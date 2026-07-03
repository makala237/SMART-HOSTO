import React, { useState } from 'react';
import { X, Save, AlertCircle, CheckCircle2, Pill, Beaker, Activity, ShieldAlert, Package, BrainCircuit, Ban, Plus, Trash2 } from 'lucide-react';

interface AddMedicationFormProps {
  onClose: () => void;
  onSave: (medication: any) => void;
}

const AddMedicationForm: React.FC<AddMedicationFormProps> = ({ onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'forme' | 'posologie' | 'securite' | 'stock' | 'ia'>('general');
  const [formData, setFormData] = useState({
    // Général
    nomCommercial: '',
    dci: '',
    codeInterne: '',
    codeBarre: '',
    laboratoire: '',
    classeTherapeutique: '',
    sousClasseTherapeutique: '',
    indications: '',

    // Forme & administration
    formeGalenique: '',
    dosageValeur: '',
    dosageUnite: '',
    concentration: '',
    volumeParUnite: '',
    voiesAdministration: [] as string[],

    // Posologie
    typePosologie: 'dose fixe',
    doseMinimale: '',
    doseMaximale: '',
    frequenceStandard: '',
    dureeStandard: '',
    doseMaxParPrise: '',
    doseMaxParJour: '',

    // Sécurité
    contreIndications: [] as string[],
    effetsSecondaires: [''],
    interactions: '',

    // Stock & conditionnement
    typeConditionnement: 'boîte',
    unitesParConditionnement: '',
    volumeParUniteStock: '',
    prixAchat: '',
    prixVente: '',
    seuilAlerte: '',

    // Paramètres IA
    parametresSurveiller: [] as string[],
    signesAlerte: [''],
    niveauRisque: 'faible',
    recommandations: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData(prev => {
      const newArray = [...(prev[field as keyof typeof prev] as string[])];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as string[]), '']
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => {
      const newArray = [...(prev[field as keyof typeof prev] as string[])];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray };
    });
  };

  const toggleMultiSelect = (field: string, value: string) => {
    setFormData(prev => {
      const current = prev[field as keyof typeof prev] as string[];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nomCommercial.trim()) newErrors.nomCommercial = 'Le nom commercial est obligatoire';
    if (!formData.dci.trim()) newErrors.dci = 'La DCI est obligatoire';
    if (formData.voiesAdministration.length === 0) newErrors.voiesAdministration = 'Au moins une voie d\'administration est requise';
    if (!formData.dosageUnite) newErrors.dosageUnite = 'L\'unité de dosage est obligatoire';

    if (formData.doseMinimale && formData.doseMaximale) {
      if (parseFloat(formData.doseMinimale) > parseFloat(formData.doseMaximale)) {
        newErrors.doseMaximale = 'La dose maximale doit être supérieure ou égale à la dose minimale';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    } else {
      // Find the first tab with an error and switch to it
      if (errors.nomCommercial || errors.dci) setActiveTab('general');
      else if (errors.voiesAdministration || errors.dosageUnite) setActiveTab('forme');
      else if (errors.doseMaximale) setActiveTab('posologie');
    }
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: Pill },
    { id: 'forme', label: 'Forme & Admin', icon: Beaker },
    { id: 'posologie', label: 'Posologie', icon: Activity },
    { id: 'securite', label: 'Sécurité', icon: ShieldAlert },
    { id: 'stock', label: 'Stock', icon: Package },
    { id: 'ia', label: 'Paramètres IA', icon: BrainCircuit }
  ] as const;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Pill size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Ajouter un médicament</h2>
              <p className="text-sm text-slate-500 font-medium">Référentiel intelligent des médicaments</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-xl transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-4 border-b border-slate-100 gap-2 overflow-x-auto shrink-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const hasError = (tab.id === 'general' && (errors.nomCommercial || errors.dci)) ||
                             (tab.id === 'forme' && (errors.voiesAdministration || errors.dosageUnite)) ||
                             (tab.id === 'posologie' && errors.doseMaximale);

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-sm transition-colors whitespace-nowrap ${
                  isActive 
                    ? 'border-blue-600 text-blue-600' 
                    : hasError 
                      ? 'border-transparent text-rose-500 hover:text-rose-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {hasError && <AlertCircle size={14} className="text-rose-500" />}
              </button>
            );
          })}
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <form id="medication-form" onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            
            {/* ONGLET 1 - GÉNÉRAL */}
            {activeTab === 'general' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nom commercial <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.nomCommercial}
                      onChange={(e) => handleInputChange('nomCommercial', e.target.value)}
                      className={`w-full p-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.nomCommercial ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200'}`}
                      placeholder="Ex: Doliprane"
                    />
                    {errors.nomCommercial && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.nomCommercial}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">DCI (Dénomination Commune Internationale) <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.dci}
                      onChange={(e) => handleInputChange('dci', e.target.value)}
                      className={`w-full p-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.dci ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200'}`}
                      placeholder="Ex: Paracétamol"
                    />
                    {errors.dci && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.dci}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Code interne</label>
                    <input 
                      type="text" 
                      value={formData.codeInterne}
                      onChange={(e) => handleInputChange('codeInterne', e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Auto généré si vide"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Code barre</label>
                    <input 
                      type="text" 
                      value={formData.codeBarre}
                      onChange={(e) => handleInputChange('codeBarre', e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Scanner ou saisir"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Laboratoire / Fabricant</label>
                    <input 
                      type="text" 
                      value={formData.laboratoire}
                      onChange={(e) => handleInputChange('laboratoire', e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Ex: Sanofi"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Classe thérapeutique</label>
                    <select 
                      value={formData.classeTherapeutique}
                      onChange={(e) => handleInputChange('classeTherapeutique', e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Sélectionner une classe...</option>
                      <option value="Antalgiques">Antalgiques</option>
                      <option value="Antibiotiques">Antibiotiques</option>
                      <option value="Anti-inflammatoires">Anti-inflammatoires</option>
                      <option value="Antihypertenseurs">Antihypertenseurs</option>
                      <option value="Antidiabétiques">Antidiabétiques</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Sous-classe thérapeutique</label>
                    <input 
                      type="text" 
                      value={formData.sousClasseTherapeutique}
                      onChange={(e) => handleInputChange('sousClasseTherapeutique', e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Ex: Palier 1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Indications principales</label>
                  <textarea 
                    value={formData.indications}
                    onChange={(e) => handleInputChange('indications', e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                    placeholder="Séparées par des virgules (ex: Fièvre, Douleurs légères à modérées)"
                  />
                  <p className="text-xs text-slate-500 mt-2">Ces indications seront utilisées par l'Assistant IA pour vérifier la pertinence des prescriptions.</p>
                </div>
              </div>
            )}

            {/* ONGLET 2 - FORME & ADMINISTRATION */}
            {activeTab === 'forme' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Présentation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Forme galénique</label>
                      <select 
                        value={formData.formeGalenique}
                        onChange={(e) => handleInputChange('formeGalenique', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="comprimé">Comprimé / Gélule</option>
                        <option value="sirop">Sirop / Suspension</option>
                        <option value="injectable">Injectable (Ampoule)</option>
                        <option value="perfusion">Perfusion (Poche)</option>
                        <option value="pommade">Pommade / Crème</option>
                        <option value="suppositoire">Suppositoire</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Dosage (valeur)</label>
                      <input 
                        type="number" 
                        value={formData.dosageValeur}
                        onChange={(e) => handleInputChange('dosageValeur', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Ex: 500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Unité de dosage <span className="text-rose-500">*</span></label>
                      <select 
                        value={formData.dosageUnite}
                        onChange={(e) => handleInputChange('dosageUnite', e.target.value)}
                        className={`w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${errors.dosageUnite ? 'border-rose-300' : 'border-slate-200'}`}
                      >
                        <option value="">Sélectionner...</option>
                        <option value="mg">mg</option>
                        <option value="g">g</option>
                        <option value="mcg">µg (mcg)</option>
                        <option value="UI">UI</option>
                        <option value="ml">ml</option>
                        <option value="%">%</option>
                      </select>
                      {errors.dosageUnite && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.dosageUnite}</p>}
                    </div>
                  </div>

                  {/* Logique dynamique basée sur la forme */}
                  {(formData.formeGalenique === 'sirop' || formData.formeGalenique === 'injectable' || formData.formeGalenique === 'perfusion') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-100">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          {formData.formeGalenique === 'sirop' ? 'Concentration (ex: 100mg/5ml)' : 'Dilution / Concentration'}
                        </label>
                        <input 
                          type="text" 
                          value={formData.concentration}
                          onChange={(e) => handleInputChange('concentration', e.target.value)}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Ex: 100mg/5ml"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Volume total par unité</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={formData.volumeParUnite}
                            onChange={(e) => handleInputChange('volumeParUnite', e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none pr-12"
                            placeholder="Ex: 100"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">ml</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Voies d'administration <span className="text-rose-500">*</span></h3>
                  {errors.voiesAdministration && <p className="text-xs text-rose-500 mb-3 font-medium">{errors.voiesAdministration}</p>}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { id: 'orale', label: 'Orale (Per os)' },
                      { id: 'IV', label: 'Intraveineuse (IV)' },
                      { id: 'IM', label: 'Intramusculaire (IM)' },
                      { id: 'SC', label: 'Sous-cutanée (SC)' },
                      { id: 'rectale', label: 'Rectale' },
                      { id: 'cutanee', label: 'Cutanée / Locale' },
                      { id: 'inhalee', label: 'Inhalée' },
                      { id: 'sublinguale', label: 'Sublinguale' }
                    ].map(voie => (
                      <label 
                        key={voie.id} 
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          formData.voiesAdministration.includes(voie.id) 
                            ? 'bg-blue-50 border-blue-200 text-blue-700' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          checked={formData.voiesAdministration.includes(voie.id)}
                          onChange={() => toggleMultiSelect('voiesAdministration', voie.id)}
                        />
                        <span className="text-sm font-bold">{voie.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ONGLET 3 - POSOLOGIE */}
            {activeTab === 'posologie' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-blue-50 text-blue-700 p-4 rounded-xl flex items-start gap-3 border border-blue-100">
                  <Activity className="shrink-0 mt-0.5" size={20} />
                  <p className="text-sm font-medium">
                    Ces paramètres sont utilisés par le <strong>Calculateur de posologie</strong> pour générer des prescriptions sécurisées et par l'<strong>Assistant IA</strong> pour vérifier les doses prescrites.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">Type de posologie par défaut</label>
                    <div className="flex flex-wrap gap-3">
                      {['dose fixe', 'mg/kg', 'mg/kg/jour'].map(type => (
                        <label 
                          key={type}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all ${
                            formData.typePosologie === type 
                              ? 'bg-slate-900 border-slate-900 text-white' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="typePosologie"
                            className="hidden"
                            checked={formData.typePosologie === type}
                            onChange={() => handleInputChange('typePosologie', type)}
                          />
                          <span className="text-sm font-bold">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Dose minimale usuelle</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={formData.doseMinimale}
                          onChange={(e) => handleInputChange('doseMinimale', e.target.value)}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none pr-16"
                          placeholder="Ex: 10"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{formData.typePosologie === 'dose fixe' ? formData.dosageUnite || 'unité' : formData.typePosologie}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Dose maximale usuelle</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={formData.doseMaximale}
                          onChange={(e) => handleInputChange('doseMaximale', e.target.value)}
                          className={`w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none pr-16 ${errors.doseMaximale ? 'border-rose-300' : 'border-slate-200'}`}
                          placeholder="Ex: 15"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{formData.typePosologie === 'dose fixe' ? formData.dosageUnite || 'unité' : formData.typePosologie}</span>
                      </div>
                      {errors.doseMaximale && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.doseMaximale}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Fréquence standard</label>
                      <select 
                        value={formData.frequenceStandard}
                        onChange={(e) => handleInputChange('frequenceStandard', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="24">1 fois par jour (toutes les 24h)</option>
                        <option value="12">2 fois par jour (toutes les 12h)</option>
                        <option value="8">3 fois par jour (toutes les 8h)</option>
                        <option value="6">4 fois par jour (toutes les 6h)</option>
                        <option value="4">6 fois par jour (toutes les 4h)</option>
                        <option value="prn">Si besoin (PRN)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Durée standard (jours)</label>
                      <input 
                        type="number" 
                        value={formData.dureeStandard}
                        onChange={(e) => handleInputChange('dureeStandard', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Ex: 5"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Limites absolues (Sécurité)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Dose MAX absolue par prise</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={formData.doseMaxParPrise}
                          onChange={(e) => handleInputChange('doseMaxParPrise', e.target.value)}
                          className="w-full p-3 bg-rose-50/50 border border-rose-100 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none pr-12"
                          placeholder="Ex: 1000"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{formData.dosageUnite || 'unité'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Dose MAX absolue par 24h</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={formData.doseMaxParJour}
                          onChange={(e) => handleInputChange('doseMaxParJour', e.target.value)}
                          className="w-full p-3 bg-rose-50/50 border border-rose-100 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none pr-12"
                          placeholder="Ex: 4000"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{formData.dosageUnite || 'unité'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ONGLET 4 - SÉCURITÉ */}
            {activeTab === 'securite' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Ban size={16} className="text-rose-500" /> Contre-indications majeures
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { id: 'grossesse', label: 'Grossesse' },
                      { id: 'allaitement', label: 'Allaitement' },
                      { id: 'enfant', label: 'Enfant < 15 ans' },
                      { id: 'nourrisson', label: 'Nourrisson < 30 mois' },
                      { id: 'ir', label: 'Insuffisance rénale sévère' },
                      { id: 'ih', label: 'Insuffisance hépatique sévère' },
                      { id: 'allergie', label: 'Allergie connue' },
                      { id: 'ulcera', label: 'Ulcère gastro-duodénal' }
                    ].map(ci => (
                      <label 
                        key={ci.id} 
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          formData.contreIndications.includes(ci.id) 
                            ? 'bg-rose-50 border-rose-200 text-rose-700' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                          checked={formData.contreIndications.includes(ci.id)}
                          onChange={() => toggleMultiSelect('contreIndications', ci.id)}
                        />
                        <span className="text-sm font-bold">{ci.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <AlertCircle size={16} className="text-orange-500" /> Effets secondaires fréquents
                    </h3>
                    <button 
                      type="button" 
                      onClick={() => addArrayItem('effetsSecondaires')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Plus size={14} /> Ajouter un effet
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.effetsSecondaires.map((effet, index) => (
                      <div key={index} className="flex gap-2">
                        <input 
                          type="text" 
                          value={effet}
                          onChange={(e) => handleArrayChange('effetsSecondaires', index, e.target.value)}
                          className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Ex: Nausées, somnolence..."
                        />
                        {formData.effetsSecondaires.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeArrayItem('effetsSecondaires', index)}
                            className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Interactions médicamenteuses</h3>
                  <textarea 
                    value={formData.interactions}
                    onChange={(e) => handleInputChange('interactions', e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                    placeholder="Décrire les interactions majeures (déconseillées ou nécessitant des précautions d'emploi)"
                  />
                </div>
              </div>
            )}

            {/* ONGLET 5 - STOCK & CONDITIONNEMENT */}
            {activeTab === 'stock' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-start gap-3 border border-emerald-100">
                  <Package className="shrink-0 mt-0.5" size={20} />
                  <p className="text-sm font-medium">
                    Ces informations lient le référentiel médical au <strong>Module Pharmacie / Stock</strong> pour la gestion des inventaires et la facturation.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Type de conditionnement</label>
                      <select 
                        value={formData.typeConditionnement}
                        onChange={(e) => handleInputChange('typeConditionnement', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="boîte">Boîte</option>
                        <option value="flacon">Flacon</option>
                        <option value="ampoule">Ampoule (à l'unité)</option>
                        <option value="tube">Tube</option>
                        <option value="poche">Poche</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Unités par conditionnement</label>
                      <input 
                        type="number" 
                        value={formData.unitesParConditionnement}
                        onChange={(e) => handleInputChange('unitesParConditionnement', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Ex: 30 (comprimés)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Volume par unité (stock)</label>
                      <input 
                        type="text" 
                        value={formData.volumeParUniteStock}
                        onChange={(e) => handleInputChange('volumeParUniteStock', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Ex: 150ml"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Prix d'achat unitaire</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={formData.prixAchat}
                          onChange={(e) => handleInputChange('prixAchat', e.target.value)}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none pr-12"
                          placeholder="0"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">FCFA</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Prix de vente unitaire</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={formData.prixVente}
                          onChange={(e) => handleInputChange('prixVente', e.target.value)}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none pr-12"
                          placeholder="0"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">FCFA</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Seuil d'alerte stock</label>
                      <input 
                        type="number" 
                        value={formData.seuilAlerte}
                        onChange={(e) => handleInputChange('seuilAlerte', e.target.value)}
                        className="w-full p-3 bg-orange-50/50 border border-orange-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="Ex: 10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ONGLET 6 - PARAMÈTRES IA */}
            {activeTab === 'ia' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 text-indigo-800/50">
                    <BrainCircuit size={120} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-lg font-black mb-2 flex items-center gap-2">
                      <BrainCircuit size={20} className="text-indigo-400" /> Intelligence Artificielle
                    </h3>
                    <p className="text-indigo-200 text-sm font-medium max-w-2xl">
                      Configurez comment l'Assistant IA et le Planificateur de soins doivent surveiller l'administration de ce médicament. Ces paramètres génèrent des alertes proactives.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-8">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Paramètres cliniques à surveiller</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { id: 'ta', label: 'Tension Artérielle' },
                        { id: 'fc', label: 'Fréq. Cardiaque' },
                        { id: 'temp', label: 'Température' },
                        { id: 'fr', label: 'Fréq. Respiratoire' },
                        { id: 'spo2', label: 'SpO2' },
                        { id: 'glycemie', label: 'Glycémie' },
                        { id: 'diurese', label: 'Diurèse' },
                        { id: 'douleur', label: 'Score Douleur' }
                      ].map(param => (
                        <label 
                          key={param.id} 
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            formData.parametresSurveiller.includes(param.id) 
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                            checked={formData.parametresSurveiller.includes(param.id)}
                            onChange={() => toggleMultiSelect('parametresSurveiller', param.id)}
                          />
                          <span className="text-sm font-bold">{param.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Signes cliniques d'alerte (IA)</h4>
                      <button 
                        type="button" 
                        onClick={() => addArrayItem('signesAlerte')}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        <Plus size={14} /> Ajouter un signe
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formData.signesAlerte.map((signe, index) => (
                        <div key={index} className="flex gap-2">
                          <input 
                            type="text" 
                            value={signe}
                            onChange={(e) => handleArrayChange('signesAlerte', index, e.target.value)}
                            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Ex: Éruption cutanée, saignements anormaux..."
                          />
                          {formData.signesAlerte.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => removeArrayItem('signesAlerte', index)}
                              className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">Niveau de risque global</label>
                      <div className="flex gap-3">
                        {[
                          { id: 'faible', label: 'Faible', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
                          { id: 'modere', label: 'Modéré', color: 'bg-orange-100 text-orange-700 border-orange-200' },
                          { id: 'eleve', label: 'Élevé', color: 'bg-rose-100 text-rose-700 border-rose-200' }
                        ].map(niveau => (
                          <label 
                            key={niveau.id}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                              formData.niveauRisque === niveau.id 
                                ? niveau.color + ' ring-2 ring-offset-1 ring-' + niveau.color.split('-')[1] + '-500'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            <input 
                              type="radio" 
                              name="niveauRisque"
                              className="hidden"
                              checked={formData.niveauRisque === niveau.id}
                              onChange={() => handleInputChange('niveauRisque', niveau.id)}
                            />
                            <span className="text-sm font-bold">{niveau.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Recommandations IA (Contexte)</label>
                      <textarea 
                        value={formData.recommandations}
                        onChange={(e) => handleInputChange('recommandations', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                        placeholder="Instructions spécifiques que l'IA doit donner aux infirmiers lors de l'administration (ex: Administrer lentement en IV directe sur 3 min)."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between">
          <div className="text-sm text-slate-500 font-medium">
            {Object.keys(errors).length > 0 && (
              <span className="text-rose-500 flex items-center gap-1">
                <AlertCircle size={16} /> Veuillez corriger les erreurs avant d'enregistrer.
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit"
              form="medication-form"
              className="px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <Save size={18} /> Enregistrer le médicament
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddMedicationForm;
