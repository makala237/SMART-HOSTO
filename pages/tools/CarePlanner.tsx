import React, { useState, useEffect } from 'react';
import { CareTask, Prescription, Patient } from '../../types';
import { Calendar, Clock, CheckCircle2, XCircle, AlertTriangle, Activity, Pill, User, BrainCircuit } from 'lucide-react';
import AIAssistantTab from '../../components/AIAssistantTab';

interface CarePlannerProps {
  patient: Patient;
  prescriptions: Prescription[];
  onUpdateTask: (taskId: string, status: CareTask['status'], comment?: string) => void;
}

const CarePlanner: React.FC<CarePlannerProps> = ({ patient, prescriptions, onUpdateTask }) => {
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [activeTab, setActiveTab] = useState<'planner' | 'ai_assistant'>('planner');
  const [filter, setFilter] = useState<'ALL' | 'TODO' | 'DONE' | 'LATE'>('ALL');

  const [toolsConfig, setToolsConfig] = useState<any[]>(() => {
    const saved = localStorage.getItem('hospital_tools');
    return saved ? JSON.parse(saved) : [];
  });
  
  const aiAssistantConfig = toolsConfig.find(t => t.code === 'ASSISTANT_IA');
  const isAIAssistantEnabled = aiAssistantConfig?.status === 'ACTIVE';
  const aiMode = aiAssistantConfig?.mode || 'SIMPLE';

  // Generate tasks from prescriptions (mock logic for demonstration)
  useEffect(() => {
    const generatedTasks: CareTask[] = [];
    let taskIdCounter = 1;

    prescriptions.forEach(rx => {
      if (rx.status !== 'VALIDATED') return;

      const startDate = new Date(rx.createdAt);
      const intervalHours = 24 / rx.frequency;

      for (let day = 0; day < rx.duration; day++) {
        for (let dose = 0; dose < rx.frequency; dose++) {
          const scheduledTime = new Date(startDate);
          scheduledTime.setDate(startDate.getDate() + day);
          scheduledTime.setHours(startDate.getHours() + (dose * intervalHours));

          // Determine mock status based on time
          const now = new Date();
          let status: CareTask['status'] = 'TODO';
          if (scheduledTime < new Date(now.getTime() - 2 * 60 * 60 * 1000)) {
            status = 'LATE'; // Late if past 2 hours
          }

          generatedTasks.push({
            id: `task_${rx.id}_${taskIdCounter++}`,
            patientId: rx.patientId,
            prescriptionId: rx.id,
            medicationName: rx.medicationName,
            scheduledAt: scheduledTime.toISOString(),
            status: status,
            dose: rx.dosePerIntake,
            units: rx.unitsPerIntake,
            route: rx.route,
            instructions: rx.instructions,
            monitoringParams: rx.monitoringParams
          });
        }
      }
    });

    // Sort by scheduled time
    generatedTasks.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    setTasks(generatedTasks);
  }, [prescriptions]);

  const filteredTasks = tasks.filter(t => {
    if (filter === 'ALL') return true;
    if (filter === 'LATE') return t.status === 'LATE' || t.status === 'MISSED';
    return t.status === filter;
  });

  const handleStatusChange = (taskId: string, newStatus: CareTask['status']) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus, executedAt: new Date().toISOString() } : t));
    onUpdateTask(taskId, newStatus);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-full max-h-[800px]">
      <div className="p-6 bg-emerald-600 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Calendar size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Planificateur de Soins</h2>
            <p className="text-emerald-100 text-sm font-medium">Suivi et administration thérapeutique</p>
          </div>
        </div>
        
        {isAIAssistantEnabled && (
          <div className="flex bg-emerald-700/50 rounded-xl p-1">
            <button 
              onClick={() => setActiveTab('planner')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === 'planner' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-100 hover:text-white'}`}
            >
              <Calendar size={16} /> Planificateur
            </button>
            <button 
              onClick={() => setActiveTab('ai_assistant')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === 'ai_assistant' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-100 hover:text-white'}`}
            >
              <BrainCircuit size={16} /> Assistant IA
            </button>
          </div>
        )}
      </div>

      {activeTab === 'planner' && (
        <>
          <div className="px-6 py-4 bg-white border-b border-slate-100 flex justify-end">
            <div className="flex bg-slate-100 rounded-xl p-1">
              <button 
                onClick={() => setFilter('ALL')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'ALL' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Tout
              </button>
              <button 
                onClick={() => setFilter('TODO')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'TODO' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                À faire
              </button>
              <button 
                onClick={() => setFilter('LATE')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'LATE' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                En retard
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center p-12 text-slate-400">
              <CheckCircle2 size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium">Aucune tâche planifiée pour ce filtre.</p>
            </div>
          ) : (
            filteredTasks.map(task => {
              const scheduledDate = new Date(task.scheduledAt);
              const isLate = task.status === 'LATE';
              const isDone = task.status === 'DONE';

              return (
                <div key={task.id} className={`bg-white p-5 rounded-2xl border-l-4 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between transition-all hover:shadow-md ${
                  isDone ? 'border-emerald-500 opacity-75' : 
                  isLate ? 'border-rose-500 bg-rose-50/30' : 
                  'border-blue-500'
                }`}>
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      isDone ? 'bg-emerald-100 text-emerald-600' : 
                      isLate ? 'bg-rose-100 text-rose-600' : 
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {isDone ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-black text-slate-900 text-lg">{task.medicationName}</h3>
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                          {task.route}
                        </span>
                        {isLate && (
                          <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center gap-1">
                            <AlertTriangle size={12} /> Retard
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-slate-600 font-medium flex items-center gap-4">
                        <span className="flex items-center gap-1"><Pill size={14} className="text-slate-400"/> {task.dose} mg ({task.units.toFixed(1)} unité(s))</span>
                        <span className="flex items-center gap-1 text-blue-600 font-bold"><Clock size={14} /> {scheduledDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-slate-400 text-xs">{scheduledDate.toLocaleDateString('fr-FR')}</span>
                      </div>

                      {task.monitoringParams && task.monitoringParams.length > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <Activity size={14} className="text-amber-500" />
                          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Surveillance :</span>
                          <div className="flex gap-2">
                            {task.monitoringParams.map((param, idx) => (
                              <span key={idx} className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded text-xs font-medium">
                                {param}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                    {!isDone && (
                      <>
                        <button 
                          onClick={() => handleStatusChange(task.id, 'REFUSED')}
                          className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                          Refusé
                        </button>
                        <button 
                          onClick={() => handleStatusChange(task.id, 'DONE')}
                          className="px-6 py-2 rounded-xl text-sm font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors flex items-center gap-2"
                        >
                          <CheckCircle2 size={16} /> Administré
                        </button>
                      </>
                    )}
                    {isDone && (
                      <div className="text-sm font-bold text-emerald-600 flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl">
                        <CheckCircle2 size={16} /> Fait à {new Date(task.executedAt || '').toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      </>
      )}

      {activeTab === 'ai_assistant' && (
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <AIAssistantTab 
            context="TREATMENT" 
            patientId={patient.id} 
            data={{ 
              prescriptions,
              tasks
            }} 
            mode={aiMode} 
          />
        </div>
      )}
    </div>
  );
};

export default CarePlanner;
