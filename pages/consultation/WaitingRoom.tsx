import React, { useState } from 'react';
import { Users, Clock, ChevronRight, Eye, RefreshCw, X, AlertCircle, ShieldAlert, Pill, TestTube, Activity, FileText, Check } from 'lucide-react';

interface WaitingRoomProps {
  waitingQueue: any[];
  onStartConsultation: (patient: any) => void;
  onCancelPatient?: (patient: any, reason: string) => void;
  onReorientPatient?: (patient: any, targetService: string) => void;
}

// Built-in clinical summary profiles mapping by ID or generic fallback
const PATIENT_SUMMARIES_DB: Record<string, any> = {
  'DME-4452': {
    allergies: ['Pénicilline'],
    treatments: ['Amlodipine 5mg (1x/j)', 'Metformine 500mg (2x/j)'],
    consultations: [
      { date: '12/03/2026', motif: 'Suivi HTA', diagnosis: 'HTA Stade 1 équilibrée', doctor: 'Dr. Sarr' },
      { date: '15/01/2026', motif: 'Syndrome grippal', diagnosis: 'Rhinopharyngite aiguë', doctor: 'Dr. Diallo' }
    ],
    exams: [
      { date: '12/03/2026', type: 'Créatininémie', result: '9.2 mg/L (Normal)' },
      { date: '12/03/2026', type: 'Iogramme sanguin', result: 'Normal' }
    ],
    hospitalisations: [
      { date: 'Mai 2025', duration: '3 jours', motif: 'Crise de paludisme aigu', service: 'Médecine Générale' }
    ]
  },
  'DME-9012': {
    allergies: [],
    treatments: ['Aucun traitement de fond'],
    consultations: [
      { date: '10/02/2026', motif: 'Douleur abdominale', diagnosis: 'Spasmes intestinaux', doctor: 'Dr. Keita' }
    ],
    exams: [
      { date: '10/02/2026', type: 'Échographie abdominale', result: 'Pas d\'anomalie détectée' }
    ],
    hospitalisations: []
  },
  'DME-7721': {
    allergies: ['Aspirine'],
    treatments: ['Amlodipine 10mg (1x/j)', 'Ramipril 5mg (1x/j)'],
    consultations: [
      { date: '18/02/2026', motif: 'Dyspnée d\'effort', diagnosis: 'HTA Stade 2', doctor: 'Dr. Sarr' }
    ],
    exams: [
      { date: '18/02/2026', type: 'ECG de repos', result: 'Surcharge ventriculaire gauche légère' }
    ],
    hospitalisations: [
      { date: 'Novembre 2025', duration: '5 jours', motif: 'Poussée hypertensive sévère', service: 'Soins Intensifs / Cardiologie' }
    ]
  }
};

