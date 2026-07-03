import React, { useState, useMemo } from 'react';
import { CreditCard, DollarSign, ArrowUpRight, Printer, Search, Calendar, Landmark, CheckCircle2, Edit3, X, Calculator, Wallet, Clock, FileText, Home } from 'lucide-react';
import { PaymentRequest, CashierTransaction, PaymentStatus, TransactionFacturation, AvoirPatient, DettePatient, ParametresCaisse } from '../types';
import { FacturationTool } from './tools/FacturationTool';

interface CashierProps {
  user: any;
  paymentRequests: PaymentRequest[];
  setPaymentRequests: React.Dispatch<React.SetStateAction<PaymentRequest[]>>;
  cashierTransactions: CashierTransaction[];
  setCashierTransactions: React.Dispatch<React.SetStateAction<CashierTransaction[]>>;
  transactionsFacturation: TransactionFacturation[];
  setTransactionsFacturation: React.Dispatch<React.SetStateAction<TransactionFacturation[]>>;
  avoirsPatient: AvoirPatient[];
  setAvoirsPatient: React.Dispatch<React.SetStateAction<AvoirPatient[]>>;
  dettesPatient: DettePatient[];
  setDettesPatient: React.Dispatch<React.SetStateAction<DettePatient[]>>;
  parametresCaisse: ParametresCaisse;
  activeTab: 'facturation' | 'pending' | 'daily' | 'search';
  setActiveTab: (tab: 'facturation' | 'pending' | 'daily' | 'search') => void;
  onBackToDashboard: () => void;
}

