import React, { useState, useEffect } from 'react';
import { 
  X, Save, FileText, Activity, BrainCircuit, Stethoscope, 
  ClipboardList, History, Beaker, Pill, CheckCircle2, AlertCircle,
  ChevronRight, ChevronLeft, Printer, Download, Mic, Trash2, Check,
  Heart, Thermometer, Calendar, MapPin
} from 'lucide-react';
import { User, PaymentRequest } from '../../types';
import { getClinicalSupport } from '../../services/geminiService';
import AIAssistantTab from '../../components/AIAssistantTab';
import { VoiceDictation } from '../../components/tools/VoiceDictation';
import { db } from '../../src/firebase';
import { collection, doc, setDoc, getDocs, query, where, updateDoc, addDoc } from 'firebase/firestore';
import { 
  symptom_catalog, 
  system_review_catalog, 
  cim11_catalog, 
  protocol_catalog_links, 
  diagnostic_exam_links, 
  diagnostic_drug_links, 
  clinical_scores 
} from '../../constants/referentials';

const PREDEFINED_SYMPTOMS = [
  'Fièvre',
  'Douleur abdominale',
  'Céphalée',
  'Toux',
  'Dyspnée',
  'Vomissements',
  'Diarrhée',
  'Métrorragies',
  'Douleurs pelviennes',
  'Traumatisme',
  'Fatigue'
];

const getCharacteristicsConfig = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('fièvre')) {
    return [
      { key: 'température', label: 'Température (°C)', type: 'number' },
      { key: 'type', label: 'Type', type: 'select', options: ['Continue', 'Intermittente', 'En plateau'] }
    ];
  } else if (n.includes('céphalée') || n.includes('cephalée')) {
    return [
      { key: 'localisation', label: 'Localisation', type: 'select', options: ['En casque', 'Hémicrânienne', 'Frontale', 'Occipitale'] },
      { key: 'type', label: 'Type', type: 'select', options: ['Pulsatile', 'Constrictive', 'Pesanteur'] },
      { key: 'intensité', label: 'Intensité (1-10)', type: 'number', min: 1, max: 10 }
    ];
  } else if (n.includes('douleur') || n.includes('traumatisme')) {
    return [
      { key: 'siège', label: 'Siège exact', type: 'text' },
      { key: 'type', label: 'Type', type: 'select', options: ['Brûlure', 'Colique', 'Crampe', 'Pesanteur', 'Coup de poignard'] },
      { key: 'intensité', label: 'Intensité (1-10)', type: 'number', min: 1, max: 10 },
      { key: 'irradiation', label: 'Irradiation', type: 'text' }
    ];
  } else if (n.includes('toux')) {
    return [
      { key: 'type', label: 'Type', type: 'select', options: ['Sèche', 'Grasse', 'Aboyante', 'Quinteuse'] },
      { key: 'horaire', label: 'Horaire', type: 'select', options: ['Prédominance nocturne', 'Matinale', 'Permanente'] }
    ];
  } else if (n.includes('vomiss') || n.includes('diarrhée') || n.includes('sang') || n.includes('métrorragie')) {
      return [
        { key: 'aspect', label: 'Aspect', type: 'text' },
        { key: 'fréquence', label: 'Fréquence par jour', type: 'number' }
      ]
  }
  return [
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'intensité', label: 'Intensité (1-10)', type: 'number', min: 1, max: 10 }
  ];
};

interface IntelligentConsultationProps {
  patient: any;
  user: User;
  onClose: () => void;
  onSave: (observation: any) => void;
  onCloturer?: (observation: any) => void;
  onSendPrescription?: (observation: any) => void;
  onSendExams?: (observation: any) => void;
  paymentRequests: PaymentRequest[];
  setPaymentRequests: React.Dispatch<React.SetStateAction<PaymentRequest[]>>;
}

type ConsultationMode = 'pediatrie' | 'gynecologie' | 'obstetrique' | 'medecine_generale' | 'chirurgie' | 'traumatologie';
type TabId = 'motif' | 'histoire' | 'antecedents' | 'systemes' | 'examen' | 'raisonnement' | 'examens' | 'prise_en_charge' | 'observation' | 'assistant_ia';

