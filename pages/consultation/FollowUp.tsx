import React from 'react';
import { Activity, User, ChevronRight, AlertCircle, Calendar, ExternalLink, RefreshCw } from 'lucide-react';

interface FollowUpProps {
  onOpenDossier?: (patient: any) => void;
  onStartVisite?: (patient: any) => void;
  onPlanifierRDV?: (patient: any) => void;
}

const FollowUp: React.FC<FollowUpProps> = ({ onOpenDossier, onStartVisite, onPlanifierRDV }) => {
  const hospitalizedPatients = [
    { id: 'HOSP-101', name: 'Moussa SOW', age: 45, gender: 'M', service: 'Médecine Interne', treatment: 'Ceftriaxone 2g/j', evolution: 'Stable', room: 'Chambre 12A' },
    { id: 'HOSP-105', name: 'Fatou NDIAYE', age: 28, gender: 'F', service: 'Maternité', treatment: 'Fer + Acide Folique', evolution: 'Favorable', room: 'Chambre 04B' },
  ];

  const externalFollowUp = [
    { id: 'EXT-502', name: 'Jean-Paul GOMIS', age: 62, gender: 'M', condition: 'Diabète Type 2', lastVisit: '15/03/2026', nextCheckup: '15/04/2026', treatment: 'Metformine 500mg' },
    { id: 'EXT-509', name: 'Awa DIALLO', age: 34, gender: 'F', condition: 'Grossesse (24 SA)', lastVisit: '20/03/2026', nextCheckup: '20/04/2026', treatment: 'CPN 3' },
  ];

  const mapToStandardPatient = (p: any) => {
    const parts = p.name.split(' ');
    return {
      id: p.id,
      firstName: parts[1] || p.name,
      lastName: parts[0] || '',
      age: p.age,
      gender: p.gender,
      vitals: { temp: '37.5', bp: '120/80', pulse: '78', spo2: '98' }
    };
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Suivi des Patients</h1>
        <p className="text-slate-500 font-medium italic">Surveillez l'évolution de vos patients hospitalisés et en suivi externe.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Hospitalized Patients */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600"><Activity size={18} /></div>
              Hospitalisés
            </h2>
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
              {hospitalizedPatients.length} Actifs
            </span>
          </div>
          
          {hospitalizedPatients.map((p) => (
            <div key={p.id} className="bg-white rounded-[32px] border border-slate-200 p-6 hover:border-blue-500 transition-all group shadow-sm hover:shadow-xl hover:shadow-blue-600/5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 font-black overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} alt="Patient" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{p.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{p.age} ans • {p.gender} • {p.room}</p>
                  </div>
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                  {p.evolution}
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Traitement en cours</p>
                <p className="text-sm font-bold text-slate-700">{p.treatment}</p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => onOpenDossier && onOpenDossier(mapToStandardPatient(p))}
                  className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                >
                  Dossier <ExternalLink size={14} />
                </button>
                <button 
                  onClick={() => onStartVisite && onStartVisite(mapToStandardPatient(p))}
                  className="flex-1 bg-slate-100 text-slate-600 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  Visite <RefreshCw size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* External Follow-up */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600"><User size={18} /></div>
              Suivi Externe
            </h2>
            <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
              {externalFollowUp.length} Patients
            </span>
          </div>

          {externalFollowUp.map((p) => (
            <div key={p.id} className="bg-white rounded-[32px] border border-slate-200 p-6 hover:border-amber-500 transition-all group shadow-sm hover:shadow-xl hover:shadow-amber-600/5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 font-black overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} alt="Patient" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{p.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{p.condition}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Prochain RDV</p>
                  <p className="text-sm font-black text-amber-600">{p.nextCheckup}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Dernière visite</p>
                  <p className="text-xs font-bold text-slate-700">{p.lastVisit}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Traitement</p>
                  <p className="text-xs font-bold text-slate-700">{p.treatment}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => onOpenDossier && onOpenDossier(mapToStandardPatient(p))}
                  className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-500 transition-all flex items-center justify-center gap-2"
                >
                  Ouvrir Dossier <ExternalLink size={14} />
                </button>
                <button 
                  onClick={() => onPlanifierRDV && onPlanifierRDV(mapToStandardPatient(p))}
                  className="flex-1 bg-slate-100 text-slate-600 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  Planifier RDV <Calendar size={14} />
                </button>
              </div>
            </div>
          ))}

          {/* Alerts Section */}
          <div className="mt-10 bg-rose-50 rounded-[40px] border border-rose-100 p-8">
            <h3 className="text-lg font-black text-rose-600 uppercase tracking-widest flex items-center gap-3 mb-6">
              <AlertCircle size={20} /> Alertes de Suivi
            </h3>
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-rose-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                  <p className="text-xs font-bold text-slate-700">Abdoulaye FALL : RDV manqué (Diabète)</p>
                </div>
                <button className="text-[9px] font-black text-rose-600 uppercase tracking-widest hover:underline">Appeler</button>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-rose-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                  <p className="text-xs font-bold text-slate-700">Mariama BA : Évolution anormale (Grossesse)</p>
                </div>
                <button className="text-[9px] font-black text-rose-600 uppercase tracking-widest hover:underline">Urgent</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowUp;