const Cashier: React.FC<CashierProps> = ({ 
  user, 
  paymentRequests, 
  setPaymentRequests, 
  cashierTransactions, 
  setCashierTransactions,
  transactionsFacturation,
  setTransactionsFacturation,
  avoirsPatient,
  setAvoirsPatient,
  dettesPatient,
  setDettesPatient,
  parametresCaisse,
  activeTab,
  setActiveTab,
  onBackToDashboard
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'MOBILE_MONEY' | 'TRANSFER' | 'CHECK'>('CASH');

  const pendingRequests = useMemo(() => {
    return paymentRequests.filter(pr => pr.status === 'PENDING' || pr.status === 'PARTIAL');
  }, [paymentRequests]);

  const dailyTransactions = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return cashierTransactions.filter(tx => tx.date.startsWith(todayStr));
  }, [cashierTransactions]);

  const handleOpenPayment = (request: PaymentRequest) => {
    setSelectedRequest(request);
    setShowPaymentModal(true);
    const remaining = request.totalAmount - request.amountPaid;
    setPaymentAmount(remaining.toString());
    setPaymentMethod('CASH');
  };

  const processPayment = () => {
    if (!selectedRequest) return;
    const amount = parseFloat(paymentAmount) || 0;
    if (amount <= 0) return;

    const remaining = selectedRequest.totalAmount - selectedRequest.amountPaid;
    if (amount > remaining) {
      alert("Le montant saisi est supérieur au reliquat dû.");
      return;
    }

    const newTransaction: CashierTransaction = {
      id: `TX-${Math.floor(Math.random() * 1000000)}`,
      paymentRequestId: selectedRequest.id,
      amount: amount,
      paymentMethod: paymentMethod,
      date: new Date().toISOString(),
      cashierId: user.id,
      cashierName: user.name,
    };

    setCashierTransactions(prev => [...prev, newTransaction]);

    setPaymentRequests(prev => prev.map(pr => {
      if (pr.id === selectedRequest.id) {
        const newPaid = pr.amountPaid + amount;
        const newStatus: PaymentStatus = newPaid >= pr.totalAmount ? 'PAID' : 'PARTIAL';
        return {
          ...pr,
          amountPaid: newPaid,
          status: newStatus
        };
      }
      return pr;
    }));

    setShowPaymentModal(false);
    setSelectedRequest(null);
  };

  return (
    <div className="p-8 text-slate-900">
      <header className="flex justify-between items-end bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm mb-10">
         <div className="flex items-center gap-6">
           <button 
             onClick={onBackToDashboard}
             className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg group"
             title="Retour au Dashboard"
           >
             <Home size={24} className="group-hover:scale-110 transition-transform" />
           </button>
           <div>
             <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 italic">
               <CreditCard size={32} className="text-blue-600" />
               {activeTab === 'facturation' ? 'Facturation' : 
                activeTab === 'pending' ? 'Demandes en Attente' : 
                activeTab === 'daily' ? 'Transactions du jour' : 'Rechercher'}
             </h1>
             <p className="text-sm font-medium text-slate-500 italic">Caisse Centrale • Gestion des encaissements et facturation</p>
           </div>
         </div>
         
         <div className="text-right hidden md:block">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisateur</p>
           <p className="font-bold text-slate-900 text-sm">{user.name}</p>
         </div>
      </header>

      {activeTab === 'facturation' && (
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-200px)]">
          <FacturationTool 
            user={user}
            paymentRequests={paymentRequests}
            setPaymentRequests={setPaymentRequests}
            transactions={transactionsFacturation}
            setTransactions={setTransactionsFacturation}
            avoirs={avoirsPatient}
            setAvoirs={setAvoirsPatient}
            dettes={dettesPatient}
            setDettes={setDettesPatient}
            parametres={parametresCaisse}
          />
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-black text-[10px] uppercase tracking-widest italic flex items-center gap-2"><FileText size={16} /> Demandes de paiement en attente</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingRequests.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium">Aucune demande en attente.</div>
            ) : (
              pendingRequests.map((pr) => (
                <div key={pr.id} className="p-8 hover:bg-slate-50 group transition-all flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                      <DollarSign size={24} />
                    </div>
                    <div>
                      <p className="font-black text-lg text-slate-900">{pr.patientName}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs font-bold text-slate-500">
                        <span className="uppercase tracking-wider">{pr.id}</span>
                        <span>•</span>
                        <span className="uppercase tracking-wider">{pr.sourceModule}</span>
                        <span>•</span>
                        <span>{new Date(pr.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total à payer</p>
                      <p className="font-black text-xl text-slate-900">{pr.totalAmount.toLocaleString()} CFA</p>
                      {pr.amountPaid > 0 && (
                        <p className="text-xs font-bold text-rose-500 mt-1">Reste: {(pr.totalAmount - pr.amountPaid).toLocaleString()} CFA</p>
                      )}
                    </div>
                    <button 
                      onClick={() => handleOpenPayment(pr)}
                      className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black hover:bg-emerald-600 transition-all flex items-center gap-2"
                    >
                      <CreditCard size={18} /> Encaisser
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'daily' && (
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-black text-[10px] uppercase tracking-widest italic flex items-center gap-2"><Landmark size={16} /> Transactions du jour</h3>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Encaissé</p>
              <p className="font-black text-xl text-emerald-600">{dailyTransactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()} CFA</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {dailyTransactions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium">Aucune transaction aujourd'hui.</div>
            ) : (
              dailyTransactions.map((tx) => {
                const pr = paymentRequests.find(p => p.id === tx.paymentRequestId);
                return (
                  <div key={tx.id} className="p-8 hover:bg-slate-50 group transition-all flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <p className="font-black text-lg text-slate-900">{pr?.patientName || 'Patient Inconnu'}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs font-bold text-slate-500">
                          <span className="uppercase tracking-wider">{tx.id}</span>
                          <span>•</span>
                          <span className="uppercase tracking-wider">Demande: {tx.paymentRequestId}</span>
                          <span>•</span>
                          <span>{new Date(tx.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Montant</p>
                        <p className="font-black text-xl text-emerald-600">+{tx.amount.toLocaleString()} CFA</p>
                        <p className="text-xs font-bold text-slate-500 mt-1">{tx.paymentMethod}</p>
                      </div>
                      <button className="p-3 text-slate-300 hover:text-blue-600 hover:bg-white rounded-2xl transition-all shadow-sm">
                        <Printer size={18} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {showPaymentModal && selectedRequest && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="p-10">
                <div className="flex justify-between items-center mb-10">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white"><Calculator size={20} /></div>
                      <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter">Encaissement</h2>
                        <p className="text-[10px] font-bold text-slate-400">DEMANDE {selectedRequest.id}</p>
                      </div>
                   </div>
                   <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} className="text-slate-400" /></button>
                </div>

                <div className="mb-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="font-black text-lg text-slate-900 mb-1">{selectedRequest.patientName}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{selectedRequest.type} • {selectedRequest.sourceModule}</p>
                </div>

                <div className="space-y-6 mb-10">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Facture</p>
                        <p className="font-black text-xl">{selectedRequest.totalAmount.toLocaleString()} CFA</p>
                      </div>
                      <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100">
                        <p className="text-[10px] font-black text-rose-400 uppercase mb-1">Reste à payer</p>
                        <p className="font-black text-xl text-rose-600">{(selectedRequest.totalAmount - selectedRequest.amountPaid).toLocaleString()} CFA</p>
                      </div>
                   </div>

                   <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Montant reçu</label>
                     <div className="relative group">
                        <Wallet className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500" size={24} />
                        <input 
                          type="number" 
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder="Montant..."
                          className="w-full pl-16 pr-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:outline-none focus:border-emerald-500 font-black text-xl"
                          max={selectedRequest.totalAmount - selectedRequest.amountPaid}
                        />
                     </div>
                   </div>

                   <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Moyen de paiement</label>
                     <div className="grid grid-cols-3 gap-2">
                       {['CASH', 'CARD', 'MOBILE_MONEY'].map((method) => (
                         <button
                           key={method}
                           onClick={() => setPaymentMethod(method as any)}
                           className={`py-3 rounded-xl font-bold text-xs transition-all ${paymentMethod === method ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                         >
                           {method === 'CASH' ? 'Espèces' : method === 'CARD' ? 'Carte' : 'Mobile'}
                         </button>
                       ))}
                     </div>
                   </div>
                </div>

                <button 
                  onClick={processPayment}
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                  className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black shadow-xl hover:bg-emerald-600 transition-all disabled:opacity-50"
                >
                  Valider l'encaissement
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cashier;
