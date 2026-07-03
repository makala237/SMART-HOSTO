
import React, { useMemo } from 'react';
import { 
  Users, 
  Stethoscope, 
  Beaker, 
  BedDouble, 
  Baby, 
  Pill, 
  CreditCard, 
  LayoutDashboard,
  Settings,
  Activity,
  ShieldAlert,
  Microscope,
  Image as ImageIcon,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { Role, User, Service } from '../types';

interface ModuleSelectorProps {
  user: User;
  onSelectModule: (role: Role) => void;
}

const ModuleSelector: React.FC<ModuleSelectorProps> = ({ user, onSelectModule }) => {
  const services = useMemo<Service[]>(() => {
    const saved = localStorage.getItem('hospital_services');
    return saved ? JSON.parse(saved) : [];
  }, []);

  const modules = [
    { id: Role.ADMIN, label: 'Tableau de Bord', icon: LayoutDashboard, color: 'bg-slate-900', description: 'Vue d\'ensemble et statistiques', access: [Role.ADMIN] },
    { id: Role.RECEPTION, label: 'Accueil', icon: Users, color: 'bg-blue-600', description: 'Enregistrement et triage patients', access: [Role.ADMIN, Role.RECEPTION], serviceId: 'SRV-ACCUEIL' },
    { id: Role.CASHIER, label: 'Caisse', icon: CreditCard, color: 'bg-emerald-600', description: 'Facturation et encaissements', access: [Role.ADMIN, Role.CASHIER, Role.ACCOUNTANT], serviceId: 'SRV-CAISSE' },
    { id: Role.DOCTOR, label: 'Consultation', icon: Stethoscope, color: 'bg-indigo-600', description: 'Dossier médical et prescriptions', access: [Role.ADMIN, Role.DOCTOR], serviceId: 'SRV-CONSULTATION' },
    { id: Role.URGENCE, label: 'Urgence', icon: ShieldAlert, color: 'bg-red-600', description: 'Prise en charge vitale immédiate', access: [Role.ADMIN, Role.DOCTOR, Role.NURSE], serviceId: 'SRV-URGENCES' },
    { id: Role.NURSE, label: 'Hospitalisation', icon: BedDouble, color: 'bg-cyan-600', description: 'Suivi des lits et soins infirmiers', access: [Role.ADMIN, Role.NURSE, Role.DOCTOR], serviceId: 'SRV-HOSPITALISATION' },
    { id: Role.MATERNITY, label: 'Maternité', icon: Baby, color: 'bg-pink-600', description: 'Suivi grossesse et accouchements', access: [Role.ADMIN, Role.MATERNITY], serviceId: 'SRV-MATERNITE' },
    { id: Role.LAB, label: 'Laboratoire', icon: Microscope, color: 'bg-amber-600', description: 'Analyses et résultats biologiques', access: [Role.ADMIN, Role.LAB], serviceId: 'SRV-LABO' },
    { id: 'IMAGERIE' as Role, label: 'Imagerie', icon: ImageIcon, color: 'bg-violet-600', description: 'Radiologie, Écho et Scanner', access: [Role.ADMIN], serviceId: 'SRV-IMAGERIE' },
    { id: Role.PHARMACY, label: 'Pharmacie', icon: Pill, color: 'bg-teal-600', description: 'Gestion des stocks et dispensation', access: [Role.ADMIN, Role.PHARMACY], serviceId: 'SRV-PHARMACIE' },
    { id: Role.ACCOUNTANT, label: 'Comptabilité', icon: TrendingUp, color: 'bg-orange-600', description: 'Gestion financière et RH', access: [Role.ADMIN, Role.ACCOUNTANT] },
    { id: 'SETTING' as Role, label: 'Paramétrage', icon: Settings, color: 'bg-rose-600', description: 'Configuration du système', access: [Role.ADMIN], special: true },
  ];

  const filteredModules = modules.filter(m => {
    // Check if service is disabled
    if (m.serviceId) {
      const service = services.find(s => s.id === m.serviceId);
      if (service && service.status === 'inactive') {
        return false;
      }
    }

    const hasLegacyAccess = m.access.includes(user.role);
    const hasRoleAccess = user.roles?.some(roleId => {
      if (roleId === 'role_admin') return true;
      if (roleId === 'role_medecin' && m.access.includes(Role.DOCTOR)) return true;
      if (roleId === 'role_infirmier' && m.access.includes(Role.NURSE)) return true;
      if (roleId === 'role_caissier' && m.access.includes(Role.CASHIER)) return true;
      if (roleId === 'role_secretaire' && m.access.includes(Role.RECEPTION)) return true;
      if (roleId === 'role_pharmacien' && m.access.includes(Role.PHARMACY)) return true;
      if (roleId === 'role_laborantin' && m.access.includes(Role.LAB)) return true;
      if (roleId === 'role_radiologue' && (m.id as string) === 'IMAGERIE') return true;
      return false;
    });
    return hasLegacyAccess || hasRoleAccess;
  });

  return (
    <div className="p-8">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Dashboard ERP Hospitalier
        </h1>
        <p className="text-slate-500 text-lg font-medium mt-2">
          Bienvenue, <span className="text-blue-600 font-bold">{user.name}</span>. Sélectionnez un module pour commencer.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredModules.map((module) => (
          <button
            key={module.id}
            onClick={() => onSelectModule(module.id as Role)}
            className={`group relative flex flex-col p-8 rounded-[32px] transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl text-left overflow-hidden border border-slate-100 ${module.special ? 'ring-4 ring-rose-100' : ''}`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${module.color} opacity-[0.03] rounded-bl-full transition-all duration-500 group-hover:scale-150`}></div>
            
            <div className={`w-16 h-16 ${module.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform duration-500 group-hover:rotate-12`}>
              <module.icon size={32} />
            </div>
            
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">
              {module.label}
            </h3>
            
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              {module.description}
            </p>

            <div className="mt-8 flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-600 transition-colors">
              Accéder au module
              <div className="ml-2 w-4 h-px bg-slate-200 group-hover:w-8 group-hover:bg-blue-600 transition-all"></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModuleSelector;
