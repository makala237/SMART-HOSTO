import React, { useState } from 'react';
import { X, Save, AlertCircle, Stethoscope, FolderTree, Clock, CreditCard, Package, BrainCircuit, Plus, Trash2, Beaker } from 'lucide-react';

interface AddMedicalActFormProps {
  onClose: () => void;
  onSave: (act: any) => void;
}

const AddMedicalActForm: React.FC<AddMedicalActFormProps> = ({ onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'classification' | 'execution' | 'facturation' | 'ressources' | 'ia' | 'laboratoire'>('general');
  const [formData, setFormData] = useState({
    // Général
    nom: '',
    codeInterne: '',
    description: '',
    type: 'acte médical',

    // Classification
    servicePrincipal: '',
    sousService: '',
    categorie: '',
    priorite: 'normal',

    // Exécution
    professionsAutorisees: [] as string[],
    dureeEstimee: '',
    necessiteRdv: false,
    peutEtreUrgent: false,
    genereHospitalisation: false,
    necessiteSurveillance: false,
    necessiteConsentement: false,

    // Facturation
    prixBase: '',
    modeTarification: 'fixe',
    factureA: 'accueil',
    remboursable: false,
    partageRevenu: false,
    pourcentageMedecin: '',
    pourcentageStructure: '',

    // Ressources
    medicamentsUtilises: [''],
    consommables: [''],
    equipements: [''],

    // Paramètres IA
    indications: '',
    signesDeclencheurs: [''],
    parametresSurveiller: [] as string[],
    niveauRisque: 'faible',
    actionsAssociees: [] as string[],

    // Laboratoire
    labParameters: [] as { nom: string; unite: string; valeurReferenceMin?: number; valeurReferenceMax?: number; valeurReferenceTexte?: string }[]
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

    if (!formData.nom.trim()) newErrors.nom = 'Le nom de l\'acte est obligatoire';
    if (!formData.servicePrincipal) newErrors.servicePrincipal = 'Le service principal est obligatoire';
    if (formData.professionsAutorisees.length === 0) newErrors.professionsAutorisees = 'Au moins une profession autorisée est requise';
    
    if (formData.modeTarification !== 'variable' && !formData.prixBase) {
      newErrors.prixBase = 'Le prix est obligatoire';
    }

    if (formData.partageRevenu) {
      const pMed = parseFloat(formData.pourcentageMedecin) || 0;
      const pStruct = parseFloat(formData.pourcentageStructure) || 0;
      if (pMed + pStruct !== 100) {
        newErrors.partageRevenu = 'La somme des pourcentages doit être égale à 100%';
      }
    }

    if (formData.servicePrincipal === 'laboratoire' || formData.type === 'examen') {
      if (formData.labParameters.length === 0) {
        newErrors.labParameters = 'Au moins un paramètre de laboratoire est requis';
      } else {
        const invalidParams = formData.labParameters.filter(p => !p.nom.trim() || !p.unite.trim());
        if (invalidParams.length > 0) {
          newErrors.labParameters = 'Tous les paramètres doivent avoir un nom et une unité';
        }
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
      if (errors.nom) setActiveTab('general');
      else if (errors.servicePrincipal) setActiveTab('classification');
      else if (errors.professionsAutorisees) setActiveTab('execution');
      else if (errors.prixBase || errors.partageRevenu) setActiveTab('facturation');
      else if (errors.labParameters) setActiveTab('laboratoire');
    }
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: Stethoscope },
    { id: 'classification', label: 'Classification', icon: FolderTree },
    { id: 'execution', label: 'Exécution', icon: Clock },
    { id: 'facturation', label: 'Facturation', icon: CreditCard },
    { id: 'ressources', label: 'Ressources', icon: Package },
    { id: 'ia', label: 'Paramètres IA', icon: BrainCircuit },
    ...(formData.servicePrincipal === 'laboratoire' || formData.type === 'examen' ? [{ id: 'laboratoire', label: 'Laboratoire', icon: Beaker }] : [])
  ] as const;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Stethoscope size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Ajouter un acte ou prestation</h2>
              <p className="text-sm text-slate-500 font-medium">Référentiel centralisé des actes médicaux</p>
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
            const hasError = (tab.id === 'general' && errors.nom) ||
                             (tab.id === 'classification' && errors.servicePrincipal) ||
                             (tab.id === 'execution' && errors.professionsAutorisees) ||
                             (tab.id === 'facturation' && (errors.prixBase || errors.partageRevenu)) ||
                             (tab.id === 'laboratoire' && errors.labParameters);

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
          <form id="medical-act-form" onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            
            {/* ONGLET 1 - GÉNÉRAL */}
            {activeTab === 'general' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nom de l'acte <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.nom}
                      onChange={(e) => handleInputChange('nom', e.target.value)}
                      className={`w-full p-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.nom ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200'}`}
                      placeholder="Ex: Consultation Générale"
                    />
                    {errors.nom && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.nom}</p>}
                  </div>
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
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                    placeholder="Description détaillée de l'acte..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Type d'acte</label>
                  <div className="flex flex-wrap gap-3">
                    {['acte médical', 'prestation administrative', 'soin infirmier', 'examen', 'intervention'].map(type => (
                      <label 
                        key={type}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all ${
                          formData.type === type 
                            ? 'bg-slate-900 border-slate-900 text-white' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="type"
                          className="hidden"
                          checked={formData.type === type}
                          onChange={() => handleInputChange('type', type)}
                        />
                        <span className="text-sm font-bold capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ONGLET 2 - CLASSIFICATION */}
            {activeTab === 'classification' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Service principal <span className="text-rose-500">*</span></label>
                    <select 
                      value={formData.servicePrincipal}
                      onChange={(e) => handleInputChange('servicePrincipal', e.target.value)}
                      className={`w-full p-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${errors.servicePrincipal ? 'border-rose-300' : 'border-slate-200'}`}
                    >
                      <option value="">Sélectionner...</option>
                      <option value="consultation">Consultation</option>
                      <option value="maternite">Maternité</option>
                      <option value="laboratoire">Laboratoire</option>
                      <option value="bloc_operatoire">Bloc opératoire</option>
                      <option value="hospitalisation">Hospitalisation</option>
                      <option value="pharmacie">Pharmacie</option>
                      <option value="accueil">Accueil</option>
                    </select>
                    {errors.servicePrincipal && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.servicePrincipal}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Sous-service (optionnel)</label>
                    <input 
                      type="text" 
                      value={formData.sousService}
                      onChange={(e) => handleInputChange('sousService', e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Ex: Pédiatrie"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Catégorie</label>
                    <select 
                      value={formData.categorie}
                      onChange={(e) => handleInputChange('categorie', e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="consultation">Consultation</option>
                      <option value="accouchement">Accouchement</option>
                      <option value="chirurgie">Chirurgie</option>
                      <option value="analyse">Analyse</option>
                      <option value="soin">Soin</option>
                      <option value="urgence">Urgence</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Priorité possible</label>
                    <select 
                      value={formData.priorite}
                      onChange={(e) => handleInputChange('priorite', e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                      <option value="critique">Critique</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ONGLET 3 - EXÉCUTION */}
            {activeTab === 'execution' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Professions autorisées <span className="text-rose-500">*</span></h3>
                  {errors.professionsAutorisees && <p className="text-xs text-rose-500 mb-3 font-medium">{errors.professionsAutorisees}</p>}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { id: 'medecin', label: 'Médecin' },
                      { id: 'sage_femme', label: 'Sage-femme' },
                      { id: 'infirmier', label: 'Infirmier' },
                      { id: 'technicien_labo', label: 'Technicien Labo' }
                    ].map(prof => (
                      <label 
                        key={prof.id} 
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          formData.professionsAutorisees.includes(prof.id) 
                            ? 'bg-blue-50 border-blue-200 text-blue-700' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          checked={formData.professionsAutorisees.includes(prof.id)}
                          onChange={() => toggleMultiSelect('professionsAutorisees', prof.id)}
                        />
                        <span className="text-sm font-bold">{prof.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Durée estimée (minutes)</label>
                    <input 
                      type="number" 
                      value={formData.dureeEstimee}
                      onChange={(e) => handleInputChange('dureeEstimee', e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Ex: 30"
                    />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Paramètres d'exécution</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                      <input 
                        type="checkbox" 
                        checked={formData.necessiteRdv}
                        onChange={(e) => handleInputChange('necessiteRdv', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Nécessite un rendez-vous</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                      <input 
                        type="checkbox" 
                        checked={formData.peutEtreUrgent}
                        onChange={(e) => handleInputChange('peutEtreUrgent', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Peut être urgent</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                      <input 
                        type="checkbox" 
                        checked={formData.genereHospitalisation}
                        onChange={(e) => handleInputChange('genereHospitalisation', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Génère une hospitalisation</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                      <input 
                        type="checkbox" 
                        checked={formData.necessiteSurveillance}
                        onChange={(e) => handleInputChange('necessiteSurveillance', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Nécessite une surveillance</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                      <input 
                        type="checkbox" 
                        checked={formData.necessiteConsentement}
                        onChange={(e) => handleInputChange('necessiteConsentement', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Nécessite un consentement</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ONGLET 4 - FACTURATION */}
            {activeTab === 'facturation' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-start gap-3 border border-emerald-100">
                  <CreditCard className="shrink-0 mt-0.5" size={20} />
                  <p className="text-sm font-medium">
                    Ces paramètres alimentent directement la <strong>Caisse</strong> et le <strong>Journal Journalier</strong>.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Mode de tarification</label>
                      <select 
                        value={formData.modeTarification}
                        onChange={(e) => handleInputChange('modeTarification', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="fixe">Fixe</option>
                        <option value="variable">Variable</option>
                        <option value="par_unite">Par unité</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Prix de base <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={formData.prixBase}
                          onChange={(e) => handleInputChange('prixBase', e.target.value)}
                          className={`w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none pr-16 ${errors.prixBase ? 'border-rose-300' : 'border-slate-200'}`}
                          placeholder="0"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">FCFA</span>
                      </div>
                      {errors.prixBase && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.prixBase}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Facturé à</label>
                      <select 
                        value={formData.factureA}
                        onChange={(e) => handleInputChange('factureA', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="accueil">Accueil (Caisse principale)</option>
                        <option value="pharmacie">Pharmacie</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                    <div className="flex items-center mt-8">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.remboursable}
                          onChange={(e) => handleInputChange('remboursable', e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-sm font-bold text-slate-700">Acte remboursable (Assurance)</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Partage de revenu</h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.partageRevenu}
                        onChange={(e) => handleInputChange('partageRevenu', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Activer</span>
                    </label>
                  </div>
                  
                  {formData.partageRevenu && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Pourcentage Médecin</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={formData.pourcentageMedecin}
                            onChange={(e) => handleInputChange('pourcentageMedecin', e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none pr-12"
                            placeholder="Ex: 60"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Pourcentage Structure</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={formData.pourcentageStructure}
                            onChange={(e) => handleInputChange('pourcentageStructure', e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none pr-12"
                            placeholder="Ex: 40"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                        </div>
                      </div>
                      {errors.partageRevenu && <p className="text-xs text-rose-500 col-span-2 font-medium">{errors.partageRevenu}</p>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ONGLET 5 - RESSOURCES */}
            {(activeTab === 'ressources' && formData.categorie !== 'consultation') && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Médicaments utilisés</h3>
                    <button 
                      type="button" 
                      onClick={() => addArrayItem('medicamentsUtilises')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Plus size={14} /> Ajouter
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.medicamentsUtilises.map((med, index) => (
                      <div key={index} className="flex gap-2">
                        <input 
                          type="text" 
                          value={med}
                          onChange={(e) => handleArrayChange('medicamentsUtilises', index, e.target.value)}
                          className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Ex: Lidocaïne 1%"
                        />
                        {formData.medicamentsUtilises.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeArrayItem('medicamentsUtilises', index)}
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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Consommables</h3>
                    <button 
                      type="button" 
                      onClick={() => addArrayItem('consommables')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Plus size={14} /> Ajouter
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.consommables.map((cons, index) => (
                      <div key={index} className="flex gap-2">
                        <input 
                          type="text" 
                          value={cons}
                          onChange={(e) => handleArrayChange('consommables', index, e.target.value)}
                          className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Ex: Gants stériles, Seringues..."
                        />
                        {formData.consommables.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeArrayItem('consommables', index)}
                            className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {(formData.categorie === 'chirurgie' || formData.categorie === 'accouchement') && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Équipements requis</h3>
                      <button 
                        type="button" 
                        onClick={() => addArrayItem('equipements')}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Plus size={14} /> Ajouter
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formData.equipements.map((equip, index) => (
                        <div key={index} className="flex gap-2">
                          <input 
                            type="text" 
                            value={equip}
                            onChange={(e) => handleArrayChange('equipements', index, e.target.value)}
                            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ex: Bloc opératoire, Échographe..."
                          />
                          {formData.equipements.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => removeArrayItem('equipements', index)}
                              className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {(activeTab === 'ressources' && formData.categorie === 'consultation') && (
              <div className="text-center p-12 text-slate-500">
                <Package size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-medium">Les ressources ne sont pas applicables pour les consultations simples.</p>
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
                      Configurez comment l'Assistant IA doit interpréter et suggérer cet acte dans le parcours patient.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Indications (Quand cet acte est-il recommandé ?)</label>
                    <textarea 
                      value={formData.indications}
                      onChange={(e) => handleInputChange('indications', e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
                      placeholder="Ex: Suspicion d'appendicite, suivi de grossesse..."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Signes déclencheurs</h4>
                      <button 
                        type="button" 
                        onClick={() => addArrayItem('signesDeclencheurs')}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        <Plus size={14} /> Ajouter
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formData.signesDeclencheurs.map((signe, index) => (
                        <div key={index} className="flex gap-2">
                          <input 
                            type="text" 
                            value={signe}
                            onChange={(e) => handleArrayChange('signesDeclencheurs', index, e.target.value)}
                            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Ex: Douleur abdominale, fièvre..."
                          />
                          {formData.signesDeclencheurs.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => removeArrayItem('signesDeclencheurs', index)}
                              className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Paramètres à surveiller après l'acte</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { id: 'ta', label: 'Tension Artérielle' },
                        { id: 'temp', label: 'Température' },
                        { id: 'douleur', label: 'Douleur' },
                        { id: 'saignement', label: 'Saignement' }
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">Niveau de risque</label>
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
                      <label className="block text-sm font-bold text-slate-700 mb-3">Actions associées (Post-acte)</label>
                      <div className="flex flex-wrap gap-3">
                        {['hospitalisation', 'surveillance', 'prescription'].map(action => (
                          <label 
                            key={action} 
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              formData.actionsAssociees.includes(action) 
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                              checked={formData.actionsAssociees.includes(action)}
                              onChange={() => toggleMultiSelect('actionsAssociees', action)}
                            />
                            <span className="text-sm font-bold capitalize">{action}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ONGLET 7 - LABORATOIRE */}
            {activeTab === 'laboratoire' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                  <h3 className="text-sm font-black text-purple-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Beaker size={16} /> Paramètres de l'examen biologique
                  </h3>
                  <p className="text-sm text-purple-600 mb-6">Définissez les paramètres mesurés par cet examen, leurs unités et leurs valeurs de référence.</p>
                  
                  {errors.labParameters && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium flex items-center gap-2">
                      <AlertCircle size={16} />
                      {errors.labParameters}
                    </div>
                  )}

                  <div className="space-y-4">
                    {formData.labParameters.map((param, index) => (
                      <div key={index} className="flex gap-3 items-start bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Nom du paramètre</label>
                              <input 
                                type="text" 
                                value={param.nom}
                                onChange={(e) => {
                                  const newParams = [...formData.labParameters];
                                  newParams[index].nom = e.target.value;
                                  handleInputChange('labParameters', newParams);
                                }}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                                placeholder="Ex: Hémoglobine"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Unité</label>
                              <input 
                                type="text" 
                                value={param.unite}
                                onChange={(e) => {
                                  const newParams = [...formData.labParameters];
                                  newParams[index].unite = e.target.value;
                                  handleInputChange('labParameters', newParams);
                                }}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                                placeholder="Ex: g/dL"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Val. Réf. Min (Numérique)</label>
                              <input 
                                type="number" 
                                step="any"
                                value={param.valeurReferenceMin ?? ''}
                                onChange={(e) => {
                                  const newParams = [...formData.labParameters];
                                  newParams[index].valeurReferenceMin = e.target.value ? parseFloat(e.target.value) : undefined;
                                  handleInputChange('labParameters', newParams);
                                }}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                                placeholder="Ex: 12.0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Val. Réf. Max (Numérique)</label>
                              <input 
                                type="number" 
                                step="any"
                                value={param.valeurReferenceMax ?? ''}
                                onChange={(e) => {
                                  const newParams = [...formData.labParameters];
                                  newParams[index].valeurReferenceMax = e.target.value ? parseFloat(e.target.value) : undefined;
                                  handleInputChange('labParameters', newParams);
                                }}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                                placeholder="Ex: 16.0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Val. Réf. (Texte)</label>
                              <input 
                                type="text" 
                                value={param.valeurReferenceTexte || ''}
                                onChange={(e) => {
                                  const newParams = [...formData.labParameters];
                                  newParams[index].valeurReferenceTexte = e.target.value;
                                  handleInputChange('labParameters', newParams);
                                }}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                                placeholder="Ex: Négatif"
                              />
                            </div>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => {
                            const newParams = [...formData.labParameters];
                            newParams.splice(index, 1);
                            handleInputChange('labParameters', newParams);
                          }}
                          className="p-2 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors mt-6"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    
                    <button 
                      type="button"
                      onClick={() => {
                        handleInputChange('labParameters', [...formData.labParameters, { nom: '', unite: '' }]);
                      }}
                      className="flex items-center gap-2 text-purple-600 font-bold text-sm hover:text-purple-700 transition-colors px-4 py-2 bg-purple-100 rounded-xl hover:bg-purple-200"
                    >
                      <Plus size={16} /> Ajouter un paramètre
                    </button>
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
              form="medical-act-form"
              className="px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <Save size={18} /> Enregistrer l'acte
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddMedicalActForm;
