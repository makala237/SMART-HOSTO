
import React from 'react';
import { 
  Users, 
  Stethoscope, 
  Beaker, 
  BedDouble, 
  Baby, 
  Pill, 
  CreditCard, 
  LayoutDashboard,
  LogOut,
  UserCheck,
  TrendingUp,
  ChevronLeft,
  Settings,
  ShieldAlert,
  Shield,
  Hospital,
  Building2,
  Wrench,
  ArrowLeft,
  Activity,
  HeartPulse,
  Database,
  Calendar,
  History,
  AlertCircle,
  Eye,
  Clock,
  Navigation,
  Calculator,
  Landmark,
  Search,
  ClipboardList,
  ShieldCheck,
  Printer,
  Package,
  DollarSign,
  Percent,
  Truck,
  FileText
} from 'lucide-react';
import { Role, User, EmergencySubMenu, ReceptionSubMenu, CashierSubMenu, LabSubMenu, InpatientSubMenu, PharmacySubMenu, AccountingSubMenu } from '../types';

interface SidebarProps {
  user: User;
  currentRole: Role | 'DASHBOARD' | 'SETTING' | 'IMAGERIE'; 
  setRole: (role: any) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  activeSettingsTab?: 'users' | 'roles' | 'establishment' | 'referentials' | 'cashier_settings' | 'tools' | 'services' | 'protocols';
  setActiveSettingsTab?: (tab: 'users' | 'roles' | 'establishment' | 'referentials' | 'cashier_settings' | 'tools' | 'services' | 'protocols') => void;
  activeMaternityTab?: 'cpn' | 'labor' | 'delivery' | 'postpartum';
  setActiveMaternityTab?: (tab: 'cpn' | 'labor' | 'delivery' | 'postpartum') => void;
  activeConsultationTab?: 'WAITING_ROOM' | 'CONSULTATION' | 'FOLLOW_UP' | 'HISTORY' | 'APPOINTMENTS';
  setActiveConsultationTab?: (tab: 'WAITING_ROOM' | 'CONSULTATION' | 'FOLLOW_UP' | 'HISTORY' | 'APPOINTMENTS') => void;
  activeEmergencyTab?: EmergencySubMenu;
  setActiveEmergencyTab?: (tab: EmergencySubMenu) => void;
  activeReceptionTab?: ReceptionSubMenu;
  setActiveReceptionTab?: (tab: ReceptionSubMenu) => void;
  activeCashierTab?: CashierSubMenu;
  setActiveCashierTab?: (tab: CashierSubMenu) => void;
  activeLabTab?: LabSubMenu;
  setActiveLabTab?: (tab: LabSubMenu) => void;
  activeInpatientTab?: InpatientSubMenu;
  setActiveInpatientTab?: (tab: InpatientSubMenu) => void;
  activePharmacyTab?: PharmacySubMenu;
  setActivePharmacyTab?: (tab: PharmacySubMenu) => void;
  activeAccountingTab?: AccountingSubMenu;
  setActiveAccountingTab?: (tab: AccountingSubMenu) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  user, 
  currentRole, 
  setRole, 
  onLogout, 
  isOpen, 
  onClose, 
  activeSettingsTab, 
  setActiveSettingsTab, 
  activeMaternityTab, 
  setActiveMaternityTab,
  activeConsultationTab,
  setActiveConsultationTab,
  activeEmergencyTab,
  setActiveEmergencyTab,
  activeReceptionTab,
  setActiveReceptionTab,
  activeCashierTab,
  setActiveCashierTab,
  activeLabTab,
  setActiveLabTab,
  activeInpatientTab,
  setActiveInpatientTab,
  activePharmacyTab,
  setActivePharmacyTab,
  activeAccountingTab,
  setActiveAccountingTab
}) => {
  // Définition des accès par rôle (RBAC)
  const menuConfig = [
    { id: Role.ADMIN, icon: LayoutDashboard, label: 'Stats & Pilotage', access: [Role.ADMIN] },
    { id: Role.RECEPTION, icon: Users, label: 'Accueil Patients', access: [Role.ADMIN, Role.RECEPTION] },
    { id: Role.URGENCE, icon: ShieldAlert, label: 'Urgences', access: [Role.ADMIN, Role.DOCTOR, Role.NURSE] },
    { id: Role.DOCTOR, icon: Stethoscope, label: 'Consultations', access: [Role.ADMIN, Role.DOCTOR] },
    { id: Role.LAB, icon: Beaker, label: 'Laboratoire', access: [Role.ADMIN, Role.LAB] },
    { id: Role.NURSE, icon: BedDouble, label: 'Hospitalisation', access: [Role.ADMIN, Role.NURSE, Role.DOCTOR] },
    { id: Role.MATERNITY, icon: Baby, label: 'Maternité', access: [Role.ADMIN, Role.MATERNITY, Role.DOCTOR] },
    { id: Role.PHARMACY, icon: Pill, label: 'Pharmacie', access: [Role.ADMIN, Role.PHARMACY] },
    { id: Role.CASHIER, icon: CreditCard, label: 'Caisse & Facturation', access: [Role.ADMIN, Role.CASHIER, Role.ACCOUNTANT] },
    { id: Role.ACCOUNTANT, icon: TrendingUp, label: 'Gestion & Compta', access: [Role.ADMIN, Role.ACCOUNTANT] },
    { id: 'SETTING', icon: Settings, label: 'Paramétrage', access: [Role.ADMIN], special: true },
  ];

  const settingsMenu = [
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'roles', label: 'Rôles & Permissions', icon: Shield },
    { id: 'establishment', label: 'Établissement', icon: Hospital },
    { id: 'services', label: 'Services & Départements', icon: Building2 },
    { id: 'referentials', label: 'Référentiels', icon: Database },
    { id: 'protocols', label: 'Catalogue Protocoles', icon: FileText },
    { id: 'cashier_settings', label: 'Paramètres de la caisse', icon: CreditCard },
    { id: 'tools', label: 'Gestion des outils', icon: Wrench },
  ];

  const maternityMenu = [
    { id: 'cpn', label: 'Consultation Prénatale', icon: Stethoscope },
    { id: 'labor', label: 'Salle de Travail', icon: Activity },
    { id: 'delivery', label: 'Salle d\'Accouchement', icon: HeartPulse },
    { id: 'postpartum', label: 'Post-Partum', icon: Baby },
  ];

  const consultationMenu = [
    { id: 'WAITING_ROOM', label: 'Salle d\'attente', icon: Users },
    { id: 'CONSULTATION', label: 'Consultation', icon: Stethoscope },
    { id: 'FOLLOW_UP', label: 'Suivi Patients', icon: Activity },
    { id: 'HISTORY', label: 'Historique', icon: History },
    { id: 'APPOINTMENTS', label: 'Rendez-vous', icon: Calendar },
  ];
  
  const emergencyMenu = [
    { id: 'TRIAGE', label: 'Triage', icon: AlertCircle },
    { id: 'ER_ROOM', label: 'Salle d’Urgence', icon: Activity },
    { id: 'OBSERVATION', label: 'Observation', icon: Eye },
    { id: 'NON_URGENT', label: 'Non Urgents', icon: Clock },
    { id: 'MANAGEMENT', label: 'Prise en charge', icon: Stethoscope },
    { id: 'DISCHARGE', label: 'Orientation / Sortie', icon: Navigation },
  ];

  const receptionMenu = [
    { id: 'triage', label: 'Admissions', icon: Users },
    { id: 'sorties', label: 'Sorties Admin', icon: LogOut },
    { id: 'demandes', label: 'Demandes Paiement', icon: CreditCard },
    { id: 'profil', label: 'Mon Profil', icon: UserCheck },
  ];

  const cashierMenu = [
    { id: 'facturation', label: 'Facturation', icon: Calculator },
    { id: 'pending', label: 'Demandes en attente', icon: Clock },
    { id: 'daily', label: 'Transactions du jour', icon: Landmark },
    { id: 'search', label: 'Rechercher', icon: Search },
  ];

  const labMenu = [
    { id: 'demandes', label: 'Demandes', icon: ClipboardList },
    { id: 'encours', label: 'En cours', icon: Clock },
    { id: 'resultats', label: 'Résultats', icon: Activity },
    { id: 'validations', label: 'Validations', icon: ShieldCheck },
    { id: 'rapports', label: 'Rapports', icon: Printer },
  ];

  const inpatientMenu = [
    { id: 'beds', label: 'Carte des lits', icon: BedDouble },
    { id: 'planner', label: 'Plans de soins', icon: ClipboardList },
  ];

  const pharmacyMenu = [
    { id: 'prescriptions', label: 'Ordonnances', icon: ClipboardList },
    { id: 'sales', label: 'Vente Directe / Stock', icon: Package },
  ];

  const accountingMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'recettes', label: 'Recettes', icon: DollarSign },
    { id: 'depenses', label: 'Dépenses', icon: TrendingUp },
    { id: 'creances', label: 'Créances', icon: AlertCircle },
    { id: 'fournisseurs', label: 'Fournisseurs', icon: Truck },
    { id: 'salaires', label: 'Salaires & RH', icon: Users },
    { id: 'quotes_parts', label: 'Quotes-Parts', icon: Percent },
    { id: 'analytique', label: 'Analytique', icon: Calculator },
    { id: 'tresorerie', label: 'Trésorerie', icon: Landmark },
    { id: 'rapports', label: 'Rapports', icon: FileText },
    { id: 'audit', label: 'Audit', icon: ShieldCheck },
  ];

  // Filtrer les menus selon le rôle de l'utilisateur
  const filteredItems = menuConfig.filter(item => {
    const hasLegacyAccess = item.access.includes(user.role);
    const hasRoleAccess = user.roles?.some(roleId => {
      // For MVP, if user has 'role_admin', they see everything.
      // In a full implementation, we'd check specific permissions.
      if (roleId === 'role_admin') return true;
      // Map legacy roles to new roles for UI purposes
      if (roleId === 'role_medecin' && item.access.includes(Role.DOCTOR)) return true;
      if (roleId === 'role_infirmier' && item.access.includes(Role.NURSE)) return true;
      if (roleId === 'role_caissier' && item.access.includes(Role.CASHIER)) return true;
      if (roleId === 'role_secretaire' && item.access.includes(Role.RECEPTION)) return true;
      if (roleId === 'role_pharmacien' && item.access.includes(Role.PHARMACY)) return true;
      if (roleId === 'role_laborantin' && item.access.includes(Role.LAB)) return true;
      if (roleId === 'role_radiologue' && item.id === 'IMAGERIE') return true;
      return false;
    });
    return hasLegacyAccess || hasRoleAccess;
  });

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <div className={`w-64 bg-slate-900 h-screen text-white flex flex-col fixed left-0 top-0 shadow-xl z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white italic shadow-lg shadow-blue-500/20">SH</div>
            <h1 className="text-xl font-black tracking-tight text-white uppercase italic">SmartHosto</h1>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {currentRole === 'SETTING' ? (
            <>
              <button
                onClick={() => setRole('DASHBOARD')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-slate-400 hover:bg-slate-800 hover:text-white mb-6"
              >
                <ArrowLeft size={18} />
                <span className="font-bold text-xs uppercase tracking-tight">Retour Dashboard</span>
              </button>
              <p className="text-[10px] font-black text-slate-500 uppercase px-4 mb-2 tracking-widest">Paramétrage</p>
              {settingsMenu.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (setActiveSettingsTab) setActiveSettingsTab(item.id as any);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                    item.id === activeSettingsTab
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-bold text-xs uppercase tracking-tight">{item.label}</span>
                </button>
              ))}
            </>
          ) : currentRole === Role.MATERNITY ? (
            <>
              <button
                onClick={() => setRole('DASHBOARD')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-slate-400 hover:bg-slate-800 hover:text-white mb-6"
              >
                <ArrowLeft size={18} />
                <span className="font-bold text-xs uppercase tracking-tight">Retour Dashboard</span>
              </button>
              <p className="text-[10px] font-black text-slate-500 uppercase px-4 mb-2 tracking-widest">Maternité</p>
              {maternityMenu.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (setActiveMaternityTab) setActiveMaternityTab(item.id as any);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                    item.id === activeMaternityTab
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-bold text-xs uppercase tracking-tight">{item.label}</span>
                </button>
              ))}
            </>
          ) : currentRole === Role.DOCTOR ? (
            <>
              <button
                onClick={() => setRole('DASHBOARD')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-slate-400 hover:bg-slate-800 hover:text-white mb-6"
              >
                <ArrowLeft size={18} />
                <span className="font-bold text-xs uppercase tracking-tight">Retour Dashboard</span>
              </button>
              <p className="text-[10px] font-black text-slate-500 uppercase px-4 mb-2 tracking-widest">Consultation</p>
              {consultationMenu.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (setActiveConsultationTab) setActiveConsultationTab(item.id as any);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                    item.id === activeConsultationTab
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-bold text-xs uppercase tracking-tight">{item.label}</span>
                </button>
              ))}
            </>
          ) : currentRole === Role.PHARMACY ? (
            <>
              <button
                onClick={() => setRole('DASHBOARD')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-slate-400 hover:bg-slate-800 hover:text-white mb-6"
              >
                <ArrowLeft size={18} />
                <span className="font-bold text-xs uppercase tracking-tight">Retour Dashboard</span>
              </button>
              <p className="text-[10px] font-black text-slate-500 uppercase px-4 mb-2 tracking-widest">Pharmacie</p>
              {pharmacyMenu.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (setActivePharmacyTab) setActivePharmacyTab(item.id as any);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                    item.id === activePharmacyTab
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-bold text-xs uppercase tracking-tight">{item.label}</span>
                </button>
              ))}
            </>
          ) : currentRole === Role.LAB ? (
            <>
              <button
                onClick={() => setRole('DASHBOARD')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-slate-400 hover:bg-slate-800 hover:text-white mb-6"
              >
                <ArrowLeft size={18} />
                <span className="font-bold text-xs uppercase tracking-tight">Retour Dashboard</span>
              </button>
              <p className="text-[10px] font-black text-slate-500 uppercase px-4 mb-2 tracking-widest">Laboratoire</p>
              {labMenu.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (setActiveLabTab) setActiveLabTab(item.id as any);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                    item.id === activeLabTab
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-bold text-xs uppercase tracking-tight">{item.label}</span>
                </button>
              ))}
            </>
          ) : currentRole === Role.NURSE ? (
            <>
              <button
                onClick={() => setRole('DASHBOARD')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-slate-400 hover:bg-slate-800 hover:text-white mb-6"
              >
                <ArrowLeft size={18} />
                <span className="font-bold text-xs uppercase tracking-tight">Retour Dashboard</span>
              </button>
              <p className="text-[10px] font-black text-slate-500 uppercase px-4 mb-2 tracking-widest">Hospitalisation</p>
              {inpatientMenu.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (setActiveInpatientTab) setActiveInpatientTab(item.id as any);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                    item.id === activeInpatientTab
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-bold text-xs uppercase tracking-tight">{item.label}</span>
                </button>
              ))}
            </>
          ) : currentRole === Role.CASHIER ? (
            <>
              <button
                onClick={() => setRole('DASHBOARD')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-slate-400 hover:bg-slate-800 hover:text-white mb-6"
              >
                <ArrowLeft size={18} />
                <span className="font-bold text-xs uppercase tracking-tight">Retour Dashboard</span>
              </button>
              <p className="text-[10px] font-black text-slate-500 uppercase px-4 mb-2 tracking-widest">Caisse & Facturation</p>
              {cashierMenu.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (setActiveCashierTab) setActiveCashierTab(item.id as any);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                    item.id === activeCashierTab
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-bold text-xs uppercase tracking-tight">{item.label}</span>
                </button>
              ))}
            </>
          ) : currentRole === Role.ACCOUNTANT ? (
            <>
              <button
                onClick={() => setRole('DASHBOARD')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-slate-400 hover:bg-slate-800 hover:text-white mb-6"
              >
                <ArrowLeft size={18} />
                <span className="font-bold text-xs uppercase tracking-tight font-black">Retour Dashboard</span>
              </button>
              <p className="text-[10px] font-black text-slate-500 uppercase px-4 mb-2 tracking-widest">Gestion & Compta</p>
              {accountingMenu.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (setActiveAccountingTab) setActiveAccountingTab(item.id as any);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                    item.id === activeAccountingTab
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-950/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-bold text-xs uppercase tracking-tight">{item.label}</span>
                </button>
              ))}
            </>
          ) : currentRole === Role.RECEPTION ? (
            <>
              <button
                onClick={() => setRole('DASHBOARD')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-slate-400 hover:bg-slate-800 hover:text-white mb-6"
              >
                <ArrowLeft size={18} />
                <span className="font-bold text-xs uppercase tracking-tight">Retour Dashboard</span>
              </button>
              <p className="text-[10px] font-black text-slate-500 uppercase px-4 mb-2 tracking-widest">Accueil Patients</p>
              {receptionMenu.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (setActiveReceptionTab) setActiveReceptionTab(item.id as any);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                    item.id === activeReceptionTab
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-bold text-xs uppercase tracking-tight">{item.label}</span>
                </button>
              ))}
            </>
          ) : currentRole === Role.URGENCE ? (
            <>
              <button
                onClick={() => setRole('DASHBOARD')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-slate-400 hover:bg-slate-800 hover:text-white mb-6"
              >
                <ArrowLeft size={18} />
                <span className="font-bold text-xs uppercase tracking-tight">Retour Dashboard</span>
              </button>
              <p className="text-[10px] font-black text-slate-500 uppercase px-4 mb-2 tracking-widest">Urgences</p>
              <div className="mx-4 p-4 bg-slate-800/40 border border-slate-700/60 rounded-2xl text-[10px] font-bold text-slate-400 leading-normal">
                <span className="text-rose-500 font-extrabold uppercase tracking-widest block mb-1">Session Active</span>
                Utilisez le menu horizontal de l'interface Urgences directement sur votre écran pour naviguer.
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setRole('DASHBOARD')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-slate-400 hover:bg-slate-800 hover:text-white mb-6"
              >
                <ArrowLeft size={18} />
                <span className="font-bold text-xs uppercase tracking-tight">Retour Dashboard</span>
              </button>
              <p className="text-[10px] font-black text-slate-500 uppercase px-4 mb-2 tracking-widest">Menu Principal</p>
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setRole(item.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                    item.id === currentRole
                    ? (item.special ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50' : 'bg-blue-600 text-white shadow-lg shadow-blue-900/50')
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-bold text-xs uppercase tracking-tight">{item.label}</span>
                </button>
              ))}
            </>
          )}
        </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-4 px-2 p-3 bg-white/5 rounded-2xl border border-white/5">
          <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden border-2 border-blue-500/50">
            <img src={`https://picsum.photos/40/40?u=${user.username}`} alt="Profile" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-black truncate text-white">{user.name}</p>
            <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest">{user.role}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors group"
        >
          <LogOut size={16} className="group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Déconnexion</span>
        </button>
      </div>
    </div>
    </>
  );
};

export default Sidebar;
