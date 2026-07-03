
import React, { useState, useEffect } from 'react';
import { Pill, Search, ShoppingCart, Clock, CheckCircle, FileText, Package, Home } from 'lucide-react';
import { PaymentRequest, User } from '../types';
import { db } from '../src/firebase';
import { collection, doc, deleteDoc, onSnapshot, query, orderBy, setDoc } from 'firebase/firestore';

interface PharmacyProps {
  paymentRequests?: PaymentRequest[];
  setPaymentRequests?: React.Dispatch<React.SetStateAction<PaymentRequest[]>>;
  user?: User;
  activeTab: 'prescriptions' | 'sales';
  setActiveTab: (tab: 'prescriptions' | 'sales') => void;
  onBackToDashboard: () => void;
}

const Pharmacy: React.FC<PharmacyProps> = ({ 
  paymentRequests = [], 
  setPaymentRequests, 
  user,
  activeTab,
  setActiveTab,
  onBackToDashboard
}) => {
  const [pendingPrescriptions, setPendingPrescriptions] = useState<any[]>([]);

  const staticFallback = [
    { id: 'ORD-552', patient: 'KOULIBALY Youssouf', patientId: 'P-101', doctor: 'Dr. Sarr', date: 'Aujourd\'hui, 10:20', items: [{name: 'Paracétamol 500mg', price: 500}, {name: 'Amoxicilline 1g', price: 2500}] },
    { id: 'ORD-553', patient: 'SYLLA Mariam', patientId: 'P-102', doctor: 'Dr. Keita', date: 'Aujourd\'hui, 11:45', items: [{name: 'Spasfon', price: 1500}, {name: 'Gaviscon', price: 3000}] }
  ];

  useEffect(() => {
    try {
      const q = query(collection(db, 'pending_prescriptions'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(docSnap => ({
          firebaseId: docSnap.id,
          ...docSnap.data()
        }));

        const mapped = list.map((item: any) => ({
          id: item.id || item.firebaseId,
          firebaseId: item.firebaseId,
          patient: item.patient || 'Patient',
          patientId: item.patientId || 'P-999',
          doctor: item.doctor || 'Dr. Sarr',
          date: item.date || 'Aujourd\'hui',
          items: item.items || []
        }));

        const merged: any[] = [...mapped];
        staticFallback.forEach(sf => {
          if (!merged.find(item => item.id === sf.id)) {
            merged.push(sf);
          }
        });

        setPendingPrescriptions(merged);
      }, (error) => {
        console.warn("Firestore subscription warn: ", error);
        setPendingPrescriptions(staticFallback);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error(e);
      setPendingPrescriptions(staticFallback);
    }
  }, []);

  const handleDeliver = async (presc: any) => {
    if (!setPaymentRequests) return;

    const totalAmount = presc.items.reduce((sum: number, item: any) => sum + item.price, 0);

    const newPaymentRequest: PaymentRequest = {
      id: `PR-${Math.floor(Math.random() * 1000000)}`,
      patientId: presc.patientId,
      patientName: presc.patient,
      requestingService: 'Pharmacie',
      sourceModule: 'Pharmacie',
      type: 'PHARMACIE',
      items: presc.items.map((item: any, index: number) => ({
        id: `item-${index}`,
        name: item.name,
        quantity: 1,
        unitPrice: item.price,
        totalPrice: item.price
      })),
      totalAmount: totalAmount,
      amountPaid: 0,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      createdBy: user?.name || 'Pharmacien'
    };

    try {
      // Create PaymentRequest in Firestore as well for cross-module integration (cashier/accounting)
      await setDoc(doc(db, 'payment_requests', newPaymentRequest.id), newPaymentRequest);

      // Create Audit Log
      const today = new Date();
      await setDoc(doc(collection(db, 'audit_logs')), {
        user: user?.name || 'Pharmacien',
        role: 'PHARMACIST',
        date: today.toLocaleDateString('fr-FR'),
        time: today.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        timestamp: today.toISOString(),
        action: `Délivrance pharmacie - Patient : ${presc.patient}`,
        details: { prescId: presc.id, totalAmount },
        module: 'Pharmacie'
      });

      // Clear from database
      if (presc.firebaseId) {
        await deleteDoc(doc(db, 'pending_prescriptions', presc.firebaseId));
      }
    } catch (err) {
      console.warn("Offline fallback triggered: ", err);
    }

    setPaymentRequests(prev => [...prev, newPaymentRequest]);
    setPendingPrescriptions(prev => prev.filter(p => p.id !== presc.id));
    alert(`Demande de paiement envoyée à la caisse pour ${presc.patient} (${totalAmount} FCFA)`);
  };

  return (
    <div className="p-8">
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
               <Pill size={32} className="text-blue-600" />
               {activeTab === 'prescriptions' ? 'Ordonnances en attente' : 'Vente Directe / Stock'}
             </h1>
             <p className="text-sm font-medium text-slate-500 italic">Pharmacie de l'Hôpital • Délivrance, vente directe et suivi des stocks officinaux.</p>
           </div>
         </div>
         
         <div className="text-right hidden md:block">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisateur</p>
           <p className="font-bold text-slate-900 text-sm">{user ? user.name : 'Pharmacien'}</p>
         </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {activeTab === 'prescriptions' ? (
            <div className="space-y-4">
              {pendingPrescriptions.map(presc => (
                <div key={presc.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-500 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{presc.patient}</h3>
                        <p className="text-xs text-slate-500">{presc.doctor} • {presc.date}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">{presc.id}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {presc.items.map((item, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium border border-slate-200">
                        {item.name} - {item.price} FCFA
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleDeliver(presc)}
                      className="flex-1 bg-emerald-600 text-white py-3 rounded-2xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={18} />
                      Délivrer & Facturer
                    </button>
                    <button className="px-6 py-3 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50">
                      Imprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                  <h2 className="font-bold flex items-center gap-2"><Package size={18} className="text-emerald-500" /> Inventaire Officinal</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="Chercher médicament..." className="pl-10 pr-4 py-2 bg-white border rounded-xl text-sm" />
                  </div>
               </div>
               <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                    <tr>
                      <th className="p-6">Produit</th>
                      <th className="p-6">Stock</th>
                      <th className="p-6">Prix (CFA)</th>
                      <th className="p-6">Expiration</th>
                      <th className="p-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { name: 'Paracétamol 500mg', stock: 450, price: 500, expiry: '12/2026', alert: false },
                      { name: 'Amoxicilline 1g', stock: 12, price: 2500, expiry: '08/2024', alert: true },
                      { name: 'Artemether 80mg', stock: 85, price: 4500, expiry: '05/2025', alert: false },
                    ].map((m, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="p-6 font-bold text-slate-900">{m.name}</td>
                        <td className="p-6">
                          <span className={`font-black ${m.alert ? 'text-red-500' : 'text-slate-900'}`}>{m.stock}</span>
                          <span className="text-[10px] text-slate-400 ml-1">unités</span>
                        </td>
                        <td className="p-6 font-bold">{m.price}</td>
                        <td className="p-6 text-sm text-slate-500">{m.expiry}</td>
                        <td className="p-6 text-right">
                          <button className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-black">Vendre</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <ShoppingCart size={20} className="text-emerald-400" />
              Panier en cours
            </h3>
            <div className="space-y-3 mb-6">
              <p className="text-sm text-slate-400 italic">Le panier est vide</p>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-between items-center mb-6">
              <span className="text-sm font-medium">Total</span>
              <span className="text-xl font-black">0 CFA</span>
            </div>
            <button className="w-full bg-emerald-600 py-3 rounded-2xl font-bold opacity-50 cursor-not-allowed">
              Encaisser la vente
            </button>
          </div>

          <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
            <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2 text-sm uppercase">
              <Clock size={16} /> Alertes Stock
            </h4>
            <p className="text-xs text-amber-700 leading-relaxed">
              3 produits sont proches de la date d'expiration. Pensez à appliquer la règle FEFO (First Expired, First Out).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pharmacy;
