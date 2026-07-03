
import React, { useState, useEffect } from 'react';
import { Role, User, EmergencySubMenu, ReceptionSubMenu, CashierSubMenu, LabSubMenu, InpatientSubMenu, PharmacySubMenu, AccountingSubMenu } from './types';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reception from './pages/Reception';
import Consultation from './pages/Consultation';
import Inpatient from './pages/Inpatient';
import Lab from './pages/Lab';
import Maternity from './pages/Maternity';
import Pharmacy from './pages/Pharmacy';
import Cashier from './pages/Cashier';
import { Accounting } from './pages/Accounting';
import Personnel from './pages/Personnel';
import Emergency from './pages/Emergency';
import ModuleSelector from './pages/ModuleSelector';
import Settings from './pages/Settings';
import ComingSoon from './pages/ComingSoon';
import { ControlCenter } from './pages/ControlCenter';
import { Menu, LogOut, Bell } from 'lucide-react';
import { applyTheme } from './constants/themes';
import { auth } from './src/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentModule, setCurrentModule] = useState<Role | 'DASHBOARD' | 'SETTING' | 'IMAGERIE' | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'users' | 'roles' | 'establishment' | 'referentials' | 'cashier_settings' | 'tools' | 'services' | 'protocols'>('users');
  const [activeMaternityTab, setActiveMaternityTab] = useState<'cpn' | 'labor' | 'delivery' | 'postpartum'>('cpn');
  const [activeConsultationTab, setActiveConsultationTab] = useState<'WAITING_ROOM' | 'CONSULTATION' | 'FOLLOW_UP' | 'HISTORY' | 'APPOINTMENTS'>('WAITING_ROOM');
  const [activeEmergencyTab, setActiveEmergencyTab] = useState<EmergencySubMenu>('TRIAGE');
  const [activeReceptionTab, setActiveReceptionTab] = useState<ReceptionSubMenu>('triage');
  const [activeCashierTab, setActiveCashierTab] = useState<CashierSubMenu>('facturation');
  const [activeLabTab, setActiveLabTab] = useState<LabSubMenu>('demandes');
  const [activeInpatientTab, setActiveInpatientTab] = useState<InpatientSubMenu>('beds');
  const [activePharmacyTab, setActivePharmacyTab] = useState<PharmacySubMenu>('prescriptions');
  const [activeAccountingTab, setActiveAccountingTab] = useState<AccountingSubMenu>('dashboard');
  const [notifications, setNotifications] = useState<{id: number, message: string}[]>([]);

  useEffect(() => {
    const handleNotification = (e: any) => {
      const newNotif = { id: Date.now(), message: e.detail };
      setNotifications(prev => [...prev, newNotif]);
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
      }, 5000);
    };

    window.addEventListener('app-notification', handleNotification);
    return () => window.removeEventListener('app-notification', handleNotification);
  }, []);

  // État global de la file d'attente partagée entre l'accueil et les médecins
  const [globalWaitingQueue, setGlobalWaitingQueue] = useState<any[]>([
    { 
      id: 'DME-4452', firstName: 'Amadou', lastName: 'DIOP', age: 39, gender: 'M', 
      time: '08:45', motif: 'CONSULTATION', paymentStatus: 'SOLDE', priority: 'normal',
      allergies: ['Pénicilline'],
      vitals: { temp: 38.2, bp: '135/85', pulse: 88, spo2: 97, weight: 75, height: 178, bmi: 23.7 }
    },
    { 
      id: 'DME-9012', firstName: 'Mariam', lastName: 'SYLLA', age: 28, gender: 'F', 
      time: '09:15', motif: 'URGENCE', paymentStatus: 'PARTIEL', priority: 'critique',
      allergies: [],
      vitals: { temp: 39.5, bp: '110/70', pulse: 112, spo2: 94, weight: 62, height: 165, bmi: 22.8 }
    },
    { 
      id: 'DME-7721', firstName: 'Jean-Paul', lastName: 'GOMIS', age: 62, gender: 'M', 
      time: '09:45', motif: 'SUIVI HTA', paymentStatus: 'SOLDE', priority: 'urgent',
      allergies: ['Aspirine'],
      vitals: { temp: 36.8, bp: '165/95', pulse: 76, spo2: 98, weight: 88, height: 172, bmi: 29.7 }
    }
  ]);

  // Global state for financial flow
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [cashierTransactions, setCashierTransactions] = useState<any[]>([]);
  const [transactionsFacturation, setTransactionsFacturation] = useState<any[]>([]);
  const [avoirsPatient, setAvoirsPatient] = useState<any[]>([]);
  const [dettesPatient, setDettesPatient] = useState<any[]>([]);
  const [parametresCaisse, setParametresCaisse] = useState<any>({
    detteAutorisee: true,
    seuilDetteMax: 50000,
    paiementPartielAutorise: true,
    avoirPatientAutorise: true,
    applicationAutoAvoir: true,
    modesPaiement: {
      especes: true,
      mobileMoney: true,
      carteBancaire: true,
      virement: false,
      cheque: false,
      autre: false
    },
    impression: {
      nomClinique: 'SmartHosto',
      logo: '',
      adresse: 'Dakar, Sénégal',
      telephone: '+221 77 000 00 00',
      slogan: 'Votre santé, notre priorité',
      piedDePage: 'Merci de votre confiance.'
    },
    permissions: {
      autoriserDette: ['ADMIN', 'DIRECTOR'],
      annulerTransaction: ['ADMIN'],
      rembourserAvoir: ['ADMIN', 'CHIEF_CASHIER'],
      modifierFactureValidee: ['ADMIN']
    },
    technique: {
      caissesActives: ['Caisse 1', 'Caisse 2'],
      formatRecu: 'REC-YYYYMMDD-XXXX',
      formatTransaction: 'TX-YYYYMMDD-XXXX'
    }
  });

  // Vérification de la session au démarrage
  useEffect(() => {
    const savedSession = localStorage.getItem('hospital_session');
    
    // Appliquer le thème sauvegardé
    const savedConfig = localStorage.getItem('hospital_config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      if (config.theme) {
        applyTheme(config.theme);
      } else {
        applyTheme('blue');
      }
    } else {
      applyTheme('blue');
    }

    if (savedSession) {
      const userData = JSON.parse(savedSession);
      
      // Set up authentication before showing authenticated modules
      signInAnonymously(auth)
        .then(() => {
          setUser(userData);
          if (userData.role === Role.SUPER_ADMIN) {
            setCurrentModule(Role.SUPER_ADMIN);
          } else {
            setCurrentModule('DASHBOARD');
          }
        })
        .catch(err => {
          console.error("Firebase recovery sign-in failed:", err);
          // Fallback to allow app to run even if firebase has transient issues
          setUser(userData);
          if (userData.role === Role.SUPER_ADMIN) {
            setCurrentModule(Role.SUPER_ADMIN);
          } else {
            setCurrentModule('DASHBOARD');
          }
        });
    }
  }, []);

  // Gestion responsive de la sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    if (userData.role === Role.SUPER_ADMIN) {
      setCurrentModule(Role.SUPER_ADMIN);
    } else {
      setCurrentModule('DASHBOARD');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hospital_session');
    auth.signOut();
    setUser(null);
    setCurrentModule(null);
  };

  const renderModule = () => {
    if (!user || !currentModule) return null;

    if (currentModule === 'DASHBOARD') {
      return <ModuleSelector user={user} onSelectModule={setCurrentModule} />;
    }

    if (currentModule === 'SETTING') {
      const isAdmin = user.role === Role.ADMIN || user.roles?.includes('role_admin');
      if (!isAdmin) return <ModuleSelector user={user} onSelectModule={setCurrentModule} />;
      return <Settings activeTab={activeSettingsTab} setActiveTab={setActiveSettingsTab} user={user} />;
    }

    switch(currentModule) {
      case Role.ADMIN: return <Dashboard />;
      case Role.RECEPTION: 
        return (
          <Reception 
            user={user} 
            setGlobalWaitingQueue={setGlobalWaitingQueue} 
            paymentRequests={paymentRequests} 
            setPaymentRequests={setPaymentRequests} 
            activeTab={activeReceptionTab}
            setActiveTab={setActiveReceptionTab}
            onBackToDashboard={() => setCurrentModule('DASHBOARD')}
          />
        );
      case Role.DOCTOR: 
        return <Consultation 
          user={user} 
          waitingQueue={globalWaitingQueue} 
          setWaitingQueue={setGlobalWaitingQueue} 
          paymentRequests={paymentRequests} 
          setPaymentRequests={setPaymentRequests}
          activeMenu={activeConsultationTab}
          setActiveMenu={setActiveConsultationTab}
        />;
      case Role.NURSE: 
        return (
          <Inpatient 
            user={user} 
            paymentRequests={paymentRequests} 
            setPaymentRequests={setPaymentRequests} 
            activeTab={activeInpatientTab}
            setActiveTab={setActiveInpatientTab}
            onBackToDashboard={() => setCurrentModule('DASHBOARD')}
          />
        );
      case Role.LAB: 
        return (
          <Lab 
            paymentRequests={paymentRequests} 
            setPaymentRequests={setPaymentRequests} 
            user={user} 
            activeTab={activeLabTab}
            setActiveTab={setActiveLabTab}
            onBackToDashboard={() => setCurrentModule('DASHBOARD')}
          />
        );
      case Role.PHARMACY: 
        return (
          <Pharmacy 
            paymentRequests={paymentRequests} 
            setPaymentRequests={setPaymentRequests} 
            user={user} 
            activeTab={activePharmacyTab}
            setActiveTab={setActivePharmacyTab}
            onBackToDashboard={() => setCurrentModule('DASHBOARD')}
          />
        );
      case Role.CASHIER: 
        return (
          <Cashier 
            user={user} 
            paymentRequests={paymentRequests} 
            setPaymentRequests={setPaymentRequests} 
            cashierTransactions={cashierTransactions} 
            setCashierTransactions={setCashierTransactions} 
            transactionsFacturation={transactionsFacturation} 
            setTransactionsFacturation={setTransactionsFacturation} 
            avoirsPatient={avoirsPatient} 
            setAvoirsPatient={setAvoirsPatient} 
            dettesPatient={dettesPatient} 
            setDettesPatient={setDettesPatient} 
            parametresCaisse={parametresCaisse} 
            activeTab={activeCashierTab}
            setActiveTab={setActiveCashierTab}
            onBackToDashboard={() => setCurrentModule('DASHBOARD')}
          />
        );
      case Role.MATERNITY: return <Maternity user={user} activeTab={activeMaternityTab} setActiveTab={setActiveMaternityTab} paymentRequests={paymentRequests} setPaymentRequests={setPaymentRequests} />;
      case Role.ACCOUNTANT: 
        return (
          <Accounting 
            user={user} 
            paymentRequests={paymentRequests} 
            cashierTransactions={cashierTransactions} 
            onBackToDashboard={() => setCurrentModule('DASHBOARD')}
            activeTab={activeAccountingTab}
            setActiveTab={setActiveAccountingTab}
          />
        ); 
      case Role.URGENCE:
        return (
          <Emergency 
            user={user} 
            globalWaitingQueue={globalWaitingQueue} 
            setGlobalWaitingQueue={setGlobalWaitingQueue} 
            paymentRequests={paymentRequests} 
            setPaymentRequests={setPaymentRequests} 
            activeMenu={activeEmergencyTab}
            setActiveMenu={setActiveEmergencyTab}
            onBackToDashboard={() => setCurrentModule('DASHBOARD')}
          />
        );
      case 'IMAGERIE':
        return <ComingSoon moduleName={currentModule} onBack={() => setCurrentModule('DASHBOARD')} />;
      default: return <ModuleSelector user={user} onSelectModule={setCurrentModule} />;
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (currentModule === Role.SUPER_ADMIN) {
    return (
      <div className="min-h-screen bg-slate-950">
        <ControlCenter 
          currentUser={user} 
          onBackToDashboard={handleLogout} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {currentModule !== 'DASHBOARD' && (
        <Sidebar 
          user={user} 
          currentRole={currentModule || 'DASHBOARD'} 
          setRole={setCurrentModule} 
          onLogout={handleLogout} 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeSettingsTab={activeSettingsTab}
          setActiveSettingsTab={setActiveSettingsTab}
          activeMaternityTab={activeMaternityTab}
          setActiveMaternityTab={setActiveMaternityTab}
          activeConsultationTab={activeConsultationTab}
          setActiveConsultationTab={setActiveConsultationTab}
          activeEmergencyTab={activeEmergencyTab}
          setActiveEmergencyTab={setActiveEmergencyTab}
          activeReceptionTab={activeReceptionTab}
          setActiveReceptionTab={setActiveReceptionTab}
          activeCashierTab={activeCashierTab}
          setActiveCashierTab={setActiveCashierTab}
          activeLabTab={activeLabTab}
          setActiveLabTab={setActiveLabTab}
          activeInpatientTab={activeInpatientTab}
          setActiveInpatientTab={setActiveInpatientTab}
          activePharmacyTab={activePharmacyTab}
          setActivePharmacyTab={setActivePharmacyTab}
          activeAccountingTab={activeAccountingTab}
          setActiveAccountingTab={setActiveAccountingTab}
        />
      )}
      
      <main className={`flex-1 min-h-screen relative transition-all duration-300 ${isSidebarOpen && currentModule !== 'DASHBOARD' ? 'md:ml-64' : 'ml-0'}`}>
        <div className="max-w-[1600px] mx-auto">
          {/* Top Bar / Header */}
          <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100">
            <div className="flex items-center gap-4">
              {!isSidebarOpen && currentModule !== 'DASHBOARD' && (
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <Menu size={20} />
                </button>
              )}
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SmartHosto SIH</span>
                <h2 className="text-sm font-bold text-slate-900">
                  {currentModule === 'DASHBOARD' ? 'Dashboard Principal' : currentModule}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-xs font-black text-slate-900">{user.name}</span>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{user.role}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors flex items-center gap-2 px-4"
              >
                <LogOut size={18} />
                <span className="text-xs font-bold hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
          
          {renderModule()}
        </div>
        
        {/* Notifications persistantes contextuelles */}
        <div className="fixed bottom-8 right-8 z-50 pointer-events-none">
          <div className="space-y-3 flex flex-col items-end">
            {notifications.map(notif => (
              <div key={notif.id} className="bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 pointer-events-auto border border-blue-500 transform hover:scale-105 transition-transform cursor-pointer group animate-in slide-in-from-right-8 fade-in duration-300">
                <Bell size={16} className="text-blue-200" />
                <div>
                  <p className="text-[10px] font-black uppercase text-blue-200">Notification</p>
                  <p className="text-xs font-bold">{notif.message}</p>
                </div>
              </div>
            ))}
            <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 pointer-events-auto border border-slate-800 transform hover:scale-105 transition-transform cursor-pointer group">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse group-hover:bg-blue-400"></div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-500">Session Active</p>
                <p className="text-xs font-bold">{user.name} • {user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