const WaitingRoom: React.FC<WaitingRoomProps> = ({ 
  waitingQueue, 
  onStartConsultation,
  onCancelPatient,
  onReorientPatient
}) => {
  // Modal states
  const [summaryPatient, setSummaryPatient] = useState<any | null>(null);
  const [reorientPatient, setReorientPatient] = useState<any | null>(null);
  const [cancelPatient, setCancelPatient] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critique': return 'bg-rose-100 text-rose-600 border-rose-200';
      case 'urgent': return 'bg-amber-100 text-amber-600 border-amber-200';
      default: return 'bg-emerald-100 text-emerald-600 border-emerald-200';
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'critique': return 'bg-rose-500';
      case 'urgent': return 'bg-amber-500';
      default: return 'bg-emerald-500';
    }
  };

  // Get or generate rich clinical summary
  const getPatientSummary = (patient: any) => {
    const staticSummary = PATIENT_SUMMARIES_DB[patient.id];
    if (staticSummary) return staticSummary;

    // Smart fallback generator to make every record extremely complete
    const isFemale = patient.gender === 'F';
    return {
      allergies: patient.allergies || [],
      treatments: patient.motif?.toLowerCase().includes('hta') 
        ? ['Amlodipine 5mg (1x/j)'] 
        : patient.motif?.toLowerCase().includes('diabète') 
        ? ['Metformine 500mg (2x/j)'] 
        : ['Néant'],
      consultations: [
        { date: '10/05/2026', motif: patient.motif || 'Contrôle', diagnosis: 'À préciser', doctor: 'Dr. Clinique' }
      ],
      exams: [
        { date: '10/05/2026', type: 'Constantes cliniques', result: `T°: ${patient.vitals?.temp || 37}°C, TA: ${patient.vitals?.bp || '120/80'}` }
      ],
      hospitalisations: []
    };
  };

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      setCancelError('Le motif d\'annulation est obligatoire.');
      return;
    }
    if (onCancelPatient && cancelPatient) {
      onCancelPatient(cancelPatient, cancelReason);
      setCancelPatient(null);
      setCancelReason('');
      setCancelError('');
    }
  };

  const handleReorientSelect = (serviceName: string) => {
    if (onReorientPatient && reorientPatient) {
      onReorientPatient(reorientPatient, serviceName);
      setReorientPatient(null);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Salle d'Attente Médicale</h1>
          <p className="text-slate-500 font-medium italic">Gérez le flux des patients entrants et priorisez les urgences.</p>
        </div>
        <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-600/20">
          {waitingQueue.length} Patients en attente
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {waitingQueue.map((p, idx) => (
          <div key={`${p.id || idx}-${idx}`} className="bg-white rounded-[40px] border border-slate-200 p-8 hover:border-blue-500 hover:shadow-2xl transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <Clock size={100} />
            </div>
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                  <Users size={20} />
                </div>
                <span className="text-[10px] font-black text-slate-400 font-mono tracking-widest uppercase">{p.id}</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getPriorityColor(p.priority || 'normal')}`}>
                {p.priority || 'NORMAL'}
              </div>
            </div>

            <h3 className="text-2xl font-black mb-1 text-slate-900">{p.lastName} {p.firstName}</h3>
            <p className="text-sm text-slate-500 font-medium mb-4">{p.age} ans • {p.gender === 'M' ? 'Masculin' : 'Féminin'}</p>

            <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Motif & Aperçu</p>
              <p className="text-xs font-bold text-slate-700 mb-2">{p.motif}</p>
              <div className="flex flex-wrap gap-2">
                {p.allergies && p.allergies.length > 0 && (
                  <span className="bg-rose-50 text-rose-600 px-2 py-1 rounded-lg text-[9px] font-black uppercase border border-rose-100 flex items-center gap-1">
                    <AlertCircle size={10} /> Allergies
                  </span>
                )}
                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-[9px] font-black uppercase border border-blue-100">
                  Dernier passage: 12/03
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">T°</p>
                <p className="text-sm font-black text-rose-600">{p.vitals?.temp || '--'}°C</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">TA</p>
                <p className="text-sm font-black text-slate-900">{p.vitals?.bp || '--'}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">SPO2</p>
                <p className="text-sm font-black text-emerald-600">{p.vitals?.spo2 || '--'}%</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-6 border-t border-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getPriorityDot(p.priority || 'normal')} animate-pulse`}></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Arrivé à {p.time}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSummaryPatient(p)}
                    className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all cursor-pointer" 
                    title="Voir résumé"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    onClick={() => setReorientPatient(p)}
                    className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all cursor-pointer" 
                    title="Réorienter"
                  >
                    <RefreshCw size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      setCancelPatient(p);
                      setCancelReason('');
                      setCancelError('');
                    }}
                    className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all cursor-pointer" 
                    title="Annuler"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <button 
                onClick={() => onStartConsultation(p)}
                className="w-full bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-600/20"
              >
                Démarrer consultation <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}

        {waitingQueue.length === 0 && (
          <div className="col-span-full py-32 text-center bg-slate-100 rounded-[50px] border-4 border-dashed border-slate-200">
            <Users size={64} className="mx-auto text-slate-300 mb-6 opacity-20" />
            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Aucun patient en attente</h3>
            <p className="text-slate-500 mt-2 font-medium italic">Reposez-vous docteur, la file est vide.</p>
          </div>
        )}
      </div>

      {/* 1. VIEW CLINICAL SUMMARY DIALOG */}
      {summaryPatient && (() => {
        const pSummary = getPatientSummary(summaryPatient);
        return (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] border border-slate-200 w-full max-w-2xl p-10 shadow-2xl relative max-h-[85vh] overflow-y-auto">
              <button 
                onClick={() => setSummaryPatient(null)} 
                className="absolute top-8 right-8 p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all"
              >
                <X size={20} />
              </button>

              <div className="flex gap-6 items-center mb-8 pb-6 border-b border-slate-100">
                <div className="w-16 h-16 bg-blue-50 border-2 border-blue-200 rounded-[28px] overflow-hidden flex items-center justify-center text-blue-600 text-xl font-bold">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${summaryPatient.lastName}`} alt="Patient" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-slate-900">{summaryPatient.lastName} {summaryPatient.firstName}</h3>
                    <span className="text-[10px] font-black text-indigo-600 tracking-widest uppercase bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-mono">
                      {summaryPatient.id}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500">
                    {summaryPatient.age} ans • {summaryPatient.gender === 'M' ? 'Masculin' : 'Féminin'}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Vitals Ribbon */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Température</p>
                    <p className="text-lg font-black text-rose-600">{summaryPatient.vitals?.temp || '--'} °C</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Tension Art.</p>
                    <p className="text-lg font-black text-slate-900">{summaryPatient.vitals?.bp || '--'}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase">SPO2</p>
                    <p className="text-lg font-black text-emerald-600">{summaryPatient.vitals?.spo2 || '--'} %</p>
                  </div>
                </div>

                {/* Allergies and Treatments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-rose-50/50 border border-rose-100 p-6 rounded-2xl">
                    <h4 className="flex items-center gap-2 text-xs font-black uppercase text-rose-800 tracking-wider mb-3">
                      <ShieldAlert size={14} className="text-rose-600" /> Allergies
                    </h4>
                    {pSummary.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {pSummary.allergies.map((all: string, i: number) => (
                          <span key={i} className="bg-rose-100 text-rose-800 font-bold text-xs px-2.5 py-1 rounded-lg">
                            {all}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-rose-600/70 font-medium italic">Aucune allergie connue</p>
                    )}
                  </div>

                  <div className="bg-emerald-50/30 border border-emerald-100 p-6 rounded-2xl">
                    <h4 className="flex items-center gap-2 text-xs font-black uppercase text-emerald-800 tracking-wider mb-3">
                      <Pill size={14} className="text-emerald-600" /> Traitements Actifs
                    </h4>
                    <ul className="text-xs text-emerald-900 font-bold space-y-1.5">
                      {pSummary.treatments.map((tr: string, i: number) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          {tr}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Last consultations */}
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-black uppercase text-slate-800 tracking-wider mb-3">
                    <FileText size={14} className="text-blue-600" /> Dernières Consultations
                  </h4>
                  <div className="border border-slate-100 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                    {pSummary.consultations.map((c: any, i: number) => (
                      <div key={i} className="p-4 bg-slate-50/40 hover:bg-slate-50 transition-colors flex justify-between items-start text-xs">
                        <div>
                          <p className="font-bold text-slate-800 mb-0.5">{c.diagnosis}</p>
                          <p className="text-[10px] text-slate-500 font-medium">Motif : {c.motif} • {c.doctor}</p>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 font-mono bg-white border border-slate-100 px-2 py-0.5 rounded">
                          {c.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Last Exams */}
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-black uppercase text-slate-800 tracking-wider mb-3">
                    <TestTube size={14} className="text-purple-600" /> Derniers Examens
                  </h4>
                  <div className="border border-slate-100 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                    {pSummary.exams.map((e: any, i: number) => (
                      <div key={i} className="p-4 bg-slate-50/40 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-800 mb-0.5">{e.type}</p>
                          <p className="text-[10px] text-purple-600 font-semibold">{e.result}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono bg-white border border-slate-100 px-2 py-0.5 rounded">
                          {e.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hospitalizations */}
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-black uppercase text-slate-800 tracking-wider mb-3">
                    <Activity size={14} className="text-amber-600" /> Hospitalisations Récentes
                  </h4>
                  {pSummary.hospitalisations.length > 0 ? (
                    <div className="border border-slate-100 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                      {pSummary.hospitalisations.map((h: any, i: number) => (
                        <div key={i} className="p-4 bg-slate-50/40 text-xs text-slate-800 font-medium">
                          <p className="font-bold text-slate-900 mb-0.5">{h.motif} ({h.duration})</p>
                          <p className="text-[10px] text-slate-500">Service : {h.service} • Date : {h.date}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="bg-slate-50 text-slate-400 text-xs italic p-4 rounded-2xl border border-slate-100">
                      Aucune hospitalisation enregistrée
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setSummaryPatient(null)}
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 2. REORIENT DIALOG */}
      {reorientPatient && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] border border-slate-200 w-full max-w-sm p-10 shadow-2xl relative">
            <button 
              onClick={() => setReorientPatient(null)} 
              className="absolute top-8 right-8 p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all"
            >
              <X size={18} />
            </button>

            <h3 className="text-2xl font-black text-slate-900 mb-2">Réorienter Patient</h3>
            <p className="text-slate-500 text-sm mb-6 font-medium italic">
              Choisissez le service de destination pour {reorientPatient.lastName} {reorientPatient.firstName}.
            </p>

            <div className="space-y-3">
              {[
                { name: 'Maternité', code: 'Maternity', description: 'CPN, Travail, Accouchement' },
                { name: 'Urgences', code: 'Emergency', description: 'Triage immédiat, Soins critiques' },
                { name: 'Laboratoire', code: 'Laboratoire', description: 'Prélèvements, NFS, Examens' },
                { name: 'Soins', code: 'Soins', description: 'Soins infirmiers, Hospitalisation de jour' }
              ].map((serv) => (
                <button
                  key={serv.code}
                  onClick={() => handleReorientSelect(serv.code)}
                  className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/30 transition-all group flex justify-between items-center cursor-pointer"
                >
                  <div>
                    <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{serv.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{serv.description}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. CANCEL DIALOG */}
      {cancelPatient && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <form 
            onSubmit={handleCancelSubmit}
            className="bg-white rounded-[40px] border border-slate-200 w-full max-w-sm p-10 shadow-2xl relative"
          >
            <button 
              type="button"
              onClick={() => setCancelPatient(null)} 
              className="absolute top-8 right-8 p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all"
            >
              <X size={18} />
            </button>

            <h3 className="text-2xl font-black text-slate-900 mb-2">Annuler la file</h3>
            <p className="text-slate-500 text-sm mb-6 font-medium italic">
              Vous allez retirer {cancelPatient.lastName} {cancelPatient.firstName} de la file d'attente.
            </p>

            {cancelError && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold leading-snug flex items-center gap-2">
                <AlertCircle size={16} /> {cancelError}
              </div>
            )}

            <div className="mb-6">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-2">Motif d'annulation obligatoire</label>
              <textarea
                value={cancelReason}
                onChange={(e) => {
                  setCancelReason(e.target.value);
                  if (e.target.value.trim()) setCancelError('');
                }}
                placeholder="Ex. Erreur d'aiguillage, Patient parti spontanément, Urgent ..."
                className="w-full text-sm p-4 border border-slate-200 rounded-2xl outline-none focus:border-rose-500 h-28 resize-none text-slate-800 font-bold"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCancelPatient(null)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
              >
                Retour
              </button>
              <button
                type="submit"
                className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20"
              >
                Confirmer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default WaitingRoom;
