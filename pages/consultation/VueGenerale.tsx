
import React from 'react';
import { 
  Activity, Thermometer, Heart, Wind, Droplets, 
  Pill, Beaker, FileText, RefreshCw, Edit3, Trash2, Eye,
  Stethoscope, Send, History, Brain, Hospital, Calendar
} from 'lucide-react';

interface VueGeneraleProps {
  patient: any;
  onAction: (action: string) => void;
}

const VueGenerale: React.FC<VueGeneraleProps> = ({ patient, onAction }) => {
  // Mock data for treatments and exams
  const currentTreatments = [
    { id: '1', name: 'Paracétamol 500mg', posology: '1 tab 3x/jour', status: 'active' },
    { id: '2', name: 'Amoxicilline 1g', posology: '1 tab 2x/jour', status: 'active' }
  ];

  const pendingExams = [
    { id: '1', name: 'NFS', status: 'en cours' },
    { id: '2', name: 'CRP', status: 'en attente' }
  ];

  const lastDiagnosis = {
    name: 'Paludisme simple',
    date: '12/03/2026'
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <button 
          onClick={() => onAction('MEDICAL')}
          className="flex flex-col items-center justify-center p-6 bg-blue-600 text-white rounded-[32px] hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 group"
        >
          <Stethoscope size={24} className="mb-3 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest text-center">Nouvelle Consultation</span>
        </button>
        <button 
          onClick={() => onAction('PRESCRIPTION')}
          className="flex flex-col items-center justify-center p-6 bg-emerald-600 text-white rounded-[32px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 group"
        >
          <Pill size={24} className="mb-3 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest text-center">Renouveler Traitement</span>
        </button>
        <button 
          onClick={() => onAction('EXAMS')}
          className="flex flex-col items-center justify-center p-6 bg-purple-600 text-white rounded-[32px] hover:bg-purple-700 transition-all shadow-xl shadow-purple-600/20 group"
        >
          <Beaker size={24} className="mb-3 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest text-center">Voir Résultats</span>
        </button>
        <button 
          onClick={() => onAction('HISTORY')}
          className="flex flex-col items-center justify-center p-6 bg-slate-900 text-white rounded-[32px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 group"
        >
          <History size={24} className="mb-3 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest text-center">Voir Historique</span>
        </button>
        <button 
          onClick={() => onAction('HOSPITALIZE')}
          className="flex flex-col items-center justify-center p-6 bg-amber-500 text-white rounded-[32px] hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20 group"
        >
          <Hospital size={24} className="mb-3 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest text-center">Hospitaliser</span>
        </button>
        <button 
          onClick={() => onAction('APPOINTMENT')}
          className="flex flex-col items-center justify-center p-6 bg-rose-500 text-white rounded-[32px] hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 group"
        >
          <Calendar size={24} className="mb-3 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest text-center">Planifier RDV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vitals Section */}
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <Activity className="text-blue-600" /> Paramètres vitaux du jour
            </h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">
              <RefreshCw size={14} /> Mettre à jour
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
              <Activity size={20} className="mx-auto mb-3 text-blue-600" />
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">TA</p>
              <p className="text-lg font-black text-slate-900">{patient.vitals?.bp || '--'}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
              <Heart size={20} className="mx-auto mb-3 text-rose-600" />
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">FC</p>
              <p className="text-lg font-black text-slate-900">{patient.vitals?.pulse || '--'}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
              <Wind size={20} className="mx-auto mb-3 text-emerald-600" />
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">FR</p>
              <p className="text-lg font-black text-slate-900">--</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
              <Thermometer size={20} className="mx-auto mb-3 text-amber-600" />
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Temp</p>
              <p className="text-lg font-black text-slate-900">{patient.vitals?.temp || '--'}°C</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
              <Droplets size={20} className="mx-auto mb-3 text-blue-400" />
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">SpO2</p>
              <p className="text-lg font-black text-slate-900">{patient.vitals?.spo2 || '--'}%</p>
            </div>
          </div>
        </div>

        {/* Last Diagnosis */}
        <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-xl shadow-slate-900/20 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
              <FileText className="text-blue-400" /> Dernier diagnostic
            </h3>
            <div className="bg-white/10 rounded-3xl p-6 border border-white/10">
              <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-2">Diagnostic Principal</p>
              <p className="text-2xl font-black mb-2">{lastDiagnosis.name}</p>
              <p className="text-sm text-slate-400 font-medium italic">Posé le {lastDiagnosis.date}</p>
            </div>
          </div>
          <button className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
            Voir détails complets
          </button>
        </div>

        {/* Treatments Section */}
        <div className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <Pill className="text-emerald-600" /> Traitements en cours
            </h3>
          </div>
          <div className="space-y-4">
            {currentTreatments.map(t => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition-all">
                <div>
                  <p className="font-black text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500 font-medium">{t.posology}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors" title="Renouveler">
                    <RefreshCw size={14} />
                  </button>
                  <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors" title="Modifier">
                    <Edit3 size={14} />
                  </button>
                  <button className="p-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 transition-colors" title="Arrêter">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exams Section */}
        <div className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <Beaker className="text-purple-600" /> Examens en attente
            </h3>
          </div>
          <div className="space-y-4">
            {pendingExams.map(e => (
              <div key={e.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${e.status === 'en cours' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-400'}`}>
                    <Beaker size={18} />
                  </div>
                  <div>
                    <p className="font-black text-slate-900">{e.name}</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${e.status === 'en cours' ? 'text-amber-600' : 'text-slate-400'}`}>{e.status}</p>
                  </div>
                </div>
                {e.status === 'disponible' && (
                  <button className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors" title="Voir résultats">
                    <Eye size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Assistant Insight */}
        <div className="bg-rose-50 rounded-[40px] border border-rose-100 p-8 shadow-sm">
          <h3 className="text-xl font-black text-rose-900 flex items-center gap-3 mb-6">
            <Brain className="text-rose-600" /> Assistant IA
          </h3>
          <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm">
            <p className="text-sm text-slate-700 font-medium italic leading-relaxed">
              "Basé sur les antécédents de paludisme et la température actuelle de 38.5°C, une goutte épaisse est recommandée pour exclure une récidive."
            </p>
            <div className="mt-6 flex gap-3">
              <button className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all">
                Appliquer suggestion
              </button>
              <button className="px-4 py-3 bg-white border border-rose-200 text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all">
                Détails
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VueGenerale;
