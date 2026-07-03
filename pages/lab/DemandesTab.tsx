import React, { useState } from 'react';
import { Search, FlaskConical, AlertTriangle, CheckCircle, Clock, FileText, UserPlus, Droplet, ClipboardList } from 'lucide-react';
import { LabExamRequest, PaymentRequest } from '../../types';

interface DemandesTabProps {
  requests: LabExamRequest[];
  updateRequests: (requests: LabExamRequest[]) => void;
  paymentRequests: PaymentRequest[];
}

const DemandesTab: React.FC<DemandesTabProps> = ({ requests, updateRequests, paymentRequests }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<LabExamRequest | null>(null);

  const pendingRequests = requests.filter(r => r.status === 'en attente');
  
  const filteredRequests = pendingRequests.filter(r => 
    r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.id.includes(searchTerm)
  );

  const handleUpdateStatus = (id: string, newStatus: LabExamRequest['status']) => {
    const requestToUpdate = requests.find(r => r.id === id);
    
    if (newStatus === 'prélèvement fait' && requestToUpdate) {
      // Deduct consumables
      const savedConsumables = localStorage.getItem('hospital_consumables');
      if (savedConsumables) {
        let consumables = JSON.parse(savedConsumables);
        let updated = false;

        requestToUpdate.exams.forEach(exam => {
          if (exam.consommables && exam.consommables.length > 0) {
            exam.consommables.forEach(consName => {
              if (!consName) return;
              const consIndex = consumables.findIndex((c: any) => c.nom.toLowerCase() === consName.toLowerCase());
              if (consIndex !== -1) {
                // Deduct 1 unit for each exam that requires this consumable
                consumables[consIndex].stockInitial = Math.max(0, (consumables[consIndex].stockInitial || 0) - 1);
                updated = true;
              }
            });
          }
        });

        if (updated) {
          localStorage.setItem('hospital_consumables', JSON.stringify(consumables));
          // Dispatch a custom event to notify other components (like Settings) if needed
          window.dispatchEvent(new Event('consumablesUpdated'));
        }
      }
    }

    const updated = requests.map(r => r.id === id ? { ...r, status: newStatus } : r);
    updateRequests(updated);
    if (selectedRequest?.id === id) {
      setSelectedRequest({ ...selectedRequest, status: newStatus });
    }
  };

  const getActualBillingStatus = (req: LabExamRequest) => {
    if (req.billingStatus === 'paid' || req.billingStatus === 'exonéré') {
      return req.billingStatus;
    }
    
    // Find a corresponding payment request
    // Match by patientId, type LABORATOIRE, and created within 5 minutes of the lab request
    const reqDate = new Date(req.date).getTime();
    const matchingPayment = paymentRequests.find(pr => {
      if (pr.patientId !== req.patientId || pr.type !== 'LABORATOIRE') return false;
      const prDate = new Date(pr.createdAt).getTime();
      const diffMinutes = Math.abs(prDate - reqDate) / (1000 * 60);
      return diffMinutes <= 5;
    });

    if (matchingPayment && matchingPayment.status === 'PAID') {
      return 'paid';
    }
    
    return req.billingStatus;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Liste des demandes */}
      <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher un patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
          {filteredRequests.length > 0 ? filteredRequests.map(req => {
            const actualBillingStatus = getActualBillingStatus(req);
            return (
            <div 
              key={req.id} 
              onClick={() => setSelectedRequest(req)}
              className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedRequest?.id === req.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-100 hover:border-blue-100 hover:bg-slate-50'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{req.patientName}</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{req.id}</p>
                </div>
                {req.priority === 'urgent' || req.priority === 'critique' ? (
                  <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                    <AlertTriangle size={12} /> {req.priority.toUpperCase()}
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-lg">
                    NORMAL
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-3 text-xs">
                <span className={`px-2 py-1 rounded-md font-bold ${actualBillingStatus === 'paid' || actualBillingStatus === 'exonéré' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  {actualBillingStatus === 'paid' ? 'Payé' : actualBillingStatus === 'exonéré' ? 'Exonéré' : 'Non payé'}
                </span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock size={12} /> {new Date(req.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          )}) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <ClipboardList size={48} className="mb-4 opacity-20" />
              <p className="font-bold">Aucune demande en attente</p>
              <p className="text-xs mt-1">Les nouvelles prescriptions apparaîtront ici.</p>
            </div>
          )}
        </div>
      </div>

      {/* Détails de la demande */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
        {selectedRequest ? (
          <>
            <div className="p-6 border-b border-slate-100 shrink-0">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{selectedRequest.patientName}</h2>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><FileText size={14} /> {selectedRequest.id}</span>
                    <span>•</span>
                    <span>{selectedRequest.patientAge ? `${selectedRequest.patientAge} ans` : 'Âge inconnu'}</span>
                    <span>•</span>
                    <span>{selectedRequest.patientGender === 'M' ? 'Homme' : selectedRequest.patientGender === 'F' ? 'Femme' : 'Sexe inconnu'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prescripteur</p>
                  <p className="font-bold text-slate-900">{selectedRequest.prescriberName}</p>
                  <p className="text-xs text-slate-500">{selectedRequest.department || 'Consultation'}</p>
                </div>
              </div>

              {selectedRequest.clinicalContext && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Renseignements Cliniques</h3>
                  <p className="text-sm font-medium text-slate-900">{selectedRequest.clinicalContext.motif}</p>
                  {selectedRequest.clinicalContext.diagnostic && (
                    <p className="text-xs text-slate-600 mt-1"><span className="font-bold">Suspicion:</span> {selectedRequest.clinicalContext.diagnostic}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <h3 className="font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2">
                <FlaskConical size={18} className="text-blue-500" /> Examens prescrits ({selectedRequest.exams.length})
              </h3>
              <div className="space-y-3">
                {selectedRequest.exams.map((exam, idx) => (
                  <div key={idx} className="p-4 border border-slate-200 rounded-2xl flex items-center justify-between bg-white">
                    <div>
                      <p className="font-bold text-slate-900">{exam.name}</p>
                      <p className="text-xs text-slate-500">{exam.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
              {getActualBillingStatus(selectedRequest) !== 'paid' && getActualBillingStatus(selectedRequest) !== 'exonéré' ? (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800">
                  <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">Paiement en attente</p>
                    <p className="text-xs mt-1">Les examens n'ont pas encore été réglés à la caisse. Veuillez vérifier avec le patient ou la caisse avant de procéder au prélèvement, sauf urgence vitale.</p>
                  </div>
                </div>
              ) : null}

              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'patient appelé')}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <UserPlus size={18} /> Appeler le patient
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'prélèvement fait')}
                  className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Droplet size={18} /> Prélèvement effectué
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <FlaskConical size={64} className="mb-6 opacity-20" />
            <h2 className="text-xl font-bold text-slate-600 mb-2">Sélectionnez une demande</h2>
            <p className="text-sm max-w-md">Choisissez une demande dans la liste pour voir les détails cliniques et procéder au prélèvement.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemandesTab;
