
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Eye, 
  Clock, 
  UserPlus, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Stethoscope, 
  Navigation, 
  Home, 
  BedDouble, 
  ArrowRightLeft,
  Search,
  Bell,
  Thermometer,
  Heart,
  Wind,
  Droplets,
  AlertTriangle,
  FileText,
  User,
  Zap,
  Save,
  Plus,
  History,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  EmergencyPatient, 
  TriageLevel, 
  TriageData, 
  User as UserType, 
  Role, 
  Patient,
  PatientStatus,
  EmergencySubMenu,
  EmergencyManagement,
  EmergencyMonitoring,
  EmergencyOrientation
} from '../types';

interface EmergencyProps {
  user: UserType;
  globalWaitingQueue?: any[];
  setGlobalWaitingQueue?: React.Dispatch<React.SetStateAction<any[]>>;
  paymentRequests?: any[];
  setPaymentRequests?: React.Dispatch<React.SetStateAction<any[]>>;
  activeMenu: EmergencySubMenu;
  setActiveMenu: (menu: EmergencySubMenu) => void;
  onBackToDashboard: () => void;
}

const Emergency: React.FC<EmergencyProps> = ({ 
  user, 
  globalWaitingQueue = [], 
  setGlobalWaitingQueue,
  activeMenu,
  setActiveMenu,
  onBackToDashboard
}) => {
  const [patients, setPatients] = useState<EmergencyPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<EmergencyPatient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // States for forms
  const [showTriageForm, setShowTriageForm] = useState(false);
  const [triageForm, setTriageForm] = useState({
    motif: '',
    bpSys: 120,
    bpDia: 80,
    heartRate: 80,
    respRate: 18,
    spo2: 98,
    temp: 37,
    consciousness: 'ALERT' as const,
    painScale: 0
  });

  const [managementForm, setManagementForm] = useState({
    diagnosis: '',
    acts: [] as string[],
    treatments: [] as string[]
  });

  const [monitoringForm, setMonitoringForm] = useState({
    bpSys: 120,
    bpDia: 80,
    heartRate: 80,
    respRate: 18,
    spo2: 98,
    temp: 37,
    note: ''
  });

  const [orientationForm, setOrientationForm] = useState({
    type: 'DISCHARGE' as const,
    summary: ''
  });

  // Calculate triage level automatically
  const calculateTriageLevel = (data: typeof triageForm): TriageLevel => {
    if (data.consciousness === 'UNCONSCIOUS' || data.spo2 < 90 || data.respRate > 30 || data.respRate < 8 || data.heartRate > 140 || data.heartRate < 40) {
      return TriageLevel.RED;
    }
    if (data.painScale >= 8 || data.temp >= 40 || data.temp < 35 || data.spo2 < 94 || data.heartRate > 110) {
      return TriageLevel.ORANGE;
    }
    if (data.painScale >= 4 || data.temp >= 38.5 || data.heartRate > 100) {
      return TriageLevel.YELLOW;
    }
    return TriageLevel.GREEN;
  };

  const triageLevel = useMemo(() => calculateTriageLevel(triageForm), [triageForm]);

  // Handle Triage Submission
  const handleTriageSubmit = () => {
    if (!selectedPatient) return;

    const triage: TriageData = {
      id: `TR-${Date.now()}`,
      patientId: selectedPatient.id,
      timestamp: new Date().toISOString(),
      motif: triageForm.motif,
      vitals: {
        bpSys: triageForm.bpSys,
        bpDia: triageForm.bpDia,
        heartRate: triageForm.heartRate,
        respRate: triageForm.respRate,
        spo2: triageForm.spo2,
        temp: triageForm.temp
      },
      consciousness: triageForm.consciousness,
      painScale: triageForm.painScale,
      level: triageLevel
    };

    const updatedPatients = patients.map(p => {
      if (p.id === selectedPatient.id) {
        let status: EmergencyPatient['status'] = PatientStatus.TRIAGE;
        if (triageLevel === TriageLevel.RED || triageLevel === TriageLevel.ORANGE) status = PatientStatus.ER_ROOM;
        else if (triageLevel === TriageLevel.YELLOW) status = PatientStatus.OBSERVATION;
        else status = PatientStatus.NON_URGENT;

        return { ...p, triage, status };
      }
      return p;
    });

    setPatients(updatedPatients);
    setShowTriageForm(false);
    setSelectedPatient(null);
    
    // Impact Log mock
    console.log(`[ER] Patient ${selectedPatient.lastName} trié en ${triageLevel}`);
  };

  // Protocols
  const protocols = [
    { id: 'PALU', name: 'Paludisme Grave', acts: ['Pose VVP', 'Prélèvement Glycémie/GE'], treatments: ['Artésunate IV 2.4mg/kg', 'Paracétamol Injectable'] },
    { id: 'RESP', name: 'Détresse Resp.', acts: ['Oxygénothérapie', 'Nébulisation Salbutamol'], treatments: ['Hydrocortisone 200mg IV'] },
    { id: 'CHOC', name: 'Choc', acts: ['Remplissage SSI 500ml', 'Pose 2ème VVP'], treatments: ['Adrénaline si besoin'] },
    { id: 'TRAUMA', name: 'Traumatisme', acts: ['Immobilisation', 'RX Standard'], treatments: ['Morphine 0.1mg/kg', 'Pansement'] }
  ];

  const applyProtocol = (id: string) => {
    const proto = protocols.find(p => p.id === id);
    if (proto) {
      setManagementForm(prev => ({
        ...prev,
        acts: [...new Set([...prev.acts, ...proto.acts])],
        treatments: [...new Set([...prev.treatments, ...proto.treatments])]
      }));
    }
  };

  const handleManagementSubmit = () => {
    if (!selectedPatient) return;

    const management: EmergencyManagement = {
      id: `MGMT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      doctorId: user.id,
      doctorName: user.name,
      diagnosis: managementForm.diagnosis,
      acts: managementForm.acts,
      treatments: managementForm.treatments
    };

    setPatients(patients.map(p => 
      p.id === selectedPatient.id ? { ...p, management } : p
    ));
    setActiveMenu('ER_ROOM');
    setSelectedPatient(null);
  };

  const handleMonitoringSubmit = () => {
    if (!selectedPatient) return;

    const monitoring: EmergencyMonitoring = {
      id: `MON-${Date.now()}`,
      timestamp: new Date().toISOString(),
      vitals: {
        bpSys: monitoringForm.bpSys,
        bpDia: monitoringForm.bpDia,
        heartRate: monitoringForm.heartRate,
        respRate: monitoringForm.respRate,
        spo2: monitoringForm.spo2,
        temp: monitoringForm.temp
      },
      nurseId: user.id,
      nurseName: user.name,
      note: monitoringForm.note
    };

    setPatients(patients.map(p => 
      p.id === selectedPatient.id ? { ...p, monitoring: [...p.monitoring, monitoring] } : p
    ));
    setSelectedPatient(null);
  };

  const handleOrientationSubmit = () => {
    if (!selectedPatient) return;

    const orientation: EmergencyOrientation = {
      id: `ORIENT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: orientationForm.type,
      summary: orientationForm.summary
    };

    setPatients(patients.map(p => 
      p.id === selectedPatient.id ? { ...p, orientation, status: 'ORIENTED' as const } : p
    ));
    setSelectedPatient(null);
  };

  // Mock data initialization
  useEffect(() => {
    if (patients.length === 0) {
      setPatients([
        { 
          id: 'DME-9012', firstName: 'Mariam', lastName: 'SYLLA', age: 28, gender: 'F', birthDate: '1996-04-12', phone: '771234567', residence: 'Dakar', emergencyContact: 'Père', emergencyPhone: '77888888', maritalStatus: 'CELIBATAIRE',
          emergencyId: 'ER-001', arrivalTimestamp: new Date(Date.now() - 45 * 60000).toISOString(), status: 'ER_ROOM', monitoring: [],
          triage: { 
            id: 'TR-1', patientId: 'DME-9012', timestamp: new Date(Date.now() - 40 * 60000).toISOString(), level: TriageLevel.RED, motif: 'Détresse respiratoire', consciousness: 'VOICE', painScale: 5,
            vitals: { bpSys: 100, bpDia: 60, heartRate: 120, respRate: 32, spo2: 88, temp: 39.5 }
          }
        },
        { 
          id: 'DME-4452', firstName: 'Amadou', lastName: 'DIOP', age: 39, gender: 'M', birthDate: '1985-01-10', phone: '772223344', residence: 'Thiès', emergencyContact: 'Frère', emergencyPhone: '775556677', maritalStatus: 'MARIE',
          emergencyId: 'ER-002', arrivalTimestamp: new Date(Date.now() - 120 * 60000).toISOString(), status: 'TRIAGE', monitoring: []
        },
        { 
          id: 'DME-7721', firstName: 'Jean-Paul', lastName: 'GOMIS', age: 62, gender: 'M', birthDate: '1962-09-21', phone: '779998877', residence: 'Saint-Louis', emergencyContact: 'Fille', emergencyPhone: '773334455', maritalStatus: 'VEUF',
          emergencyId: 'ER-003', arrivalTimestamp: new Date(Date.now() - 10 * 60000).toISOString(), status: 'TRIAGE', monitoring: []
        }
      ]);
    }
  }, []);

  const filteredPatients = useMemo(() => {
    let list = patients;
    if (searchQuery) {
      list = list.filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.includes(searchQuery));
    }
    
    switch(activeMenu) {
      case 'TRIAGE': return list.filter(p => p.status === 'TRIAGE');
      case 'ER_ROOM': return list.filter(p => p.status === 'ER_ROOM');
      case 'OBSERVATION': return list.filter(p => p.status === 'OBSERVATION');
      case 'NON_URGENT': return list.filter(p => p.status === 'NON_URGENT');
      case 'DISCHARGE': return list.filter(p => p.status === 'ORIENTED');
      default: return list;
    }
  }, [patients, activeMenu, searchQuery]);

  const getTriageColor = (level: TriageLevel | undefined) => {
    switch(level) {
      case TriageLevel.RED: return 'bg-rose-600';
      case TriageLevel.ORANGE: return 'bg-orange-500';
      case TriageLevel.YELLOW: return 'bg-amber-400';
      case TriageLevel.GREEN: return 'bg-emerald-500';
      default: return 'bg-slate-300';
    }
  };

  const getTriageTextColor = (level: TriageLevel | undefined) => {
    switch(level) {
      case TriageLevel.RED: return 'text-rose-600';
      case TriageLevel.ORANGE: return 'text-orange-600';
      case TriageLevel.YELLOW: return 'text-amber-600';
      case TriageLevel.GREEN: return 'text-emerald-600';
      default: return 'text-slate-500';
    }
  };

  const getTriageBgSoft = (level: TriageLevel | undefined) => {
    switch(level) {
      case TriageLevel.RED: return 'bg-rose-50';
      case TriageLevel.ORANGE: return 'bg-orange-50';
      case TriageLevel.YELLOW: return 'bg-amber-50';
      case TriageLevel.GREEN: return 'bg-emerald-50';
      default: return 'bg-slate-50';
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto text-slate-900">
      <div className="flex flex-col gap-6 min-h-[85vh]">
        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col gap-6">
           <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm gap-6">
              <div className="flex items-center gap-6">
                <button 
                  onClick={onBackToDashboard}
                  className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg group"
                  title="Retour au Dashboard"
                >
                  <Home size={24} className="group-hover:scale-110 transition-transform" />
                </button>
                <div>
                  <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 italic">
                    <ShieldAlert size={32} className="text-rose-600" />
                    {activeMenu === 'MANAGEMENT' ? 'Prise en Charge Médicale' : activeMenu.replace('_', ' ')}
                  </h1>
                  <p className="text-sm font-medium text-slate-500 capitalize">{user.profession} • {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
              </div>

              {/* URGENCE TOP NAVIGATION CHIPS */}
              <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-[24px] max-w-full overflow-x-auto">
                {[
                  { id: 'TRIAGE', label: 'Triage', icon: AlertCircle },
                  { id: 'ER_ROOM', label: 'Salle d’Urgence', icon: Activity },
                  { id: 'OBSERVATION', label: 'Observation', icon: Eye },
                  { id: 'NON_URGENT', label: 'Non Urgents', icon: Clock },
                  { id: 'MANAGEMENT', label: 'Prise en charge', icon: Stethoscope },
                  { id: 'DISCHARGE', label: 'Orientation / Sortie', icon: Navigation },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMenu(tab.id as EmergencySubMenu)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-[16px] font-bold text-xs uppercase tracking-tight transition-all shrink-0 ${activeMenu === tab.id ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    <tab.icon size={14} className={activeMenu === tab.id ? 'text-rose-600' : 'text-slate-400'} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                 <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="Rechercher un patient..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all w-64 shadow-sm"
                    />
                 </div>
                 <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-rose-600 transition-all shadow-sm">
                    <Bell size={20} />
                 </button>
              </div>
           </header>

           <AnimatePresence mode="wait">
              {/* VUES PAR MENU */}
              {activeMenu !== 'MANAGEMENT' && (
                <motion.div 
                  key={activeMenu}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredPatients.map(p => (
                    <div 
                      key={p.id} 
                      className={`bg-white rounded-[40px] border border-slate-200 p-8 hover:shadow-2xl hover:border-rose-500 transition-all group relative overflow-hidden`}
                    >
                      {p.triage && (
                        <div className={`absolute top-0 left-0 right-0 h-2 ${getTriageColor(p.triage.level)}`} />
                      )}
                      
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-2xl ${p.triage ? getTriageBgSoft(p.triage.level) : 'bg-slate-100'} ${p.triage ? getTriageTextColor(p.triage.level) : 'text-slate-400'} group-hover:scale-110 transition-transform`}>
                            <User size={20} />
                          </div>
                          <div className="truncate">
                            <h3 className="text-xl font-black truncate">{p.lastName} {p.firstName}</h3>
                            <span className="text-[10px] font-black text-slate-400 font-mono tracking-widest">{p.id}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-[9px] font-black text-slate-400 uppercase">Arrivée</span>
                           <span className="text-xs font-black font-mono">{new Date(p.arrivalTimestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-3xl p-5 mb-6 border border-slate-100/50">
                        {p.triage ? (
                          <div className="space-y-4">
                             <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Priorité</span>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full text-white ${getTriageColor(p.triage.level)} shadow-lg shadow-${getTriageColor(p.triage.level).split('-')[1]}-500/20`}>
                                   {p.triage.level}
                                </span>
                             </div>
                             <div className="grid grid-cols-2 gap-3">
                                <div className="text-center p-2 bg-white rounded-xl border border-slate-100">
                                   <p className="text-[8px] font-bold text-slate-400 uppercase">Pouls</p>
                                   <p className="text-sm font-black text-slate-900">{p.triage.vitals.heartRate} <small className="text-[10px] opacity-30">bpm</small></p>
                                </div>
                                <div className="text-center p-2 bg-white rounded-xl border border-slate-100">
                                   <p className="text-[8px] font-bold text-slate-400 uppercase">SpO2</p>
                                   <p className={`text-sm font-black ${p.triage.vitals.spo2 < 90 ? 'text-rose-600' : 'text-slate-900'}`}>{p.triage.vitals.spo2} <small className="text-[10px] opacity-30">%</small></p>
                                </div>
                             </div>
                          </div>
                        ) : (
                          <div className="py-4 text-center">
                             <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                                <AlertTriangle size={12} /> Triage requis
                             </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 mt-auto pt-4 border-t border-slate-50">
                         {activeMenu === 'TRIAGE' && !p.triage && (
                           <button 
                             onClick={() => { setSelectedPatient(p); setShowTriageForm(true); }}
                             className="flex-1 bg-rose-600 text-white p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-rose-600/20"
                           >
                             Lancer le Triage <Zap size={14} />
                           </button>
                         )}
                         {activeMenu === 'ER_ROOM' && (
                           <>
                             <button 
                               onClick={() => { setSelectedPatient(p); setActiveMenu('MANAGEMENT'); setManagementForm({ diagnosis: p.management?.diagnosis || '', acts: p.management?.acts || [], treatments: p.management?.treatments || [] }); }}
                               className="flex-1 bg-slate-900 text-white p-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                             >
                               Soin <Stethoscope size={14} />
                             </button>
                             <button 
                               className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                               title="Monitoring rapide"
                             >
                               <Activity size={18} />
                             </button>
                           </>
                         )}
                         {activeMenu === 'OBSERVATION' && (
                            <button 
                              onClick={() => { setSelectedPatient(p); }} // Open monitoring view or management
                              className="flex-1 bg-white border border-slate-200 text-slate-900 p-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-rose-600 transition-all flex items-center justify-center gap-2"
                            >
                              Réévaluer <History size={14} />
                            </button>
                         )}
                      </div>
                    </div>
                  ))}

                  {filteredPatients.length === 0 && (
                     <div className="col-span-full py-40 text-center bg-slate-100 rounded-[60px] border-4 border-dashed border-slate-200 opacity-50">
                        <Activity size={64} className="mx-auto text-slate-400 mb-6" />
                        <h3 className="text-xl font-black text-slate-900 uppercase">File Vide</h3>
                        <p className="text-slate-500 font-medium">Aucun patient dans cette section pour le moment.</p>
                     </div>
                  )}
                </motion.div>
              )}

              {/* VUE PRISE EN CHARGE MÉDICALE */}
              {activeMenu === 'MANAGEMENT' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full"
                >
                  {!selectedPatient ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                       <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-8">
                          <Stethoscope size={48} />
                       </div>
                       <h3 className="text-2xl font-black mb-4 italic">Sélectionnez un patient pour la prise en charge</h3>
                       <p className="text-slate-500 max-w-md mx-auto mb-10">Choisissez un patient de la salle d'urgence ou d'observation pour administrer des soins et protocoles rapides.</p>
                       <button onClick={() => setActiveMenu('ER_ROOM')} className="px-10 py-4 bg-slate-900 text-white rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all flex items-center gap-3">
                          Aller à la salle d'urgence <ArrowRightLeft size={16} />
                       </button>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full">
                       <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                          <div className="flex items-center gap-6">
                             <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner">
                                <img src={`https://picsum.photos/64/64?u=${selectedPatient.id}`} alt="" />
                             </div>
                             <div>
                                <h2 className="text-2xl font-black italic">{selectedPatient.lastName} {selectedPatient.firstName}</h2>
                                <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">{selectedPatient.age} ans • {selectedPatient.gender} • {selectedPatient.id}</p>
                             </div>
                          </div>
                          <div className={`px-8 py-3 rounded-2xl ${getTriageColor(selectedPatient.triage?.level)} text-white shadow-xl shadow-${getTriageColor(selectedPatient.triage?.level).split('-')[1]}-500/20`}>
                             <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black uppercase opacity-60">Probabilité d'Urgence</span>
                                <span className="text-lg font-black">{selectedPatient.triage?.level}</span>
                             </div>
                          </div>
                       </div>

                       <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
                          {/* Left: Decision Area */}
                          <div className="col-span-8 p-10 space-y-10 border-r border-slate-100 overflow-y-auto custom-scrollbar">
                             <section>
                                <h4 className="text-xs font-black text-rose-600 uppercase tracking-[0.25em] mb-6 flex items-center gap-2 border-b border-rose-50 pb-2">
                                   <AlertCircle size={16} /> Protocoles Rapides (Prélèvement auto)
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                   {protocols.map(p => (
                                     <button 
                                       key={p.id} 
                                       onClick={() => applyProtocol(p.id)}
                                       className="p-5 bg-white border-2 border-slate-100 rounded-[24px] text-left hover:border-rose-500 hover:bg-rose-50/10 transition-all group"
                                     >
                                        <p className="text-[10px] font-black text-slate-400 mb-1">{p.id}</p>
                                        <p className="text-sm font-black text-slate-900 leading-tight italic group-hover:text-rose-600">{p.name}</p>
                                     </button>
                                   ))}
                                </div>
                             </section>

                             <section>
                                <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.25em] mb-4">Diagnostic Rapide</h4>
                                <textarea 
                                  value={managementForm.diagnosis}
                                  onChange={e => setManagementForm({...managementForm, diagnosis: e.target.value})}
                                  placeholder="Entrez le diagnostic de travail..."
                                  className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[32px] focus:border-blue-500 outline-none font-bold text-lg italic transition-all"
                                />
                             </section>

                             <div className="grid grid-cols-2 gap-8">
                                <section>
                                   <div className="flex justify-between items-center mb-4">
                                      <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.25em]">Gestes Réalisés</h4>
                                      <div className="flex gap-2">
                                         {['Pose VVP', 'O2', 'Sondage', 'Nettoyage'].map(g => (
                                           <button key={g} onClick={() => setManagementForm({...managementForm, acts: [...new Set([...managementForm.acts, g])]})} className="p-1 px-2 bg-slate-100 rounded-lg text-[8px] font-black hover:bg-indigo-600 hover:text-white transition-colors">{g}</button>
                                         ))}
                                      </div>
                                   </div>
                                   <div className="p-6 bg-slate-50 border border-slate-100 rounded-[32px] min-h-[150px]">
                                      <div className="flex flex-wrap gap-2">
                                         {managementForm.acts.map((act, i) => (
                                           <span key={i} className="px-4 py-2 bg-white border border-indigo-100 rounded-xl text-xs font-bold text-indigo-700 flex items-center gap-2 shadow-sm animate-in zoom-in-95">
                                              {act} <X size={14} className="cursor-pointer hover:text-rose-500" onClick={() => setManagementForm({...managementForm, acts: managementForm.acts.filter((_, idx) => idx !== i)})} />
                                           </span>
                                         ))}
                                      </div>
                                   </div>
                                </section>
                                <section>
                                   <div className="flex justify-between items-center mb-4">
                                      <h4 className="text-xs font-black text-emerald-600 uppercase tracking-[0.25em]">Traitements Admin.</h4>
                                      <div className="flex gap-2">
                                         {['Paracétamol', 'SSI', 'Ceftriaxone', 'Salbutamol'].map(t => (
                                           <button key={t} onClick={() => setManagementForm({...managementForm, treatments: [...new Set([...managementForm.treatments, t])]})} className="p-1 px-2 bg-slate-100 rounded-lg text-[8px] font-black hover:bg-emerald-600 hover:text-white transition-colors">{t}</button>
                                         ))}
                                      </div>
                                   </div>
                                   <div className="p-6 bg-slate-50 border border-slate-100 rounded-[32px] min-h-[150px]">
                                      <div className="flex flex-wrap gap-2">
                                         {managementForm.treatments.map((tr, i) => (
                                           <span key={i} className="px-4 py-2 bg-white border border-emerald-100 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-2 shadow-sm animate-in zoom-in-95">
                                              {tr} <X size={14} className="cursor-pointer hover:text-rose-500" onClick={() => setManagementForm({...managementForm, treatments: managementForm.treatments.filter((_, idx) => idx !== i)})} />
                                           </span>
                                         ))}
                                      </div>
                                   </div>
                                </section>
                             </div>
                          </div>

                          {/* Right: Monitoring and Summary */}
                          <div className="col-span-4 bg-slate-50/50 p-8 space-y-8 overflow-y-auto custom-scrollbar">
                             <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b pb-2">Dernier Monitoring</h5>
                                {selectedPatient.monitoring.length > 0 ? (
                                   <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                         <div className="text-center p-3 bg-slate-50 rounded-2xl">
                                            <p className="text-[8px] font-black text-slate-400 mb-1">BP</p>
                                            <p className="text-sm font-black">{selectedPatient.monitoring[0].vitals.bpSys}/{selectedPatient.monitoring[0].vitals.bpDia}</p>
                                         </div>
                                         <div className="text-center p-3 bg-slate-50 rounded-2xl">
                                            <p className="text-[8px] font-black text-slate-400 mb-1">SPO2</p>
                                            <p className="text-sm font-black text-emerald-600">{selectedPatient.monitoring[0].vitals.spo2}%</p>
                                         </div>
                                      </div>
                                      <div className="text-center p-4 bg-yellow-50 border border-yellow-100 rounded-2xl italic text-[11px] font-medium text-yellow-800">
                                         "{selectedPatient.monitoring[0].note}"
                                      </div>
                                   </div>
                                ) : (
                                   <div className="text-center py-6">
                                      <p className="text-xs text-slate-400 italic">Aucun monitoring enregistré</p>
                                   </div>
                                )}
                             </div>

                             <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Clock size={100} /></div>
                                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 relative z-10">Orientation Immédiate</h5>
                                
                                <div className="grid grid-cols-1 gap-3 relative z-10">
                                   {[
                                     { id: 'HOSPITALIZATION', label: 'Hospitalisation Directe', icon: BedDouble, desc: 'Admission unité de soins' },
                                     { id: 'CONSULTATION', label: 'Consultation Externe', icon: History, desc: 'Suivi post-stabilisation' },
                                     { id: 'DISCHARGE', label: 'Sortie Directe', icon: Home, desc: 'Traitement à domicile' },
                                     { id: 'EXTERNAL_TRANSFER', label: 'Transfert Externe', icon: ArrowRightLeft, desc: 'Vers structure spécialisée' }
                                   ].map(opt => (
                                     <button 
                                       key={opt.id}
                                       onClick={() => { setOrientationForm({...orientationForm, type: opt.id as any}); handleOrientationSubmit(); }}
                                       className="w-full flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left"
                                     >
                                        <div className="p-3 bg-white/10 rounded-xl text-white"><opt.icon size={20} /></div>
                                        <div>
                                           <p className="text-xs font-black italic">{opt.label}</p>
                                           <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-tighter">{opt.desc}</p>
                                        </div>
                                     </button>
                                   ))}
                                </div>
                             </div>

                             <div className="pt-6">
                                <button 
                                  onClick={handleManagementSubmit}
                                  className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/30 active:scale-95"
                                >
                                   Valider & Sauvegarder <Save size={18} />
                                </button>
                                <button 
                                  onClick={() => setActiveMenu('ER_ROOM')}
                                  className="w-full mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-600 transition-colors"
                                >
                                   Annuler l'Édition
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}
                </motion.div>
              )}
           </AnimatePresence>
        </main>
      </div>

      {/* MODAL TRIAGE */}
      <AnimatePresence>
         {showTriageForm && selectedPatient && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowTriageForm(false)}
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-5xl rounded-[50px] shadow-2xl relative overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
              >
                 {/* Left Panel: Patient Info Summary */}
                 <div className="md:w-1/3 bg-slate-900 p-12 text-white flex flex-col justify-between">
                    <div>
                       <div className="w-16 h-16 bg-rose-600 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl shadow-rose-600/20">
                          <AlertCircle size={32} />
                       </div>
                       <h2 className="text-3xl font-black italic mb-2">Triage Infirmier</h2>
                       <p className="text-slate-400 text-sm font-medium mb-12">Évaluez l'urgence vitale et orientez le patient.</p>

                       <div className="space-y-6">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400"><User size={20} /></div>
                             <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Identité</p>
                                <p className="text-lg font-black">{selectedPatient.lastName} {selectedPatient.firstName}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400"><Clock size={20} /></div>
                             <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Temps d'attente</p>
                                <p className="text-lg font-black text-rose-500">45 Minutes</p>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className={`p-8 rounded-[32px] ${getTriageColor(triageLevel)} transition-colors text-white text-center shadow-2xl`}>
                       <span className="text-[10px] font-black uppercase opacity-60">Classification Suggérée</span>
                       <h3 className="text-3xl font-black mt-2 tracking-tighter">{triageLevel}</h3>
                    </div>
                 </div>

                 {/* Right Panel: Triage Form */}
                 <div className="md:w-2/3 p-12 overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-center mb-10">
                       <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Données de Triage</h3>
                       <button onClick={() => setShowTriageForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-300"><X size={24} /></button>
                    </div>

                    <div className="space-y-10">
                       <div className="space-y-4">
                          <label className="text-sm font-black text-slate-600 block flex items-center gap-2">
                             Motif de venu <span className="text-[10px] font-black text-rose-500 uppercase">(Requis)</span>
                          </label>
                          <textarea 
                            value={triageForm.motif}
                            onChange={e => setTriageForm({...triageForm, motif: e.target.value})}
                            placeholder="Description rapide des plaintes..."
                            className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[32px] focus:border-rose-500 outline-none font-bold text-lg italic transition-all"
                          />
                       </div>

                       <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><Thermometer size={12} className="text-rose-500" /> Température (°C)</label>
                             <input type="number" step="0.1" value={triageForm.temp} onChange={e => setTriageForm({...triageForm, temp: parseFloat(e.target.value)})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-xl text-center focus:border-rose-500 outline-none transition-all" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><Heart size={12} className="text-rose-500" /> Pouls (BPM)</label>
                             <input type="number" value={triageForm.heartRate} onChange={e => setTriageForm({...triageForm, heartRate: parseInt(e.target.value)})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-xl text-center focus:border-rose-500 outline-none transition-all" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><Droplets size={12} className="text-blue-500" /> Saturation (%)</label>
                             <input type="number" value={triageForm.spo2} onChange={e => setTriageForm({...triageForm, spo2: parseInt(e.target.value)})} className={`w-full p-4 bg-slate-50 border-2 ${triageForm.spo2 < 90 ? 'border-rose-500 text-rose-600' : 'border-slate-100'} rounded-2xl font-black text-xl text-center focus:border-rose-500 outline-none transition-all`} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><Wind size={12} className="text-slate-500" /> Fréq. Resp.</label>
                             <input type="number" value={triageForm.respRate} onChange={e => setTriageForm({...triageForm, respRate: parseInt(e.target.value)})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-xl text-center focus:border-rose-500 outline-none transition-all" />
                          </div>
                          <div className="space-y-2 col-span-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2">Tension Artérielle (mmHg)</label>
                             <div className="flex items-center gap-3">
                                <input type="number" value={triageForm.bpSys} onChange={e => setTriageForm({...triageForm, bpSys: parseInt(e.target.value)})} placeholder="SYS" className="flex-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-xl text-center focus:border-rose-500 outline-none" />
                                <span className="text-2xl font-black text-slate-300">/</span>
                                <input type="number" value={triageForm.bpDia} onChange={e => setTriageForm({...triageForm, bpDia: parseInt(e.target.value)})} placeholder="DIA" className="flex-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-xl text-center focus:border-rose-500 outline-none" />
                             </div>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-4">
                             <label className="text-sm font-black text-slate-600 block">État de conscience (AVPU)</label>
                             <div className="grid grid-cols-2 gap-3">
                                {[
                                  { id: 'ALERT', label: 'Alerte' },
                                  { id: 'VOICE', label: 'Vocal' },
                                  { id: 'PAIN', label: 'Douleur' },
                                  { id: 'UNCONSCIOUS', label: 'Inconscient' }
                                ].map(c => (
                                  <button
                                    key={c.id}
                                    onClick={() => setTriageForm({...triageForm, consciousness: c.id as any})}
                                    className={`p-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${triageForm.consciousness === c.id ? 'border-rose-600 bg-rose-600 text-white shadow-lg' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-rose-300'}`}
                                  >
                                    {c.label}
                                  </button>
                                ))}
                             </div>
                          </div>
                          <div className="space-y-4">
                             <div className="flex justify-between items-center">
                                <label className="text-sm font-black text-slate-600">Échelle de Douleur</label>
                                <span className="text-2xl font-black text-rose-600">{triageForm.painScale}/10</span>
                             </div>
                             <input 
                               type="range" 
                               min="0" max="10" step="1" 
                               value={triageForm.painScale}
                               onChange={e => setTriageForm({...triageForm, painScale: parseInt(e.target.value)})}
                               className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-rose-600" 
                             />
                             <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">
                                <span>Pas de douleur</span>
                                <span>Douleur maximale</span>
                             </div>
                          </div>
                       </div>

                       <div className="pt-8 flex gap-4">
                          <button 
                            disabled={!triageForm.motif}
                            onClick={handleTriageSubmit}
                            className={`flex-1 py-6 rounded-[32px] text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl ${triageForm.motif ? 'bg-slate-900 text-white hover:bg-rose-600 shadow-slate-900/20' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                          >
                             Valider le Triage & Assigner <ChevronRight size={18} />
                          </button>
                       </div>
                    </div>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default Emergency;
