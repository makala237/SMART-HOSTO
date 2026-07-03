
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Hospital, 
  Database, 
  CreditCard, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  UserPlus,
  Stethoscope,
  Pill,
  Building2,
  Shield,
  Edit2,
  Key,
  Ban,
  Palette,
  X,
  Search,
  Filter,
  Wrench,
  Package
} from 'lucide-react';
import { Role, User, EstablishmentConfig, MedicalAct, Medication, CustomRole, UserStatus } from '../types';
import RolesPermissions from './settings/RolesPermissions';
import ToolsManagement from './settings/ToolsManagement';
import ServicesDepartments from './settings/ServicesDepartments';
import ProtocolsManagement from './settings/ProtocolsManagement';
import AddMedicationForm from './settings/AddMedicationForm';
import AddMedicalActForm from './settings/AddMedicalActForm';
import AddConsumableForm from './settings/AddConsumableForm';
import { DEFAULT_ROLES } from '../constants/rbac';
import { THEMES, ThemeColor } from '../constants/themes';

interface SettingsProps {
  activeTab: 'users' | 'roles' | 'establishment' | 'referentials' | 'cashier_settings' | 'tools' | 'services' | 'protocols';
  setActiveTab: (tab: 'users' | 'roles' | 'establishment' | 'referentials' | 'cashier_settings' | 'tools' | 'services' | 'protocols') => void;
  user: User | null;
}

