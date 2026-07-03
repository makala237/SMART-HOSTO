import React, { useState } from 'react';
import { X, Save, AlertCircle, Package, FolderTree, Clock, CreditCard, Link as LinkIcon, BrainCircuit, Plus, Trash2 } from 'lucide-react';

interface AddConsumableFormProps {
  onClose: () => void;
  onSave: (consumable: any) => void;
}

const AddConsumableForm: React.FC<AddConsumableFormProps> = ({ onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'stock' | 'utilisation' | 'tarification' | 'integrations' | 'ia'>('general');
  const [formData, setFormData] = useState({
    // Général
    nom: '',
    codeInterne: '',
    description: '',
    categorie: '',
    sousCategorie: '',
    servicePrincipal: '',

    // Stock
    uniteGestion: '',
    quantiteParConditionnement: '',
    stockInitial: '',
    seuilAlerte: '',
    gestionParLot: false,
    datePeremptionApplicable: false,
    numeroLot: '',
    datePeremption: '',

    // Utilisation
    venduAuPatient: false,
    consommeEnInterne: false,
    deductionAutomatique: false,
    lieActeMedical: false,
    lieExamenLabo: false,
    lieSoinInfirmier: false,
    lieHospitalisation: false,
    lieDocumentAdministratif: false,
    modeUtilisation: 'unitaire',

    // Tarification
    prixAchat: '',
    prixVente: '',
    facturableAuPatient: false,
    caisseConcernee: '',

    // Intégrations métier
    actesLies: [] as string[],
    examensLaboLies: [] as string[],
    soinsLies: [] as string[],
    modulesLies: [] as string[],

    // Paramètres intelligents
    prioriteApprovisionnement: 'moyenne',
    regleAlerteStock: 'normale',
    commentaireAdministratif: '',
    recommandationsUsage: '',
    servicePrioritaire: ''
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

    if (!formData.nom.trim()) newErrors.nom = 'Le nom du consommable est obligatoire';
    if (!formData.categorie) newErrors.categorie = 'La catégorie est obligatoire';
    if (!formData.servicePrincipal) newErrors.servicePrincipal = 'Le service principal est obligatoire';
    if (!formData.uniteGestion) newErrors.uniteGestion = 'L\'unité de gestion est obligatoire';
    
    if (formData.facturableAuPatient && !formData.prixVente) {
      newErrors.prixVente = 'Le prix de vente est obligatoire si le consommable est facturable';
    }

    if (formData.seuilAlerte && isNaN(Number(formData.seuilAlerte))) {
      newErrors.seuilAlerte = 'Le seuil d\'alerte doit être un nombre';
    }

    if (formData.quantiteParConditionnement && isNaN(Number(formData.quantiteParConditionnement))) {
      newErrors.quantiteParConditionnement = 'La quantité par conditionnement doit être un nombre';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    } else {
      if (errors.nom || errors.categorie || errors.servicePrincipal) setActiveTab('general');
      else if (errors.uniteGestion || errors.seuilAlerte || errors.quantiteParConditionnement) setActiveTab('stock');
      else if (errors.prixVente) setActiveTab('tarification');
    }
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: Package },
    { id: 'stock', label: 'Stock', icon: FolderTree },
    { id: 'utilisation', label: 'Utilisation', icon: Clock },
    { id: 'tarification', label: 'Tarification', icon: CreditCard },
    { id: 'integrations', label: 'Intégrations Métier', icon: LinkIcon },
    { id: 'ia', label: 'Paramètres IA', icon: BrainCircuit }
  ] as const;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <Package size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Ajouter un consommable</h2>
              <p className="text-sm text-slate-500 font-medium">Référentiel centralisé des consommables</p>
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
            const hasError = (tab.id === 'general' && (errors.nom || errors.categorie || errors.servicePrincipal)) ||
                             (tab.id === 'stock' && (errors.uniteGestion || errors.seuilAlerte || errors.quantiteParConditionnement)) ||
                             (tab.id === 'tarification' && errors.prixVente);

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-sm transition-colors whitespace-nowrap ${
                  isActive 
                    ? 'border-emerald-600 text-emerald-600' 
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
          <form id="consumable-form" onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            
            {/* ONGLET 1 - GÉNÉRAL */}
            {activeTab === 'general' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nom du consommable <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.nom}
                      onChange={(e) => handleInputChange('nom', e.target.value)}
                      className={`w-full p-3 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${errors.nom ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200'}`}
                      placeholder="Ex: Gants stériles taille M"
                    />
                    {errors.nom && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.nom}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Code interne</label>
                    <input 
                      type="text" 
                      value={formData.codeInterne}
                      onChange={(e) => handleInputChange('codeInterne', e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Auto généré si vide"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px]"
                    placeholder="Description détaillée du consommable..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Catégorie principale <span className="text-rose-500">*</span></label>
                    <select 
                      value={formData.categorie}
                      onChange={(e) => handleInputChange('categorie', e.target.value)}
                      className={`w-full p-3 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none ${errors.categorie ? 'border-rose-300' : 'border-slate-200'}`}
                    >
                      <option value="">Sélectionner...</option>
                      <option value="médical">Médical</option>
                      <option value="laboratoire">Laboratoire</option>
                      <option value="administratif">Administratif</option>
                      <option value="technique">Technique</option>
                    </select>
                    {errors.categorie && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.categorie}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Sous-catégorie</label>
                    <input 
                      type="text" 
                      value={formData.sousCategorie}
                      onChange={(e) => handleInputChange('sousCategorie', e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Ex: Protection, Réactif, Formulaire..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Service principal utilisateur <span className="text-rose-500">*</span></label>
                  <select 
                    value={formData.servicePrincipal}
                    onChange={(e) => handleInputChange('servicePrincipal', e.target.value)}
                    className={`w-full p-3 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none ${errors.servicePrincipal ? 'border-rose-300' : 'border-slate-200'}`}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="accueil">Accueil</option>
                    <option value="consultation">Consultation</option>
                    <option value="maternite">Maternité</option>
                    <option value="laboratoire">Laboratoire</option>
                    <option value="bloc_operatoire">Bloc opératoire</option>
                    <option value="hospitalisation">Hospitalisation</option>
                    <option value="pharmacie">Pharmacie</option>
                    <option value="administration">Administration</option>
                  </select>
                  {errors.servicePrincipal && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.servicePrincipal}</p>}
                </div>
              </div>
            )}

            {/* ONGLET 2 - STOCK */}
            {activeTab === 'stock' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Unité de gestion <span className="text-rose-500">*</span></label>
                    <select 
                      value={formData.uniteGestion}
                      onChange={(e) => handleInputChange('uniteGestion', e.target.value)}
                      className={`w-full p-3 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none ${errors.uniteGestion ? 'border-rose-300' : 'border-slate-200'}`}
                    >
                      <option value="">Sélectionner...</option>
                      <option value="unité">Unité</option>
                      <option value="boîte">Boîte</option>
                      <option value="paquet">Paquet</option>
                      <option value="lot">Lot</option>
                      <option value="flacon">Flacon</option>
                      <option value="rouleau">Rouleau</option>
                      <option value="autre">Autre</option>
                    </select>
                    {errors.uniteGestion && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.uniteGestion}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Quantité par conditionnement</label>
                    <input 
                      type="number" 
                      value={formData.quantiteParConditionnement}
                      onChange={(e) => handleInputChange('quantiteParConditionnement', e.target.value)}
                      className={`w-full p-3 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none ${errors.quantiteParConditionnement ? 'border-rose-300' : 'border-slate-200'}`}
                      placeholder="Ex: 100"
                    />
                    {errors.quantiteParConditionnement && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.quantiteParConditionnement}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Stock initial</label>
                    <input 
                      type="number" 
                      value={formData.stockInitial}
                      onChange={(e) => handleInputChange('stockInitial', e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Ex: 50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Seuil d'alerte</label>
                    <input 
                      type="number" 
                      value={formData.seuilAlerte}
                      onChange={(e) => handleInputChange('seuilAlerte', e.target.value)}
                      className={`w-full p-3 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none ${errors.seuilAlerte ? 'border-rose-300' : 'border-slate-200'}`}
                      placeholder="Ex: 10"
                    />
                    {errors.seuilAlerte && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.seuilAlerte}</p>}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                      <input 
                        type="checkbox" 
                        checked={formData.gestionParLot}
                        onChange={(e) => handleInputChange('gestionParLot', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Gestion par lot</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                      <input 
                        type="checkbox" 
                        checked={formData.datePeremptionApplicable}
                        onChange={(e) => handleInputChange('datePeremptionApplicable', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Date de péremption applicable</span>
                    </label>
                  </div>

                  {formData.gestionParLot && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Numéro de lot initial</label>
                        <input 
                          type="text" 
                          value={formData.numeroLot}
                          onChange={(e) => handleInputChange('numeroLot', e.target.value)}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                          placeholder="Ex: LOT-2023-001"
                        />
                      </div>
                      {formData.datePeremptionApplicable && (
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Date de péremption</label>
                          <input 
                            type="date" 
                            value={formData.datePeremption}
                            onChange={(e) => handleInputChange('datePeremption', e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ONGLET 3 - UTILISATION */}
            {activeTab === 'utilisation' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Contexte d'utilisation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                      <input 
                        type="checkbox" 
                        checked={formData.venduAuPatient}
                        onChange={(e) => handleInputChange('venduAuPatient', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Vendu au patient</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                      <input 
                        type="checkbox" 
                        checked={formData.consommeEnInterne}
                        onChange={(e) => handleInputChange('consommeEnInterne', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Consommé en interne</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                      <input 
                        type="checkbox" 
                        checked={formData.deductionAutomatique}
                        onChange={(e) => handleInputChange('deductionAutomatique', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Déduction automatique du stock</span>
                    </label>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Liaisons</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                      <input 
                        type="checkbox" 
                        checked={formData.lieActeMedical}
                        onChange={(e) => handleInputChange('lieActeMedical', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Lié à un acte médical</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                      <input 
                        type="checkbox" 
                        checked={formData.lieExamenLabo}
                        onChange={(e) => handleInputChange('lieExamenLabo', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Lié à un examen de laboratoire</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                      <input 
                        type="checkbox" 
                        checked={formData.lieSoinInfirmier}
                        onChange={(e) => handleInputChange('lieSoinInfirmier', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Lié à un soin infirmier</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                      <input 
                        type="checkbox" 
                        checked={formData.lieHospitalisation}
                        onChange={(e) => handleInputChange('lieHospitalisation', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Lié à une hospitalisation</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                      <input 
                        type="checkbox" 
                        checked={formData.lieDocumentAdministratif}
                        onChange={(e) => handleInputChange('lieDocumentAdministratif', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Lié à un document administratif</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Mode d'utilisation</label>
                  <div className="flex flex-wrap gap-3">
                    {['unitaire', 'multiple', 'selon protocole', 'selon acte'].map(mode => (
                      <label 
                        key={mode}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all ${
                          formData.modeUtilisation === mode 
                            ? 'bg-slate-900 border-slate-900 text-white' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="modeUtilisation"
                          className="hidden"
                          checked={formData.modeUtilisation === mode}
                          onChange={() => handleInputChange('modeUtilisation', mode)}
                        />
                        <span className="text-sm font-bold capitalize">{mode}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ONGLET 4 - TARIFICATION */}
            {activeTab === 'tarification' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Prix d'achat</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={formData.prixAchat}
                        onChange={(e) => handleInputChange('prixAchat', e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none pr-16"
                        placeholder="0"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">FCFA</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Prix de vente</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={formData.prixVente}
                        onChange={(e) => handleInputChange('prixVente', e.target.value)}
                        className={`w-full p-3 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none pr-16 ${errors.prixVente ? 'border-rose-300' : 'border-slate-200'}`}
                        placeholder="0"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">FCFA</span>
                    </div>
                    {errors.prixVente && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.prixVente}</p>}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Facturation</h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.facturableAuPatient}
                        onChange={(e) => handleInputChange('facturableAuPatient', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-bold text-slate-700">Facturable au patient</span>
                    </label>
                  </div>
                  
                  {formData.facturableAuPatient && (
                    <div className="pt-4 border-t border-slate-100">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Caisse concernée</label>
                      <select 
                        value={formData.caisseConcernee}
                        onChange={(e) => handleInputChange('caisseConcernee', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="accueil">Accueil</option>
                        <option value="pharmacie">Pharmacie</option>
                        <option value="autre">Autre</option>
                      </select>
                      <p className="text-xs text-slate-500 mt-2">Ex: carnet médical vendu à l'accueil, dossier d'hospitalisation vendu à l'accueil.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ONGLET 5 - INTÉGRATIONS MÉTIER */}
            {activeTab === 'integrations' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-start gap-3 border border-emerald-100">
                  <LinkIcon className="shrink-0 mt-0.5" size={20} />
                  <p className="text-sm font-medium">
                    Ce bloc permet la déduction automatique quand un acte ou examen est exécuté.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Actes liés</h3>
                    <button 
                      type="button" 
                      onClick={() => addArrayItem('actesLies')}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <Plus size={14} /> Ajouter
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.actesLies.map((acte, index) => (
                      <div key={index} className="flex gap-2">
                        <input 
                          type="text" 
                          value={acte}
                          onChange={(e) => handleArrayChange('actesLies', index, e.target.value)}
                          className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                          placeholder="Nom de l'acte médical..."
                        />
                        {formData.actesLies.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeArrayItem('actesLies', index)}
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
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Examens labo liés</h3>
                    <button 
                      type="button" 
                      onClick={() => addArrayItem('examensLaboLies')}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <Plus size={14} /> Ajouter
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.examensLaboLies.map((examen, index) => (
                      <div key={index} className="flex gap-2">
                        <input 
                          type="text" 
                          value={examen}
                          onChange={(e) => handleArrayChange('examensLaboLies', index, e.target.value)}
                          className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                          placeholder="Nom de l'examen de laboratoire..."
                        />
                        {formData.examensLaboLies.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeArrayItem('examensLaboLies', index)}
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
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Soins liés</h3>
                    <button 
                      type="button" 
                      onClick={() => addArrayItem('soinsLies')}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <Plus size={14} /> Ajouter
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.soinsLies.map((soin, index) => (
                      <div key={index} className="flex gap-2">
                        <input 
                          type="text" 
                          value={soin}
                          onChange={(e) => handleArrayChange('soinsLies', index, e.target.value)}
                          className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                          placeholder="Nom du soin infirmier..."
                        />
                        {formData.soinsLies.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeArrayItem('soinsLies', index)}
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
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Modules liés</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { id: 'accueil', label: 'Accueil' },
                      { id: 'consultation', label: 'Consultation' },
                      { id: 'maternite', label: 'Maternité' },
                      { id: 'laboratoire', label: 'Laboratoire' },
                      { id: 'hospitalisation', label: 'Hospitalisation' },
                      { id: 'bloc', label: 'Bloc' },
                      { id: 'caisse', label: 'Caisse' }
                    ].map(module => (
                      <label 
                        key={module.id} 
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          formData.modulesLies.includes(module.id) 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                          checked={formData.modulesLies.includes(module.id)}
                          onChange={() => toggleMultiSelect('modulesLies', module.id)}
                        />
                        <span className="text-sm font-bold">{module.label}</span>
                      </label>
                    ))}
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
                      <BrainCircuit size={20} className="text-indigo-400" /> Intelligence Artificielle & Supervision
                    </h3>
                    <p className="text-indigo-200 text-sm font-medium max-w-2xl">
                      Configurez comment l'Assistant IA et le système de supervision gèrent ce consommable.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Priorité d'approvisionnement</label>
                      <select 
                        value={formData.prioriteApprovisionnement}
                        onChange={(e) => handleInputChange('prioriteApprovisionnement', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="faible">Faible</option>
                        <option value="moyenne">Moyenne</option>
                        <option value="élevée">Élevée</option>
                        <option value="critique">Critique</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Règle d'alerte stock</label>
                      <select 
                        value={formData.regleAlerteStock}
                        onChange={(e) => handleInputChange('regleAlerteStock', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="normale">Normale</option>
                        <option value="renforcée">Renforcée</option>
                        <option value="critique">Critique</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Commentaire administratif</label>
                    <textarea 
                      value={formData.commentaireAdministratif}
                      onChange={(e) => handleInputChange('commentaireAdministratif', e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
                      placeholder="Notes internes..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Recommandations d'usage</label>
                    <textarea 
                      value={formData.recommandationsUsage}
                      onChange={(e) => handleInputChange('recommandationsUsage', e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
                      placeholder="Recommandations pour l'IA..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Service prioritaire</label>
                    <input 
                      type="text" 
                      value={formData.servicePrioritaire}
                      onChange={(e) => handleInputChange('servicePrioritaire', e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Ex: Urgences, Bloc opératoire..."
                    />
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
              form="consumable-form"
              className="px-6 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <Save size={18} /> Enregistrer le consommable
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddConsumableForm;
