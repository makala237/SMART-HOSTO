import React, { useState, useEffect, useMemo } from 'react';
import { Building2, Activity, Shield, Users, Wrench, Search, Filter, CheckCircle2, XCircle, Settings, Plus, X, Save, Baby } from 'lucide-react';
import { Service, ServiceType, User, Tool } from '../../types';

interface ServicesDepartmentsProps {
  users: User[];
}

// Predefined list of services
const PREDEFINED_SERVICES: Partial<Service>[] = [
  // SERVICES CLINIQUES PRINCIPAUX
  { id: 'SRV-ACCUEIL', name: 'Accueil / Admission', type: 'clinique', status: 'active', description: 'Gestion des admissions et orientation des patients' },
  { id: 'SRV-CONSULTATION', name: 'Consultation externe', type: 'clinique', status: 'active', description: 'Consultations médicales générales et spécialisées' },
  { id: 'SRV-URGENCES', name: 'Urgences', type: 'clinique', status: 'active', description: 'Prise en charge des urgences médicales et chirurgicales' },
  { id: 'SRV-HOSPITALISATION', name: 'Hospitalisation', type: 'clinique', status: 'active', description: 'Séjour et suivi des patients hospitalisés', specificSettings: { hospitalBeds: 12, maternityBeds: 8 } },
  { id: 'SRV-MATERNITE', name: 'Maternité', type: 'clinique', status: 'active', description: 'Suivi de grossesse, accouchement et post-partum' },
  { id: 'SRV-PEDIATRIE', name: 'Pédiatrie', type: 'clinique', status: 'active', description: 'Soins médicaux pour nourrissons, enfants et adolescents' },
  { id: 'SRV-BLOC', name: 'Bloc opératoire', type: 'clinique', status: 'active', description: 'Interventions chirurgicales' },
  { id: 'SRV-REA', name: 'Réanimation / soins intensifs', type: 'clinique', status: 'active', description: 'Soins intensifs et surveillance continue' },
  
  // SERVICES MÉDICO-TECHNIQUES
  { id: 'SRV-LABO', name: 'Laboratoire', type: 'technique', status: 'active', description: 'Analyses de biologie médicale' },
  { id: 'SRV-IMAGERIE', name: 'Imagerie médicale', type: 'technique', status: 'active', description: 'Radiologie, échographie, scanner, IRM' },
  { id: 'SRV-PHARMACIE', name: 'Pharmacie', type: 'technique', status: 'active', description: 'Gestion et dispensation des médicaments' },
  
  // SERVICES DE SOUTIEN
  { id: 'SRV-INFIRMIER', name: 'Soins infirmiers', type: 'soutien', status: 'active', description: 'Soins infirmiers généraux et spécialisés' },
  { id: 'SRV-VACCINATION', name: 'Vaccination', type: 'soutien', status: 'active', description: 'Programme de vaccination' },
  { id: 'SRV-NUTRITION', name: 'Nutrition', type: 'soutien', status: 'active', description: 'Conseil et suivi nutritionnel' },
  { id: 'SRV-KINE', name: 'Kinésithérapie', type: 'soutien', status: 'active', description: 'Rééducation et physiothérapie' },
  
  // SERVICES ADMINISTRATIFS
  { id: 'SRV-CAISSE', name: 'Comptabilité / caisse', type: 'administratif', status: 'active', description: 'Facturation et encaissement' },
  { id: 'SRV-ADMIN', name: 'Administration', type: 'administratif', status: 'active', description: 'Direction et gestion générale' },
  { id: 'SRV-RH', name: 'Ressources humaines', type: 'administratif', status: 'active', description: 'Gestion du personnel' },
  { id: 'SRV-ARCHIVES', name: 'Archivage médical', type: 'administratif', status: 'active', description: 'Gestion des dossiers médicaux' },
  
  // SERVICES SPÉCIALISÉS (DÉSACTIVÉS PAR DÉFAUT)
  { id: 'SRV-DIALYSE', name: 'Dialyse', type: 'specialise', status: 'inactive', description: 'Hémodialyse et soins rénaux' },
  { id: 'SRV-ONCOLOGIE', name: 'Oncologie', type: 'specialise', status: 'inactive', description: 'Traitement des cancers' },
  { id: 'SRV-CARDIOLOGIE', name: 'Cardiologie', type: 'specialise', status: 'inactive', description: 'Maladies du cœur et des vaisseaux' },
  { id: 'SRV-DERMATOLOGIE', name: 'Dermatologie', type: 'specialise', status: 'inactive', description: 'Maladies de la peau' },
  { id: 'SRV-ORL', name: 'ORL', type: 'specialise', status: 'inactive', description: 'Oto-rhino-laryngologie' },
  { id: 'SRV-OPHTALMOLOGIE', name: 'Ophtalmologie', type: 'specialise', status: 'inactive', description: 'Maladies des yeux' },
  { id: 'SRV-PSYCHIATRIE', name: 'Psychiatrie', type: 'specialise', status: 'inactive', description: 'Santé mentale' },
];

