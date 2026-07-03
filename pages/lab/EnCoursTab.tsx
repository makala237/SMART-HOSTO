import React, { useState } from 'react';
import { Search, FlaskConical, AlertTriangle, CheckCircle, Clock, User, FileText, Activity } from 'lucide-react';
import { LabExamRequest } from '../../types';

interface EnCoursTabProps {
  requests: LabExamRequest[];
  updateRequests: (requests: LabExamRequest[]) => void;
  user?: any;
}

const EnCoursTab: React.FC<EnCoursTabProps> = ({ requests, updateRequests, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<LabExamRequest | null>(null);

  const inProgressRequests = requests.filter(r => 
    r.status === 'patient appelé' || 
    r.status === 'prélèvement fait' || 
    r.status === 'en cours'
  );
  
  const filteredRequests = inProgressRequests.filter(r => 
    r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.id.includes(searchTerm)
  );

  const handleUpdateStatus = (id: string, newStatus: LabExamRequest['status']) => {
    const updated = requests.map(r => r.id === id ? { ...r, status: newStatus } : r);
    updateRequests(updated);
    if (selectedRequest?.id === id) {
      setSelectedRequest({ ...selectedRequest, status: newStatus });
    }
  };

  const handleUpdateSampleInfo = (id: string, field: string, value: string) => {
    const updated = requests.map(r => r.id === id ? { ...r, [field]: value } : r);
    updateRequests(updated);
    if (selectedRequest?.id === id) {
      setSelectedRequest({ ...selectedRequest, [field]: value });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Liste des prélèvements en cours */}
      <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher un échantillon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
          {filteredRequests.length > 0 ? filteredRequests.map(req => (
            <div 
              key={req.id} 
              onClick={() => setSelectedRequest(req)}
              className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedRequest?.id === req.id ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-white border-slate-100 hover:border-amber-100 hover:bg-slate-50'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{req.patientName}</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{req.id}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                  req.status === 'patient appelé' ? 'bg-blue-100 text-blue-700' :
                  req.status === 'prélèvement fait' ? 'bg-purple-100 text-purple-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {req.status.toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mt-3 text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock size={12} /> {new Date(req.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
                {req.sampleType && (
                  <span className="text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                    {req.sampleType}
                  </span>
                )}
              </div>
            </div>
          )) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <FlaskConical size={48} className="mb-4 opacity-20" />
              <p className="font-bold">Aucun échantillon en cours</p>
            </div>
          )}
        </div>
      </div>

      {/* Détails et actions sur l'échantillon */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
        {selectedRequest ? (
          <>
            <div className="p-6 border-b border-slate-100 shrink-0">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{selectedRequest.patientName}</h2>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><FileText size={14} /> {selectedRequest.id}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Statut Actuel</p>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    selectedRequest.status === 'patient appelé' ? 'bg-blue-100 text-blue-700' :
                    selectedRequest.status === 'prélèvement fait' ? 'bg-purple-100 text-purple-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedRequest.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
              {/* Informations de prélèvement */}
              <div>
                <h3 className="font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2">
                  <FlaskConical size={18} className="text-purple-500" /> Informations de Prélèvement
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type d'échantillon</label>
                    <select 
                      value={selectedRequest.sampleType || ''}
                      onChange={(e) => handleUpdateSampleInfo(selectedRequest.id, 'sampleType', e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 outline-none font-medium text-slate-700"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="Sang total (EDTA)">Sang total (EDTA)</option>
                      <option value="Sérum (Tube sec)">Sérum (Tube sec)</option>
                      <option value="Plasma (Citrate)">Plasma (Citrate)</option>
                      <option value="Urine">Urine</option>
                      <option value="Selles">Selles</option>
                      <option value="LCR">LCR</option>
                      <option value="Ecouvillon">Ecouvillon</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Heure de prélèvement</label>
                    <input 
                      type="time" 
                      value={selectedRequest.sampleTime || ''}
                      onChange={(e) => handleUpdateSampleInfo(selectedRequest.id, 'sampleTime', e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 outline-none font-medium text-slate-700"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Remarques sur l'échantillon</label>
                    <select 
                      value={selectedRequest.sampleRemarks || ''}
                      onChange={(e) => handleUpdateSampleInfo(selectedRequest.id, 'sampleRemarks', e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 outline-none font-medium text-slate-700"
                    >
                      <option value="">Aucune remarque (Conforme)</option>
                      <option value="échantillon insuffisant">Échantillon insuffisant</option>
                      <option value="hémolysé">Hémolysé</option>
                      <option value="à refaire">À refaire</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Examens à réaliser */}
              <div>
                <h3 className="font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2">
                  <Activity size={18} className="text-amber-500" /> Analyses à effectuer
                </h3>
                <div className="space-y-2">
                  {selectedRequest.exams.map((exam, idx) => (
                    <div key={idx} className="p-3 border border-slate-200 rounded-xl flex items-center justify-between bg-white">
                      <span className="font-bold text-slate-800 text-sm">{exam.name}</span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">{exam.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <User size={16} /> Technicien: <span className="text-slate-900 font-bold">{user?.name || 'Non assigné'}</span>
              </div>
              <div className="flex gap-3">
                {selectedRequest.status === 'patient appelé' && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'prélèvement fait')}
                    className="px-6 py-3 bg-purple-100 text-purple-700 font-bold rounded-xl hover:bg-purple-200 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    Confirmer prélèvement
                  </button>
                )}
                {(selectedRequest.status === 'prélèvement fait' || selectedRequest.status === 'patient appelé') && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'en cours')}
                    className="px-6 py-3 bg-amber-100 text-amber-700 font-bold rounded-xl hover:bg-amber-200 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    Démarrer l'analyse
                  </button>
                )}
                {selectedRequest.status === 'en cours' && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'terminé')}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <CheckCircle size={18} /> Analyses terminées
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <FlaskConical size={64} className="mb-6 opacity-20" />
            <h2 className="text-xl font-bold text-slate-600 mb-2">Sélectionnez un échantillon</h2>
            <p className="text-sm max-w-md">Choisissez un prélèvement en cours pour mettre à jour son statut ou ajouter des remarques.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnCoursTab;
