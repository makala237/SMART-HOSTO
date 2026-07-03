import React, { useState } from 'react';
import { Search, ShieldCheck, CheckCircle, XCircle, FileText, AlertTriangle, User } from 'lucide-react';
import { LabExamRequest, ResultatLaboratoire } from '../../types';

interface ValidationsTabProps {
  requests: LabExamRequest[];
  updateRequests: (requests: LabExamRequest[]) => void;
  resultats: ResultatLaboratoire[];
  updateResultats: (resultats: ResultatLaboratoire[]) => void;
  user?: any;
}

const ValidationsTab: React.FC<ValidationsTabProps> = ({ requests, updateRequests, resultats, updateResultats, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState<ResultatLaboratoire | null>(null);
  const [remarques, setRemarques] = useState('');

  const pendingValidations = resultats.filter(r => r.statut === 'prêt pour validation');
  
  const filteredValidations = pendingValidations.filter(r => {
    const req = requests.find(req => req.id === r.demandeId);
    return req?.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || r.demandeId.includes(searchTerm);
  });

  const handleValidate = (status: 'validé' | 'rejeté') => {
    if (!selectedResult) return;

    const updatedResult = {
      ...selectedResult,
      statut: status,
      validePar: user?.name || 'Biologiste',
      dateValidation: new Date().toISOString(),
      remarquesValidation: remarques
    };

    const updatedResultats = resultats.map(r => r.id === selectedResult.id ? updatedResult : r);
    updateResultats(updatedResultats);

    if (status === 'validé') {
      const updatedRequests = requests.map(r => r.id === selectedResult.demandeId ? { ...r, status: 'validé' as const } : r);
      updateRequests(updatedRequests);
      
      // Notify the system
      const req = getRequest(selectedResult.demandeId);
      if (req) {
        window.dispatchEvent(new CustomEvent('app-notification', { 
          detail: `Résultat de laboratoire validé pour ${req.patientName}` 
        }));
      }
    } else {
      // If rejected, maybe send back to 'en cours' or 'terminé' (brouillon)
      const updatedRequests = requests.map(r => r.id === selectedResult.demandeId ? { ...r, status: 'terminé' as const } : r);
      updateRequests(updatedRequests);
      
      // Also set the result back to brouillon so it can be edited
      const rejectedResult = { ...updatedResult, statut: 'brouillon' as const };
      const finalResultats = resultats.map(r => r.id === selectedResult.id ? rejectedResult : r);
      updateResultats(finalResultats);
    }

    setSelectedResult(null);
    setRemarques('');
  };

  const getRequest = (demandeId: string) => requests.find(r => r.id === demandeId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Liste des validations en attente */}
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
          {filteredValidations.length > 0 ? filteredValidations.map(res => {
            const req = getRequest(res.demandeId);
            if (!req) return null;
            
            return (
              <div 
                key={res.id} 
                onClick={() => setSelectedResult(res)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedResult?.id === res.id ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-slate-100 hover:border-emerald-100 hover:bg-slate-50'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{req.patientName}</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{req.id}</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-lg">
                    À VALIDER
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mt-3 text-xs">
                  <span className="text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                    Saisi par: {res.saisiPar}
                  </span>
                </div>
              </div>
            );
          }) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <ShieldCheck size={48} className="mb-4 opacity-20" />
              <p className="font-bold">Aucune validation en attente</p>
            </div>
          )}
        </div>
      </div>

      {/* Détails de la validation */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
        {selectedResult ? (
          <>
            <div className="p-6 border-b border-slate-100 shrink-0">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{getRequest(selectedResult.demandeId)?.patientName}</h2>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><FileText size={14} /> Demande: {selectedResult.demandeId}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Saisi par</p>
                  <span className="text-sm font-bold text-slate-700">{selectedResult.saisiPar}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
              {selectedResult.lignes.map((ligne, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900">{ligne.examName}</h3>
                  </div>
                  
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                            <th className="pb-2 font-bold">Paramètre</th>
                            <th className="pb-2 font-bold">Résultat</th>
                            <th className="pb-2 font-bold">Unité</th>
                            <th className="pb-2 font-bold">Valeurs de réf.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ligne.parametres.map((param, pIdx) => (
                            <tr key={pIdx} className="border-b border-slate-100 last:border-0">
                              <td className="py-3 text-sm font-medium text-slate-700">{param.nom}</td>
                              <td className="py-3 pr-4">
                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-bold ${
                                  param.isAnormal ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {param.valeur || '-'}
                                  {param.isAnormal && <AlertTriangle size={14} />}
                                </span>
                              </td>
                              <td className="py-3 text-sm text-slate-500">{param.unite}</td>
                              <td className="py-3 text-xs text-slate-400">{param.valeurReference}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {ligne.conclusion && (
                      <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Conclusion</p>
                        <p className="text-sm text-slate-700 font-medium">{ligne.conclusion}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {selectedResult.commentaireGlobal && (
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Commentaire Global</p>
                  <p className="text-sm text-blue-900 font-medium">{selectedResult.commentaireGlobal}</p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Remarques de validation (Optionnel)</label>
                <textarea 
                  value={remarques}
                  onChange={(e) => setRemarques(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none min-h-[80px]"
                  placeholder="Ajouter une remarque en cas de rejet ou de validation sous condition..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <User size={16} /> Validateur: <span className="text-slate-900 font-bold">{user?.name || 'Biologiste'}</span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleValidate('rejeté')}
                  className="px-6 py-3 bg-white border border-rose-200 text-rose-700 font-bold rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <XCircle size={18} /> Rejeter
                </button>
                <button 
                  onClick={() => handleValidate('validé')}
                  className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle size={18} /> Valider les résultats
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <ShieldCheck size={64} className="mb-6 opacity-20" />
            <h2 className="text-xl font-bold text-slate-600 mb-2">Sélectionnez un résultat</h2>
            <p className="text-sm max-w-md">Choisissez un résultat en attente pour le vérifier et le valider.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationsTab;
