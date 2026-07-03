
import React, { useState, useEffect } from 'react';
import { Baby, Activity, Heart, Clock, Clipboard, Save, TrendingUp, BedDouble, ArrowLeft, Plus, Pill } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { User, Tool, Patient, Medication, PaymentRequest } from '../types';
import { SmartPartogram } from './tools/SmartPartogram';
import { SmartCPN } from './tools/SmartCPN';
import DigitalPrescription from './tools/DigitalPrescription';
import { DEFAULT_TOOLS } from './settings/ToolsManagement';

interface MaternityProps {
  user: User;
  activeTab: 'cpn' | 'labor' | 'delivery' | 'postpartum';
  setActiveTab: (tab: 'cpn' | 'labor' | 'delivery' | 'postpartum') => void;
  paymentRequests?: PaymentRequest[];
  setPaymentRequests?: React.Dispatch<React.SetStateAction<PaymentRequest[]>>;
}

const Maternity: React.FC<MaternityProps> = ({ user, activeTab, setActiveTab, paymentRequests = [], setPaymentRequests }) => {
  const [laborViewMode, setLaborViewMode] = useState<'beds' | 'partogram'>('beds');
  const [laborDisplayMode, setLaborDisplayMode] = useState<'beds' | 'table'>('beds');
  const [selectedPatient, setSelectedPatient] = useState<{name: string, dossierId: string} | null>(null);
  const [isSmartPartogramEnabled, setIsSmartPartogramEnabled] = useState(false);
  const [isSmartCPNEnabled, setIsSmartCPNEnabled] = useState(false);
  const [isDigitalPrescriptionEnabled, setIsDigitalPrescriptionEnabled] = useState(false);
  const [showDigitalPrescription, setShowDigitalPrescription] = useState(false);

  const [medications, setMedications] = useState<Medication[]>(() => {
    const saved = localStorage.getItem('hospital_meds');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Paracétamol', dosage: '500mg', price: 500, stock: 100, quantityPerBox: 16 },
      { id: '2', name: 'Amoxicilline', dosage: '1g', price: 2500, stock: 50, quantityPerBox: 14 }
    ];
  });

  // Mock patient for Digital Prescription
  const mockPatient: Patient = {
    id: 'P-MAT-123',
    firstName: selectedPatient?.name.split(' ')[1] || 'Fatoumata',
    lastName: selectedPatient?.name.split(' ')[0] || 'TRAORÉ',
    birthDate: '1995-05-15',
    gender: 'F',
    phone: '00000000',
    residence: 'Bamako',
    emergencyContact: 'Moussa',
    emergencyPhone: '11111111',
    maritalStatus: 'MARIE'
  };

  useEffect(() => {
    if (activeTab !== 'labor') {
      setLaborViewMode('beds');
    }
  }, [activeTab]);

  useEffect(() => {
    const savedTools = localStorage.getItem('hospital_tools');
    let tools: Tool[] = DEFAULT_TOOLS;
    if (savedTools) {
      const parsed = JSON.parse(savedTools);
      const merged = [...parsed];
      DEFAULT_TOOLS.forEach(dt => {
        if (!merged.find(t => t.code === dt.code)) {
          merged.push(dt);
        }
      });
      tools = merged;
    }
    
    const partogramTool = tools.find(t => t.code === 'PARTOGRAMME');
    if (partogramTool && partogramTool.status === 'ACTIVE' && partogramTool.authorizedRoles.includes(user.role)) {
      setIsSmartPartogramEnabled(true);
    }
    const cpnTool = tools.find(t => t.code === 'CPN_OMS');
    if (cpnTool && cpnTool.status === 'ACTIVE' && cpnTool.authorizedRoles.includes(user.role)) {
      setIsSmartCPNEnabled(true);
    }
    const digitalPrescriptionConfig = tools.find(t => t.code === 'ORD_NUM');
    if (digitalPrescriptionConfig && digitalPrescriptionConfig.status === 'ACTIVE' && digitalPrescriptionConfig.authorizedRoles.includes(user.role)) {
      setIsDigitalPrescriptionEnabled(true);
    }
  }, [user.role]);
  
  // Mock partogram data
  const partogramData = [
    { time: '08:00', dilation: 3, alert: 3, action: 5 },
    { time: '10:00', dilation: 4, alert: 5, action: 7 },
    { time: '12:00', dilation: 6, alert: 7, action: 9 },
    { time: '14:00', dilation: 8, alert: 9, action: 10 },
  ];

  const [services] = useState<any[]>(() => {
    const saved = localStorage.getItem('hospital_services');
    return saved ? JSON.parse(saved) : [];
  });

  const hospitalService = services.find(s => s.id === 'SRV-HOSPITALISATION');
  const configuredMaternityBedsCount = hospitalService?.specificSettings?.maternityBeds || 8;

  const laborBeds = Array.from({ length: configuredMaternityBedsCount }, (_, i) => ({
    id: `LIT-${i+1}`,
    occupied: i % 3 === 0,
    patient: i % 3 === 0 ? (i === 0 ? "Mme. TRAORÉ Fatoumata" : "Mme. DIALLO Aminata") : null,
    dossierId: i % 3 === 0 ? `MAT-2024-${88 + i}` : null,
    phase: i % 3 === 0 ? (i === 0 ? 'Phase Active' : 'Phase Latente') : null,
    dilation: i % 3 === 0 ? (i === 0 ? '6 cm' : '3 cm') : null,
  }));

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          {activeTab === 'labor' && laborViewMode === 'partogram' && (
            <button 
              onClick={() => setLaborViewMode('beds')}
              className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center">
            <Baby size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {activeTab === 'cpn' && 'Consultation Prénatale'}
              {activeTab === 'labor' && 'Salle de Travail'}
              {activeTab === 'delivery' && 'Salle d\'Accouchement'}
              {activeTab === 'postpartum' && 'Post-Partum'}
            </h1>
            <p className="text-slate-500">
              {activeTab === 'labor' && laborViewMode === 'partogram' && selectedPatient 
                ? `${selectedPatient.name} • Dossier ${selectedPatient.dossierId}`
                : 'Gestion des consultations, salle de travail, accouchement et post-partum'}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          {isDigitalPrescriptionEnabled && (
            <button 
              onClick={() => setShowDigitalPrescription(true)}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-6 py-3 rounded-2xl font-semibold hover:bg-indigo-100 transition-colors"
            >
              <Pill size={20} />
              Prescrire un traitement
            </button>
          )}
        </div>
      </div>

      {activeTab === 'cpn' && (
        isSmartCPNEnabled ? (
          <SmartCPN user={user} />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-8">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
              <Clipboard className="text-pink-500" />
              Consultation Prénatale (CPN)
            </h2>
            <div className="text-center py-12 text-slate-500">
              <p>L'outil CPN intelligent n'est pas activé ou vous n'avez pas les droits d'accès.</p>
              <p className="text-sm mt-2">Veuillez contacter l'administrateur pour activer cet outil dans les paramètres.</p>
            </div>
          </div>
        )
      )}

      {activeTab === 'labor' && (
        laborViewMode === 'beds' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Bed Map */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <BedDouble size={20} className="text-pink-500" />
                    Surveillance Salle de Travail
                  </h2>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button 
                      onClick={() => setLaborDisplayMode('beds')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${laborDisplayMode === 'beds' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Vue Lits
                    </button>
                    <button 
                      onClick={() => setLaborDisplayMode('table')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${laborDisplayMode === 'table' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Vue Tableau
                    </button>
                  </div>
                </div>
                
                {laborDisplayMode === 'beds' ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {laborBeds.map(bed => (
                      <div 
                        key={bed.id}
                        className={`relative p-5 rounded-2xl border-2 transition-all group ${
                          bed.occupied 
                          ? 'border-pink-500 bg-pink-50 shadow-md shadow-pink-500/10 cursor-pointer' 
                          : 'border-dashed border-slate-200 hover:border-pink-300 hover:bg-slate-50'
                        }`}
                        onClick={() => {
                          if (bed.occupied) {
                            setSelectedPatient({ name: bed.patient!, dossierId: bed.dossierId! });
                            setLaborViewMode('partogram');
                          }
                        }}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {bed.id}
                          </span>
                          <BedDouble size={20} className={bed.occupied ? 'text-pink-600' : 'text-slate-200'} />
                        </div>
                        
                        {bed.occupied ? (
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 mb-1 truncate">{bed.patient}</h4>
                            <p className="text-[10px] font-bold text-pink-600 uppercase">{bed.phase}</p>
                            <div className="mt-4 pt-3 border-t border-pink-100 flex items-center justify-between text-[10px] text-slate-500">
                              <span className="flex items-center gap-1"><Activity size={10} /> {bed.dilation}</span>
                              <span className="bg-white border px-2 py-0.5 rounded text-pink-600 font-bold group-hover:bg-pink-600 group-hover:text-white transition-colors">Partogramme</span>
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
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Patiente</th>
                          <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Dilatation</th>
                          <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">BCF</th>
                          <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Contractions</th>
                          <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Progression</th>
                          <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Dernière Obs.</th>
                          <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">État</th>
                        </tr>
                      </thead>
                      <tbody>
                        {laborBeds.filter(b => b.occupied).map((bed, i) => (
                          <tr 
                            key={bed.id} 
                            className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedPatient({ name: bed.patient!, dossierId: bed.dossierId! });
                              setLaborViewMode('partogram');
                            }}
                          >
                            <td className="p-4 font-bold text-slate-900">{bed.patient}</td>
                            <td className="p-4 text-sm text-slate-600">{bed.dilation}</td>
                            <td className="p-4 text-sm text-slate-600">{i === 0 ? '142 bpm' : '138 bpm'}</td>
                            <td className="p-4 text-sm text-slate-600">{i === 0 ? '4/10m' : '3/10m'}</td>
                            <td className="p-4 text-sm text-slate-600">{bed.phase}</td>
                            <td className="p-4 text-sm text-slate-600">Il y a 15 min</td>
                            <td className="p-4">
                              <span className={`w-3 h-3 rounded-full inline-block ${i === 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Labor Tasks */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Clock size={18} className="text-pink-500" />
                    Tâches Sages-femmes
                  </h3>
                  <span className="text-xs font-bold text-slate-400">10:45</span>
                </div>
                <div className="p-6 divide-y divide-slate-50">
                  {[
                    { time: '11:00', task: 'Toucher vaginal', patient: 'LIT-1', urgent: true },
                    { time: '11:30', task: 'Écoute BDCF', patient: 'LIT-4', urgent: false },
                    { time: '12:00', task: 'Pose perfusion', patient: 'LIT-1', urgent: false },
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
                            <button className="px-3 py-1 bg-pink-600 text-white rounded-lg text-[10px] font-bold">Valider</button>
                            <button className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">Reporter</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {isSmartPartogramEnabled ? (
              <SmartPartogram user={user} patientName={selectedPatient?.name || "Patiente"} dossierId={selectedPatient?.dossierId || "MAT-000"} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Partogram Graphic */}
                <div className="lg:col-span-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <TrendingUp size={20} className="text-pink-500" />
                      Partogramme Numérique (Courbe de Friedman)
                    </h2>
                    <button className="bg-pink-50 text-pink-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-pink-100">
                      + Saisie Examen Cervical
                    </button>
                  </div>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={partogramData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis domain={[0, 10]} label={{ value: 'Dilatation (cm)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <ReferenceLine y={10} stroke="green" strokeDasharray="3 3" label="Pleine Dilatation" />
                        <Line type="monotone" dataKey="dilation" stroke="#db2777" strokeWidth={4} dot={{ r: 6 }} />
                        <Line type="monotone" dataKey="alert" stroke="#f59e0b" strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="action" stroke="#ef4444" strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Quick Vitals & Monitoring */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
                    <h3 className="font-bold mb-6 flex items-center gap-2">
                      <Activity size={20} className="text-pink-400" />
                      Paramètres Fœtaux
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                        <p className="text-xs text-slate-400 uppercase font-black mb-1">Cœur Fœtal (RCF)</p>
                        <div className="flex justify-between items-end">
                          <span className="text-3xl font-black">142</span>
                          <span className="text-xs font-bold text-green-400 mb-1">bpm • Stable</span>
                        </div>
                      </div>
                      <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                        <p className="text-xs text-slate-400 uppercase font-black mb-1">Contractions / 10 min</p>
                        <div className="flex justify-between items-end">
                          <span className="text-3xl font-black">4</span>
                          <span className="text-xs font-bold text-pink-400 mb-1">Durée: 45s</span>
                        </div>
                      </div>
                    </div>
                    <button className="w-full mt-6 bg-pink-600 py-3 rounded-2xl font-bold hover:bg-pink-500 transition-all">
                      Valider Accouchement
                    </button>
                  </div>
                  
                  <div className="bg-white rounded-3xl p-6 border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Clock size={18} className="text-slate-400" />
                      Historique Interventions
                    </h4>
                    <div className="space-y-3">
                      {[
                        { time: '12:15', msg: 'Rupture artificielle des membranes' },
                        { time: '10:00', msg: 'Pose de perfusion ocytocine' },
                      ].map((log, i) => (
                        <div key={i} className="flex gap-3 text-xs">
                          <span className="font-black text-slate-400">{log.time}</span>
                          <span className="text-slate-600">{log.msg}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      )}

      {activeTab === 'cpn' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8">
          <h2 className="text-xl font-bold mb-8">Fiche de Suivi CPN</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-xs font-black text-slate-500 mb-2 uppercase">DDR (Date Dernières Règles)</label>
              <input type="date" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 mb-2 uppercase">Date Probable Accouchement</label>
              <input type="date" readOnly value="2024-12-15" className="w-full p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700 font-bold" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 mb-2 uppercase">Grave / Parité</label>
              <input type="text" placeholder="G2 P1" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" />
            </div>
          </div>
          <button className="bg-pink-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-pink-600/20">
            Enregistrer Consultation
          </button>
        </div>
      )}

      {activeTab === 'delivery' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
            <Baby className="text-pink-500" />
            Dossier d'Accouchement
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
              <h3 className="font-bold text-slate-900 border-b pb-2">Informations sur l'Accouchement</h3>
              
              <div>
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase">Date et Heure de Naissance</label>
                <input type="datetime-local" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" />
              </div>
              
              <div>
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase">Mode d'Accouchement</label>
                <select className="w-full p-4 bg-slate-50 border rounded-2xl outline-none">
                  <option>Voie basse spontanée</option>
                  <option>Voie basse instrumentale (Forceps)</option>
                  <option>Voie basse instrumentale (Ventouse)</option>
                  <option>Césarienne programmée</option>
                  <option>Césarienne d'urgence</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase">Délivrance</label>
                <select className="w-full p-4 bg-slate-50 border rounded-2xl outline-none">
                  <option>Spontanée complète</option>
                  <option>Spontanée incomplète</option>
                  <option>Délivrance artificielle</option>
                  <option>Révision utérine</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="font-bold text-slate-900 border-b pb-2">Informations sur le Nouveau-né</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2 uppercase">Sexe</label>
                  <select className="w-full p-4 bg-slate-50 border rounded-2xl outline-none">
                    <option>Masculin</option>
                    <option>Féminin</option>
                    <option>Indéterminé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2 uppercase">Poids (g)</label>
                  <input type="number" placeholder="3200" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2 uppercase">Apgar 1 min</label>
                  <input type="number" min="0" max="10" placeholder="8" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2 uppercase">Apgar 5 min</label>
                  <input type="number" min="0" max="10" placeholder="9" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2 uppercase">Apgar 10 min</label>
                  <input type="number" min="0" max="10" placeholder="10" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase">Réanimation néonatale</label>
                <select className="w-full p-4 bg-slate-50 border rounded-2xl outline-none">
                  <option>Aucune</option>
                  <option>Aspiration</option>
                  <option>Ventilation au masque</option>
                  <option>Intubation</option>
                  <option>Massage cardiaque</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <label className="block text-xs font-black text-slate-500 mb-2 uppercase">Observations / Complications</label>
            <textarea rows={4} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" placeholder="Déchirure périnéale, hémorragie, etc..."></textarea>
          </div>
          
          <div className="flex justify-end gap-4">
            <button className="bg-slate-100 text-slate-600 px-8 py-4 rounded-2xl font-bold hover:bg-slate-200">
              Annuler
            </button>
            <button className="bg-pink-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-pink-600/20 hover:bg-pink-700">
              Valider l'Accouchement
            </button>
          </div>
        </div>
      )}

      {activeTab === 'postpartum' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
            <Heart className="text-pink-500" />
            Surveillance Post-Partum
          </h2>
          <div className="text-center py-12 text-slate-500">
            <p>Sélectionnez une patiente pour afficher son dossier de surveillance post-partum.</p>
          </div>
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
              patient={mockPatient}
              prescripteur={user}
              medications={medications}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Maternity;