export default function IntelligentConsultation({
  patient,
  user,
  onClose,
  onSave,
  onCloturer,
  onSendPrescription,
  onSendExams,
  paymentRequests,
  setPaymentRequests
}: IntelligentConsultationProps) {
  const [mode, setMode] = useState<ConsultationMode | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('motif');

  // Data states
  const [motif, setMotif] = useState('');
  const [motifSymptoms, setMotifSymptoms] = useState<string[]>([]);
  const [motifDuree, setMotifDuree] = useState<string>('');
  const [motifUnite, setMotifUnite] = useState<string>('jours');
  const [symptomSearch, setSymptomSearch] = useState('');
  const [customSymptoms, setCustomSymptoms] = useState<string[]>([]);
  const [showChroniqueAlert, setShowChroniqueAlert] = useState(false);
  const [symptomSystemFilter, setSymptomSystemFilter] = useState('Tous');
  const [symptomFavorites, setSymptomFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('symptom_favs');
    return saved ? JSON.parse(saved) : ['Fièvre', 'Céphalée', 'Toux', 'Dyspnée'];
  });
  const [symptomRecents, setSymptomRecents] = useState<string[]>(() => {
    const saved = localStorage.getItem('symptom_recs');
    return saved ? JSON.parse(saved) : ['Douleur abdominale', 'Vomissements', 'Fatigue'];
  });

  const [symptoms, setSymptoms] = useState<{
    name: string, 
    characteristics: Record<string, string>,
    installation?: string,
    conduiteType?: string,
    conduiteDetails?: any,
    evolution?: string,
    delaiApparition?: string
  }[]>([]);
  const [hmaText, setHmaText] = useState('');
  
  const [antecedents, setAntecedents] = useState({
    personnels: {
      medicaux: '',
      chirurgicaux: '',
      immunoAllergiques: '',
      toxicologiques: '',
      environnementaux: '',
      obstetricaux: ''
    },
    familiaux: ''
  });
  const [systemes, setSystemes] = useState<Record<string, boolean>>({});
  const [systemDetails, setSystemDetails] = useState<Record<string, string>>({});
  const [symptomesGeneraux, setSymptomesGeneraux] = useState<Record<string, boolean>>({
    fièvre: false,
    asthénie: false,
    anorexie: false,
    amaigrissement: false
  });
  const [constantes, setConstantes] = useState({
    ta: patient?.vitals?.bp || '',
    fc: patient?.vitals?.pulse?.toString() || '',
    fr: '',
    temp: patient?.vitals?.temp?.toString() || '',
    sat: patient?.vitals?.spo2?.toString() || ''
  });
  const [etatGeneral, setEtatGeneral] = useState('');
  const [examenAppareils, setExamenAppareils] = useState<Record<string, string>>({});
  
  const [hypotheses, setHypotheses] = useState<{principal: string, differentiels: string[]}>({
    principal: '', differentiels: []
  });

  const [examensDemandes, setExamensDemandes] = useState<{name: string, urgent: boolean, price?: number, status?: 'demandé' | 'payé' | 'prélevé' | 'validé'}[]>([]);
  const [prescriptions, setPrescriptions] = useState<{name: string, posologie: string, price?: number}[]>([]);
  const [orientation, setOrientation] = useState('');
  
  const [observation, setObservation] = useState('');

  // CIM-10 and prescription-related top-level states to avoid Hook order rules violation
  const [searchCim, setSearchCim] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const favs = localStorage.getItem('cim10_favs');
    return favs ? JSON.parse(favs) : ['B54.9', 'I10', 'N39.0'];
  });
  const [recents, setRecents] = useState<string[]>(() => {
    const recs = localStorage.getItem('cim10_recs');
    return recs ? JSON.parse(recs) : ['B54.9', 'A09.9'];
  });

  const [selectedDrugIndex, setSelectedDrugIndex] = useState<number | null>(null);
  const [customDrugName, setCustomDrugName] = useState('');
  const [customDrugPrice, setCustomDrugPrice] = useState(1550);
  const [customPosology, setCustomPosology] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Tous');

  // Synchronise le motif avec les variables structurées
  useEffect(() => {
    if (motifSymptoms.length === 0 || !motifDuree) {
      // Don't overwrite if it was initialized somehow differently, but normally we update it.
      if (motifSymptoms.length === 0 && motifDuree === '' && motif === '') return;
    }
    
    let sympText = '';
    if (motifSymptoms.length === 1) {
      sympText = motifSymptoms[0].toLowerCase();
    } else if (motifSymptoms.length === 2) {
      sympText = `${motifSymptoms[0].toLowerCase()} et ${motifSymptoms[1].toLowerCase()}`;
    } else if (motifSymptoms.length === 3) {
      sympText = `${motifSymptoms[0].toLowerCase()}, ${motifSymptoms[1].toLowerCase()} et ${motifSymptoms[2].toLowerCase()}`;
    }

    if (sympText && motifDuree) {
      setMotif(`Motif de consultation : ${sympText} évoluant depuis ${motifDuree} ${motifUnite}`);
    } else if (sympText) {
      setMotif(`Motif de consultation : ${sympText}`);
    } else {
      setMotif('');
    }

    if (motifUnite === 'jours' && parseInt(motifDuree) >= 30) {
      setShowChroniqueAlert(true);
    } else {
      setShowChroniqueAlert(false);
    }
  }, [motifSymptoms, motifDuree, motifUnite]);

  // Synchronise History when Motif symptoms change
  useEffect(() => {
    // Basic sync: if a symptom is added in motif, add it conceptually to history if not there
    const updatedHistory = [...symptoms];
    let changed = false;
    motifSymptoms.forEach(s => {
      if (!updatedHistory.find(h => h.name.toLowerCase() === s.toLowerCase())) {
        updatedHistory.push({ 
          name: s, 
          characteristics: {},
          installation: '',
          conduiteType: '',
          conduiteDetails: {},
          evolution: '',
          delaiApparition: ''
        });
        changed = true;
      }
    });
    if (changed) {
      setSymptoms(updatedHistory);
    }
  }, [motifSymptoms]);

  // Generate HMA text dynamically
  useEffect(() => {
    if (symptoms.length === 0) {
      setHmaText('');
      return;
    }
    
    let txt = `Le début des symptômes remonterait à environ ${motifDuree || '[durée]'} ${motifUnite || 'jours'}`;
    
    symptoms.forEach((s, idx) => {
      if (idx === 0) {
        txt += `, marqué par l'installation ${s.installation ? s.installation.toLowerCase() : '...'} d'`;
      } else {
        txt += `\npuis ${s.delaiApparition ? s.delaiApparition.toLowerCase() + ' plus tard' : 'secondairement'}, par l'apparition d'`;
      }
      
      let prefix = 'une ';
      const nameLower = s.name.toLowerCase();
      if (['vomissements', 'vertiges', 'traumatismes'].some(x => nameLower.includes(x))) prefix = 'épisodes de ';
      else if (['toux', 'fatigue', 'dyspnée', 'diarrhée', 'fièvre'].some(x => nameLower.includes(x))) prefix = 'une ';
      else if (nameLower.match(/^[aeiouy]/)) prefix = 'une ';
      
      txt += `${prefix && prefix !== 'une ' ? prefix : (nameLower.match(/^[aeiouy]/) ? "une " : "une ")}${nameLower}`;
      
      let chars = [];
      if (nameLower.includes('fièvre') && s.characteristics['température']) {
        chars.push(`chiffrée à ${s.characteristics['température']}°C`);
      }
      if (s.characteristics['localisation'] || s.characteristics['siège']) {
        chars.push(`localisée à ${s.characteristics['localisation'] || s.characteristics['siège']}`);
      }
      if (s.characteristics['type']) {
        if (nameLower.includes('céphalée')) {
             chars.push(`en ${s.characteristics['type'].toLowerCase()}`);
        } else {
             chars.push(`de type ${s.characteristics['type'].toLowerCase()}`);
        }
      }
      if (s.characteristics['intensité']) {
        chars.push(`d'intensité ${s.characteristics['intensité']}/10`);
      }
      if (s.characteristics['irradiation']) {
        chars.push(`irradiant vers ${s.characteristics['irradiation'].toLowerCase()}`);
      }
      if (s.characteristics['horaire']) {
        chars.push(`à prédominance ${s.characteristics['horaire'].toLowerCase()}`);
      }
      if (s.characteristics['fréquence']) {
         chars.push(`à une fréquence de ${s.characteristics['fréquence']} fois/jour`);
      }
      if (s.characteristics['aspect']) {
         chars.push(`d'aspect ${s.characteristics['aspect'].toLowerCase()}`);
      }
      // Any other custom characteristics added
      Object.keys(s.characteristics || {}).forEach(k => {
         const knownKeys = ['température', 'localisation', 'siège', 'type', 'intensité', 'irradiation', 'horaire', 'fréquence', 'aspect'];
         if (!knownKeys.includes(k) && s.characteristics[k]) {
             chars.push(`${k.toLowerCase()} ${s.characteristics[k].toLowerCase()}`);
         }
      });
      
      if (chars.length > 0) {
        txt += ` ${chars.join(', ')}`;
      }
      
      if (s.conduiteType) {
        if (s.conduiteType === 'automédication') {
           txt += `, motivant une automédication faite de ${s.conduiteDetails?.medicament || '[médicament]'} ${s.conduiteDetails?.dose ? `(${s.conduiteDetails.dose})` : ''} ${s.conduiteDetails?.frequence || ''} ${s.conduiteDetails?.duree ? `pendant ${s.conduiteDetails.duree}` : ''}`.replace(/\s+/g, ' ');
        } else if (s.conduiteType === 'consultation' || s.conduiteType === 'hospitalisation') {
           txt += `, motivant une ${s.conduiteType} dans une structure de type ${s.conduiteDetails?.structure || '[non précisée]'}, avec administration de ${s.conduiteDetails?.traitementRecu || '[aucun traitement]'} et réalisation de ${s.conduiteDetails?.actesRealises || '[aucun acte]'}`;
        } else if (s.conduiteType === 'abstention') {
           txt += `, motivant une abstention thérapeutique`;
        }
      }
      
      if (s.evolution) {
        txt += `. L'évolution sera marquée par une ${s.evolution.toLowerCase()}`;
      } else {
        txt += '.';
      }
    });
    
    setHmaText(txt.trim());
  }, [symptoms, motifDuree, motifUnite]);

  // Synchronise Systemes when Motif symptoms change
  useEffect(() => {
    const sysMap: Record<string, string[]> = {
      'Respiratoire': ['toux', 'dyspnée', 'douleur thoracique', 'hémoptysie'],
      'Digestif': ['abdominale', 'vomissements', 'diarrhée', 'méléna', 'hématémèse', 'nausée'],
      'Neuro': ['céphalée', 'vertige', 'convulsion', 'paralysie', 'coma'], // Neurologique
      'Gynéco': ['métrorragies', 'douleurs pelviennes', 'leucorrhée'], // Urogénital
      'Général': ['fièvre', 'fatigue', 'asthénie', 'anorexie']
    };
    
    setSystemes(prev => {
      const newSys = { ...prev };
      motifSymptoms.forEach(s => {
        const lowerS = s.toLowerCase();
        if (sysMap['Respiratoire'].some(x => lowerS.includes(x))) newSys['Respiratoire'] = true;
        if (sysMap['Digestif'].some(x => lowerS.includes(x))) newSys['Digestif'] = true;
        if (sysMap['Neuro'].some(x => lowerS.includes(x))) newSys['Neurologique'] = true;
        if (sysMap['Gynéco'].some(x => lowerS.includes(x))) newSys['Urogénital'] = true;
      });
      return newSys;
    });

    setSymptomesGeneraux(prev => {
      const newGen = { ...prev };
      motifSymptoms.forEach(s => {
        const lowerS = s.toLowerCase();
        if (lowerS.includes('fièvre')) newGen['fièvre'] = true;
        if (lowerS.includes('asthénie') || lowerS.includes('fatigue')) newGen['asthénie'] = true;
        if (lowerS.includes('anorexie') || lowerS.includes('appétit')) newGen['anorexie'] = true;
        if (lowerS.includes('amaigrissement') || lowerS.includes('poids')) newGen['amaigrissement'] = true;
      });
      return newGen;
    });
  }, [motifSymptoms]);

  const toggleSymptom = (s: string) => {
    setMotifSymptoms(prev => {
      if (prev.includes(s)) {
        return prev.filter(x => x !== s);
      } else {
        if (prev.length >= 3) return prev; // limit to 3
        
        // Add to recents
        setSymptomRecents(recs => {
          const filtered = recs.filter(r => r !== s);
          const updated = [s, ...filtered].slice(0, 5);
          localStorage.setItem('symptom_recs', JSON.stringify(updated));
          return updated;
        });

        return [...prev, s];
      }
    });
  };

  const tabs: {id: TabId, label: string, icon: any}[] = [
    { id: 'motif', label: 'Motif', icon: ClipboardList },
    { id: 'histoire', label: 'Histoire', icon: History },
    { id: 'antecedents', label: 'Antécédents', icon: FileText },
    { id: 'systemes', label: 'Systèmes', icon: Activity },
    { id: 'examen', label: 'Examen', icon: Stethoscope },
    { id: 'raisonnement', label: 'Raisonnement', icon: BrainCircuit },
    { id: 'examens', label: 'Examens', icon: Beaker },
    { id: 'prise_en_charge', label: 'Prise en charge', icon: Pill },
    { id: 'observation', label: 'Observation', icon: FileText },
    { id: 'assistant_ia', label: 'Assistant IA', icon: BrainCircuit }
  ];

  const generateObservation = () => {
    const obs = `
OBSERVATION MÉDICALE
-------------------
Patient: ${patient?.lastName} ${patient?.firstName} (${patient?.age} ans, ${patient?.gender})
Mode de consultation: ${mode}

MOTIF DE CONSULTATION:
${motif}

HISTOIRE DE LA MALADIE:
${hmaText || symptoms.map(s => `- ${s.name}: ${Object.entries(s.characteristics || {}).map(([k, v]) => `${k}=${v}`).join(', ')}`).join('\n')}

SYMPTÔMES GÉNÉRAUX:
${Object.entries(symptomesGeneraux).filter(([_, v]) => v).map(([k]) => `${k}${systemDetails[k] ? `: ${systemDetails[k]}` : ''}`).join(', ') || 'Néant'}

ENQUÊTE DES SYSTÈMES:
${Object.entries(systemes).filter(([_, v]) => v).map(([k]) => `${k}${systemDetails[k] ? `: ${systemDetails[k]}` : ''}`).join(', ') || 'Rien à signaler'}

ANTÉCÉDENTS PERSONNELS:
- Médicaux: ${antecedents.personnels.medicaux}
- Chirurgicaux: ${antecedents.personnels.chirurgicaux}
- Immuno-allergiques: ${antecedents.personnels.immunoAllergiques}
- Toxicologiques: ${antecedents.personnels.toxicologiques}
- Environnementaux: ${antecedents.personnels.environnementaux}
${mode === 'gynecologie' || mode === 'obstetrique' ? `- Obstétricaux: ${antecedents.personnels.obstetricaux}` : ''}

ANTÉCÉDENTS FAMILIAUX:
${antecedents.familiaux}

EXAMEN PHYSIQUE:
Constantes: TA: ${constantes.ta}, FC: ${constantes.fc}, FR: ${constantes.fr}, T°: ${constantes.temp}, Sat: ${constantes.sat}
État général: ${etatGeneral}
Examen par appareil:
${Object.entries(examenAppareils).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

HYPOTHÈSES DIAGNOSTIQUES:
Principal: ${hypotheses.principal}
Différentiels: ${hypotheses.differentiels.join(', ')}

EXAMENS DEMANDÉS:
${examensDemandes.map(e => `- ${e.name} ${e.urgent ? '(URGENT)' : ''}`).join('\n')}

CONDUITE À TENIR:
Prescriptions:
${prescriptions.map(p => `- ${p.name}: ${p.posologie}`).join('\n')}
Orientation: ${orientation}
    `.trim();
    setObservation(obs);
  };

  const handleSave = () => {
    if (!motif) {
      alert("Le motif de consultation est obligatoire.");
      return;
    }
    onSave({
      mode,
      motif,
      symptoms,
      antecedents,
      constantes,
      etatGeneral,
      examenAppareils,
      hypotheses,
      examensDemandes,
      prescriptions,
      orientation,
      observation
    });
  };

  const handleTriggerCloturer = () => {
    if (!motif) {
      alert("Le motif de consultation est obligatoire.");
      return;
    }
    if (onCloturer) {
      onCloturer({
        mode,
        motif,
        symptoms,
        antecedents,
        constantes,
        etatGeneral,
        examenAppareils,
        hypotheses,
        examensDemandes,
        prescriptions,
        orientation,
        observation
      });
    }
  };

  const handleTriggerSendPrescription = () => {
    if (onSendPrescription) {
      onSendPrescription({
        mode,
        motif,
        symptoms,
        antecedents,
        constantes,
        etatGeneral,
        examenAppareils,
        hypotheses,
        examensDemandes,
        prescriptions,
        orientation,
        observation
      });
    }
  };

  const handleTriggerSendExams = () => {
    if (onSendExams) {
      onSendExams({
        mode,
        motif,
        symptoms,
        antecedents,
        constantes,
        etatGeneral,
        examenAppareils,
        hypotheses,
        examensDemandes,
        prescriptions,
        orientation,
        observation
      });
    }
  };

  useEffect(() => {
    const handleSaveDraftEv = () => {
      handleSave();
    };
    const handleCloturerEv = () => {
      handleTriggerCloturer();
    };
    const handleSendPrescriptionEv = () => {
      handleTriggerSendPrescription();
    };
    const handleSendExamsEv = () => {
      handleTriggerSendExams();
    };

    window.addEventListener('trigger-intelligent-save-draft', handleSaveDraftEv);
    window.addEventListener('trigger-intelligent-cloturer', handleCloturerEv);
    window.addEventListener('trigger-intelligent-send-prescription', handleSendPrescriptionEv);
    window.addEventListener('trigger-intelligent-send-exams', handleSendExamsEv);

    return () => {
      window.removeEventListener('trigger-intelligent-save-draft', handleSaveDraftEv);
      window.removeEventListener('trigger-intelligent-cloturer', handleCloturerEv);
      window.removeEventListener('trigger-intelligent-send-prescription', handleSendPrescriptionEv);
      window.removeEventListener('trigger-intelligent-send-exams', handleSendExamsEv);
    };
  }, [mode, motif, symptoms, antecedents, constantes, etatGeneral, examenAppareils, hypotheses, examensDemandes, prescriptions, orientation, observation, onSave, onCloturer, onSendPrescription, onSendExams]);

  const handleDictationAnalysis = (section: string, data: any) => {
    if (!data) return;
    
    switch (section) {
      case 'motif':
        if (data.symptoms) setMotifSymptoms(prev => [...new Set([...prev, ...data.symptoms])].slice(0, 3));
        if (data.duration) setMotifDuree(data.duration);
        if (data.unit) setMotifUnite(data.unit);
        break;
      case 'hma':
        if (data.symptoms) {
          setSymptoms(data.symptoms.map((s: any) => ({
            name: s.name || 'Symptôme',
            characteristics: s.characteristics || {},
            installation: s.installation || 'progressive',
            conduiteType: s.conduiteType || 'abstention',
            conduiteDetails: s.conduiteDetails || {},
            evolution: s.evolution || 'persistance',
            delaiApparition: s.delaiApparition || ''
          })));
        }
        break;
      case 'examen':
        if (data.vitals) {
          setConstantes(prev => ({
            ta: data.vitals.ta || prev.ta,
            fc: data.vitals.pouls?.toString() || prev.fc,
            fr: data.vitals.freqResp?.toString() || prev.fr,
            temp: data.vitals.temp?.toString() || prev.temp,
            sat: data.vitals.spo2?.toString() || prev.sat,
          }));
        }
        if (data.clinicalSigns) {
          setExamenAppareils(prev => ({
            ...prev,
            'Observation vocale': data.clinicalSigns.join(', ')
          }));
        }
        break;
      case 'conclusion':
        if (data.diagnosis) setHypotheses(prev => ({ ...prev, principal: data.diagnosis }));
        if (data.plan) {
          setPrescriptions(data.plan.map((p: string) => ({ name: p, posologie: 'À préciser' })));
        }
        break;
    }
  };

  if (!mode) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8">
          <h2 className="text-2xl font-black text-slate-900 mb-6 text-center">Sélectionnez le type de consultation</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { id: 'medecine_generale', label: 'Médecine Générale / Interne' },
              { id: 'pediatrie', label: 'Pédiatrie' },
              { id: 'gynecologie', label: 'Gynécologie' },
              { id: 'obstetrique', label: 'Obstétrique' },
              { id: 'chirurgie', label: 'Chirurgie' },
              { id: 'traumatologie', label: 'Traumatologie' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as ConsultationMode)}
                className="p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-3 text-center"
              >
                <Stethoscope size={32} className="text-blue-600" />
                <span className="font-bold text-slate-700">{m.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <button onClick={onClose} className="px-6 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-bold">Annuler</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <BrainCircuit className="text-blue-600" /> Consultation Intelligente
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Patient: {patient?.lastName} {patient?.firstName} • Mode: <span className="uppercase text-blue-600">{mode.replace('_', ' ')}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-48 bg-slate-50 border-r border-slate-100 overflow-y-auto p-2 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'observation') generateObservation();
                  setActiveTab(tab.id);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-8 bg-white">
            {activeTab === 'motif' && (
              <div className="space-y-8 animate-in fade-in">
                <div className="flex justify-between items-center bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mic className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Dictée intelligente</h4>
                      <p className="text-xs text-slate-500">Parlez pour remplir les symptômes et la durée</p>
                    </div>
                  </div>
                  <VoiceDictation 
                    section="motif" 
                    onAnalysisComplete={(data) => handleDictationAnalysis('motif', data)} 
                  />
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-800 border-b pb-2 mb-4">A. Sélection de symptômes</h3>
                  
                  <div className="space-y-6">
                    {/* Search & Custom Add */}
                    <div className="flex items-center gap-2">
                       <input 
                         type="text" 
                         value={symptomSearch}
                         onChange={e => setSymptomSearch(e.target.value)}
                         placeholder="Rechercher un symptôme dans les référentiels..."
                         className="flex-1 p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
                       />
                       {symptomSearch && !symptom_catalog.some(s => s.label.toLowerCase() === symptomSearch.toLowerCase()) && ![...customSymptoms].some(s => s.toLowerCase() === symptomSearch.toLowerCase()) && (
                         <button 
                           onClick={() => {
                             if (!customSymptoms.includes(symptomSearch)) {
                               setCustomSymptoms([...customSymptoms, symptomSearch]);
                             }
                             toggleSymptom(symptomSearch);
                             setSymptomSearch('');
                           }}
                           className="px-4 py-3 bg-blue-50 text-blue-700 font-bold rounded-xl whitespace-nowrap hover:bg-blue-100"
                         >
                           + Ajouter personnalisé
                         </button>
                       )}
                    </div>

                    {/* Limits Alert */}
                    {motifSymptoms.length >= 3 && (
                      <p className="text-sm font-bold text-amber-600 flex items-center gap-2 bg-amber-50 p-3 rounded-xl border border-amber-100">
                        <AlertCircle size={16} /> Maximum 3 symptômes autorisés pour structurer le motif principal
                      </p>
                    )}

                    {/* Quick Access Layers: Favorites and Recents */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Favorites */}
                      <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-100/50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2">Symptômes Favoris ★</p>
                        <div className="flex flex-wrap gap-2">
                          {symptomFavorites.map(fav => {
                            const isSelected = motifSymptoms.includes(fav);
                            return (
                              <div key={fav} className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => toggleSymptom(fav)}
                                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                    isSelected 
                                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                      : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50'
                                  }`}
                                  disabled={!isSelected && motifSymptoms.length >= 3}
                                >
                                  {fav}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSymptomFavorites(prev => {
                                      const updated = prev.filter(f => f !== fav);
                                      localStorage.setItem('symptom_favs', JSON.stringify(updated));
                                      return updated;
                                    });
                                  }}
                                  className="text-slate-300 hover:text-rose-500 text-xs px-1"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                          {symptomFavorites.length === 0 && <p className="text-[11px] text-slate-400 italic">Aucun symptôme favori.</p>}
                        </div>
                      </div>

                      {/* Recents */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Sélections Récentes ↻</p>
                        <div className="flex flex-wrap gap-2">
                          {symptomRecents.map(rec => {
                            const isSelected = motifSymptoms.includes(rec);
                            return (
                              <button
                                key={rec}
                                type="button"
                                onClick={() => toggleSymptom(rec)}
                                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                  isSelected 
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                                disabled={!isSelected && motifSymptoms.length >= 3}
                              >
                                {rec}
                              </button>
                            );
                          })}
                          {symptomRecents.length === 0 && <p className="text-[11px] text-slate-400 italic">Aucune sélection récente.</p>}
                        </div>
                      </div>
                    </div>

                    {/* System tabs selector */}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Trier par système anatomique</p>
                      <div className="flex flex-wrap gap-1.5 border-b pb-3 mb-3">
                        {['Tous', 'Général', 'Respiratoire', 'Digestif', 'Neurologique', 'Gynécologique', 'Cardio-vasculaire', 'Uro-néphrologique', 'Autre'].map(sys => (
                          <button
                            key={sys}
                            type="button"
                            onClick={() => setSymptomSystemFilter(sys)}
                            className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${
                              symptomSystemFilter === sys 
                                ? 'bg-slate-900 text-white' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {sys}
                          </button>
                        ))}
                      </div>

                      {/* Symptom list from catalog */}
                      <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto p-2 border border-slate-100 rounded-2xl bg-slate-50/50">
                        {symptom_catalog
                          .filter(sc => {
                            // System filter
                            if (symptomSystemFilter !== 'Tous' && sc.category !== symptomSystemFilter) return false;
                            // Search query filter
                            if (symptomSearch && !sc.label.toLowerCase().includes(symptomSearch.toLowerCase())) return false;
                            return true;
                          })
                          .map(sc => {
                            const isSelected = motifSymptoms.includes(sc.label);
                            const isFav = symptomFavorites.includes(sc.label);
                            return (
                              <div key={sc.label} className="flex bg-white rounded-xl border border-slate-200/60 shadow-xs hover:border-blue-200 transition-all">
                                <button 
                                  type="button" 
                                  onClick={() => toggleSymptom(sc.label)}
                                  className={`pl-3 pr-2 py-1.5 text-xs font-bold rounded-l-xl transition-all ${
                                    isSelected 
                                      ? 'bg-blue-600 text-white'
                                      : 'text-slate-600 hover:bg-slate-50'
                                  }`}
                                  disabled={!isSelected && motifSymptoms.length >= 3}
                                >
                                  {sc.label}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSymptomFavorites(prev => {
                                      const updated = prev.includes(sc.label)
                                        ? prev.filter(f => f !== sc.label)
                                        : [...prev, sc.label];
                                      localStorage.setItem('symptom_favs', JSON.stringify(updated));
                                      return updated;
                                    });
                                  }}
                                  className="px-2 border-l border-slate-100 hover:bg-amber-50 hover:text-amber-500 rounded-r-xl transition-all text-xs font-bold"
                                >
                                  {isFav ? '★' : '☆'}
                                </button>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-800 border-b pb-2 mb-4">B. Durée globale d'évolution</h3>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="number"
                      min="1"
                      value={motifDuree}
                      onChange={e => setMotifDuree(e.target.value)}
                      placeholder="Ex: 3"
                      className="w-32 p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold text-center"
                    />
                    <select 
                      value={motifUnite}
                      onChange={e => setMotifUnite(e.target.value)}
                      className="p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white font-bold text-slate-700"
                    >
                      <option value="jours">Jours</option>
                      <option value="semaines">Semaines</option>
                    </select>
                  </div>
                  {showChroniqueAlert && (
                     <p className="text-sm font-bold text-amber-600 flex items-center gap-2 mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <AlertCircle size={16} /> Le motif de consultation correspond à une évolution chronique, vérifier la saisie.
                     </p>
                  )}
                </div>

                {motif && (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-sm font-bold text-slate-700">Texte généré :</p>
                    <p className="text-slate-600 italic mt-1">{motif}</p>
                  </div>
                )}
                
                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={() => setActiveTab('histoire')}
                    disabled={motifSymptoms.length === 0 || !motifDuree}
                    className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 ${
                      motifSymptoms.length > 0 && motifDuree
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/25'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    } transition-all`}
                  >
                    Continuer <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'histoire' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mic className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Dictée HMA</h4>
                      <p className="text-xs text-slate-500">Décrivez l'évolution pour une analyse structurée</p>
                    </div>
                  </div>
                  <VoiceDictation 
                    section="hma" 
                    onAnalysisComplete={(data) => handleDictationAnalysis('hma', data)} 
                  />
                </div>
                <h3 className="text-lg font-black text-slate-800 border-b pb-2">Histoire de la maladie</h3>
                <div className="flex gap-2 mb-4">
                  <input 
                    type="text" 
                    placeholder="Ajouter un symptôme supplémentaire..." 
                    className="flex-1 p-3 border border-slate-200 rounded-xl outline-none"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        setSymptoms([...symptoms, { name: e.currentTarget.value, characteristics: {} }]);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
                <div className="space-y-6">
                  {symptoms.map((s, i) => {
                    const charConfig = getCharacteristicsConfig(s.name);
                    return (
                      <div key={i} className="p-6 border border-slate-200 rounded-[24px] bg-white shadow-sm space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">
                            Symptôme {i + 1} : <span className="text-blue-600">{s.name}</span>
                          </h4>
                          <button onClick={() => setSymptoms(symptoms.filter((_, idx) => idx !== i))} className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-colors">
                            <X size={18} />
                          </button>
                        </div>

                        {/* Chronologie et Installation */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl">
                          {i > 0 && (
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Délai d'apparition</label>
                              <input 
                                type="text"
                                placeholder="ex: 2 jours plus tard"
                                value={s.delaiApparition || ''}
                                onChange={e => {
                                  const newSymp = [...symptoms];
                                  newSymp[i].delaiApparition = e.target.value;
                                  setSymptoms(newSymp);
                                }}
                                className="w-full p-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                              />
                            </div>
                          )}
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Mode d'installation</label>
                            <div className="flex gap-2">
                              {['brutale', 'progressive'].map(mode => (
                                <button
                                  key={mode}
                                  onClick={() => {
                                    const newSymp = [...symptoms];
                                    newSymp[i].installation = mode;
                                    setSymptoms(newSymp);
                                  }}
                                  className={`flex-1 py-2 px-3 rounded-xl border text-sm font-bold capitalize transition-all ${
                                    s.installation === mode ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                                  }`}
                                >
                                  {mode}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Caractéristiques selon CIM-10 / Moteur IA */}
                        <div>
                          <h5 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3">Caractéristiques de {s.name}</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {charConfig.map(char => (
                              <div key={char.key}>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">{char.label}</label>
                                {char.type === 'select' ? (
                                  <select
                                    value={s.characteristics[char.key] || ''}
                                    onChange={e => {
                                      const newSymp = [...symptoms];
                                      newSymp[i].characteristics[char.key] = e.target.value;
                                      setSymptoms(newSymp);
                                    }}
                                    className="w-full p-2.5 text-sm font-medium border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-white"
                                  >
                                    <option value="">Sélectionner</option>
                                    {(char.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                  </select>
                                ) : (
                                  <input 
                                    type={char.type}
                                    min={char.min}
                                    max={char.max}
                                    value={s.characteristics[char.key] || ''}
                                    onChange={e => {
                                      const newSymp = [...symptoms];
                                      newSymp[i].characteristics[char.key] = e.target.value;
                                      setSymptoms(newSymp);
                                    }}
                                    placeholder={`Saisir ${char.label.toLowerCase()}`}
                                    className="w-full p-2.5 text-sm font-medium border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Conduite du patient */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <h5 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3">Conduite du patient</h5>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {['automédication', 'consultation', 'hospitalisation', 'abstention'].map(type => (
                              <button
                                key={type}
                                onClick={() => {
                                  const newSymp = [...symptoms];
                                  newSymp[i].conduiteType = type;
                                  if (!newSymp[i].conduiteDetails) newSymp[i].conduiteDetails = {};
                                  setSymptoms(newSymp);
                                }}
                                className={`px-4 py-2 rounded-xl border text-sm font-bold capitalize transition-all ${
                                  s.conduiteType === type ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>

                          {s.conduiteType === 'automédication' && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {[
                                {k: 'medicament', l: 'Médicament'},
                                {k: 'dose', l: 'Dose (ex: 1g)'},
                                {k: 'frequence', l: 'Fréquence (ex: 3x/j)'},
                                {k: 'duree', l: 'Durée (ex: 2j)'}
                              ].map(f => (
                                <div key={f.k}>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">{f.l}</label>
                                  <input 
                                    type="text"
                                    value={s.conduiteDetails?.[f.k] || ''}
                                    onChange={e => {
                                      const newSymp = [...symptoms];
                                      newSymp[i].conduiteDetails[f.k] = e.target.value;
                                      setSymptoms(newSymp);
                                    }}
                                    className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {(s.conduiteType === 'consultation' || s.conduiteType === 'hospitalisation') && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {[
                                {k: 'structure', l: 'Structure / Clinique'},
                                {k: 'traitementRecu', l: 'Traitement Reçu'},
                                {k: 'actesRealises', l: 'Actes Réalisés'}
                              ].map(f => (
                                <div key={f.k}>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase">{f.l}</label>
                                  <input 
                                    type="text"
                                    value={s.conduiteDetails?.[f.k] || ''}
                                    onChange={e => {
                                      const newSymp = [...symptoms];
                                      newSymp[i].conduiteDetails[f.k] = e.target.value;
                                      setSymptoms(newSymp);
                                    }}
                                    className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Évolution */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Évolution du symptôme</label>
                          <div className="flex gap-2">
                            {['amélioration', 'persistance', 'aggravation'].map(evo => (
                              <button
                                key={evo}
                                onClick={() => {
                                  const newSymp = [...symptoms];
                                  newSymp[i].evolution = evo;
                                  setSymptoms(newSymp);
                                }}
                                className={`flex-1 py-2 px-3 rounded-xl border text-sm font-bold capitalize transition-all ${
                                  s.evolution === evo ? 'bg-amber-500 text-white border-amber-500 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
                                }`}
                              >
                                {evo}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {symptoms.length > 0 && hmaText && (
                    <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-[24px]">
                       <h4 className="font-black text-blue-900 text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
                         <FileText size={16} /> Texte généré de l'HMA
                       </h4>
                       <p className="text-blue-800 leading-relaxed bg-white/50 p-4 rounded-xl border border-blue-100/50">{hmaText}</p>
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <button 
                      onClick={() => setActiveTab('antecedents')}
                      disabled={symptoms.some(s => !s.evolution || !s.installation)}
                      className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 ${
                        symptoms.every(s => s.evolution && s.installation)
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/25'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      } transition-all`}
                    >
                      Continuer <ChevronRight size={20} />
                    </button>
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'antecedents' && (
              <div className="space-y-10 animate-in fade-in pb-10">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <FileText className="text-blue-600" size={24} /> Antécédents
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Renseignez l'historique médical personnel et familial du patient.</p>
                </div>

                {/* Section Personnels */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
                    <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">I. Antécédents Personnels</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Médicaux */}
                    <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100 space-y-4 hover:shadow-md transition-all">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">A. Médicaux</label>
                        <VoiceDictation 
                          section="note" 
                          onAnalysisComplete={(data) => setAntecedents(prev => ({
                            ...prev, 
                            personnels: { ...prev.personnels, medicaux: prev.personnels.medicaux + (prev.personnels.medicaux ? ' ' : '') + data.content }
                          }))} 
                        />
                      </div>
                      <textarea
                        value={antecedents.personnels.medicaux}
                        onChange={e => setAntecedents({...antecedents, personnels: {...antecedents.personnels, medicaux: e.target.value}})}
                        className="w-full p-4 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-white min-h-[100px] text-sm font-medium transition-all"
                        placeholder="Pathologies chroniques, hospitalisations antérieures..."
                      />
                    </div>

                    {/* Chirurgicaux */}
                    <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100 space-y-4 hover:shadow-md transition-all">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">B. Chirurgicaux</label>
                        <VoiceDictation 
                          section="note" 
                          onAnalysisComplete={(data) => setAntecedents(prev => ({
                            ...prev, 
                            personnels: { ...prev.personnels, chirurgicaux: prev.personnels.chirurgicaux + (prev.personnels.chirurgicaux ? ' ' : '') + data.content }
                          }))} 
                        />
                      </div>
                      <textarea
                        value={antecedents.personnels.chirurgicaux}
                        onChange={e => setAntecedents({...antecedents, personnels: {...antecedents.personnels, chirurgicaux: e.target.value}})}
                        className="w-full p-4 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-white min-h-[100px] text-sm font-medium transition-all"
                        placeholder="Interventions, dates, complications..."
                      />
                    </div>

                    {/* Immuno-allergiques */}
                    <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100 space-y-4 hover:shadow-md transition-all">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">C. Immuno-allergiques</label>
                        <VoiceDictation 
                          section="note" 
                          onAnalysisComplete={(data) => setAntecedents(prev => ({
                            ...prev, 
                            personnels: { ...prev.personnels, immunoAllergiques: prev.personnels.immunoAllergiques + (prev.personnels.immunoAllergiques ? ' ' : '') + data.content }
                          }))} 
                        />
                      </div>
                      <textarea
                        value={antecedents.personnels.immunoAllergiques}
                        onChange={e => setAntecedents({...antecedents, personnels: {...antecedents.personnels, immunoAllergiques: e.target.value}})}
                        className="w-full p-4 border-2 border-rose-100 rounded-xl outline-none focus:border-rose-500 bg-white min-h-[100px] text-sm font-medium transition-all"
                        placeholder="Allergies alimentaires, médicamenteuses, atopie..."
                      />
                    </div>

                    {/* Toxicologiques */}
                    <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100 space-y-4 hover:shadow-md transition-all">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">D. Toxicologiques</label>
                        <VoiceDictation 
                          section="note" 
                          onAnalysisComplete={(data) => setAntecedents(prev => ({
                            ...prev, 
                            personnels: { ...prev.personnels, toxicologiques: prev.personnels.toxicologiques + (prev.personnels.toxicologiques ? ' ' : '') + data.content }
                          }))} 
                        />
                      </div>
                      <textarea
                        value={antecedents.personnels.toxicologiques}
                        onChange={e => setAntecedents({...antecedents, personnels: {...antecedents.personnels, toxicologiques: e.target.value}})}
                        className="w-full p-4 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-white min-h-[100px] text-sm font-medium transition-all"
                        placeholder="Tabac, Alcool, autres substances..."
                      />
                    </div>

                    {/* Environnementaux */}
                    <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100 space-y-4 hover:shadow-md transition-all">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">E. Environnementaux</label>
                        <VoiceDictation 
                          section="note" 
                          onAnalysisComplete={(data) => setAntecedents(prev => ({
                            ...prev, 
                            personnels: { ...prev.personnels, environnementaux: prev.personnels.environnementaux + (prev.personnels.environnementaux ? ' ' : '') + data.content }
                          }))} 
                        />
                      </div>
                      <textarea
                        value={antecedents.personnels.environnementaux}
                        onChange={e => setAntecedents({...antecedents, personnels: {...antecedents.personnels, environnementaux: e.target.value}})}
                        className="w-full p-4 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-white min-h-[100px] text-sm font-medium transition-all"
                        placeholder="Conditions de vie, profession, exposition..."
                      />
                    </div>

                    {/* Obstétricaux (si applicable) */}
                    {(mode === 'gynecologie' || mode === 'obstetrique') && (
                      <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100 space-y-4 hover:shadow-md transition-all">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">F. Obstétricaux</label>
                          <VoiceDictation 
                            section="note" 
                            onAnalysisComplete={(data) => setAntecedents(prev => ({
                              ...prev, 
                              personnels: { ...prev.personnels, obstetricaux: prev.personnels.obstetricaux + (prev.personnels.obstetricaux ? ' ' : '') + data.content }
                            }))} 
                          />
                        </div>
                        <textarea
                          value={antecedents.personnels.obstetricaux}
                          onChange={e => setAntecedents({...antecedents, personnels: {...antecedents.personnels, obstetricaux: e.target.value}})}
                          className="w-full p-4 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-white min-h-[100px] text-sm font-medium transition-all"
                          placeholder="Gestité, Parité, cycles..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Section Familiaux */}
                <div className="space-y-6">
                   <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-emerald-500 rounded-full"></div>
                    <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">II. Antécédents Familiaux</h4>
                  </div>
                  
                  <div className="bg-emerald-50/50 p-6 rounded-[24px] border border-emerald-100 space-y-4 hover:shadow-md transition-all">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black text-emerald-700 uppercase tracking-widest">Antécédents du premier degré</label>
                      <VoiceDictation 
                        section="note" 
                        onAnalysisComplete={(data) => setAntecedents(prev => ({
                          ...prev, 
                          familiaux: prev.familiaux + (prev.familiaux ? ' ' : '') + data.content
                        }))} 
                      />
                    </div>
                    <textarea
                      value={antecedents.familiaux}
                      onChange={e => setAntecedents({...antecedents, familiaux: e.target.value})}
                      className="w-full p-4 border-2 border-emerald-100 rounded-xl outline-none focus:border-emerald-500 bg-white min-h-[120px] text-sm font-medium transition-all"
                      placeholder="Hypertension, Diabète, Cancer, Tuberculose familiale..."
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                   <button 
                    onClick={() => setActiveTab('systemes')}
                    className="px-8 py-4 bg-blue-600 text-white rounded-[20px] font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                  >
                    Phase Suivante : Systèmes <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'systemes' && (
              <div className="space-y-8 animate-in fade-in">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-black text-slate-800">Enquête des systèmes</h3>
                  <p className="text-sm text-slate-500">Sélectionnez les systèmes présentant des anomalies.</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">I. Symptômes Généraux</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.keys(symptomesGeneraux).map(symp => (
                      <div key={symp} className="space-y-2">
                        <button
                          onClick={() => setSymptomesGeneraux({...symptomesGeneraux, [symp]: !symptomesGeneraux[symp]})}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                            symptomesGeneraux[symp] ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-white bg-white hover:border-orange-200 shadow-sm'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-sm text-slate-700 capitalize">{symp}</span>
                            {symptomesGeneraux[symp] && <CheckCircle2 size={16} className="text-orange-600" />}
                          </div>
                        </button>
                        
                        {symptomesGeneraux[symp] && (
                          <div className="animate-in slide-in-from-top-2 duration-200">
                             <div className="p-3 bg-white border border-orange-100 rounded-xl shadow-sm space-y-2">
                               <div className="flex justify-between items-center">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Précisions ({symp})</label>
                                 <VoiceDictation 
                                   section="note" 
                                   onAnalysisComplete={(data) => setSystemDetails(prev => ({
                                     ...prev,
                                     [symp]: (prev[symp] || '') + (prev[symp] ? ' ' : '') + (data.content || '')
                                   }))} 
                                 />
                               </div>
                               <textarea
                                 value={systemDetails[symp] || ''}
                                 onChange={(e) => setSystemDetails({...systemDetails, [symp]: e.target.value})}
                                 placeholder="Détails..."
                                 className="w-full p-2 text-xs border border-slate-100 rounded-lg outline-none focus:border-orange-300 min-h-[50px] resize-none"
                               />
                             </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest ml-2">II. Revue par Système</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {system_review_catalog.map(item => {
                      const sys = item.system;
                      return (
                        <div key={sys} className="space-y-2">
                          <button
                            onClick={() => setSystemes({...systemes, [sys]: !systemes[sys]})}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                              systemes[sys] ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-100 bg-white hover:border-blue-200 shadow-sm'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-sm text-slate-705">{sys}</span>
                              {systemes[sys] && <CheckCircle2 size={16} className="text-blue-600" />}
                            </div>
                          </button>
                          
                          {systemes[sys] && (
                            <div className="animate-in slide-in-from-top-2 duration-200">
                               <div className="p-3 bg-white border border-blue-100 rounded-xl shadow-sm space-y-3">
                                 {/* Symptom chips for quick generation */}
                                 <div className="flex flex-wrap gap-1 border-b border-dashed border-slate-100 pb-2.5">
                                   <p className="text-[8px] font-black uppercase text-slate-400 w-full mb-1">Cliquer pour insérer :</p>
                                   {item.symptoms.map(s => {
                                     const currentVal = systemDetails[sys] || '';
                                     const hasSymptom = currentVal.includes(s);
                                     return (
                                       <button
                                         key={s}
                                         type="button"
                                         onClick={() => {
                                           let newVal = currentVal;
                                           if (hasSymptom) {
                                             newVal = currentVal.replace(new RegExp(`\\b${s}\\b,?\\s*|\\s*,?\\s*\\b${s}\\b`), '').trim();
                                             if (newVal.endsWith(',')) newVal = newVal.slice(0, -1);
                                           } else {
                                             newVal = currentVal ? `${currentVal}, ${s}` : s;
                                           }
                                           setSystemDetails({
                                             ...systemDetails,
                                             [sys]: newVal
                                           });
                                         }}
                                         className={`px-2 py-1 text-[10px] font-bold rounded ${
                                           hasSymptom 
                                             ? 'bg-blue-100 text-blue-700' 
                                             : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                         }`}
                                       >
                                         {s}
                                       </button>
                                     );
                                   })}
                                 </div>

                                 <div className="flex justify-between items-center">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Symptômes observés ({sys})</label>
                                   <VoiceDictation 
                                     section="note" 
                                     onAnalysisComplete={(data) => setSystemDetails(prev => ({
                                       ...prev,
                                       [sys]: (prev[sys] || '') + (prev[sys] ? ' ' : '') + (data.content || '')
                                     }))} 
                                   />
                                 </div>
                                 <textarea
                                   value={systemDetails[sys] || ''}
                                   onChange={(e) => setSystemDetails({...systemDetails, [sys]: e.target.value})}
                                   placeholder="Précisez les symptômes ou complétez..."
                                   className="w-full p-2 text-xs border border-slate-100 rounded-lg outline-none focus:border-blue-300 min-h-[60px] resize-none font-medium"
                                 />
                               </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                   <button 
                    onClick={() => setActiveTab('examen')}
                    className="px-8 py-4 bg-blue-600 text-white rounded-[20px] font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                  >
                    Phase Suivante : Examen <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'examen' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mic className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Dictée Examen Clinique</h4>
                      <p className="text-xs text-slate-500">Dictatez les signes physiques et les constantes</p>
                    </div>
                  </div>
                  <VoiceDictation 
                    section="examen" 
                    onAnalysisComplete={(data) => handleDictationAnalysis('examen', data)} 
                  />
                </div>
                <h3 className="text-lg font-black text-slate-800 border-b pb-2">Examen Physique</h3>
                
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase">Constantes</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.keys(constantes).map(c => (
                      <div key={c}>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">{c}</label>
                        <input
                          type="text"
                          value={(constantes as any)[c]}
                          onChange={e => setConstantes({...constantes, [c]: e.target.value})}
                          className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-2 block text-sm uppercase">État Général</label>
                  <textarea
                    value={etatGeneral}
                    onChange={e => setEtatGeneral(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-2 block text-sm uppercase">Examen par appareil</label>
                  <div className="space-y-3">
                    {['Cardio-vasculaire', 'Pleuro-pulmonaire', 'Abdominal', 'Neurologique'].map(app => (
                      <div key={app} className="flex gap-3 items-start">
                        <span className="w-1/4 text-sm font-bold text-slate-600 pt-2">{app}</span>
                        <textarea
                          value={examenAppareils[app] || ''}
                          onChange={e => setExamenAppareils({...examenAppareils, [app]: e.target.value})}
                          className="flex-1 p-2 border border-slate-200 rounded-lg text-sm outline-none"
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'raisonnement' && (() => {
              // State variables searchCim, favorites, recents, and selectedSpecialty are now declared at the top level of the component

              const toggleFavorite = (code: string) => {
                const newFavs = favorites.includes(code)
                  ? favorites.filter(c => c !== code)
                  : [...favorites, code];
                setFavorites(newFavs);
                localStorage.setItem('cim10_favs', JSON.stringify(newFavs));
              };

              const addRecent = (code: string) => {
                const newRecs = recents.includes(code)
                  ? [code, ...recents.filter(c => c !== code)].slice(0, 5)
                  : [code, ...recents].slice(0, 5);
                setRecents(newRecs);
                localStorage.setItem('cim10_recs', JSON.stringify(newRecs));
              };

              const filteredCim = cim11_catalog.filter(c => {
                const queryMatch = c.code.toLowerCase().includes(searchCim.toLowerCase()) ||
                  c.label.toLowerCase().includes(searchCim.toLowerCase()) ||
                  c.chapter.toLowerCase().includes(searchCim.toLowerCase()) ||
                  c.category.toLowerCase().includes(searchCim.toLowerCase());
                
                const specMatch = selectedSpecialty === 'Tous' || c.specialty === selectedSpecialty;
                return queryMatch && specMatch;
              });

              const handleSelectDiagnosis = (c: any, forceDiff = false) => {
                addRecent(c.code);
                
                const diagText = `[${c.code}] ${c.label}`;
                if (forceDiff) {
                  if (!hypotheses.differentiels.includes(diagText)) {
                    setHypotheses({ ...hypotheses, differentiels: [...hypotheses.differentiels, diagText] });
                  }
                } else {
                  setHypotheses({ ...hypotheses, principal: diagText });
                }

                // Point 10 & 11: Auto-detection of linked clinical packs
                const linkedExams = diagnostic_exam_links[c.code];
                const linkedDrugs = diagnostic_drug_links[c.code];
                if (linkedExams || linkedDrugs) {
                  const confirmPack = window.confirm(
                    `📊 RECOMMANDATIONS CLINIQUES (Protocole Cible):\n\n` +
                    `Pour le diagnostic CIM-11 "${c.label}" : \n` +
                    (linkedExams ? `- Examens recommandés : ${linkedExams.join(', ')}\n` : '') +
                    (linkedDrugs ? `- Traitements conseillés : ${linkedDrugs.map(d => d.name).join(', ')}\n\n` : '\n') +
                    `Souhaitez-vous charger automatiquement ce pack d'ordonnances et d'examens ?`
                  );
                  if (confirmPack) {
                    if (linkedExams) {
                      setExamensDemandes(prev => {
                        const updated = [...prev];
                        linkedExams.forEach(exName => {
                          if (!updated.some(e => e.name === exName)) {
                            updated.push({ name: exName, urgent: false });
                          }
                        });
                        return updated;
                      });
                    }
                    if (linkedDrugs) {
                      setPrescriptions(prev => {
                        const updated = [...prev];
                        linkedDrugs.forEach(dr => {
                          if (!updated.some(p => p.name === dr.name)) {
                            updated.push({ name: dr.name, posologie: dr.posology, price: dr.price });
                          }
                        });
                        return updated;
                      });
                    }
                  }
                }
              };

              return (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-lg font-black text-slate-800">Moteur Clinique CIM-11</h3>
                    <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">CIM-11 (OMS) Standard</span>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Diagnostic Selections (Left 2 cols) */}
                    <div className="lg:col-span-2 space-y-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Diagnostic Principal (Requis pour clôturer la consultation)</label>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={hypotheses.principal}
                            onChange={e => setHypotheses({...hypotheses, principal: e.target.value})}
                            className="flex-1 p-4 border-2 border-blue-100 bg-blue-50/50 rounded-2xl outline-none focus:border-blue-500 font-bold text-blue-900 text-sm shadow-inner"
                            placeholder="Sélectionnez dans le catalogue CIM-11 ou saisissez directement..."
                          />
                          {hypotheses.principal && (
                            <button 
                              type="button"
                              onClick={() => setHypotheses({...hypotheses, principal: ''})}
                              className="px-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer text-xs font-bold"
                            >
                              Effacer
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Diagnostics Différentiels</label>
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            id="custom-diff-input"
                            placeholder="Saisir et ajouter un diagnostic alternatif..."
                            className="flex-1 p-3 border border-slate-200 rounded-2xl outline-none text-xs font-semibold"
                            onKeyDown={e => {
                              if (e.key === 'Enter' && e.currentTarget.value) {
                                const val = e.currentTarget.value;
                                if (!hypotheses.differentiels.includes(val)) {
                                  setHypotheses({
                                    ...hypotheses, 
                                    differentiels: [...hypotheses.differentiels, val]
                                  });
                                }
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById('custom-diff-input') as HTMLInputElement;
                              if (input && input.value) {
                                if (!hypotheses.differentiels.includes(input.value)) {
                                  setHypotheses({
                                    ...hypotheses,
                                    differentiels: [...hypotheses.differentiels, input.value]
                                  });
                                }
                                input.value = '';
                              }
                            }}
                            className="bg-slate-900 hover:bg-blue-600 text-white rounded-2xl px-5 text-xs font-bold transition-all cursor-pointer"
                          >
                            Ajouter
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {hypotheses.differentiels.map((d, i) => (
                            <span key={i} className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2">
                              {d}
                              <button 
                                type="button"
                                onClick={() => setHypotheses({...hypotheses, differentiels: hypotheses.differentiels.filter((_, idx) => idx !== i)})} 
                                className="text-rose-500 hover:bg-rose-100 p-0.5 rounded cursor-pointer"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                          {hypotheses.differentiels.length === 0 && (
                            <p className="text-xs text-slate-400 italic">Aucun diagnostic différentiel défini.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* CIM11 Interactive Catalogue Selector (Right 1 col) */}
                    <div className="lg:col-span-1 bg-slate-50 p-6 rounded-3xl border border-slate-200/60 max-h-[460px] overflow-y-auto custom-scrollbar flex flex-col gap-4">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Recherche CIM-11 OMS</p>
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="Code CIM-11, libellé, chapitre..."
                            value={searchCim}
                            onChange={e => setSearchCim(e.target.value)}
                            className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 shadow-xs"
                          />
                          {searchCim && (
                            <button onClick={() => setSearchCim('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Filter by Specialty */}
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Filtrer par Spécialité</p>
                        <div className="flex flex-wrap gap-1">
                          {['Tous', 'Médecine Générale', 'Urgences', 'Maternité', 'Pédiatrie', 'Chirurgie', 'Traumatologie'].map(spec => (
                            <button
                              key={spec}
                              type="button"
                              onClick={() => setSelectedSpecialty(spec)}
                              className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
                                selectedSpecialty === spec 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {spec}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Favorites list */}
                      {!searchCim && favorites.length > 0 && (
                        <div>
                          <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-1.5">Favoris Cliniques ★</p>
                          <div className="space-y-1.5">
                            {cim11_catalog.filter(c => favorites.includes(c.code)).map(c => (
                              <div key={c.code} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100 text-[11px] font-semibold gap-2 hover:border-blue-300">
                                <button 
                                  onClick={() => handleSelectDiagnosis(c, false)}
                                  className="flex-1 text-left truncate hover:text-blue-600 cursor-pointer text-xs font-bold"
                                  type="button"
                                >
                                  <span className="font-mono text-[9px] bg-slate-100 px-1 py-0.5 rounded text-slate-500 mr-1.5 font-bold">{c.code}</span>
                                  {c.label}
                                </button>
                                <button type="button" onClick={() => toggleFavorite(c.code)} className="text-amber-500 hover:text-slate-300 cursor-pointer">
                                  ★
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Catalog view */}
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                          {searchCim ? 'Résultats de recherche' : 'Codes CIM-11 Référencés'}
                        </p>
                        <div className="space-y-1.5">
                          {filteredCim.map(c => (
                            <div key={c.code} className="flex flex-col p-2 bg-white rounded-xl border border-slate-100 text-[11px] font-semibold gap-1 hover:border-blue-300 transition-all">
                              <div className="flex items-center justify-between gap-1.5">
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const setDiff = window.confirm(`Voulez-vous ajouter "${c.label}" comme diagnostic DIFFERENTIEL ?\n(Annuler l'ajoutera comme DIAGNOSTIC PRINCIPAL)`);
                                    handleSelectDiagnosis(c, setDiff);
                                  }}
                                  className="flex-1 text-left truncate hover:text-blue-600 cursor-pointer text-xs font-black text-slate-800"
                                >
                                  <span className="font-mono text-[9px] bg-slate-100 px-1 py-0.5 rounded text-slate-600 mr-1.5 font-bold">{c.code}</span>
                                  {c.label}
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => toggleFavorite(c.code)} 
                                  className={favorites.includes(c.code) ? 'text-amber-500 cursor-pointer' : 'text-slate-300 hover:text-amber-500 cursor-pointer'}
                                >
                                  {favorites.includes(c.code) ? '★' : '☆'}
                                </button>
                              </div>
                              <div className="flex justify-between items-center text-[8px] text-slate-400 font-bold border-t border-slate-50 pt-1">
                                <span className="truncate max-w-[120px]">{c.chapter}</span>
                                <span className="bg-slate-100 px-1 rounded text-slate-500 uppercase">{c.specialty}</span>
                              </div>
                            </div>
                          ))}
                          {filteredCim.length === 0 && (
                            <p className="text-[10px] text-slate-400 italic">Aucun diagnostic correspondant.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {activeTab === 'examens' && (() => {
              // Predefined catalog of exams
              const EXAMS_CATALOG = [
                { name: 'NFS (Hémogramme)', price: 4000, category: 'Hématologie' },
                { name: 'TDR Paludisme / Goutte Épaisse', price: 2000, category: 'Parasitologie' },
                { name: 'CRP (Protéine C Réactive)', price: 5000, category: 'Immunologie' },
                { name: 'ECBU (Urines)', price: 6000, category: 'Bactériologie' },
                { name: 'Créatininémie', price: 3500, category: 'Biochimie' },
                { name: 'Glycémie à jeun', price: 1500, category: 'Biochimie' },
                { name: 'Échographie Obstétricale / Pelvienne', price: 10000, category: 'Imagerie' },
                { name: 'Radiographie Thoracique (Face)', price: 8000, category: 'Imagerie' },
                { name: 'ECG de repos 12 dérivations', price: 7000, category: 'Imagerie' }
              ];

              // Predefined clinical packs (Point 6)
              const CLINICAL_PACKS = [
                {
                  id: 'pack_palu',
                  name: 'Pack Paludisme',
                  description: 'TDR Paludisme + NFS (Hémogramme) + Goutte Épaisse',
                  exams: [
                    { name: 'NFS (Hémogramme)', price: 4000 },
                    { name: 'TDR Paludisme / Goutte Épaisse', price: 2000 }
                  ]
                },
                {
                  id: 'pack_cardio',
                  name: 'Pack Cardio / Rénal',
                  description: 'Créatininémie + Glycémie + ECG de repos',
                  exams: [
                    { name: 'Créatininémie', price: 3500 },
                    { name: 'Glycémie à jeun', price: 1500 },
                    { name: 'ECG de repos 12 dérivations', price: 7000 }
                  ]
                },
                {
                  id: 'pack_inf',
                  name: 'Pack Syndr. Infectieux',
                  description: 'NFS + CRP + ECBU',
                  exams: [
                    { name: 'NFS (Hémogramme)', price: 4000 },
                    { name: 'CRP (Protéine C Réactive)', price: 5000 },
                    { name: 'ECBU (Urines)', price: 6000 }
                  ]
                }
              ];

              const handleAddPack = (pack: any) => {
                const currentExams = [...examensDemandes];
                pack.exams.forEach((item: any) => {
                  if (!currentExams.some(e => e.name.toLowerCase() === item.name.toLowerCase())) {
                    currentExams.push({ name: item.name, urgent: false, price: item.price });
                  }
                });
                setExamensDemandes(currentExams);
              };

              return (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-lg font-black text-slate-800">Bulletin d'Examens Connecté</h3>
                    <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">Facturation & Labo Liés</span>
                  </div>

                  {/* Predefined packs & protocoles */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block font-bold">Packs & Protocoles Cliniques Rapides</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {CLINICAL_PACKS.map(p => (
                        <div key={p.id} className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl flex flex-col justify-between hover:border-purple-300 transition-all border-dashed">
                          <div>
                            <h4 className="font-black text-xs text-purple-900 mb-0.5">{p.name}</h4>
                            <p className="text-[10px] text-purple-600 font-semibold mb-3 leading-tight">{p.description}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddPack(p)}
                            className="w-full py-2 bg-purple-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-purple-700 transition-colors shadow-sm cursor-pointer"
                          >
                            Sélectionner le pack
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-t pt-4">
                    {/* Add individual exam */}
                    <div className="lg:col-span-2 space-y-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block font-mono">Ajouter un examen issu du catalogue</label>
                        <select 
                          onChange={(e) => {
                            if (!e.target.value) return;
                            const idx = parseInt(e.target.value);
                            const chosen = EXAMS_CATALOG[idx];
                            if (!examensDemandes.some(ex => ex.name.toLowerCase() === chosen.name.toLowerCase())) {
                              setExamensDemandes([...examensDemandes, { name: chosen.name, urgent: false, price: chosen.price }]);
                            }
                            e.target.value = '';
                          }}
                          className="w-full p-3.5 text-sm font-semibold border border-slate-200 rounded-2xl outline-none focus:border-blue-500 bg-white"
                        >
                          <option value="">-- Parcourir la nomenclature des prestations --</option>
                          {EXAMS_CATALOG.map((ex, idx) => (
                            <option key={idx} value={idx}>{ex.name} [Prestation : {ex.price} FCFA]</option>
                          ))}
                        </select>
                      </div>

                      {/* Selected exams list */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-bold block mb-1">Examens prescrits dans le bulletin</label>
                        {examensDemandes.map((e, i) => {
                          const status = e.status || 'demandé';
                          return (
                            <div key={i} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-slate-800 text-sm block">{e.name}</span>
                                  {e.urgent && <span className="bg-rose-100 text-rose-700 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md">Urgent</span>}
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black text-slate-400 uppercase">Tarif : {e.price || 2500} FCFA</span>
                                  
                                  {/* Status badge and manual selector */}
                                  <div className="flex items-center gap-1">
                                    <span className="text-[9px] text-slate-450 font-semibold">Statut :</span>
                                    <select
                                      value={status}
                                      onChange={(evt) => {
                                        const newEx = [...examensDemandes];
                                        newEx[i].status = evt.target.value as any;
                                        setExamensDemandes(newEx);
                                      }}
                                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                        status === 'demandé' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                        status === 'payé' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                        status === 'prélevé' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      }`}
                                    >
                                      <option value="demandé">🕒 Demandé</option>
                                      <option value="payé">💳 Payé</option>
                                      <option value="prélevé">🔬 Prélevé</option>
                                      <option value="validé">✅ Validé</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <label className="flex items-center gap-1.5 text-xs font-black text-rose-500 cursor-pointer select-none font-bold">
                                  <input 
                                    type="checkbox" 
                                    checked={e.urgent}
                                    onChange={() => {
                                      const newEx = [...examensDemandes];
                                      newEx[i].urgent = !newEx[i].urgent;
                                      setExamensDemandes(newEx);
                                    }}
                                    className="accent-rose-500 scale-110"
                                  /> Urgent
                                </label>
                                <button 
                                  type="button"
                                  onClick={() => setExamensDemandes(examensDemandes.filter((_, idx) => idx !== i))} 
                                  className="p-1 text-slate-450 hover:text-rose-600 cursor-pointer"
                                >
                                  <X size={15} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        {examensDemandes.length === 0 && (
                          <p className="p-4 bg-slate-50 text-slate-400 text-xs italic rounded-2xl text-center border-2 border-dashed border-slate-200">
                            Aucun examen programmé sur ce bulletin.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Laboratory Pre-estimation breakdown (Right 1 col) */}
                    <div className="lg:col-span-1 bg-slate-950 text-white p-6 rounded-3xl flex flex-col justify-between gap-4">
                      <div className="space-y-4">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimation Laboratoire</p>
                          <h4 className="text-sm font-semibold">Valorisation des examens</h4>
                        </div>
                        
                        <div className="divide-y divide-slate-850 text-xs font-semibold space-y-2.5">
                          {examensDemandes.map((ex, idx) => (
                            <div key={idx} className="flex justify-between pt-2">
                              <span className="text-slate-450 truncate max-w-[150px]">{ex.name}</span>
                              <span className="text-slate-350">{ex.price || 2500} FCFA</span>
                            </div>
                          ))}
                          {examensDemandes.length === 0 && (
                            <p className="text-[11px] text-slate-600 italic pt-4">Aucun frais estimé.</p>
                          )}
                          <div className="flex justify-between pt-3 font-black text-blue-400 text-sm border-t border-slate-800">
                            <span>Total Estimations</span>
                            <span>{examensDemandes.reduce((sum, e) => sum + (e.price || 2500), 0)} FCFA</span>
                          </div>
                        </div>
                      </div>

                      {examensDemandes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const uncommitted = examensDemandes.some(e => (e.status || 'demandé') === 'demandé');
                            if (!uncommitted) {
                              alert("Tous les examens de ce bulletin sont déjà en cours/payés !");
                              return;
                            }
                            
                            // Log transmission in audit log
                            addDoc(collection(db, 'audit_logs'), {
                              action: 'EXAM_BULLETIN_TRANSMISSION',
                              patientId: patient?.id || 'unknown',
                              patientName: patient?.nom || 'Inconnu',
                              userId: user?.id || 'unknown',
                              userName: user?.name || 'Medecin',
                              timestamp: new Date().toISOString(),
                              details: {
                                examCount: examensDemandes.length,
                                totalCost: examensDemandes.reduce((sum, e) => sum + (e.price || 2500), 0),
                                exams: examensDemandes.map(e => ({ name: e.name, price: e.price || 2500, status: 'demandé' }))
                              }
                            }).catch(err => console.error("Could not write audit log :", err));

                            // Turn todos into status paye or transmitted
                            setExamensDemandes(prev => prev.map(e => ({ ...e, status: e.status === 'demandé' ? 'payé' : e.status })));
                            alert(`📡 TRANSMISSION AUTOMATIQUE RÉUSSIE !\n\nLes examens ont été transmis aux modules Laboratoire (pour bons de prélèvement) et Facturation (pour encaissement des frais).`);
                          }}
                          className="w-full py-3 bg-purple-600 font-extrabold text-[10px] uppercase tracking-widest text-white rounded-xl hover:bg-purple-700 transition-colors shadow-md cursor-pointer"
                        >
                          ⚡ Transmettre au Labo & Caisse
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {activeTab === 'prise_en_charge' && (() => {
              // Drug catalog with details & pricing (Point 5)
              const MEDICINE_CATALOG = [
                { name: 'Paracétamol 500mg (Boite)', price: 500, defaultPosology: '1 comprimé toutes les 8 heures (3 fois/jour) pendant 5 jours', family: 'Antalgique' },
                { name: 'Amoxicilline 1g (Boite)', price: 2500, defaultPosology: '1 comprimé matin et soir pendant 7 jours', family: 'Antibiotique' },
                { name: 'Artemether-Lumefantrine (Coartem)', price: 2000, defaultPosology: '1 comprimé par jour au cours des repas pendant 3 jours', family: 'Antipaludique' },
                { name: 'Amlodipine 5mg (Boite)', price: 2250, defaultPosology: '1 comprimé par jour le matin en continu', family: 'Anti-hypertenseur' },
                { name: 'Ciprofloxacine 500mg', price: 3500, defaultPosology: '1 comprimé 2 fois par jour pendant 5 jours', family: 'Antibiotique' },
                { name: 'Spasfon Comprimés', price: 1500, defaultPosology: '1 comprimé lors des accès douloureux, max 3/jour', family: 'Antispasmodique' },
                { name: 'Gaviscon Suspension (Flacon)', price: 3000, defaultPosology: '1 sachet / cuillère 3 fois par jour après les repas', family: 'Antiacide' },
                { name: 'Metformine 500mg (Flacon)', price: 1800, defaultPosology: '1 comprimé matin et soir pendant le repas', family: 'Antidiabétique' }
              ];

              // State variables selectedDrugIndex, customDrugName, customDrugPrice, customPosology are now declared at top level

              const handleAddPrescription = (name: string, posology: string, price: number) => {
                if (!name.trim()) return;
                setPrescriptions([...prescriptions, { name, posologie: posology, price }]);
                setSelectedDrugIndex(null);
                setCustomDrugName('');
                setCustomPosology('');
              };

              return (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-lg font-black text-slate-800">Ordonnance Clinique & Pharmacie</h3>
                    <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 font-mono">Prescription & Dispensation</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Catalog search and Calculator (2 cols) */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl flex flex-col gap-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Calculateur de Posologie Rapide</h4>
                        
                        {/* Drug selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] font-black uppercase text-slate-500 mb-1 block">Saisir manuellement</label>
                            <input 
                              type="text" 
                              placeholder="Saisir médicament..."
                              value={customDrugName}
                              onChange={e => {
                                setCustomDrugName(e.target.value);
                              }}
                              className="w-full p-3 text-xs font-bold border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-white"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-black uppercase text-slate-500 mb-1 block font-bold">ou Sélectionner du catalogue</label>
                            <select
                              onChange={e => {
                                if (e.target.value === '') {
                                  setSelectedDrugIndex(null);
                                  return;
                                }
                                const idx = parseInt(e.target.value);
                                setSelectedDrugIndex(idx);
                                setCustomDrugName(MEDICINE_CATALOG[idx].name);
                                setCustomPosology(MEDICINE_CATALOG[idx].defaultPosology);
                                setCustomDrugPrice(MEDICINE_CATALOG[idx].price);
                              }}
                              value={selectedDrugIndex !== null ? selectedDrugIndex : ''}
                              className="w-full p-3 text-xs font-bold border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-white"
                            >
                              <option value="">-- Parcourir l'officine --</option>
                              {MEDICINE_CATALOG.map((drug, dIdx) => (
                                <option key={dIdx} value={dIdx}>{drug.name} [{drug.price} F]</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Posology Calculator Editor */}
                        <div className="flex flex-col gap-3">
                          <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                              <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">Nom final</label>
                              <input 
                                type="text"
                                value={customDrugName}
                                onChange={e => setCustomDrugName(e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                                placeholder="Sélectionner ou saisir..."
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">Tarif pharmacie (F)</label>
                              <input 
                                type="number"
                                value={customDrugPrice}
                                onChange={e => setCustomDrugPrice(parseInt(e.target.value) || 0)}
                                className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                                placeholder="..."
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">Calculateur Posologie (Comprimés/prises)</label>
                            <textarea 
                              value={customPosology}
                              onChange={e => setCustomPosology(e.target.value)}
                              className="w-full p-3 border border-slate-200 rounded-xl text-xs h-20 resize-none font-semibold text-slate-700"
                              placeholder="Ex. 1 comprimé à renouveler toutes les 8h si fièvre..."
                            />
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                handleAddPrescription(customDrugName, customPosology, customDrugPrice);
                              }}
                              className="px-5 py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                            >
                              Inscrire Ordonnance
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Display added meditations */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1 font-bold">Médicaments inscrits à l'ordonnance</label>
                        {prescriptions.map((p, idx) => (
                          <div key={idx} className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                            <div>
                              <p className="font-extrabold text-sm text-slate-900">{p.name}</p>
                              <p className="text-xs text-slate-500 font-semibold mb-1">{p.posologie}</p>
                              <span className="text-[9px] font-black uppercase text-slate-400">Tarif pharmacie : {p.price || 1500} FCFA</span>
                            </div>
                            <button 
                              type="button"
                              onClick={() => setPrescriptions(prescriptions.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-rose-500 p-1.5 cursor-pointer text-xs"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                        {prescriptions.length === 0 && (
                          <p className="p-4 bg-slate-50 text-slate-400 text-xs italic rounded-2xl text-center border-2 border-dashed border-slate-200">
                            Aucun médicament inscrit pour le moment.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Prescription total pricing (Right 1 col) */}
                    <div className="lg:col-span-1 bg-emerald-950 text-white p-6 rounded-3xl h-fit flex flex-col gap-4">
                      <div>
                        <p className="text-[9px] font-black text-emerald-300 uppercase tracking-widest mb-1">Estimation Pharmacie</p>
                        <h4 className="text-sm font-semibold">Valorisation de l'ordonnance</h4>
                      </div>

                      <div className="divide-y divide-emerald-800 text-xs font-semibold space-y-2.5">
                        {prescriptions.map((p, idx) => (
                          <div key={idx} className="flex justify-between pt-2">
                            <span className="text-emerald-200 truncate max-w-[150px]">{p.name}</span>
                            <span>{p.price || 1500} FCFA</span>
                          </div>
                        ))}
                        {prescriptions.length === 0 && (
                          <p className="text-[11px] text-emerald-500 italic pt-4">Vide.</p>
                        )}
                        <div className="flex justify-between pt-3 font-black text-white text-sm border-t border-emerald-700">
                          <span>Total Pharmacie</span>
                          <span>{prescriptions.reduce((sum, p) => sum + (p.price || 1500), 0)} FCFA</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Notes / Orientation */}
                  <div className="mt-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block font-bold">Orientation / Indications d'hospitalisation</label>
                    <textarea
                      value={orientation}
                      onChange={e => setOrientation(e.target.value)}
                      className="w-full p-4 border border-slate-200 rounded-2xl outline-none text-xs font-semibold"
                      placeholder="Ex: Patient orienté de toute urgence pour surveillance continue clinique..."
                      rows={3}
                    />
                  </div>
                </div>
              );
            })()}

            {activeTab === 'observation' && (
              <div className="space-y-6 animate-in fade-in h-full flex flex-col">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-lg font-black text-slate-800">Observation Médicale Générée</h3>
                  <div className="flex gap-2">
                    <button onClick={generateObservation} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">
                      Régénérer
                    </button>
                  </div>
                </div>
                <textarea
                  value={observation}
                  onChange={e => setObservation(e.target.value)}
                  className="flex-1 w-full p-6 border border-slate-200 rounded-2xl outline-none font-mono text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {activeTab === 'assistant_ia' && (
              <div className="h-full animate-in fade-in">
                <AIAssistantTab 
                  context="TREATMENT" 
                  patientId={patient?.id} 
                  data={{ 
                    motif, 
                    symptoms, 
                    antecedents, 
                    constantes, 
                    etatGeneral, 
                    examenAppareils 
                  }} 
                  mode="ADVANCED" 
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const currentIndex = tabs.findIndex(t => t.id === activeTab);
                if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].id);
              }}
              disabled={activeTab === tabs[0].id}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 disabled:opacity-50 flex items-center gap-1"
            >
              <ChevronLeft size={16} /> Précédent
            </button>
            <button 
              onClick={() => {
                const currentIndex = tabs.findIndex(t => t.id === activeTab);
                if (currentIndex < tabs.length - 1) {
                  const nextTab = tabs[currentIndex + 1].id;
                  if (nextTab === 'observation') generateObservation();
                  setActiveTab(nextTab);
                }
              }}
              disabled={activeTab === tabs[tabs.length - 1].id}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 disabled:opacity-50 flex items-center gap-1"
            >
              Suivant <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="px-5 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-slate-50 shadow-sm"
              type="button"
            >
              <Save size={16} className="text-slate-500" /> Enregistrer Brouillon
            </button>
            <button 
              onClick={handleTriggerCloturer}
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
              type="button"
            >
              <Check size={16} /> Clôturer la Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
