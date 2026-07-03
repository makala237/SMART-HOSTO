import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Trash2, Printer, CreditCard, DollarSign, User, FileText, AlertTriangle, CheckCircle, ShoppingCart, X } from 'lucide-react';
import { PaymentRequest, LigneFacturation, TransactionFacturation, AvoirPatient, DettePatient, HistoriqueFinancierPatient, ParametresCaisse } from '../../types';

interface FacturationToolProps {
  user: any;
  paymentRequests: PaymentRequest[];
  setPaymentRequests: React.Dispatch<React.SetStateAction<PaymentRequest[]>>;
  transactions: TransactionFacturation[];
  setTransactions: React.Dispatch<React.SetStateAction<TransactionFacturation[]>>;
  avoirs: AvoirPatient[];
  setAvoirs: React.Dispatch<React.SetStateAction<AvoirPatient[]>>;
  dettes: DettePatient[];
  setDettes: React.Dispatch<React.SetStateAction<DettePatient[]>>;
  parametres: ParametresCaisse;
}

export const FacturationTool: React.FC<FacturationToolProps> = ({
  user,
  paymentRequests,
  setPaymentRequests,
  transactions,
  setTransactions,
  avoirs,
  setAvoirs,
  dettes,
  setDettes,
  parametres
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [lignes, setLignes] = useState<LigneFacturation[]>([]);
  const [montantRemis, setMontantRemis] = useState<string>('');
  const [modePaiement, setModePaiement] = useState<'CASH' | 'CARD' | 'MOBILE_MONEY' | 'TRANSFER' | 'CHECK' | 'OTHER'>('CASH');
  const [useAvoir, setUseAvoir] = useState<boolean>(parametres.applicationAutoAvoir);

  // Pour l'ajout direct
  const [newItemLibelle, setNewItemLibelle] = useState('');
  const [newItemPrix, setNewItemPrix] = useState('');
  const [newItemQte, setNewItemQte] = useState('1');

  // Reçu
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<TransactionFacturation | null>(null);

  // Historique patient
  const patientAvoirs = useMemo(() => avoirs.filter(a => a.patientId === selectedPatientId && a.status === 'AVAILABLE'), [avoirs, selectedPatientId]);
  const patientDettes = useMemo(() => dettes.filter(d => d.patientId === selectedPatientId && (d.status === 'PENDING' || d.status === 'PARTIAL')), [dettes, selectedPatientId]);
  
  const totalAvoirDispo = patientAvoirs.reduce((sum, a) => sum + a.montant, 0);
  const totalDetteEnCours = patientDettes.reduce((sum, d) => sum + d.montantRestant, 0);

  // Calculs
  const sousTotal = lignes.reduce((sum, l) => sum + l.montantTotal, 0);
  const montantAvoirApplique = useAvoir ? Math.min(sousTotal, totalAvoirDispo) : 0;
  const totalGeneral = sousTotal - montantAvoirApplique;
  
  const remis = parseFloat(montantRemis) || 0;
  const resteAPayer = Math.max(0, totalGeneral - remis);
  const surplus = Math.max(0, remis - totalGeneral);

  // Validation
  const canValidate = useMemo(() => {
    if (lignes.length === 0) return false;
    if (remis >= totalGeneral) return true;
    
    // Paiement partiel
    if (!parametres.paiementPartielAutorise) return false;
    if (!parametres.detteAutorisee) return false;
    
    // Vérification seuil dette
    const nouvelleDetteTotale = totalDetteEnCours + resteAPayer;
    if (nouvelleDetteTotale > parametres.seuilDetteMax) {
      // Seuls certains rôles peuvent autoriser le dépassement
      const hasPermission = parametres.permissions.autoriserDette.includes(user.role);
      if (!hasPermission) return false;
    }
    
    return true;
  }, [lignes, remis, totalGeneral, parametres, totalDetteEnCours, resteAPayer, user.role]);

  // Chargement des demandes en attente pour le patient sélectionné
  useEffect(() => {
    if (!selectedPatientId) return;
    
    const pendingForPatient = paymentRequests.filter(pr => 
      pr.patientId === selectedPatientId && 
      (pr.status === 'PENDING' || pr.status === 'PARTIAL')
    );
    
    const newLignes: LigneFacturation[] = [];
    pendingForPatient.forEach(pr => {
      pr.items.forEach(item => {
        // Ne pas ajouter en double si déjà présent
        if (!lignes.find(l => l.id === `${pr.id}-${item.id}`)) {
          newLignes.push({
            id: `${pr.id}-${item.id}`,
            libelle: item.name,
            source: pr.sourceModule,
            quantite: item.quantity,
            prixUnitaire: item.unitPrice,
            montantTotal: item.totalPrice,
            paymentRequestId: pr.id
          });
        }
      });
    });
    
    if (newLignes.length > 0) {
      setLignes(prev => [...prev, ...newLignes]);
    }
  }, [selectedPatientId, paymentRequests]);

  const handleAddDirectItem = () => {
    if (!newItemLibelle || !newItemPrix || !newItemQte) return;
    
    const prix = parseFloat(newItemPrix);
    const qte = parseInt(newItemQte);
    
    const newLigne: LigneFacturation = {
      id: `DIRECT-${Date.now()}`,
      libelle: newItemLibelle,
      source: 'Achat Direct',
      quantite: qte,
      prixUnitaire: prix,
      montantTotal: prix * qte
    };
    
    setLignes([...lignes, newLigne]);
    setNewItemLibelle('');
    setNewItemPrix('');
    setNewItemQte('1');
  };

  const handleRemoveLigne = (id: string) => {
    setLignes(lignes.filter(l => l.id !== id));
  };

  const handleValidate = () => {
    if (!canValidate || !selectedPatientId) return;

    const transactionId = parametres.technique.formatTransaction.replace('YYYYMMDD', new Date().toISOString().split('T')[0].replace(/-/g, '')).replace('XXXX', Math.floor(Math.random() * 10000).toString().padStart(4, '0'));

    const nouvelleTransaction: TransactionFacturation = {
      id: transactionId,
      patientId: selectedPatientId,
      patientName: selectedPatientId, // Idéalement récupérer le vrai nom
      date: new Date().toISOString(),
      lignes: [...lignes],
      sousTotal,
      totalGeneral,
      montantPaye: remis,
      avoirUtilise: montantAvoirApplique,
      surplusConserve: parametres.avoirPatientAutorise ? surplus : 0,
      detteCreee: resteAPayer,
      modePaiement,
      caissierId: user.id,
      caissierName: user.name,
      status: 'VALIDATED'
    };

    // 1. Sauvegarder la transaction
    setTransactions(prev => [...prev, nouvelleTransaction]);

    // 2. Gérer l'avoir utilisé
    if (montantAvoirApplique > 0) {
      let restantAUtiliser = montantAvoirApplique;
      const updatedAvoirs = [...avoirs];
      
      for (let i = 0; i < updatedAvoirs.length; i++) {
        if (updatedAvoirs[i].patientId === selectedPatientId && updatedAvoirs[i].status === 'AVAILABLE') {
          if (updatedAvoirs[i].montant <= restantAUtiliser) {
            restantAUtiliser -= updatedAvoirs[i].montant;
            updatedAvoirs[i].status = 'USED';
          } else {
            // Avoir partiellement utilisé, on crée un nouvel avoir pour le reste
            const reste = updatedAvoirs[i].montant - restantAUtiliser;
            updatedAvoirs[i].status = 'USED';
            updatedAvoirs.push({
              id: `AV-${Date.now()}`,
              patientId: selectedPatientId,
              montant: reste,
              dateCreation: new Date().toISOString(),
              transactionSourceId: transactionId,
              status: 'AVAILABLE'
            });
            restantAUtiliser = 0;
          }
        }
        if (restantAUtiliser <= 0) break;
      }
      setAvoirs(updatedAvoirs);
    }

    // 3. Gérer le nouveau surplus (nouvel avoir)
    if (surplus > 0 && parametres.avoirPatientAutorise) {
      setAvoirs(prev => [...prev, {
        id: `AV-${Date.now()}`,
        patientId: selectedPatientId,
        montant: surplus,
        dateCreation: new Date().toISOString(),
        transactionSourceId: transactionId,
        status: 'AVAILABLE'
      }]);
    }

    // 4. Gérer la nouvelle dette
    if (resteAPayer > 0) {
      setDettes(prev => [...prev, {
        id: `DT-${Date.now()}`,
        patientId: selectedPatientId,
        montantInitial: resteAPayer,
        montantRestant: resteAPayer,
        dateCreation: new Date().toISOString(),
        transactionSourceId: transactionId,
        status: 'PENDING'
      }]);
    }

    // 5. Mettre à jour les PaymentRequests
    const prIds = [...new Set(lignes.map(l => l.paymentRequestId).filter(Boolean))] as string[];
    if (prIds.length > 0) {
      setPaymentRequests(prev => prev.map(pr => {
        if (prIds.includes(pr.id)) {
          // Simplification : on marque comme payé si inclus dans la transaction
          return { ...pr, status: 'PAID', amountPaid: pr.totalAmount };
        }
        return pr;
      }));
    }

    // Reset
    setLignes([]);
    setMontantRemis('');
    setLastTransaction(nouvelleTransaction);
    setShowReceipt(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 flex-1 overflow-hidden">
        
        {/* Colonne Gauche: Lignes de facturation */}
        <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
          
          {/* Zone 1: Identification Patient */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 shrink-0">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <User size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-black text-slate-900">Identification Patient</h2>
                <p className="text-sm text-slate-500">Sélectionnez un patient pour consolider ses factures</p>
              </div>
              <div className="w-1/3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="ID Patient (ex: P-101)" 
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Zone 2: Lignes de facturation */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                Lignes de facturation
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {lignes.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <ShoppingCart size={48} className="mb-4 opacity-20" />
                  <p>Aucune ligne de facturation</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100">
                      <th className="pb-3 font-black">Libellé</th>
                      <th className="pb-3 font-black">Source</th>
                      <th className="pb-3 font-black text-right">Qte</th>
                      <th className="pb-3 font-black text-right">P.U</th>
                      <th className="pb-3 font-black text-right">Total</th>
                      <th className="pb-3 font-black text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {lignes.map(ligne => (
                      <tr key={ligne.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-bold text-slate-900 text-sm">{ligne.libelle}</td>
                        <td className="py-3 text-xs text-slate-500">
                          <span className="px-2 py-1 bg-slate-100 rounded-md">{ligne.source}</span>
                        </td>
                        <td className="py-3 text-sm text-slate-600 text-right">{ligne.quantite}</td>
                        <td className="py-3 text-sm text-slate-600 text-right">{ligne.prixUnitaire.toLocaleString()}</td>
                        <td className="py-3 font-bold text-blue-600 text-right">{ligne.montantTotal.toLocaleString()}</td>
                        <td className="py-3 text-center">
                          <button onClick={() => handleRemoveLigne(ligne.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Ajout direct */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Libellé (Achat direct)" 
                  value={newItemLibelle}
                  onChange={e => setNewItemLibelle(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
                <input 
                  type="number" 
                  placeholder="Prix U." 
                  value={newItemPrix}
                  onChange={e => setNewItemPrix(e.target.value)}
                  className="w-24 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
                <input 
                  type="number" 
                  placeholder="Qte" 
                  value={newItemQte}
                  onChange={e => setNewItemQte(e.target.value)}
                  className="w-16 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
                <button 
                  onClick={handleAddDirectItem}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm font-bold"
                >
                  <Plus size={16} /> Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne Droite: Historique & Encaissement */}
        <div className="flex flex-col gap-6 overflow-hidden">
          
          {/* Zone 3: Historique Financier */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 shrink-0">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
              <CreditCard size={18} className="text-emerald-600" />
              Historique Financier
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Avoir Disponible</p>
                <p className="text-xl font-black text-emerald-700">{totalAvoirDispo.toLocaleString()} <span className="text-xs">FCFA</span></p>
              </div>
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Dette en cours</p>
                <p className="text-xl font-black text-rose-700">{totalDetteEnCours.toLocaleString()} <span className="text-xs">FCFA</span></p>
              </div>
            </div>
            
            {totalDetteEnCours > parametres.seuilDetteMax && (
              <div className="mt-4 p-3 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-start gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <p>Attention: Le seuil de dette autorisé ({parametres.seuilDetteMax} FCFA) est dépassé.</p>
              </div>
            )}
          </div>

          {/* Zone 4: Encaissement */}
          <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white flex flex-col flex-1">
            <h3 className="font-bold flex items-center gap-2 mb-6 text-slate-300">
              <DollarSign size={18} />
              Encaissement & Validation
            </h3>

            <div className="space-y-4 mb-6 flex-1">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <span className="text-slate-400">Sous-total</span>
                <span className="font-bold">{sousTotal.toLocaleString()} FCFA</span>
              </div>
              
              {totalAvoirDispo > 0 && (
                <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={useAvoir} 
                      onChange={(e) => setUseAvoir(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-emerald-400">Utiliser l'avoir</span>
                  </div>
                  <span className="font-bold text-emerald-400">-{montantAvoirApplique.toLocaleString()} FCFA</span>
                </div>
              )}

              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <span className="text-lg font-black text-white">Net à payer</span>
                <span className="text-2xl font-black text-blue-400">{totalGeneral.toLocaleString()} FCFA</span>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Montant remis par le patient</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={montantRemis}
                    onChange={(e) => setMontantRemis(e.target.value)}
                    className="w-full pl-4 pr-16 py-4 rounded-xl bg-slate-800 border border-slate-700 text-white font-black text-xl focus:border-blue-500 outline-none"
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-500">FCFA</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                {['CASH', 'MOBILE_MONEY', 'CARD'].map((mode) => (
                  <button 
                    key={mode}
                    onClick={() => setModePaiement(mode as any)}
                    className={`py-2 rounded-lg text-xs font-bold border ${modePaiement === mode ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                  >
                    {mode === 'CASH' ? 'Espèces' : mode === 'CARD' ? 'Carte' : 'Mobile'}
                  </button>
                ))}
              </div>

              {surplus > 0 && (
                <div className="p-3 bg-emerald-900/30 border border-emerald-800/50 rounded-lg flex justify-between items-center">
                  <span className="text-xs text-emerald-400 font-medium">Monnaie à rendre / Nouvel Avoir</span>
                  <span className="font-bold text-emerald-400">{surplus.toLocaleString()} FCFA</span>
                </div>
              )}

              {resteAPayer > 0 && remis > 0 && (
                <div className="p-3 bg-rose-900/30 border border-rose-800/50 rounded-lg flex justify-between items-center">
                  <span className="text-xs text-rose-400 font-medium">Reste à payer (Nouvelle Dette)</span>
                  <span className="font-bold text-rose-400">{resteAPayer.toLocaleString()} FCFA</span>
                </div>
              )}
            </div>

            <button 
              onClick={handleValidate}
              disabled={!canValidate}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} />
              Valider & Imprimer
            </button>
          </div>
        </div>
      </div>

      {/* Modal Reçu */}
      {showReceipt && lastTransaction && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Printer size={18} className="text-blue-600" />
                Aperçu du reçu
              </h3>
              <button onClick={() => setShowReceipt(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-50" id="receipt-content">
              <div className="bg-white p-6 shadow-sm border border-slate-200" style={{ width: '80mm', margin: '0 auto', fontFamily: 'monospace' }}>
                <div className="text-center mb-4">
                  <h2 className="font-bold text-lg">{parametres.impression.nomClinique}</h2>
                  <p className="text-xs">{parametres.impression.adresse}</p>
                  <p className="text-xs">{parametres.impression.telephone}</p>
                  <p className="text-xs italic mt-1">{parametres.impression.slogan}</p>
                </div>
                
                <div className="border-t border-b border-dashed border-slate-300 py-2 mb-4 text-xs">
                  <p>Reçu N°: {lastTransaction.id}</p>
                  <p>Date: {new Date(lastTransaction.date).toLocaleString('fr-FR')}</p>
                  <p>Patient: {lastTransaction.patientName}</p>
                  <p>Caissier: {lastTransaction.caissierName}</p>
                </div>

                <div className="mb-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left pb-1">Désignation</th>
                        <th className="text-right pb-1">Qte</th>
                        <th className="text-right pb-1">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lastTransaction.lignes.map((ligne, idx) => (
                        <tr key={idx}>
                          <td className="py-1">{ligne.libelle}</td>
                          <td className="text-right py-1">{ligne.quantite}</td>
                          <td className="text-right py-1">{ligne.montantTotal.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-slate-300 pt-2 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Sous-total:</span>
                    <span>{lastTransaction.sousTotal.toLocaleString()} CFA</span>
                  </div>
                  {lastTransaction.avoirUtilise > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Avoir utilisé:</span>
                      <span>-{lastTransaction.avoirUtilise.toLocaleString()} CFA</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm mt-1 border-t border-slate-200 pt-1">
                    <span>Net à payer:</span>
                    <span>{lastTransaction.totalGeneral.toLocaleString()} CFA</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span>Montant remis:</span>
                    <span>{lastTransaction.montantPaye.toLocaleString()} CFA</span>
                  </div>
                  {lastTransaction.surplusConserve > 0 && (
                    <div className="flex justify-between">
                      <span>Monnaie rendue:</span>
                      <span>{lastTransaction.surplusConserve.toLocaleString()} CFA</span>
                    </div>
                  )}
                  {lastTransaction.detteCreee > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Reste à payer:</span>
                      <span>{lastTransaction.detteCreee.toLocaleString()} CFA</span>
                    </div>
                  )}
                  <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                    <span>Mode:</span>
                    <span>{lastTransaction.modePaiement}</span>
                  </div>
                </div>

                <div className="mt-6 text-center text-[10px] text-slate-500">
                  <p>{parametres.impression.piedDePage}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex gap-2 bg-white">
              <button 
                onClick={() => setShowReceipt(false)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-colors"
              >
                Fermer
              </button>
              <button 
                onClick={() => {
                  window.print();
                  // Dans un vrai cas, on utiliserait une librairie pour imprimer juste le div #receipt-content
                }}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
              >
                <Printer size={18} /> Imprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