const ServicesDepartments: React.FC<ServicesDepartmentsProps> = ({ users }) => {
  const [tools, setTools] = useState<Tool[]>([]);

  useEffect(() => {
    const savedTools = localStorage.getItem('hospital_tools');
    if (savedTools) {
      setTools(JSON.parse(savedTools));
    }
  }, []);
  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('hospital_services');
    if (saved) {
      return JSON.parse(saved);
    }
    
    // Initialize with predefined list
    const initialServices = PREDEFINED_SERVICES.map(s => ({
      ...s,
      users: [],
      activeTools: [],
      linkedModules: [],
      specificSettings: {}
    })) as Service[];
    
    // Migration logic: map old departments to new services if needed
    const oldDepartments = localStorage.getItem('hospital_departments');
    if (oldDepartments) {
      try {
        const parsedDepts = JSON.parse(oldDepartments);
        // We could try to map them by name, but to avoid breaking things, we'll just keep the predefined list
        // and let the admin configure it. The prompt says "récupérer les services existants, les mapper vers les services standards".
        // Since it's a bit complex to map arbitrary strings, we'll do a simple mapping if names match.
        parsedDepts.forEach((dept: any) => {
          const match = initialServices.find(s => s.name.toLowerCase() === dept.name.toLowerCase());
          if (!match) {
            // If it doesn't match, we add it as a custom service (though prompt says "supprimer la création libre", 
            // we must not lose data). Let's add it as 'specialise'.
            initialServices.push({
              id: dept.id || `SRV-CUSTOM-${Date.now()}`,
              name: dept.name,
              description: 'Service migré de l\'ancien système',
              type: 'specialise',
              status: 'active',
              users: [],
              activeTools: [],
              linkedModules: [],
              specificSettings: {}
            });
          }
        });
      } catch (e) {
        console.error('Migration error', e);
      }
    }
    
    localStorage.setItem('hospital_services', JSON.stringify(initialServices));
    return initialServices;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ServiceType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'inactive'>('ALL');
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Save to localStorage whenever services change
  useEffect(() => {
    localStorage.setItem('hospital_services', JSON.stringify(services));
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            service.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'ALL' || service.type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || service.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [services, searchQuery, typeFilter, statusFilter]);

  const toggleServiceStatus = (id: string) => {
    setServices(prev => prev.map(s => 
      s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
    ));
  };

  const handleApplyProfile = (profile: 'BASE' | 'MATERNITY' | 'FULL') => {
    setServices(prev => prev.map(s => {
      let shouldBeActive = false;
      
      if (profile === 'BASE') {
        shouldBeActive = ['SRV-ACCUEIL', 'SRV-CONSULTATION', 'SRV-PHARMACIE', 'SRV-LABO', 'SRV-CAISSE', 'SRV-ADMIN'].includes(s.id);
      } else if (profile === 'MATERNITY') {
        shouldBeActive = ['SRV-ACCUEIL', 'SRV-CONSULTATION', 'SRV-PHARMACIE', 'SRV-LABO', 'SRV-CAISSE', 'SRV-ADMIN', 'SRV-MATERNITE', 'SRV-VACCINATION', 'SRV-PEDIATRIE'].includes(s.id);
      } else if (profile === 'FULL') {
        // All clinical, technical, support, admin
        shouldBeActive = s.type !== 'specialise';
      }
      
      return { ...s, status: shouldBeActive ? 'active' : 'inactive' };
    }));
    setShowProfileModal(false);
  };

  const openConfig = (service: Service) => {
    setSelectedService(service);
    setIsConfigModalOpen(true);
  };

  const saveConfig = (updatedService: Service) => {
    setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
    setIsConfigModalOpen(false);
    setSelectedService(null);
  };

  const getTypeColor = (type: ServiceType) => {
    switch (type) {
      case 'clinique': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'technique': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'soutien': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'administratif': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'specialise': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeName = (type: ServiceType) => {
    switch (type) {
      case 'clinique': return 'Clinique';
      case 'technique': return 'Médico-technique';
      case 'soutien': return 'Soutien';
      case 'administratif': return 'Administratif';
      case 'specialise': return 'Spécialisé';
      default: return type;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Services & Départements</h2>
          <p className="text-slate-500 mt-1">Gérez l'architecture modulaire de votre établissement</p>
        </div>
        <button 
          onClick={() => setShowProfileModal(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2"
        >
          <Building2 size={20} />
          Profils de Clinique
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher un service..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700"
          >
            <option value="ALL">Tous les types</option>
            <option value="clinique">Clinique</option>
            <option value="technique">Médico-technique</option>
            <option value="soutien">Soutien</option>
            <option value="administratif">Administratif</option>
            <option value="specialise">Spécialisé</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="active">Activés</option>
            <option value="inactive">Désactivés</option>
          </select>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map(service => (
          <div key={service.id} className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${service.status === 'active' ? 'border-indigo-100 shadow-md shadow-indigo-100/50' : 'border-slate-200 opacity-75'}`}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getTypeColor(service.type)}`}>
                  {getTypeName(service.type)}
                </span>
                <button 
                  onClick={() => toggleServiceStatus(service.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${service.status === 'active' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  {service.status === 'active' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {service.status === 'active' ? 'Activé' : 'Désactivé'}
                </button>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-2">{service.name}</h3>
              <p className="text-sm text-slate-500 mb-6 line-clamp-2">{service.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Users size={14} />
                    <span className="text-xs font-bold uppercase">Utilisateurs</span>
                  </div>
                  <span className="text-lg font-black text-slate-800">{service.users.length}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Wrench size={14} />
                    <span className="text-xs font-bold uppercase">Outils</span>
                  </div>
                  <span className="text-lg font-black text-slate-800">{service.activeTools.length}</span>
                </div>
              </div>
              
              <button 
                onClick={() => openConfig(service)}
                className="w-full py-3 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 border border-slate-200 hover:border-indigo-200"
              >
                <Settings size={18} />
                Configurer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Config Modal */}
      {isConfigModalOpen && selectedService && (
        <ServiceConfigModal 
          service={selectedService} 
          users={users}
          tools={tools}
          onClose={() => setIsConfigModalOpen(false)} 
          onSave={saveConfig} 
        />
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Profils de Clinique</h2>
                  <p className="text-sm text-slate-500 font-medium">Configurez rapidement votre établissement</p>
                </div>
              </div>
              <button onClick={() => setShowProfileModal(false)} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profil 1 */}
              <div className="border border-slate-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer group" onClick={() => handleApplyProfile('BASE')}>
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Activity size={24} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">Clinique de Base</h3>
                <p className="text-sm text-slate-500 mb-4">Idéal pour les centres de santé de premier niveau.</p>
                <ul className="space-y-2 text-sm font-medium text-slate-700">
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Accueil & Consultation</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Pharmacie & Labo</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Caisse</li>
                </ul>
              </div>

              {/* Profil 2 */}
              <div className="border border-slate-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden" onClick={() => handleApplyProfile('MATERNITY')}>
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">POPULAIRE</div>
                <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Baby size={24} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">Clinique avec Maternité</h3>
                <p className="text-sm text-slate-500 mb-4">Pour les centres incluant le suivi de grossesse et accouchement.</p>
                <ul className="space-y-2 text-sm font-medium text-slate-700">
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Profil de Base inclus</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Maternité (CPN, Accouchement)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Pédiatrie & Vaccination</li>
                </ul>
              </div>

              {/* Profil 3 */}
              <div className="border border-slate-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer group" onClick={() => handleApplyProfile('FULL')}>
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building2 size={24} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">Hôpital Complet</h3>
                <p className="text-sm text-slate-500 mb-4">Pour les établissements de niveau supérieur.</p>
                <ul className="space-y-2 text-sm font-medium text-slate-700">
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Tous les services cliniques</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Hospitalisation & Bloc</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Réanimation & Imagerie</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-component for Configuration Modal ---
const ServiceConfigModal: React.FC<{ service: Service, users: User[], tools: Tool[], onClose: () => void, onSave: (s: Service) => void }> = ({ service, users, tools, onClose, onSave }) => {
  const [editedService, setEditedService] = useState<Service>({ ...service });
  const [activeTab, setActiveTab] = useState<'info' | 'users' | 'tools' | 'settings'>('info');

  const handleUserToggle = (userId: string) => {
    setEditedService(prev => {
      const newUsers = prev.users.includes(userId) 
        ? prev.users.filter(id => id !== userId)
        : [...prev.users, userId];
      return { ...prev, users: newUsers };
    });
  };

  const handleToolToggle = (toolId: string) => {
    setEditedService(prev => {
      const newTools = prev.activeTools.includes(toolId)
        ? prev.activeTools.filter(id => id !== toolId)
        : [...prev.activeTools, toolId];
      return { ...prev, activeTools: newTools };
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Settings size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Configuration : {service.name}</h2>
              <p className="text-sm text-slate-500 font-medium">Gérez les accès, outils et paramètres spécifiques</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-xl transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b border-slate-200 shrink-0">
          <button onClick={() => setActiveTab('info')} className={`flex-1 py-4 font-bold text-sm transition-colors border-b-2 ${activeTab === 'info' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Informations</button>
          <button onClick={() => setActiveTab('users')} className={`flex-1 py-4 font-bold text-sm transition-colors border-b-2 ${activeTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Utilisateurs ({editedService.users.length})</button>
          <button onClick={() => setActiveTab('tools')} className={`flex-1 py-4 font-bold text-sm transition-colors border-b-2 ${activeTab === 'tools' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Outils ({editedService.activeTools.length})</button>
          <button onClick={() => setActiveTab('settings')} className={`flex-1 py-4 font-bold text-sm transition-colors border-b-2 ${activeTab === 'settings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Paramètres Avancés</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {activeTab === 'info' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Nom du Service</label>
                <input 
                  type="text" 
                  value={editedService.name}
                  onChange={e => setEditedService({...editedService, name: e.target.value})}
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Description</label>
                <textarea 
                  value={editedService.description}
                  onChange={e => setEditedService({...editedService, description: e.target.value})}
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium min-h-[100px]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Type de Service</label>
                <select 
                  value={editedService.type}
                  onChange={e => setEditedService({...editedService, type: e.target.value as ServiceType})}
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                >
                  <option value="clinique">Clinique</option>
                  <option value="technique">Médico-technique</option>
                  <option value="soutien">Soutien</option>
                  <option value="administratif">Administratif</option>
                  <option value="specialise">Spécialisé</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map(user => {
                  const isAssigned = editedService.users.includes(user.id);
                  return (
                    <div key={user.id} className={`p-4 rounded-xl border flex items-center justify-between transition-colors cursor-pointer ${isAssigned ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:border-indigo-300'}`} onClick={() => handleUserToggle(user.id)}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.profession || user.role}</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${isAssigned ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                        {isAssigned && <CheckCircle2 size={14} />}
                      </div>
                    </div>
                  );
                })}
              </div>
              {users.length === 0 && (
                <p className="text-center text-slate-500 py-8">Aucun utilisateur trouvé dans le système.</p>
              )}
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tools.map(tool => {
                  const isAssigned = editedService.activeTools.includes(tool.id);
                  return (
                    <div key={tool.id} className={`p-4 rounded-xl border flex items-center justify-between transition-colors cursor-pointer ${isAssigned ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:border-indigo-300'}`} onClick={() => handleToolToggle(tool.id)}>
                      <div>
                        <p className="font-bold text-slate-900">{tool.name}</p>
                        <p className="text-xs text-slate-500">{tool.description}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border shrink-0 ${isAssigned ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                        {isAssigned && <CheckCircle2 size={14} />}
                      </div>
                    </div>
                  );
                })}
              </div>
              {tools.length === 0 && (
                <p className="text-center text-slate-500 py-8">Aucun outil trouvé dans le système.</p>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4">Paramètres spécifiques au service</h3>
                
                {/* Example of dynamic settings based on service type or ID */}
                {editedService.id === 'SRV-HOSPITALISATION' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Nombre de lits d'hospitalisation</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="number" 
                          value={editedService.specificSettings?.hospitalBeds || 0}
                          onChange={e => setEditedService({
                            ...editedService, 
                            specificSettings: { ...editedService.specificSettings, hospitalBeds: parseInt(e.target.value) || 0 }
                          })}
                          className="w-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-black text-xl text-center"
                        />
                        <div className="flex-1 text-sm text-slate-500">
                          Définissez la capacité d'accueil totale du service pour la gestion de l'occupation.
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-2 text-pink-600">Hospitalisation Maternité (Salle de travail)</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="number" 
                          value={editedService.specificSettings?.maternityBeds || 0}
                          onChange={e => setEditedService({
                            ...editedService, 
                            specificSettings: { ...editedService.specificSettings, maternityBeds: parseInt(e.target.value) || 0 }
                          })}
                          className="w-32 p-4 bg-pink-50 border border-pink-100 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none font-black text-xl text-center text-pink-700"
                        />
                        <div className="flex-1 text-sm text-slate-500">
                          Configurez le nombre de lits disponibles spécifiquement pour la salle de travail du service maternité.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {editedService.id === 'SRV-MATERNITE' && (
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editedService.specificSettings?.autoPartogram || false}
                        onChange={e => setEditedService({
                          ...editedService, 
                          specificSettings: { ...editedService.specificSettings, autoPartogram: e.target.checked }
                        })}
                        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-medium text-slate-700">Activer le partogramme automatique</span>
                    </label>
                  </div>
                )}
                
                {editedService.id === 'SRV-LABO' && (
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editedService.specificSettings?.autoValidateResults || false}
                        onChange={e => setEditedService({
                          ...editedService, 
                          specificSettings: { ...editedService.specificSettings, autoValidateResults: e.target.checked }
                        })}
                        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-medium text-slate-700">Validation automatique des résultats normaux</span>
                    </label>
                  </div>
                )}

                {/* --- Spécialités et Files d'attente paramétrables --- */}
                {(() => {
                  const getSpecialtiesForService = (id: string) => {
                    switch (id) {
                      case 'SRV-CONSULTATION':
                        return [
                          { id: 'medecine_generale', label: 'Médecine générale' },
                          { id: 'pediatrie', label: 'Pédiatrie' },
                          { id: 'gynecologie', label: 'Gynécologie' },
                          { id: 'obstetrique', label: 'Obstétrique' },
                          { id: 'cpn_consultation', label: 'Consultation prénatale (CPN)' },
                          { id: 'postnatale_consultation', label: 'Consultation postnatale' },
                          { id: 'chirurgie', label: 'Chirurgie' },
                          { id: 'traumatologie', label: 'Traumatologie' },
                          { id: 'medecine_interne', label: 'Médecine interne' },
                        ];
                      case 'SRV-MATERNITE':
                        return [
                          { id: 'travail_accouchement', label: 'Travail / Accouchement' },
                          { id: 'consultation_obstetricale', label: 'Consultation obstétricale' },
                          { id: 'consultation_gynecologique', label: 'Consultation gynécologique' },
                          { id: 'cpn_maternite', label: 'Consultation prénatale' },
                          { id: 'postnatale_maternite', label: 'Consultation postnatale' },
                        ];
                      case 'SRV-URGENCES':
                        return [
                          { id: 'urgence_adulte', label: 'Urgence adulte' },
                          { id: 'urgence_pediatrique', label: 'Urgence pédiatrique' },
                          { id: 'urgence_obstetricale', label: 'Urgence obstétricale' },
                          { id: 'traumatisme', label: 'Traumatisme' },
                        ];
                      case 'SRV-LABO':
                        return [{ id: 'laboratoire', label: 'Laboratoire' }];
                      case 'SRV-INFIRMIER':
                        return [{ id: 'soins_infirmiers', label: 'Soins infirmiers' }];
                      case 'SRV-VACCINATION':
                        return [{ id: 'vaccination', label: 'Vaccination' }];
                      case 'SRV-PHARMACIE':
                        return [{ id: 'pharmacie', label: 'Pharmacie' }];
                      default:
                        return [];
                    }
                  };

                  const specList = getSpecialtiesForService(editedService.id);
                  if (specList.length === 0) {
                    if (editedService.id !== 'SRV-MATERNITE' && editedService.id !== 'SRV-LABO' && editedService.id !== 'SRV-HOSPITALISATION') {
                      return <p className="text-sm text-slate-500 italic mt-4">Aucun paramètre spécifique disponible pour ce service actuellement.</p>;
                    }
                    return null;
                  }

                  const activeSpecs = editedService.specificSettings?.activeSpecialties || specList.map(s => s.id);

                  const toggleSpecialty = (specId: string) => {
                    const newActive = activeSpecs.includes(specId)
                      ? activeSpecs.filter((sid: string) => sid !== specId)
                      : [...activeSpecs, specId];
                    
                    setEditedService({
                      ...editedService,
                      specificSettings: {
                        ...editedService.specificSettings,
                        activeSpecialties: newActive
                      }
                    });
                  };

                  return (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">
                        Spécialités de Prise en Charge Activées
                      </h4>
                      <p className="text-xs text-slate-500 mb-4 font-medium italic">
                        Désactivez une spécialité ou file d'attente pour la masquer complétement du module Accueil.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {specList.map(spec => {
                          const isActive = activeSpecs.includes(spec.id);
                          return (
                            <label key={spec.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${isActive ? 'bg-indigo-50/50 border-indigo-100 hover:bg-indigo-50' : 'bg-white border-slate-200 opacity-60 hover:opacity-80'}`}>
                              <input 
                                type="checkbox"
                                checked={isActive}
                                onChange={() => toggleSpecialty(spec.id)}
                                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <div>
                                <span className="font-bold text-slate-800 text-xs">{spec.label}</span>
                                <p className="text-[8px] text-slate-400 font-bold font-mono uppercase">DISPONIBLE À L'ACCUEIL</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-4 shrink-0">
          <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
            Annuler
          </button>
          <button onClick={() => onSave(editedService)} className="px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/20">
            <Save size={18} />
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicesDepartments;
