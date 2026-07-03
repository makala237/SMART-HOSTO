
import React, { useState } from 'react';
import { BedDouble, Calendar, Activity, Clock, Bell, Plus, ArrowLeft, Pill, Home, ClipboardList } from 'lucide-react';
import CarePlanner from './tools/CarePlanner';
import DigitalPrescription from './tools/DigitalPrescription';
import { Patient, Prescription, User, Medication, PaymentRequest } from '../types';

import { DEFAULT_TOOLS } from './settings/ToolsManagement';

interface InpatientProps {
  user?: User;
  paymentRequests?: PaymentRequest[];
  setPaymentRequests?: React.Dispatch<React.SetStateAction<PaymentRequest[]>>;
  activeTab: 'beds' | 'planner';
  setActiveTab: (tab: 'beds' | 'planner') => void;
  onBackToDashboard: () => void;
}

const Inpatient: React.FC<InpatientProps> = ({ 
  user, 
  paymentRequests = [], 
  setPaymentRequests,
  activeTab,
  setActiveTab,
  onBackToDashboard
}) => {
  const [selectedPatientForPlanner, setSelectedPatientForPlanner] = useState<Patient | null>(null);
  const [showDigitalPrescription, setShowDigitalPrescription] = useState(false);

  const [toolsConfig, setToolsConfig] = useState<any[]>(() => {
    const saved = localStorage.getItem('hospital_tools');
    if (saved) {
      const parsed = JSON.parse(saved);
      const merged = [...parsed];
      DEFAULT_TOOLS.forEach(dt => {
        if (!merged.find(t => t.code === dt.code)) {
          merged.push(dt);
        }
      });
      return merged;
    }
    return DEFAULT_TOOLS;
  });
  
  const carePlannerConfig = toolsConfig.find(t => t.code === 'PLAN_SOINS');
  const isCarePlannerEnabled = carePlannerConfig?.status === 'ACTIVE' && 
    (user && (carePlannerConfig.authorizedRoles.includes(user.role) || user.roles?.includes('role_admin')));

  const digitalPrescriptionConfig = toolsConfig.find(t => t.code === 'ORD_NUM');
  const isDigitalPrescriptionEnabled = digitalPrescriptionConfig?.status === 'ACTIVE' && 
    (user && (digitalPrescriptionConfig.authorizedRoles.includes(user.role) || user.roles?.includes('role_admin')));

  const [medications, setMedications] = useState<Medication[]>(() => {
    const saved = localStorage.getItem('hospital_meds');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Paracétamol', dosage: '500mg', price: 500, stock: 100, quantityPerBox: 16 },
      { id: '2', name: 'Amoxicilline', dosage: '1g', price: 2500, stock: 50, quantityPerBox: 14 }
    ];
  });

  // Mock data for Care Planner
  const mockPatient: Patient = {
    id: 'P-123',
    firstName: 'Moussa',
    lastName: 'SIDIBÉ',
    birthDate: '1980-05-15',
    gender: 'M',
    phone: '00000000',
    residence: 'Bamako',
    emergencyContact: 'Awa',
    emergencyPhone: '11111111',
    maritalStatus: 'MARIE'
  };

  const mockPrescriptions: Prescription[] = [
    {
      id: 'RX-001',
      patientId: 'P-123',
      doctorId: 'D-001',
      medicationId: '1',
      medicationName: 'Paracétamol',
      route: 'Per os',
      dosageScheme: '1000 mg',
      frequency: 3,
      duration: 3,
      calculationType: 'FIXED',
      dosePerIntake: 1000,
      dosePer24h: 3000,
      totalDose: 9000,
      unitsPerIntake: 2,
      totalUnits: 18,
      totalBoxes: 1,
      createdAt: new Date().toISOString(),
      status: 'VALIDATED',
      monitoringParams: ['Température', 'Douleur']
    },
    {
      id: 'RX-002',
      patientId: 'P-123',
      doctorId: 'D-001',
      medicationId: '2',
      medicationName: 'Amoxicilline',
      route: 'IV',
      dosageScheme: '1 g',
      frequency: 2,
      duration: 5,
      calculationType: 'FIXED',
      dosePerIntake: 1000,
      dosePer24h: 2000,
      totalDose: 10000,
      unitsPerIntake: 1,
      totalUnits: 10,
      totalBoxes: 1,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Started yesterday
      status: 'VALIDATED',
      monitoringParams: ['Température', 'Point d\'injection']
    }
  ];

  const [services] = useState<any[]>(() => {
    const saved = localStorage.getItem('hospital_services');
    return saved ? JSON.parse(saved) : [];
  });

  const hospitalService = services.find(s => s.id === 'SRV-HOSPITALISATION');
  const configuredBedsCount = hospitalService?.specificSettings?.hospitalBeds || 12;

  const beds = Array.from({ length: configuredBedsCount }, (_, i) => ({
    id: `B-${i+1}`,
    room: Math.floor(i / 2) + 1,
    occupied: i % 3 === 0,
    patient: i % 3 === 0 ? "M. SIDIBÉ Moussa" : null,
    type: i < 4 ? 'ICU' : 'Standard'
  }));

  return (
    <div className="p-8">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm mb-10 gap-6">
         <div className="flex items-center gap-6">
           <button 
             onClick={onBackToDashboard}
             className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg group text-center shrink-0"
             title="Retour au Dashboard"
           >
             <Home size={24} className="group-hover:scale-110 transition-transform" />
           </button>
           <div>
             <div className="flex items-center gap-4">
               {activeTab === 'planner' && (
                 <button 
                   onClick={() => setActiveTab('beds')}
                   className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors shrink-0"
                   title="Retour aux lits"
                 >
                   <ArrowLeft size={18} />
                 </button>
               )}
               <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 italic animate-in fade-in">
                 <BedDouble size={32} className="text-blue-600 shrink-0" />
                 {activeTab === 'beds' 
                   ? 'Hospitalisation & Lits' 
                   : (selectedPatientForPlanner 
                       ? `Plan de soins - ${selectedPatientForPlanner.lastName} ${selectedPatientForPlanner.firstName}` 
                       : 'Plan de Soins'
                     )
                 }
               </h1>
             </div>
             <p className="text-sm font-medium text-slate-500 italic mt-1">Hospitalisation • Plan de soins, surveillance et gestion des capacités.</p>
           </div>
         </div>
         
         <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
           {isDigitalPrescriptionEnabled && (
             <button 
               onClick={() => setShowDigitalPrescription(true)}
               className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-6 py-3 rounded-2xl font-semibold hover:bg-indigo-100 transition-colors text-sm"
             >
               <Pill size={18} />
               Prescrire un traitement
             </button>
           )}
           <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-semibold shadow-sm hover:bg-slate-50 text-sm">
             <Bell size={18} className="text-red-500" />
             Alertes (3)
           </button>
           <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 text-sm">
             <Plus size={18} />
             Nouvelle Admission
           </button>
         </div>
      </header>

      {activeTab === 'beds' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Bed Map */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
                <BedDouble size={20} className="text-blue-500" />
                Carte des Lits
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {beds.map(bed => (
                  <div 
                    key={bed.id}
                    className={`relative p-5 rounded-2xl border-2 transition-all group ${
                      bed.occupied 
                      ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10 ' + (isCarePlannerEnabled ? 'cursor-pointer' : '') 
                      : 'border-dashed border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                    onClick={() => {
                      if (bed.occupied && isCarePlannerEnabled) {
                        setSelectedPatientForPlanner(mockPatient);
                        setActiveTab('planner');
                      }
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                        bed.type === 'ICU' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {bed.id}
                      </span>
                      <BedDouble size={20} className={bed.occupied ? 'text-blue-600' : 'text-slate-200'} />
                    </div>
                    
                    {bed.occupied ? (
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 mb-1 truncate">{bed.patient}</h4>
                        <p className="text-[10px] font-bold text-blue-600 uppercase">Stable</p>
                        <div className="mt-4 pt-3 border-t border-blue-100 flex items-center justify-between text-[10px] text-slate-500">
                          <span className="flex items-center gap-1"><Activity size={10} /> 12h:00</span>
                          {isCarePlannerEnabled && (
                            <span className="bg-white border px-2 py-0.5 rounded text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">Plan de soins</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-xs font-medium text-slate-400">Libre</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Nursing Tasks */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Clock size={18} className="text-indigo-500" />
                  Tâches Infirmières
                </h3>
                <span className="text-xs font-bold text-slate-400">10:45</span>
              </div>
              <div className="p-6 divide-y divide-slate-50">
                {[
                  { time: '11:00', task: 'Injectable Ceftriaxone', patient: 'Chambre 2 - Lit A', urgent: true },
                  { time: '11:30', task: 'Paramètres vitaux', patient: 'Chambre 4 - Lit B', urgent: false },
                  { time: '12:00', task: 'Pansement post-op', patient: 'Chambre 1 - Lit ICU', urgent: false },
                ].map((t, i) => (
                  <div key={i} className="py-4 first:pt-0 last:pb-0 group">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className={`text-xs font-black ${t.urgent ? 'text-red-500' : 'text-slate-400'}`}>{t.time}</span>
                        <div className="w-0.5 h-full bg-slate-100 my-1 group-last:hidden"></div>
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold text-sm ${t.urgent ? 'text-red-700' : 'text-slate-900'}`}>{t.task}</p>
                        <p className="text-xs text-slate-500">{t.patient}</p>
                        <div className="flex gap-2 mt-3">
                          <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold">Valider</button>
                          <button className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">Reporter</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <Activity size={18} />
                Vigilance Clinique
              </h4>
              <p className="text-indigo-100 text-sm mb-4">Le patient Lit ICU montre une tachycardie légère (105 bpm).</p>
              <button className="w-full bg-white text-indigo-700 py-2 rounded-xl text-xs font-black">Voir Paramètres</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {selectedPatientForPlanner ? (
            <CarePlanner 
              patient={selectedPatientForPlanner}
              prescriptions={mockPrescriptions}
              onUpdateTask={(taskId, status) => {
                console.log(`Task ${taskId} updated to ${status}`);
              }}
            />
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center">
              <ClipboardList size={48} className="text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-bold text-lg">Aucun patient sélectionné pour l'instant</p>
              <p className="text-slate-400 text-sm mt-1">Veuillez sélectionner un patient hospitalisé depuis la carte des lits pour configurer son plan de soins.</p>
              <button 
                onClick={() => setActiveTab('beds')}
                className="mt-6 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition"
              >
                Retourner à la carte des lits
              </button>
            </div>
          )}
        </div>
      )}

      {showDigitalPrescription && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <DigitalPrescription 
              onCancel={() => setShowDigitalPrescription(false)}
              onValidate={(ordonnance) => {
                console.log('Ordonnance validée:', ordonnance);
                if (ordonnance.pharmacyStatus === 'PENDING') {
                  const savedPrescriptions = localStorage.getItem('hospital_prescriptions');
                  const prescriptions = savedPrescriptions ? JSON.parse(savedPrescriptions) : [];
                  prescriptions.push(ordonnance);
                  localStorage.setItem('hospital_prescriptions', JSON.stringify(prescriptions));
                }
                setShowDigitalPrescription(false);
              }}
              patient={selectedPatientForPlanner || mockPatient}
              prescripteur={user || { id: 'u1', name: 'Dr. Test', role: 'medecin', email: 'test@test.com' }}
              medications={medications}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Inpatient;
