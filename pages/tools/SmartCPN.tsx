import React, { useState, useEffect } from 'react';
import { User, PregnancyDossier, CPNVisit, CPNExam, CPNPrevention, LabExamRequest } from '../../types';
import { Baby, Activity, Heart, Clock, Clipboard, Save, TrendingUp, AlertTriangle, CheckCircle2, FileText, Printer, Plus, Thermometer, Droplets, Syringe, Stethoscope, List, ChevronDown, ChevronUp, Calendar, BrainCircuit, Beaker } from 'lucide-react';
import AIAssistantTab from '../../components/AIAssistantTab';
import LabExamRequestForm from '../../components/LabExamRequestForm';

interface SmartCPNProps {
  user: User;
}

export const SmartCPN: React.FC<SmartCPNProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'consultation' | 'exams' | 'prevention' | 'plan' | 'ai_assistant'>('summary');
  const [mode, setMode] = useState<'SIMPLE' | 'ADVANCED'>('SIMPLE');
  const [aiMode, setAiMode] = useState<'SIMPLE' | 'ADVANCED'>('SIMPLE');
  const [viewMode, setViewMode] = useState<'list' | 'dossier'>('list');
  const [selectedPregnancy, setSelectedPregnancy] = useState<PregnancyDossier | null>(null);
  const [showLabExamForm, setShowLabExamForm] = useState(false);
  const [isLabExamEnabled, setIsLabExamEnabled] = useState(false);

  // Mock data for pregnancies
  const [pregnancies, setPregnancies] = useState<PregnancyDossier[]>([
    {
      id: 'preg_1',
      patientId: 'pat_1',
      gestity: 2,
      parity: 1,
      obstetricalHistory: 'Accouchement normal en 2022',
      ddr: '2023-08-15',
      dpa: '2024-05-22',
      gestationalAgeWeeks: 26,
      riskFactors: ['Anémie légère'],
      status: 'A_JOUR',
      cpnCount: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'preg_2',
      patientId: 'pat_2',
      gestity: 1,
      parity: 0,
      obstetricalHistory: 'Primigeste',
      ddr: '2023-11-01',
      dpa: '2024-08-08',
      gestationalAgeWeeks: 15,
      riskFactors: [],
      status: 'EN_RETARD',
      cpnCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  useEffect(() => {
    const savedTools = localStorage.getItem('hospital_tools');
    if (savedTools) {
      const parsedTools = JSON.parse(savedTools);
      const cpnTool = parsedTools.find((t: any) => t.code === 'CPN_OMS');
      if (cpnTool && cpnTool.mode) {
        setMode(cpnTool.mode);
      }
      const aiTool = parsedTools.find((t: any) => t.code === 'ASSISTANT_IA');
      if (aiTool && aiTool.mode) {
        setAiMode(aiTool.mode);
      }
      const labTool = parsedTools.find((t: any) => t.code === 'BULLETIN_EXAMENS');
      if (labTool && labTool.status === 'ACTIVE' && labTool.authorizedRoles.includes(user.role)) {
        setIsLabExamEnabled(true);
      }
    }
  }, [user.role]);

  const renderPregnancyList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <Baby size={28} className="text-pink-600" />
          Suivi des Grossesses (CPN)
        </h2>
        <button className="bg-pink-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-pink-700">
          <Plus size={18} /> Nouveau Dossier Grossesse
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Patiente</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Âge Gest.</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">CPN Réalisées</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Prochaine CPN</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Statut</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Risque</th>
            </tr>
          </thead>
          <tbody>
            {pregnancies.map((preg) => (
              <tr 
                key={preg.id} 
                className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedPregnancy(preg);
                  setViewMode('dossier');
                  setActiveTab('summary');
                }}
              >
                <td className="p-4 font-bold text-slate-900">Patiente {preg.patientId}</td>
                <td className="p-4 text-sm text-slate-600">{preg.gestationalAgeWeeks} SA</td>
                <td className="p-4 text-sm text-slate-600">{preg.cpnCount}</td>
                <td className="p-4 text-sm text-slate-600">Dans 2 semaines</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    preg.status === 'A_JOUR' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {preg.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4">
                  {preg.riskFactors.length > 0 ? (
                    <span className="flex items-center gap-1 text-amber-600 text-xs font-bold">
                      <AlertTriangle size={14} /> Oui
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">Non</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDossier = () => {
    if (!selectedPregnancy) return null;

    return (
      <div className="space-y-6">
        {/* Top Banner */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button 
                onClick={() => setViewMode('list')}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
              >
                <ChevronDown className="rotate-90" size={20} />
              </button>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                Dossier Grossesse
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                selectedPregnancy.status === 'A_JOUR' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {selectedPregnancy.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 ml-12">
              <p><span className="font-bold text-slate-900">Patiente {selectedPregnancy.patientId}</span></p>
              <p>Âge gestationnel: <span className="font-bold">{selectedPregnancy.gestationalAgeWeeks} SA</span></p>
              <p>DPA: <span className="font-bold text-pink-600">{selectedPregnancy.dpa}</span></p>
              <p>Gestité/Parité: <span className="font-bold">G{selectedPregnancy.gestity} P{selectedPregnancy.parity}</span></p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700">
              <Printer size={18} /> Rapport CPN
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          {[
            { id: 'summary', label: 'Résumé grossesse', icon: Clipboard },
            { id: 'consultation', label: 'Consultation CPN', icon: Stethoscope },
            { id: 'exams', label: 'Examens & Dépistages', icon: Activity },
            { id: 'prevention', label: 'Prévention', icon: Syringe },
            { id: 'plan', label: 'Plan de suivi', icon: Calendar },
            { id: 'ai_assistant', label: 'Assistant IA', icon: BrainCircuit, color: 'text-purple-600' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id 
                ? (tab.id === 'ai_assistant' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-900 text-white shadow-md') 
                : `text-slate-500 hover:bg-slate-100 hover:text-slate-900 ${tab.color || ''}`
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            
            {/* TAB: SUMMARY */}
            {activeTab === 'summary' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Âge Gestationnel</p>
                    <p className="text-3xl font-black text-pink-600">{selectedPregnancy.gestationalAgeWeeks} SA</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">DPA Estimée</p>
                    <p className="text-xl font-black text-slate-700 mt-2">{selectedPregnancy.dpa}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">CPN Réalisées</p>
                    <p className="text-3xl font-black text-blue-600">{selectedPregnancy.cpnCount}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Prochaine CPN</p>
                    <p className="text-lg font-bold text-emerald-600 mt-2">Semaine 30</p>
                  </div>
                </div>

                {selectedPregnancy.riskFactors.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl">
                    <h3 className="text-sm font-black text-amber-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <AlertTriangle size={18} />
                      Facteurs de Risque
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-amber-900 font-medium">
                      {selectedPregnancy.riskFactors.map((risk, i) => (
                        <li key={i}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Calendar size={16} className="text-blue-500" />
                    Calendrier OMS des Consultations
                  </h3>
                  <div className="space-y-3">
                    {[
                      { week: '< 12', status: 'FAIT', date: '2023-10-15' },
                      { week: '20', status: 'FAIT', date: '2023-12-20' },
                      { week: '26', status: 'FAIT', date: '2024-02-05' },
                      { week: '30', status: 'ATTENDU', date: '2024-03-10' },
                      { week: '34', status: 'A_VENIR', date: '2024-04-05' },
                      { week: '36', status: 'A_VENIR', date: '2024-04-19' },
                      { week: '38', status: 'A_VENIR', date: '2024-05-03' },
                      { week: '40', status: 'A_VENIR', date: '2024-05-17' },
                    ].map((cpn, i) => (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${
                        cpn.status === 'FAIT' ? 'bg-emerald-50 border-emerald-100' :
                        cpn.status === 'ATTENDU' ? 'bg-amber-50 border-amber-200 shadow-sm' :
                        'bg-slate-50 border-slate-100'
                      }`}>
                        <div className="flex items-center gap-3">
                          {cpn.status === 'FAIT' ? <CheckCircle2 size={18} className="text-emerald-500" /> :
                           cpn.status === 'ATTENDU' ? <Clock size={18} className="text-amber-500" /> :
                           <div className="w-4 h-4 rounded-full border-2 border-slate-300 ml-0.5"></div>}
                          <span className={`font-bold ${cpn.status === 'FAIT' ? 'text-emerald-700' : cpn.status === 'ATTENDU' ? 'text-amber-700' : 'text-slate-500'}`}>
                            CPN {i + 1} ({cpn.week} SA)
                          </span>
                        </div>
                        <span className={`text-sm font-bold ${cpn.status === 'FAIT' ? 'text-emerald-600' : cpn.status === 'ATTENDU' ? 'text-amber-600' : 'text-slate-400'}`}>
                          {cpn.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CONSULTATION */}
            {activeTab === 'consultation' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                    <Stethoscope size={20} className="text-pink-500" />
                    Nouvelle Consultation CPN
                  </h3>
                  
                  <div className="space-y-8">
                    {/* Motif & Interrogatoire */}
                    <section>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">Interrogatoire</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Motif de consultation</label>
                          <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-pink-500" placeholder="Ex: CPN de routine, Douleurs..." />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Symptômes d'alerte</label>
                          <div className="flex flex-wrap gap-3">
                            {['Mouvements fœtaux diminués', 'Céphalées', 'Douleurs abdominales', 'Saignements', 'Fièvre'].map(symp => (
                              <label key={symp} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                                <input type="checkbox" className="rounded text-pink-600 focus:ring-pink-500" />
                                <span className="text-sm font-medium text-slate-700">{symp}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Constantes Materneles */}
                    <section>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">Constantes Maternelles</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">TA Systolique</label>
                          <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-pink-500" placeholder="mmHg" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">TA Diastolique</label>
                          <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-pink-500" placeholder="mmHg" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Poids</label>
                          <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-pink-500" placeholder="kg" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Température</label>
                          <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-pink-500" placeholder="°C" />
                        </div>
                        <div className="col-span-2">
                          <label className="flex items-center gap-2 mt-4 cursor-pointer">
                            <input type="checkbox" className="rounded text-pink-600 focus:ring-pink-500 w-5 h-5" />
                            <span className="text-sm font-bold text-slate-700">Présence d'œdèmes</span>
                          </label>
                        </div>
                      </div>
                    </section>

                    {/* Examen Obstétrical */}
                    <section>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">Examen Obstétrical</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hauteur Utérine</label>
                          <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-pink-500" placeholder="cm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">BCF</label>
                          <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-pink-500" placeholder="bpm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Présentation</label>
                          <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-pink-500">
                            <option>Non déterminée</option>
                            <option>Céphalique</option>
                            <option>Siège</option>
                            <option>Transverse</option>
                          </select>
                        </div>
                      </div>
                    </section>

                    {/* Conclusion */}
                    <section>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">Conclusion</h4>
                      <div className="space-y-4">
                        <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-pink-500 h-24" placeholder="Notes cliniques, évolution, recommandations..."></textarea>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded text-rose-600 focus:ring-rose-500 w-5 h-5" />
                            <span className="text-sm font-bold text-rose-700">Marquer comme grossesse à risque</span>
                          </label>
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button className="bg-pink-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-pink-700 shadow-lg shadow-pink-600/20">
                      <Save size={20} /> Enregistrer la CPN
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: EXAMS */}
            {activeTab === 'exams' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Activity size={20} className="text-blue-500" />
                    Examens & Dépistages
                  </h3>
                  {isLabExamEnabled && (
                    <button 
                      onClick={() => setShowLabExamForm(true)}
                      className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-xl transition-colors"
                    >
                      <Plus size={16} /> Prescrire un examen
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  {[
                    { name: 'Hémoglobine', status: 'FAIT', date: '2023-10-15', result: '11.5 g/dL', anomaly: false },
                    { name: 'Test VIH', status: 'FAIT', date: '2023-10-15', result: 'Négatif', anomaly: false },
                    { name: 'Test Syphilis', status: 'FAIT', date: '2023-10-15', result: 'Négatif', anomaly: false },
                    { name: 'Groupe Sanguin / Rh', status: 'FAIT', date: '2023-10-15', result: 'O+', anomaly: false },
                    { name: 'Analyse d\'urine (Bandelette)', status: 'RECOMMANDE', date: '-', result: '-', anomaly: false },
                    { name: 'Échographie obstétricale (T2)', status: 'EN_ATTENTE', date: '-', result: '-', anomaly: false },
                  ].map((exam, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-900">{exam.name}</p>
                        <p className="text-xs text-slate-500 mt-1">Date: {exam.date}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          exam.status === 'FAIT' ? 'bg-emerald-100 text-emerald-700' :
                          exam.status === 'EN_ATTENTE' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {exam.status.replace('_', ' ')}
                        </span>
                        {exam.status === 'FAIT' && (
                          <p className={`text-sm font-bold mt-2 ${exam.anomaly ? 'text-rose-600' : 'text-slate-700'}`}>
                            {exam.result}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: PREVENTION */}
            {activeTab === 'prevention' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Syringe size={20} className="text-emerald-500" />
                  Prévention & Traitements
                </h3>
                
                <div className="space-y-8">
                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">Supplémentation</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-900">Fer + Acide Folique</p>
                          <p className="text-xs text-slate-500 mt-1">Prescrit le 2023-10-15</p>
                        </div>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">En cours</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">Prévention Paludisme</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-900">Moustiquaire Imprégnée (MILDA)</p>
                          <p className="text-xs text-slate-500 mt-1">Remise le 2023-10-15</p>
                        </div>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Fait</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-900">TPI (Sulfadoxine-Pyriméthamine)</p>
                          <p className="text-xs text-slate-500 mt-1">Dose 1: 2023-12-20 | Dose 2: 2024-02-05</p>
                        </div>
                        <button className="text-blue-600 font-bold text-sm hover:underline">Administrer Dose 3</button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">Vaccination</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-900">Tétanos (VAT)</p>
                          <p className="text-xs text-slate-500 mt-1">VAT 1: 2023-10-15 | VAT 2: 2023-11-15</p>
                        </div>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">À jour</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PLAN */}
            {activeTab === 'plan' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Calendar size={20} className="text-purple-500" />
                  Plan de Suivi
                </h3>
                
                <div className="space-y-6">
                  <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
                    <h4 className="font-bold text-purple-900 mb-2">Prochaine Consultation Recommandée</h4>
                    <p className="text-2xl font-black text-purple-700">Semaine 30 (vers le 10 Mars 2024)</p>
                    <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors">
                      Programmer le RDV
                    </button>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-4">À faire avant la prochaine CPN</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5"><Activity size={14}/></div>
                        <div>
                          <p className="font-bold text-slate-700">Échographie du 3ème trimestre</p>
                          <p className="text-xs text-slate-500">Pour évaluer la croissance fœtale et la présentation.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5"><Droplets size={14}/></div>
                        <div>
                          <p className="font-bold text-slate-700">Bandelette urinaire</p>
                          <p className="text-xs text-slate-500">Recherche de protéinurie.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: AI ASSISTANT */}
            {activeTab === 'ai_assistant' && (
              <AIAssistantTab 
                context="CPN" 
                patientId={selectedPregnancy.patientId} 
                data={selectedPregnancy} 
                mode={aiMode} 
              />
            )}

          </div>

          {/* Right Column: Intelligence & Alerts */}
          {activeTab !== 'ai_assistant' && (
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-500" />
                  Intelligence Clinique
                </h3>
                
                <div className="space-y-3">
                  <div className="p-3 rounded-xl border bg-amber-50 border-amber-200 text-amber-800 flex items-start gap-3">
                    <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Vigilance</p>
                      <p className="text-xs mt-1 font-medium">Bandelette urinaire non réalisée à la dernière CPN. À prévoir aujourd'hui.</p>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-xl border bg-blue-50 border-blue-200 text-blue-800 flex items-start gap-3">
                    <Activity size={16} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Information</p>
                      <p className="text-xs mt-1 font-medium">La patiente est éligible pour la 3ème dose de TPI (SP) selon le protocole OMS.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-500">
      {viewMode === 'list' ? renderPregnancyList() : renderDossier()}

      {showLabExamForm && selectedPregnancy && (
        <LabExamRequestForm
          patientId={selectedPregnancy.patientId}
          patientName={`Patiente ${selectedPregnancy.patientId}`} // In a real app, fetch patient name
          patientAge="28 ans"
          patientSex="F"
          patientDossier={selectedPregnancy.id}
          prescriberId={user?.id || 'unknown'}
          prescriberName={user?.name || 'Dr. Inconnu'}
          requestingService="Maternité (CPN)"
          onClose={() => setShowLabExamForm(false)}
          onSave={(request) => {
            const newRequest: LabExamRequest = {
              ...request,
              id: `REQ-${Date.now()}`,
              date: new Date().toISOString(),
              status: 'en attente',
              billingStatus: 'pending'
            };
            
            // Save to localStorage
            const savedRequests = localStorage.getItem('hospital_lab_requests');
            const parsedRequests = savedRequests ? JSON.parse(savedRequests) : [];
            localStorage.setItem('hospital_lab_requests', JSON.stringify([...parsedRequests, newRequest]));
            
            // Log for consumables
            console.log(`[CONSOMMABLES] Réservation des consommables pour ${request.exams.length} examens`);

            setShowLabExamForm(false);
          }}
        />
      )}
    </div>
  );
};
