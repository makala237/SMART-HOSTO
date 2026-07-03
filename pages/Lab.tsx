
import React, { useState, useEffect } from 'react';
import { Beaker, Search, FlaskConical, AlertTriangle, CheckCircle, Clock, FileText, ClipboardList, Activity, ShieldCheck, Printer, Home } from 'lucide-react';
import { LabExamRequest, ResultatLaboratoire, RapportLaboratoirePDF, PaymentRequest } from '../types';
import DemandesTab from './lab/DemandesTab';
import EnCoursTab from './lab/EnCoursTab';
import ResultatsTab from './lab/ResultatsTab';
import ValidationsTab from './lab/ValidationsTab';
import RapportsTab from './lab/RapportsTab';
import { db, handleFirestoreError, OperationType, auth } from '../src/firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';

interface LabProps {
  paymentRequests: PaymentRequest[];
  setPaymentRequests: React.Dispatch<React.SetStateAction<PaymentRequest[]>>;
  user?: any;
  activeTab: 'demandes' | 'encours' | 'resultats' | 'validations' | 'rapports';
  setActiveTab: (tab: 'demandes' | 'encours' | 'resultats' | 'validations' | 'rapports') => void;
  onBackToDashboard: () => void;
}

const Lab: React.FC<LabProps> = ({ 
  paymentRequests, 
  setPaymentRequests, 
  user,
  activeTab,
  setActiveTab,
  onBackToDashboard
}) => {
  const [labRequests, setLabRequests] = useState<LabExamRequest[]>([]);
  const [resultats, setResultats] = useState<ResultatLaboratoire[]>([]);
  const [rapports, setRapports] = useState<RapportLaboratoirePDF[]>([]);

  useEffect(() => {
    let unsubs: (() => void)[] = [];

    const setupListeners = () => {
      const unsubRequests = onSnapshot(collection(db, 'lab_requests'), (snapshot) => {
        const requests = snapshot.docs.map(doc => doc.data() as LabExamRequest);
        setLabRequests(requests);
      }, (error) => {
        // Only handle error if we are still authenticated
        if (auth.currentUser) {
          handleFirestoreError(error, OperationType.LIST, 'lab_requests');
        }
      });

      const unsubResults = onSnapshot(collection(db, 'lab_results'), (snapshot) => {
        const results = snapshot.docs.map(doc => doc.data() as ResultatLaboratoire);
        setResultats(results);
      }, (error) => {
        if (auth.currentUser) {
          handleFirestoreError(error, OperationType.LIST, 'lab_results');
        }
      });

      const unsubReports = onSnapshot(collection(db, 'lab_reports'), (snapshot) => {
        const reports = snapshot.docs.map(doc => doc.data() as RapportLaboratoirePDF);
        setRapports(reports);
      }, (error) => {
        if (auth.currentUser) {
          handleFirestoreError(error, OperationType.LIST, 'lab_reports');
        }
      });

      unsubs = [unsubRequests, unsubResults, unsubReports];
    };

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setupListeners();
      } else {
        // Clear listeners if user logs out
        unsubs.forEach(unsub => unsub());
        unsubs = [];
      }
    });

    return () => {
      unsubscribeAuth();
      unsubs.forEach(unsub => unsub());
    };
  }, []);

  const saveRequests = async (newRequests: LabExamRequest[]) => {
    try {
      for (const req of newRequests) {
        const docRef = doc(db, 'lab_requests', req.id);
        await setDoc(docRef, req, { merge: true });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'lab_requests');
    }
  };

  const saveResultats = async (newResultats: ResultatLaboratoire[]) => {
    try {
      for (const res of newResultats) {
        const docRef = doc(db, 'lab_results', res.id);
        await setDoc(docRef, res, { merge: true });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'lab_results');
    }
  };

  const saveRapports = async (newRapports: RapportLaboratoirePDF[]) => {
    try {
      for (const rep of newRapports) {
        const docRef = doc(db, 'lab_reports', rep.id);
        await setDoc(docRef, rep, { merge: true });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'lab_reports');
    }
  };

  const pendingCount = labRequests.filter(r => r.status === 'en attente').length;
  const inProgressCount = labRequests.filter(r => r.status === 'patient appelé' || r.status === 'prélèvement fait' || r.status === 'en cours').length;
  const validationCount = resultats.filter(r => r.statut === 'prêt pour validation').length;

  return (
    <div className="p-8 h-screen flex flex-col bg-slate-50">
      <header className="flex justify-between items-end bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm mb-6 shrink-0">
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
               <Beaker size={32} className="text-blue-600" />
               {activeTab === 'demandes' ? 'Demandes de Laboratoire' : 
                activeTab === 'encours' ? 'Analyses en Cours' : 
                activeTab === 'resultats' ? 'Saisie des Résultats' : 
                activeTab === 'validations' ? 'Validations Biologiques' : 'Rapports & Archives'}
             </h1>
             <p className="text-sm font-medium text-slate-500 italic">Laboratoire Central • Gestion complète des analyses biologiques</p>
           </div>
         </div>
         
         <div className="text-right hidden md:block">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisateur</p>
           <p className="font-bold text-slate-900 text-sm">{user ? user.name : 'Laborantin'}</p>
         </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'demandes' && <DemandesTab requests={labRequests} updateRequests={saveRequests} paymentRequests={paymentRequests} />}
        {activeTab === 'encours' && <EnCoursTab requests={labRequests} updateRequests={saveRequests} user={user} />}
        {activeTab === 'resultats' && <ResultatsTab requests={labRequests} updateRequests={saveRequests} resultats={resultats} updateResultats={saveResultats} user={user} />}
        {activeTab === 'validations' && <ValidationsTab requests={labRequests} updateRequests={saveRequests} resultats={resultats} updateResultats={saveResultats} user={user} />}
        {activeTab === 'rapports' && <RapportsTab requests={labRequests} resultats={resultats} rapports={rapports} updateRapports={saveRapports} user={user} />}
      </div>
    </div>
  );
};

export default Lab;
