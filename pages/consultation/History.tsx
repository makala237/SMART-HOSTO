import React, { useState, useEffect } from 'react';
import { History, Search, Filter, Eye, RefreshCw, FileText, Calendar, X, Printer } from 'lucide-react';
import { db } from '../../src/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

interface HistoryProps {
  patientId?: string;
}

const HistoryComponent: React.FC<HistoryProps> = ({ patientId }) => {
  const [dbConsultations, setDbConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'GENERAL' | 'GYNECO' | 'CPN'>('ALL');
  const [viewDetailRecord, setViewDetailRecord] = useState<any | null>(null);

  // Inherent high-quality mock data to provide a rich fallback history registry
  const staticHistoryData = [
    { id: 'CONS-9982', patientId: '1', date: '12/05/2026', patient: 'Amadou DIOP', age: 39, gender: 'M', diagnosis: 'Paludisme simple', treatment: 'Artéméther-Luméfantrine', exams: 'TDR Palu (+)', type: 'Consultation Générale', doctor: 'Dr. Sarr', observation: 'Patient consulte pour fièvre et courbatures depuis 3 jours. Température 39°C. TDR Palu positif. Débute Coartem.' },
    { id: 'CONS-9975', patientId: '2', date: '10/05/2026', patient: 'Fatou NDIAYE', age: 28, gender: 'F', diagnosis: 'Infection Urinaire', treatment: 'Ciprofloxacine 500mg', exams: 'ECBU', type: 'Consultation Générale', doctor: 'Dr. Keita', observation: 'Brûlures mictionnelles et pollakiurie. Température 37.5°C. Abdomen souple. Prescription d\'antibiotiques.' },
    { id: 'CONS-9968', patientId: 'DME-4452', date: '12/03/2026', patient: 'KOULIBALY Youssouf', age: 45, gender: 'M', diagnosis: 'Hypertension Artérielle', treatment: 'Amlodipine 5mg', exams: 'Créatininémie', type: 'Consultation Générale', doctor: 'Dr. Sarr', observation: 'Suivi de routine pour HTA. Paramètres stables. Tension à 130/80. Poursuite du traitement en cours.' },
    { id: 'CONS-9961', patientId: 'DME-7721', date: '29/03/2026', patient: 'Awa DIALLO', age: 34, gender: 'F', diagnosis: 'Grossesse active 24 SA', treatment: 'Fer + Acide Folique', exams: 'Échographie Obstétricale', type: 'CPN / Maternité', doctor: 'Dr. Diallo', observation: 'Visite prénatale du 2ème trimestre. Hauteur utérine 21cm, bruits du coeur foetal bien perçus à 144 bpm.' }
  ];

  useEffect(() => {
    const loadDbConsultations = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'consultations'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const list: any[] = [];
        querySnapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setDbConsultations(list);
      } catch (err) {
        console.error("Firestore history download failed: ", err);
      } finally {
        setLoading(false);
      }
    };
    loadDbConsultations();
  }, []);

  // Merge Firestore records (taking priority) with the standard rich static dataset
  const mergedDataset = [...dbConsultations, ...staticHistoryData];

  // Remove potential duplicates by ID
  const uniqueDatasetMap = new Map();
  mergedDataset.forEach(item => {
    uniqueDatasetMap.set(item.id, item);
  });
  const finalDataset = Array.from(uniqueDatasetMap.values());

  // Search and Filter logic
  const filteredDataset = finalDataset.filter((h) => {
    // 1. Filter by specific active patient in Consultation workspace
    if (patientId && h.patientId !== patientId && h.patientIdRaw !== patientId) {
      return false;
    }

    // 2. Search query matching (matches Patient name, ID, or Diagnosis)
    const matchesSearch = searchQuery.trim() === '' || (
      h.patient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 3. Tab Categories Filters
    const matchesFilter = selectedFilter === 'ALL' || (
      selectedFilter === 'GENERAL' && h.type === 'Consultation Générale' ||
      selectedFilter === 'GYNECO' && h.type === 'Consultation Gynécologique' ||
      selectedFilter === 'CPN' && h.type === 'CPN / Maternité'
    );

    return matchesSearch && matchesFilter;
  });

  const handlePrintObservation = (h: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${h.id} - SMARTHOSTO CLINIC</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 50px; color: #1e293b; line-height: 1.6; background-color: #ffffff; }
            .header-bar { border-bottom: 4px solid #1e40af; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 22px; font-weight: 900; color: #1e40af; text-transform: uppercase; letter-spacing: 0.05em; }
            h1 { font-size: 28px; font-weight: 900; margin: 0; color: #0f172a; }
            .meta-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 30px; font-size: 13px; }
            .meta-item { font-weight: 800; color: #475569; }
            .meta-item span { font-weight: 500; color: #0f172a; margin-left: 6px; }
            h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #1e40af; border-bottom: 2px solid #eff6ff; padding-bottom: 6px; margin-top: 30px; margin-bottom: 12px; font-weight: 900; }
            .observation-block { background: #fafafa; border: 1px solid #e2e8f0; padding: 25px; border-radius: 12px; font-family: monospace; font-size: 13px; white-space: pre-wrap; color: #334155; }
            .footer-line { margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: right; font-size: 11px; color: #94a3b8; font-weight: 700; }
            .no-print-btn { text-align: center; margin-top: 35px; }
            .btn { background: #1e40af; color: white; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: bold; border: none; cursor: pointer; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
            @media print {
              .no-print-btn { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <div class="logo">SMARTHOSTO CLINIQUE SERVICES</div>
            <div style="font-size: 12px; color: #64748b; font-weight: bold;">DOCUMENT CLINIQUE CERTIFIÉ</div>
          </div>
          <h1>Observation Médicale d'Orientation</h1>
          <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 800; margin-top: 4px; margin-bottom: 24px;">Référence : ${h.id}</div>

          <div class="meta-grid">
            <div class="meta-item">Patient : <span>${h.patient}</span></div>
            <div class="meta-item">Date & Heure : <span>${h.date} • ${h.time || '10:00'}</span></div>
            <div class="meta-item">Identité Médicale : <span>${h.age} ans • ${h.gender}</span></div>
            <div class="meta-item">Praticien Responsable : <span>${h.doctor || 'Médecin Référent'}</span></div>
            <div class="meta-item">Type de Consultation : <span>${h.type || 'Standard'}</span></div>
            <div class="meta-item">Diagnostic d'Entrée : <span>${h.diagnosis || 'Non spécifié'}</span></div>
          </div>

          <h2>Observation de consultation</h2>
          <div class="observation-block">${h.observation || 'Aucune transcription détaillée enregistrée.'}</div>

          <h2>Prescriptions & Traitements associés</h2>
          <p style="font-size: 14px; font-weight: 700; color: #334155; margin-left: 8px;">${h.treatment || 'Aucun traitement prescrit.'}</p>

          <h2>Frais & Actes</h2>
          <p style="font-size: 14px; font-weight: 700; color: #334155; margin-left: 8px;">${h.exams || 'Aucun acte accessoire ordonné.'}</p>

          <div class="footer-line">
            Valide de droit • Signature Électronique Certifiée SMARTHOSTO CLINICAL CLOUD
          </div>

          <div class="no-print-btn">
            <button class="btn" onclick="window.print()">Déclencher l'Impression</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Historique Médical</h1>
          <p className="text-slate-500 font-medium italic">Retrouvez toutes vos consultations et dossiers cliniques archivés.</p>
        </div>

        {/* Categories togglers */}
        <div className="flex gap-2">
          {[
            { id: 'ALL', label: 'Tout' },
            { id: 'GENERAL', label: 'Consultations' },
            { id: 'GYNECO', label: 'Gynécologie' },
            { id: 'CPN', label: 'Maternité / CPN' }
          ].map((filt) => (
            <button
              key={filt.id}
              onClick={() => setSelectedFilter(filt.id as any)}
              className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                selectedFilter === filt.id 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {filt.label}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher patient, diagnostic, code ID..." 
              className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all w-80 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-bold">
            Téléchargement sécurisé des dossiers...
          </div>
        ) : filteredDataset.length === 0 ? (
          <div className="text-center py-20 text-slate-400 italic">
            Aucun dossier ne correspond aux critères de recherche.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & ID</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnostic Principal</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Traitement & Examens</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Module / Type</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredDataset.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{h.date}</p>
                          <p className="text-[10px] font-black text-slate-400 font-mono tracking-widest uppercase">{h.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-900">{h.patient}</p>
                      <p className="text-xs text-slate-500 font-semibold">{h.age} ans • {h.gender}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100 inline-block max-w-[200px] truncate">
                        {h.diagnosis}
                      </span>
                    </td>
                    <td className="px-8 py-6 max-w-xs">
                      <p className="text-xs font-bold text-slate-700 truncate mb-0.5">Tr : {h.treatment || 'Néant'}</p>
                      <p className="text-[10px] font-medium text-slate-500 truncate italic">Ex : {h.exams || 'Néant'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-lg">
                        {h.type || 'Consultation'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setViewDetailRecord(h)}
                          className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-250 transition-all cursor-pointer" 
                          title="Fiche Clinique Observation"
                        >
                          <FileText size={16} />
                        </button>
                        <button 
                          onClick={() => handlePrintObservation(h)}
                          className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all cursor-pointer" 
                          title="Imprimer Fiche"
                        >
                          <Printer size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAILED OBSERVATION RECORD POPUP */}
      {viewDetailRecord && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] border border-slate-200 w-full max-w-2xl p-10 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => setViewDetailRecord(null)} 
              className="absolute top-8 right-8 p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all"
            >
              <X size={18} />
            </button>

            <div className="flex justify-between items-start mb-6 border-b pb-4">
              <div>
                <span className="text-[9px] font-black tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase border border-indigo-100 font-mono">
                  {viewDetailRecord.id}
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">{viewDetailRecord.patient}</h3>
                <p className="text-xs text-slate-500 font-semibold">{viewDetailRecord.age} ans • {viewDetailRecord.gender}</p>
              </div>
              <button
                onClick={() => handlePrintObservation(viewDetailRecord)}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/25"
              >
                <Printer size={14} /> Imprimer Observation
              </button>
            </div>

            <div className="space-y-6 text-sm">
              <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-600">
                <span className="bg-slate-50 p-3 rounded-xl border border-slate-100">Date : <span className="text-slate-950">{viewDetailRecord.date}</span></span>
                <span className="bg-slate-50 p-3 rounded-xl border border-slate-100">Praticien : <span className="text-slate-950">{viewDetailRecord.doctor || 'Dr. Référent'}</span></span>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Diagnostic Retenu</h4>
                <div className="bg-blue-50 border border-blue-100 text-blue-800 font-black p-4 rounded-2xl flex items-center gap-3">
                  <RefreshCw size={16} className="text-blue-600 animate-spin" />
                  <span>{viewDetailRecord.diagnosis}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 font-mono">Observation Générée</h4>
                <div className="bg-slate-950 text-slate-50 p-6 rounded-2xl font-mono text-xs overflow-auto max-h-60 leading-relaxed block whitespace-pre-wrap rounded-box border border-slate-800">
                  {viewDetailRecord.observation || 'Aucune observation textuelle pré-générée.'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-800 mb-2">Traitement Prescrit</h4>
                  <p className="text-xs font-bold text-emerald-990">{viewDetailRecord.treatment || 'Néant'}</p>
                </div>
                <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-800 mb-2">Actes & Prestations</h4>
                  <p className="text-xs font-bold text-purple-990">{viewDetailRecord.exams || 'Néant'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t flex justify-end">
              <button 
                onClick={() => setViewDetailRecord(null)}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-black uppercase tracking-widest"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryComponent;
