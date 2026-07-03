import React, { useState, useEffect } from 'react';
import { Search, FlaskConical, CheckCircle, Clock, FileText, Save, Activity, AlertTriangle } from 'lucide-react';
import { LabExamRequest, ResultatLaboratoire, LigneResultat, ParametreResultat, MedicalAct } from '../../types';

interface ResultatsTabProps {
  requests: LabExamRequest[];
  updateRequests: (requests: LabExamRequest[]) => void;
  resultats: ResultatLaboratoire[];
  updateResultats: (resultats: ResultatLaboratoire[]) => void;
  user?: any;
}

const ResultatsTab: React.FC<ResultatsTabProps> = ({ requests, updateRequests, resultats, updateResultats, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<LabExamRequest | null>(null);
  const [medicalActs, setMedicalActs] = useState<MedicalAct[]>([]);
  
  // Form state for results
  const [currentResultat, setCurrentResultat] = useState<ResultatLaboratoire | null>(null);

  useEffect(() => {
    const savedActs = localStorage.getItem('hospital_medical_acts');
    if (savedActs) {
      setMedicalActs(JSON.parse(savedActs));
    }
  }, []);

  const readyRequests = requests.filter(r => 
    r.status === 'en cours' || 
    r.status === 'terminé'
  );
  
  const filteredRequests = readyRequests.filter(r => 
    r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.id.includes(searchTerm)
  );

  // Initialize or load result form when a request is selected
  useEffect(() => {
    if (selectedRequest) {
      const existingResult = resultats.find(r => r.demandeId === selectedRequest.id);
      if (existingResult) {
        setCurrentResultat(existingResult);
      } else {
        // Initialize new result
        const newLignes: LigneResultat[] = selectedRequest.exams.map(exam => {
          const act = medicalActs.find(a => a.id === exam.actId);
          const params: ParametreResultat[] = act?.labParameters?.map(p => ({
            nom: p.nom,
            unite: p.unite,
            valeurReference: p.valeurReferenceTexte || (p.valeurReferenceMin !== undefined && p.valeurReferenceMax !== undefined ? `${p.valeurReferenceMin} - ${p.valeurReferenceMax}` : ''),
            valeur: '',
            isAnormal: false
          })) || [{
            nom: 'Résultat',
            unite: '',
            valeurReference: '',
            valeur: '',
            isAnormal: false
          }];

          return {
            examId: exam.actId,
            examName: exam.name,
            parametres: params,
            conclusion: ''
          };
        });

        setCurrentResultat({
          id: `RES-${Date.now().toString().slice(-6)}`,
          demandeId: selectedRequest.id,
          patientId: selectedRequest.patientId,
          lignes: newLignes,
          statut: 'brouillon',
          saisiPar: user?.name || 'Technicien',
          dateSaisie: new Date().toISOString()
        });
      }
    } else {
      setCurrentResultat(null);
    }
  }, [selectedRequest, resultats, medicalActs, user]);

  const handleParamChange = (examId: string, paramIndex: number, value: string) => {
    if (!currentResultat) return;
    
    const updatedLignes = currentResultat.lignes.map(ligne => {
      if (ligne.examId === examId) {
        const updatedParams = [...ligne.parametres];
        updatedParams[paramIndex] = { ...updatedParams[paramIndex], valeur: value };
        
        // Check if abnormal based on reference values (simple check if numeric)
        const act = medicalActs.find(a => a.id === examId);
        const refParam = act?.labParameters?.[paramIndex];
        if (refParam && refParam.valeurReferenceMin !== undefined && refParam.valeurReferenceMax !== undefined) {
          const numVal = parseFloat(value);
          if (!isNaN(numVal)) {
            updatedParams[paramIndex].isAnormal = numVal < refParam.valeurReferenceMin || numVal > refParam.valeurReferenceMax;
          }
        }

        return { ...ligne, parametres: updatedParams };
      }
      return ligne;
    });

    setCurrentResultat({ ...currentResultat, lignes: updatedLignes });
  };

  const handleConclusionChange = (examId: string, value: string) => {
    if (!currentResultat) return;
    const updatedLignes = currentResultat.lignes.map(ligne => 
      ligne.examId === examId ? { ...ligne, conclusion: value } : ligne
    );
    setCurrentResultat({ ...currentResultat, lignes: updatedLignes });
  };

  const handleSave = (statut: 'brouillon' | 'prêt pour validation') => {
    if (!currentResultat || !selectedRequest) return;
    
    const updatedResultat = { ...currentResultat, statut, dateSaisie: new Date().toISOString() };
    
    const existingIndex = resultats.findIndex(r => r.id === updatedResultat.id);
    let newResultats;
    if (existingIndex >= 0) {
      newResultats = [...resultats];
      newResultats[existingIndex] = updatedResultat;
    } else {
      newResultats = [...resultats, updatedResultat];
    }
    
    updateResultats(newResultats);

    // Update request status if needed
    if (statut === 'prêt pour validation' && selectedRequest.status !== 'terminé') {
      const updatedRequests = requests.map(r => r.id === selectedRequest.id ? { ...r, status: 'terminé' as const } : r);
      updateRequests(updatedRequests);
    }

    if (statut === 'prêt pour validation') {
      setSelectedRequest(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Liste des demandes prêtes pour la saisie */}
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
            const res = resultats.find(r => r.demandeId === req.id);
            return (
              <div 
                key={req.id} 
                onClick={() => setSelectedRequest(req)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedRequest?.id === req.id ? 'bg-purple-50 border-purple-200 shadow-sm' : 'bg-white border-slate-100 hover:border-purple-100 hover:bg-slate-50'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{req.patientName}</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{req.id}</p>
                  </div>
                  {res?.statut === 'brouillon' ? (
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-lg">
                      BROUILLON
                    </span>
                  ) : res?.statut === 'prêt pour validation' ? (
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-lg">
                      À VALIDER
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-lg">
                      À SAISIR
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-3 text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock size={12} /> {new Date(req.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <span className="text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                    {req.exams.length} examen(s)
                  </span>
                </div>
              </div>
            );
          }) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <Activity size={48} className="mb-4 opacity-20" />
              <p className="font-bold">Aucune analyse en attente de résultats</p>
            </div>
          )}
        </div>
      </div>

      {/* Saisie des résultats */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
        {selectedRequest && currentResultat ? (
          <>
            <div className="p-6 border-b border-slate-100 shrink-0">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{selectedRequest.patientName}</h2>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><FileText size={14} /> Demande: {selectedRequest.id}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Statut Résultat</p>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    currentResultat.statut === 'brouillon' ? 'bg-slate-100 text-slate-700' :
                    currentResultat.statut === 'prêt pour validation' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {currentResultat.statut.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
              {currentResultat.lignes.map((ligne, idx) => (
                <div key={idx} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900">{ligne.examName}</h3>
                  </div>
                  
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                            <th className="pb-2 font-bold">Paramètre</th>
                            <th className="pb-2 font-bold w-1/3">Résultat</th>
                            <th className="pb-2 font-bold">Unité</th>
                            <th className="pb-2 font-bold">Valeurs de réf.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ligne.parametres.map((param, pIdx) => (
                            <tr key={pIdx} className="border-b border-slate-100 last:border-0">
                              <td className="py-3 text-sm font-medium text-slate-700">{param.nom}</td>
                              <td className="py-3 pr-4">
                                <div className="relative">
                                  <input 
                                    type="text" 
                                    value={param.valeur}
                                    onChange={(e) => handleParamChange(ligne.examId, pIdx, e.target.value)}
                                    className={`w-full p-2 border rounded-lg text-sm font-bold outline-none transition-all ${
                                      param.isAnormal 
                                        ? 'border-rose-300 bg-rose-50 text-rose-700 focus:ring-2 focus:ring-rose-500/20' 
                                        : 'border-slate-200 bg-white focus:ring-2 focus:ring-purple-500/20'
                                    }`}
                                    placeholder="Valeur..."
                                  />
                                  {param.isAnormal && (
                                    <AlertTriangle size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-rose-500" />
                                  )}
                                </div>
                              </td>
                              <td className="py-3 text-sm text-slate-500">{param.unite}</td>
                              <td className="py-3 text-xs text-slate-400">{param.valeurReference}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Conclusion / Interprétation (Optionnel)</label>
                      <textarea 
                        value={ligne.conclusion || ''}
                        onChange={(e) => handleConclusionChange(ligne.examId, e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 outline-none min-h-[80px]"
                        placeholder="Ajouter une conclusion spécifique à cet examen..."
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Commentaire global (Optionnel)</label>
                <textarea 
                  value={currentResultat.commentaireGlobal || ''}
                  onChange={(e) => setCurrentResultat({...currentResultat, commentaireGlobal: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 outline-none min-h-[100px]"
                  placeholder="Commentaire général sur l'ensemble des résultats..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-between items-center">
              <div className="text-sm text-slate-500">
                Saisi par: <span className="font-bold text-slate-700">{currentResultat.saisiPar}</span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleSave('brouillon')}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Save size={18} /> Enregistrer brouillon
                </button>
                <button 
                  onClick={() => handleSave('prêt pour validation')}
                  className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle size={18} /> Soumettre pour validation
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <Activity size={64} className="mb-6 opacity-20" />
            <h2 className="text-xl font-bold text-slate-600 mb-2">Sélectionnez une demande</h2>
            <p className="text-sm max-w-md">Choisissez une demande pour saisir les résultats des analyses.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultatsTab;