const Settings: React.FC<SettingsProps> = ({ activeTab, setActiveTab, user }) => {
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showAddMedicalAct, setShowAddMedicalAct] = useState(false);
  const [showAddConsumable, setShowAddConsumable] = useState(false);

  // --- State for Roles ---
  const [roles, setRoles] = useState<CustomRole[]>(() => {
    const saved = localStorage.getItem('hospital_roles');
    return saved ? JSON.parse(saved) : DEFAULT_ROLES;
  });

  // --- State for Users ---
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('hospital_users');
    return saved ? JSON.parse(saved) : [
      { id: '1', username: 'admin', email: 'admin@smarthosto.com', name: 'Administrateur', role: Role.ADMIN, roles: ['role_admin'], status: 'ACTIVE', profession: 'Admin Système', token: 'fake', lastLogin: new Date().toISOString() }
    ];
  });
  const [newUser, setNewUser] = useState<Partial<User>>({ role: Role.DOCTOR, roles: [], status: 'ACTIVE' });
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('ALL');

  // --- State for Establishment ---
  const [establishment, setEstablishment] = useState<EstablishmentConfig>(() => {
    const saved = localStorage.getItem('hospital_config');
    const defaults = {
      name: 'Hôpital Central de Yaoundé',
      address: 'Avenue de l\'Indépendance, Yaoundé, Cameroun',
      phone: '+237 222 33 44 55',
      language: 'FR' as const,
      currency: 'XAF' as const,
      theme: 'blue',
      email: 'contact@smarthosto.com',
      city: 'Yaoundé',
      country: 'Cameroun',
      slogan: 'Votre santé, notre priorité absolue',
      logo: 'SH'
    };
    if (saved) {
      try {
        return { ...defaults, ...JSON.parse(saved) };
      } catch (e) {
        return defaults;
      }
    }
    return defaults;
  });

  // --- State for Referentials ---
  const [activeReferentialTab, setActiveReferentialTab] = useState<'acts' | 'medications' | 'consumables'>('acts');
  const [acts, setActs] = useState<MedicalAct[]>(() => {
    const saved = localStorage.getItem('hospital_acts');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Consultation Générale', price: 5000, category: 'Consultation' },
      { id: '2', name: 'Échographie', price: 15000, category: 'Imagerie' }
    ];
  });
  const [meds, setMeds] = useState<Medication[]>(() => {
    const saved = localStorage.getItem('hospital_meds');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Paracétamol', dosage: '500mg', price: 500, stock: 100 },
      { id: '2', name: 'Amoxicilline', dosage: '1g', price: 2500, stock: 50 }
    ];
  });
  const [consumables, setConsumables] = useState<any[]>(() => {
    const saved = localStorage.getItem('hospital_consumables');
    return saved ? JSON.parse(saved) : [
      { id: '1', nom: 'Gants stériles', categorie: 'médical', servicePrincipal: 'bloc_operatoire', stockInitial: 1000, uniteGestion: 'boîte', facturableAuPatient: false },
      { id: '2', nom: 'Seringues 5ml', categorie: 'médical', servicePrincipal: 'hospitalisation', stockInitial: 500, uniteGestion: 'boîte', facturableAuPatient: false },
      { id: '3', nom: 'Carnet médical', categorie: 'administratif', servicePrincipal: 'accueil', stockInitial: 200, uniteGestion: 'unité', facturableAuPatient: true, prixVente: 1000 }
    ];
  });

  // --- State for Consumables Filters ---
  const [consumableSearch, setConsumableSearch] = useState('');
  const [consumableCategoryFilter, setConsumableCategoryFilter] = useState('tous');
  
  // --- State for Cashier Settings ---
  const [cashierSettings, setCashierSettings] = useState(() => {
    const saved = localStorage.getItem('hospital_cashier_config');
    return saved ? JSON.parse(saved) : {
      partialPayment: true,
      maxDebt: 50000,
      allowCredit: true,
      autoApplyCredit: true
    };
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('hospital_users', JSON.stringify(users));
    localStorage.setItem('hospital_roles', JSON.stringify(roles));
    localStorage.setItem('hospital_config', JSON.stringify(establishment));
    localStorage.setItem('hospital_acts', JSON.stringify(acts));
    localStorage.setItem('hospital_meds', JSON.stringify(meds));
    localStorage.setItem('hospital_cashier_config', JSON.stringify(cashierSettings));
  }, [users, roles, establishment, acts, meds, cashierSettings]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // --- Handlers ---
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.name || !newUser.email) return;

    if (isEditingUser && newUser.id) {
      setUsers(users.map(u => u.id === newUser.id ? { ...u, ...newUser } as User : u));
      showMessage('success', 'Utilisateur modifié avec succès');
    } else {
      const userToAdd: User = {
        id: Math.random().toString(36).substr(2, 9),
        username: newUser.username,
        email: newUser.email,
        password: newUser.password, // TODO: Hash in production
        forcePasswordChange: newUser.forcePasswordChange,
        name: newUser.name,
        role: newUser.role as Role,
        roles: newUser.roles || [],
        status: newUser.status || 'ACTIVE',
        token: 'fake',
        profession: newUser.profession
      };
      setUsers([...users, userToAdd]);
      showMessage('success', 'Utilisateur ajouté avec succès');
    }
    
    setNewUser({ role: Role.DOCTOR, roles: [], status: 'ACTIVE' });
    setIsEditingUser(false);
    setShowUserForm(false);
  };

  const handleEditUser = (user: User) => {
    setNewUser({ ...user, password: '' });
    setIsEditingUser(true);
  };

  const handleResetPassword = (id: string) => {
    showMessage('success', 'Un email de réinitialisation a été envoyé à l\'utilisateur');
  };

  const handleToggleStatus = (id: string) => {
    if (users.find(u => u.id === id)?.username === 'admin') {
      showMessage('error', 'Impossible de désactiver l\'administrateur principal');
      return;
    }
    setUsers(users.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' };
      }
      return u;
    }));
    showMessage('success', 'Statut mis à jour');
  };

  const handleDeleteUser = (id: string) => {
    if (users.find(u => u.id === id)?.username === 'admin') {
      showMessage('error', 'Impossible de supprimer l\'administrateur principal');
      return;
    }
    setUsers(users.filter(u => u.id !== id));
    showMessage('success', 'Utilisateur supprimé');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(userSearchQuery.toLowerCase()));
    
    const matchesRole = userRoleFilter === 'ALL' || 
      (user.roles && user.roles.includes(userRoleFilter)) || 
      (!user.roles?.length && user.role === userRoleFilter);
      
    const matchesStatus = userStatusFilter === 'ALL' || user.status === userStatusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSaveEstablishment = (e: React.FormEvent) => {
    e.preventDefault();
    showMessage('success', 'Configuration de l\'établissement enregistrée');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-600/20">
              <Database size={24} />
            </div>
            Console de Paramétrage
          </h1>
          <p className="text-slate-500 font-medium mt-2">Configuration centrale de votre SIH SmartHosto</p>
        </div>

        {message && (
          <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Content Area */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 min-h-[600px]">
          {activeTab === 'roles' && (
            <RolesPermissions roles={roles} setRoles={setRoles} users={users} setUsers={setUsers} showMessage={showMessage} />
          )}

          {activeTab === 'tools' && (
            <ToolsManagement showMessage={showMessage} />
          )}

          {activeTab === 'users' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Gestion des Utilisateurs</h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowUserForm(true)}
                    className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 text-sm"
                  >
                    <UserPlus size={16} />
                    Ajouter un utilisateur
                  </button>
                </div>
              </div>

              {/* Add/Edit User Form */}
              {(showUserForm || isEditingUser) && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                      {isEditingUser ? 'Éditer l\'utilisateur' : 'Nouvel Utilisateur'}
                    </h3>
                    <button 
                      onClick={() => { 
                        setIsEditingUser(false); 
                        setShowUserForm(false);
                        setNewUser({ role: Role.DOCTOR, roles: [], status: 'ACTIVE' }); 
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto">
                    <form id="user-form" onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Nom complet *</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Dr. Jean Dupont" 
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 ring-blue-600/20 outline-none"
                          value={newUser.name || ''}
                          onChange={e => setNewUser({...newUser, name: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Username *</label>
                        <input 
                          type="text" 
                          placeholder="Ex: jdupont" 
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 ring-blue-600/20 outline-none"
                          value={newUser.username || ''}
                          onChange={e => setNewUser({...newUser, username: e.target.value})}
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Email *</label>
                        <input 
                          type="email" 
                          placeholder="Ex: jean.dupont@hopital.com" 
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 ring-blue-600/20 outline-none"
                          value={newUser.email || ''}
                          onChange={e => setNewUser({...newUser, email: e.target.value})}
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Mot de passe {isEditingUser ? '(laisser vide pour ne pas changer)' : '*'}</label>
                        <input 
                          type="password" 
                          placeholder="Min. 8 caractères" 
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 ring-blue-600/20 outline-none"
                          value={newUser.password || ''}
                          onChange={e => setNewUser({...newUser, password: e.target.value})}
                          required={!isEditingUser}
                          minLength={8}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Statut</label>
                        <select 
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 ring-blue-600/20 outline-none"
                          value={newUser.status || 'ACTIVE'}
                          onChange={e => setNewUser({...newUser, status: e.target.value as UserStatus})}
                        >
                          <option value="ACTIVE">Actif</option>
                          <option value="INACTIVE">Inactif</option>
                          <option value="BLOCKED">Bloqué</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Rôle(s) assigné(s)</label>
                        <div className="relative group">
                          <div className="w-full min-h-[46px] px-4 py-2 rounded-xl border border-slate-200 bg-white flex flex-wrap gap-2 items-center cursor-pointer">
                            {(newUser.roles?.length || 0) === 0 ? (
                              <span className="text-slate-400 text-sm">Sélectionner des rôles...</span>
                            ) : (
                              newUser.roles?.map(roleId => {
                                const role = roles.find(r => r.id === roleId);
                                return role ? (
                                  <span key={roleId} className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg flex items-center gap-1">
                                    {role.name}
                                    <button type="button" onClick={(e) => { e.stopPropagation(); setNewUser({...newUser, roles: newUser.roles?.filter(id => id !== roleId)}); }} className="hover:text-rose-500"><AlertCircle size={10} className="rotate-45" /></button>
                                  </span>
                                ) : null;
                              })
                            )}
                          </div>
                          
                          {/* Dropdown for multi-select */}
                          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-10 hidden group-hover:block max-h-48 overflow-y-auto">
                            {roles.map(role => (
                              <label key={role.id} className="flex items-center gap-2 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0">
                                <input 
                                  type="checkbox" 
                                  checked={newUser.roles?.includes(role.id) || false}
                                  onChange={(e) => {
                                    const currentRoles = newUser.roles || [];
                                    if (e.target.checked) {
                                      setNewUser({...newUser, roles: [...currentRoles, role.id]});
                                    } else {
                                      setNewUser({...newUser, roles: currentRoles.filter(id => id !== role.id)});
                                    }
                                  }}
                                  className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-slate-700">{role.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-1 md:col-span-2 flex items-center gap-2 mt-2">
                        <input 
                          type="checkbox" 
                          id="forcePasswordChange"
                          checked={newUser.forcePasswordChange || false}
                          onChange={e => setNewUser({...newUser, forcePasswordChange: e.target.checked})}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="forcePasswordChange" className="text-xs font-medium text-slate-600 cursor-pointer">
                          Forcer le changement de mot de passe au prochain login
                        </label>
                      </div>
                    </form>
                  </div>
                  
                  <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => { 
                        setIsEditingUser(false); 
                        setShowUserForm(false);
                        setNewUser({ role: Role.DOCTOR, roles: [], status: 'ACTIVE' }); 
                      }}
                      className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      form="user-form"
                      className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                    >
                      {isEditingUser ? <Save size={18} /> : <UserPlus size={18} />}
                      {isEditingUser ? 'Enregistrer' : 'Ajouter'}
                    </button>
                  </div>
                </div>
              </div>
              )}

              {/* Users List */}
              <div className="space-y-4">
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      placeholder="Rechercher un utilisateur (nom, username, email)..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 ring-blue-600/20 outline-none bg-slate-50 focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <select
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="pl-10 pr-8 py-3 rounded-2xl border border-slate-200 focus:ring-2 ring-blue-600/20 outline-none bg-slate-50 focus:bg-white transition-colors appearance-none font-medium text-slate-700 text-sm"
                      >
                        <option value="ALL">Tous les rôles</option>
                        {roles.map(role => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                    </div>
                    <select
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value)}
                      className="px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 ring-blue-600/20 outline-none bg-slate-50 focus:bg-white transition-colors font-medium text-slate-700 text-sm"
                    >
                      <option value="ALL">Tous les statuts</option>
                      <option value="ACTIVE">Actif</option>
                      <option value="INACTIVE">Inactif</option>
                      <option value="BLOCKED">Bloqué</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-3xl border border-slate-100">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisateur</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rôles</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dernière Connexion</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                            Aucun utilisateur trouvé pour cette recherche.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map(u => (
                          <tr key={u.id} onClick={() => setViewingUser(u)} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-900">{u.name}</div>
                              <div className="text-xs text-slate-500 font-medium">@{u.username}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{u.email || '-'}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {u.roles && u.roles.length > 0 ? (
                                  u.roles.map(roleId => {
                                    const role = roles.find(r => r.id === roleId);
                                    return role ? (
                                      <span key={roleId} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-black uppercase">
                                        {role.name}
                                      </span>
                                    ) : null;
                                  })
                                ) : (
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[9px] font-black uppercase">
                                    {u.role}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 
                                u.status === 'BLOCKED' ? 'bg-rose-50 text-rose-600' : 
                                'bg-slate-100 text-slate-500'
                              }`}>
                                {u.status || 'ACTIVE'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                              {u.lastLogin ? new Date(u.lastLogin).toLocaleString('fr-FR') : 'Jamais'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={(e) => { e.stopPropagation(); handleEditUser(u); }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Éditer">
                                  <Edit2 size={16} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleResetPassword(u.id); }} className="p-2 text-slate-400 hover:text-amber-600 transition-colors" title="Réinitialiser mot de passe">
                                  <Key size={16} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleToggleStatus(u.id); }} className={`p-2 transition-colors ${u.status === 'ACTIVE' ? 'text-slate-400 hover:text-orange-600' : 'text-orange-600 hover:text-emerald-600'}`} title={u.status === 'ACTIVE' ? 'Désactiver' : 'Activer'}>
                                  <Ban size={16} />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteUser(u.id); }}
                                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* User Details Modal */}
          {viewingUser && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setViewingUser(null)}>
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                    Détails de l'utilisateur
                  </h3>
                  <button 
                    onClick={() => setViewingUser(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-2xl font-black">
                      {viewingUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">{viewingUser.name}</h4>
                      <p className="text-sm text-slate-500">@{viewingUser.username}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                      <p className="text-sm font-medium text-slate-700">{viewingUser.email || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Profession</p>
                      <p className="text-sm font-medium text-slate-700">{viewingUser.profession || 'Non renseignée'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rôles</p>
                      <div className="flex flex-wrap gap-2">
                        {viewingUser.roles && viewingUser.roles.length > 0 ? (
                          viewingUser.roles.map(roleId => {
                            const role = roles.find(r => r.id === roleId);
                            return role ? (
                              <span key={roleId} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">
                                {role.name}
                              </span>
                            ) : null;
                          })
                        ) : (
                          <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold">
                            {viewingUser.role}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Statut</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          viewingUser.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 
                          viewingUser.status === 'BLOCKED' ? 'bg-rose-50 text-rose-600' : 
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {viewingUser.status || 'ACTIVE'}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dernière Connexion</p>
                        <p className="text-sm font-medium text-slate-700">
                          {viewingUser.lastLogin ? new Date(viewingUser.lastLogin).toLocaleString('fr-FR') : 'Jamais'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                  <button 
                    onClick={() => {
                      const u = viewingUser;
                      setViewingUser(null);
                      handleEditUser(u);
                    }}
                    className="px-6 py-3 rounded-xl font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-2"
                  >
                    <Edit2 size={16} /> Éditer
                  </button>
                  <button 
                    onClick={() => setViewingUser(null)}
                    className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'establishment' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Configuration de l'Établissement</h2>
              <form onSubmit={handleSaveEstablishment} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nom de l'Hôpital</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200"
                      value={establishment.name}
                      onChange={e => setEstablishment({...establishment, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Téléphone</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200"
                      value={establishment.phone}
                      onChange={e => setEstablishment({...establishment, phone: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Adresse</label>
                    <textarea 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 min-h-[100px]"
                      value={establishment.address}
                      onChange={e => setEstablishment({...establishment, address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Langue par défaut</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200"
                      value={establishment.language}
                      onChange={e => setEstablishment({...establishment, language: e.target.value as any})}
                    >
                      <option value="FR">Français</option>
                      <option value="EN">Anglais</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Devise</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200"
                      value={establishment.currency}
                      onChange={e => setEstablishment({...establishment, currency: e.target.value as any})}
                    >
                      <option value="XAF">Franc CFA (XAF)</option>
                      <option value="USD">Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email de contact</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200"
                      value={establishment.email || ''}
                      onChange={e => setEstablishment({...establishment, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Slogan / Devise d'établissement</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200"
                      value={establishment.slogan || ''}
                      onChange={e => setEstablishment({...establishment, slogan: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Ville</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200"
                      value={establishment.city || ''}
                      onChange={e => setEstablishment({...establishment, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Pays</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200"
                      value={establishment.country || ''}
                      onChange={e => setEstablishment({...establishment, country: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Logo (Badge initiales)</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200"
                      value={establishment.logo || ''}
                      onChange={e => setEstablishment({...establishment, logo: e.target.value})}
                    />
                  </div>
                  
                  <div className="col-span-2 space-y-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Palette size={20} className="text-slate-400" />
                      <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Thème de l'interface</label>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {(Object.keys(THEMES) as ThemeColor[]).map((themeName) => (
                        <button
                          key={themeName}
                          type="button"
                          onClick={() => {
                            setEstablishment({...establishment, theme: themeName});
                            // Appliquer le thème immédiatement pour prévisualisation
                            const root = document.documentElement;
                            Object.entries(THEMES[themeName]).forEach(([shade, color]) => {
                              root.style.setProperty(`--theme-${shade}`, color);
                            });
                          }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                            (establishment.theme || 'blue') === themeName 
                              ? 'border-slate-900 bg-slate-50' 
                              : 'border-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <div 
                            className="w-6 h-6 rounded-full shadow-inner" 
                            style={{ backgroundColor: THEMES[themeName][500] }}
                          />
                          <span className="font-bold text-sm capitalize">{themeName}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Sélectionnez une couleur principale pour personnaliser l'interface de l'application.
                    </p>
                  </div>
                </div>
                <button type="submit" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all">
                  <Save size={20} /> Enregistrer les modifications
                </button>
              </form>
            </div>
          )}

          {activeTab === 'services' && (
            <ServicesDepartments users={users} />
          )}

          {activeTab === 'protocols' && (
            <ProtocolsManagement user={user} showMessage={showMessage} />
          )}

          {activeTab === 'referentials' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Référentiels de Base</h2>
              
              {/* Referential Tabs */}
              <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 overflow-x-auto">
                <button
                  onClick={() => setActiveReferentialTab('acts')}
                  className={`flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                    activeReferentialTab === 'acts'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
                >
                  Actes Médicaux
                </button>
                <button
                  onClick={() => setActiveReferentialTab('medications')}
                  className={`flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                    activeReferentialTab === 'medications'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
                >
                  Médicaments de base
                </button>
                <button
                  onClick={() => setActiveReferentialTab('consumables')}
                  className={`flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                    activeReferentialTab === 'consumables'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
                >
                  Consommables
                </button>
              </div>

              {/* Acts */}
              {activeReferentialTab === 'acts' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-400 uppercase tracking-widest text-xs">Actes Médicaux & Tarifs</h3>
                    <button 
                      onClick={() => setShowAddMedicalAct(true)}
                      className="text-blue-600 font-bold text-xs flex items-center gap-1"
                    >
                      <Plus size={14} /> Ajouter
                    </button>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-slate-100">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Acte</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Catégorie</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase text-right">Tarif</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {acts.map(a => (
                          <tr key={a.id}>
                            <td className="px-4 py-3 font-bold text-sm">{a.name}</td>
                            <td className="px-4 py-3 text-xs text-slate-500">{a.category}</td>
                            <td className="px-4 py-3 text-right font-black text-blue-600">{a.price.toLocaleString()} {establishment.currency}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Meds */}
              {activeReferentialTab === 'medications' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-400 uppercase tracking-widest text-xs">Médicaments de Base</h3>
                    <button 
                      onClick={() => setShowAddMedication(true)}
                      className="text-blue-600 font-bold text-xs flex items-center gap-1"
                    >
                      <Plus size={14} /> Ajouter
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {meds.map(m => (
                      <div key={m.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{m.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{m.dosage} • Stock: {m.stock}</p>
                        </div>
                        <p className="font-black text-emerald-600">{m.price} {establishment.currency}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Consumables */}
              {activeReferentialTab === 'consumables' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-400 uppercase tracking-widest text-xs">Consommables</h3>
                    <button 
                      onClick={() => setShowAddConsumable(true)}
                      className="text-emerald-600 font-bold text-xs flex items-center gap-1 bg-emerald-50 px-3 py-2 rounded-xl hover:bg-emerald-100 transition-colors"
                    >
                      <Plus size={14} /> Ajouter un consommable
                    </button>
                  </div>

                  {/* Filters & Search */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Rechercher par nom, code, catégorie..."
                        value={consumableSearch}
                        onChange={(e) => setConsumableSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                      />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                      {['tous', 'médical', 'laboratoire', 'administratif', 'technique'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setConsumableCategoryFilter(cat)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                            consumableCategoryFilter === cat 
                              ? 'bg-slate-900 text-white' 
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="capitalize">{cat}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Nom</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Catégorie</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Service</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Facturable</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {consumables
                            .filter(c => consumableCategoryFilter === 'tous' || c.categorie === consumableCategoryFilter)
                            .filter(c => 
                              c.nom?.toLowerCase().includes(consumableSearch.toLowerCase()) || 
                              c.codeInterne?.toLowerCase().includes(consumableSearch.toLowerCase()) ||
                              c.categorie?.toLowerCase().includes(consumableSearch.toLowerCase()) ||
                              c.sousCategorie?.toLowerCase().includes(consumableSearch.toLowerCase())
                            )
                            .map(c => {
                              const stockStatus = c.stockInitial <= (c.seuilAlerte || 10) ? 'rouge' : (c.stockInitial <= (c.seuilAlerte || 10) * 2 ? 'jaune' : 'vert');
                              return (
                                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-4">
                                    <p className="font-bold text-slate-900 text-sm">{c.nom}</p>
                                    {c.codeInterne && <p className="text-xs text-slate-500 font-medium">{c.codeInterne}</p>}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 capitalize">
                                      {c.categorie}
                                    </span>
                                    {c.sousCategorie && <p className="text-xs text-slate-500 mt-1">{c.sousCategorie}</p>}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-sm text-slate-600 capitalize">{c.servicePrincipal?.replace('_', ' ')}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${
                                        stockStatus === 'vert' ? 'bg-emerald-500' : 
                                        stockStatus === 'jaune' ? 'bg-amber-500' : 'bg-rose-500'
                                      }`} />
                                      <span className="font-bold text-slate-700 text-sm">{c.stockInitial}</span>
                                      <span className="text-xs text-slate-500">{c.uniteGestion}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    {c.facturableAuPatient ? (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                                        Oui ({c.prixVente} {establishment.currency})
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                                        Non
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <Edit2 size={16} />
                                      </button>
                                      <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          {consumables.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                <Package size={32} className="mx-auto mb-3 opacity-20" />
                                <p className="font-medium">Aucun consommable trouvé</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'cashier_settings' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Paramètres de la caisse</h2>
              
              {/* Règles financières */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight border-b border-slate-100 pb-4">A. Règles financières</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-slate-900">Paiement partiel autorisé</p>
                      <p className="text-xs text-slate-500">Accepter un paiement inférieur au total</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={cashierSettings.partialPayment} 
                        onChange={(e) => setCashierSettings({...cashierSettings, partialPayment: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${cashierSettings.partialPayment ? 'text-slate-400' : 'text-slate-300'}`}>
                      Seuil maximal de dette (FCFA)
                    </label>
                    <input 
                      type="number" 
                      value={cashierSettings.maxDebt} 
                      onChange={(e) => setCashierSettings({...cashierSettings, maxDebt: parseInt(e.target.value) || 0})}
                      disabled={!cashierSettings.partialPayment}
                      className={`w-full px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-900 transition-all ${!cashierSettings.partialPayment ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60' : 'bg-slate-50'}`} 
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-slate-900">Avoir patient autorisé</p>
                      <p className="text-xs text-slate-500">Conserver la monnaie comme avoir</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={cashierSettings.allowCredit} 
                        onChange={(e) => setCashierSettings({...cashierSettings, allowCredit: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-slate-900">Application auto. de l'avoir</p>
                      <p className="text-xs text-slate-500">Déduire l'avoir au prochain achat</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={cashierSettings.autoApplyCredit} 
                        onChange={(e) => setCashierSettings({...cashierSettings, autoApplyCredit: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modes de paiement */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight border-b border-slate-100 pb-4">B. Modes de paiement</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['Espèces', 'Mobile Money', 'Carte bancaire', 'Virement', 'Chèque', 'Autre'].map((mode) => (
                    <div key={mode} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl">
                      <input type="checkbox" defaultChecked={['Espèces', 'Mobile Money', 'Carte bancaire'].includes(mode)} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      <span className="font-medium text-slate-700">{mode}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Informations d'impression */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight border-b border-slate-100 pb-4">C. Informations d'impression (Reçus)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom de la structure</label>
                    <input type="text" defaultValue={establishment.name} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Téléphone</label>
                    <input type="text" defaultValue={establishment.phone} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adresse</label>
                    <input type="text" defaultValue={establishment.address} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Slogan ou Message</label>
                    <input type="text" defaultValue="Votre santé, notre priorité" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pied de page des reçus</label>
                    <input type="text" defaultValue="Merci de votre confiance. Les reçus ne sont ni repris ni échangés." className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900" />
                  </div>
                </div>
              </div>

              {/* Permissions financières */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight border-b border-slate-100 pb-4">D. Permissions financières</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Autoriser une dette au-delà du seuil', roles: ['Administrateur', 'Gestionnaire'] },
                    { label: 'Annuler une transaction', roles: ['Administrateur', 'Gestionnaire', 'Caissier Principal'] },
                    { label: 'Rembourser un avoir', roles: ['Administrateur', 'Gestionnaire'] },
                    { label: 'Modifier une facture validée', roles: ['Administrateur'] }
                  ].map((perm, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 rounded-2xl gap-4">
                      <span className="font-bold text-slate-900">{perm.label}</span>
                      <div className="flex flex-wrap gap-2">
                        {perm.roles.map(r => (
                          <span key={r} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">{r}</span>
                        ))}
                        <button className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-full hover:bg-slate-300">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Paramètres techniques */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight border-b border-slate-100 pb-4">E. Paramètres techniques de caisse</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Format de numérotation des reçus</label>
                    <input type="text" defaultValue="REC-YYYYMMDD-XXXX" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-sm text-slate-900" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Format d'identifiant des transactions</label>
                    <input type="text" defaultValue="TRX-YYYYMMDD-XXXX" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-sm text-slate-900" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                  Enregistrer les paramètres de caisse
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddMedication && (
        <AddMedicationForm 
          onClose={() => setShowAddMedication(false)}
          onSave={(med) => {
            const newMed = {
              id: Date.now().toString(),
              name: med.nomCommercial,
              dosage: `${med.dosageValeur}${med.dosageUnite}`,
              price: Number(med.prixVente) || 0,
              stock: 0,
              ...med
            };
            const updatedMeds = [...meds, newMed];
            setMeds(updatedMeds);
            localStorage.setItem('hospital_meds', JSON.stringify(updatedMeds));
            setShowAddMedication(false);
            setMessage({ type: 'success', text: 'Médicament ajouté avec succès' });
            setTimeout(() => setMessage(null), 3000);
          }}
        />
      )}

      {showAddMedicalAct && (
        <AddMedicalActForm 
          onClose={() => setShowAddMedicalAct(false)}
          onSave={(act) => {
            const newAct = {
              id: Date.now().toString(),
              name: act.nom,
              price: Number(act.prixBase) || 0,
              category: act.categorie || 'Non catégorisé',
              ...act
            };
            const updatedActs = [...acts, newAct];
            setActs(updatedActs);
            localStorage.setItem('hospital_acts', JSON.stringify(updatedActs));
            setShowAddMedicalAct(false);
            setMessage({ type: 'success', text: 'Acte médical ajouté avec succès' });
            setTimeout(() => setMessage(null), 3000);
          }}
        />
      )}

      {showAddConsumable && (
        <AddConsumableForm 
          onClose={() => setShowAddConsumable(false)}
          onSave={(consumable) => {
            const newConsumable = {
              id: Date.now().toString(),
              name: consumable.nom,
              price: Number(consumable.prixVente) || 0,
              stock: Number(consumable.stockInitial) || 0,
              ...consumable
            };
            const updatedConsumables = [...consumables, newConsumable];
            setConsumables(updatedConsumables);
            localStorage.setItem('hospital_consumables', JSON.stringify(updatedConsumables));
            setShowAddConsumable(false);
            setMessage({ type: 'success', text: 'Consommable ajouté avec succès' });
            setTimeout(() => setMessage(null), 3000);
          }}
        />
      )}
    </div>
  );
};

export default Settings;
