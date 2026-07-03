import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, Pill, TestTube, Brain, History, 
  LayoutDashboard, LogOut, ChevronRight, UserCheck,
  Activity, Thermometer, AlertTriangle, Calendar,
  TrendingUp, X, Check, MapPin, Clock, User, Heart, AlertCircle, FileText
} from 'lucide-react';
import DoctorTopBar from './consultation/DoctorTopBar';
import WaitingRoom from './consultation/WaitingRoom';
import ActiveConsultation from './consultation/ActiveConsultation';
import FollowUp from './consultation/FollowUp';
import HistoryTab from './consultation/History';
import Appointments from './consultation/Appointments';
import VueGenerale from './consultation/VueGenerale';
import OrdonnanceTab from './consultation/OrdonnanceTab';
import ExamensTab from './consultation/ExamensTab';
import DigitalPrescription from './tools/DigitalPrescription';
import LabExamRequestForm from '../components/LabExamRequestForm';
import AIAssistantTab from '../components/AIAssistantTab';
import { User as UserType, PaymentRequest } from '../types';
import { db } from '../src/firebase';
import { collection, doc, setDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';

interface ConsultationProps {
  user?: UserType;
  waitingQueue?: any[];
  setWaitingQueue?: React.Dispatch<React.SetStateAction<any[]>>;
  paymentRequests?: PaymentRequest[];
  setPaymentRequests?: React.Dispatch<React.SetStateAction<PaymentRequest[]>>;
  activeMenu: 'WAITING_ROOM' | 'CONSULTATION' | 'FOLLOW_UP' | 'HISTORY' | 'APPOINTMENTS';
  setActiveMenu: (menu: 'WAITING_ROOM' | 'CONSULTATION' | 'FOLLOW_UP' | 'HISTORY' | 'APPOINTMENTS') => void;
}

type ConsultationTab = 'GENERAL' | 'MEDICAL' | 'PRESCRIPTION' | 'EXAMS' | 'HISTORY' | 'AI';

const Consultation: React.FC<ConsultationProps> = ({ 
  user, 
  waitingQueue = [], 
  setWaitingQueue, 
  paymentRequests = [], 
  setPaymentRequests,
  activeMenu,
  setActiveMenu
}) => {
  const [activePatient, setActivePatient] = useState<any | null>(null);
  const [consultationTab, setConsultationTab] = useState<ConsultationTab>('GENERAL');
  const [planningPatient, setPlanningPatient] = useState<any | null>(null);

  // Popup overlay states
  const [showHospitalizationDialog, setShowHospitalizationDialog] = useState(false);
  const [showClosureDialog, setShowClosureDialog] = useState(false);
  const [compilationData, setCompilationData] = useState<any | null>(null);

  // Quick hospitalisation form states
  const [hospForm, setHospForm] = useState({
    motif: '',
    service: 'Médecine interne',
    priorite: 'Moyenne',
    duree: 3,
    observations: ''
  });

  // Keep hospitalisation form in sync with active patient
  useEffect(() => {
    if (activePatient) {
      setHospForm(prev => ({
        ...prev,
        motif: activePatient.motif || '',
        observations: ''
      }));
    }
  }, [activePatient]);

  // Handle starting a consultation
  const handleStartConsultation = async (patient: any) => {
    try {
      const today = new Date();
      // 1. Sync updated status to Firestore
      const q = query(collection(db, 'service_queues'), where('patientId', '==', patient.id));
      const snaps = await getDocs(q);
      snaps.forEach(async (dSnap) => {
        await updateDoc(doc(db, 'service_queues', dSnap.id), { 
          status: 'in_consultation',
          calledAt: today.toISOString()
        });
      });
      
      // Trace action in audit_logs
      await setDoc(doc(collection(db, 'audit_logs')), {
        user: user?.name || user?.email || 'Docteur',
        role: 'DOCTOR',
        date: today.toLocaleDateString('fr-FR'),
        time: today.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        timestamp: today.toISOString(),
        action: `Appel Patient - Statut mis à jour: En consultation (in_consultation)`,
        details: { patientId: patient.id, name: `${patient.lastName} ${patient.firstName}` },
        module: 'Consultation'
      });
    } catch(e) {
      console.error("Error setting service_queues in_consultation status:", e);
    }

    // 2. Disappear automatically from wait queue state
    if (setWaitingQueue) {
      setWaitingQueue(prev => prev.filter(p => p.id !== patient.id));
    }

    setActivePatient(patient);
    setConsultationTab('MEDICAL'); // Default to MEDICAL (active clinical workspace) tab
    setActiveMenu('CONSULTATION');
  };

  const handleEndSession = () => {
    setActivePatient(null);
    setActiveMenu('WAITING_ROOM');
  };

  // Callback to handle patient cancellation from wait room (Point 1.3)
  const handleCancelPatient = async (patient: any, reason: string) => {
    try {
      const today = new Date();
      const dateStr = today.toLocaleDateString('fr-FR');
      const timeStr = today.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      // 1. Audit trace
      await setDoc(doc(collection(db, 'audit_logs')), {
        user: user?.name || user?.email || 'Médecin d\'Orientation',
        role: 'DOCTOR',
        date: dateStr,
        time: timeStr,
        timestamp: today.toISOString(),
        action: `Annulation de patient en file d'attente - ${patient.lastName} ${patient.firstName}`,
        details: { patientId: patient.id, reason },
        module: 'Consultation'
      });

      // 2. Local queue removal
      if (setWaitingQueue) {
        setWaitingQueue(prev => prev.filter(p => p.id !== patient.id));
      }

      // 3. Sync into Firestore waiting list
      const q = query(collection(db, 'service_queues'), where('patientId', '==', patient.id));
      const snaps = await getDocs(q);
      snaps.forEach(async (dSnap) => {
        await updateDoc(doc(db, 'service_queues', dSnap.id), { status: 'cancelled', cancelReason: reason });
      });

      window.dispatchEvent(new CustomEvent('app-notification', { 
        detail: `Consultation annulée pour ${patient.lastName} ${patient.firstName}.` 
      }));
    } catch (e) {
      console.error("Cancel patient error: ", e);
    }
  };

  // Callback to handle patient reorientation (Point 1.2)
  const handleReorientPatient = async (patient: any, targetService: string) => {
    try {
      const today = new Date();
      const dateStr = today.toLocaleDateString('fr-FR');
      const timeStr = today.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      // 1. Trace audit
      await setDoc(doc(collection(db, 'audit_logs')), {
        user: user?.name || user?.email || 'Médecin d\'Orientation',
        role: 'DOCTOR',
        date: dateStr,
        time: timeStr,
        timestamp: today.toISOString(),
        action: `Réorientation du patient : ${patient.lastName} ${patient.firstName} vers ${targetService}`,
        details: { patientId: patient.id, targetService },
        module: 'Consultation'
      });

      // 2. Create target queue document
      const queueDocRef = doc(collection(db, 'service_queues'));
      await setDoc(queueDocRef, {
        id: queueDocRef.id,
        patientId: patient.id,
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        age: patient.age || 0,
        gender: patient.gender || 'M',
        time: timeStr,
        date: dateStr,
        motif: `Réorientation médicale de Consultation vers ${targetService}`,
        speciality: targetService,
        queueName: targetService,
        service: targetService,
        status: 'waiting',
        paymentStatus: 'PENDING',
        priority: targetService === 'Emergency' ? 'critique' : 'normal',
        vitals: patient.vitals || {},
        createdAt: today.toISOString()
      });

      // 3. Remove patient from Consultation queue (except if it is Emergency where they might stay)
      if (targetService !== 'Emergency' && setWaitingQueue) {
        setWaitingQueue(prev => prev.filter(p => p.id !== patient.id));
      }

      window.dispatchEvent(new CustomEvent('app-notification', { 
        detail: `Réorientation médicale réussie de ${patient.lastName} ${patient.firstName} vers ${targetService}.` 
      }));
    } catch (e) {
      console.error("Reorientation error: ", e);
    }
  };

  // Submit clinical hospitalization request (Point 7)
  const handleConfirmHospitalization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;
    const today = new Date();
    try {
      const hospReqId = `HOSP-${Math.floor(Math.random() * 1000000)}`;

      await setDoc(doc(db, 'hospitalisation_requests', hospReqId), {
        id: hospReqId,
        patientId: activePatient.id,
        patientName: `${activePatient.lastName} ${activePatient.firstName}`,
        age: activePatient.age,
        gender: activePatient.gender,
        date: today.toLocaleDateString('fr-FR'),
        time: today.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        service: hospForm.service,
        priority: hospForm.priorite,
        dureePrevisionnelle: hospForm.duree,
        motif: hospForm.motif,
        observations: hospForm.observations,
        status: 'pending',
        createdAt: today.toISOString()
      });

      await setDoc(doc(collection(db, 'audit_logs')), {
        user: user?.name || user?.email || 'Docteur',
        role: 'DOCTOR',
        date: today.toLocaleDateString('fr-FR'),
        time: today.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        timestamp: today.toISOString(),
        action: `Demande d'hospitalisation initiée - Patient: ${activePatient.lastName} ${activePatient.firstName}`,
        details: { hospReqId, service: hospForm.service, priority: hospForm.priorite },
        module: 'Consultation'
      });

      setShowHospitalizationDialog(false);
      window.dispatchEvent(new CustomEvent('app-notification', { 
        detail: `Demande d'hospitalisation créée pour ${activePatient.lastName} ${activePatient.firstName} (${hospForm.service}).` 
      }));
    } catch (e) {
      console.error("Inpatient write error: ", e);
    }
  };

  // Mandatory Clinical Validation & Closure (Point 9 & Point 8)
  const handleSave = async (data: any) => {
    if (!activePatient) return;

    // Handle generic button click without arguments (forward event to IntelligentConsultation)
    if (!data || data.nativeEvent) {
      window.dispatchEvent(new CustomEvent('trigger-intelligent-save-draft'));
      return;
    }

    const today = new Date();
    const dateStr = today.toLocaleDateString('fr-FR');
    const timeStr = today.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    try {
      const consultationId = activePatient.consultationId || `CONS-${Math.floor(Math.random() * 1000000)}`;

      // 1. Create or update consultation in 'consultations'
      const consDocRef = doc(db, 'consultations', consultationId);
      const consultationPayload = {
        id: consultationId,
        patientId: activePatient.id,
        patient: `${activePatient.lastName} ${activePatient.firstName}`,
        patientIdRaw: activePatient.id,
        age: activePatient.age,
        gender: activePatient.gender,
        date: dateStr,
        time: timeStr,
        doctor: user?.name || 'Dr. Sarr',
        doctorEmail: user?.email || '',
        motif: data.motif || '',
        diagnosis: data.hypotheses?.principal || 'Diagnostic non précisé',
        treatment: data.prescriptions?.map((p: any) => p.name).join(', ') || 'Néant',
        exams: data.examensDemandes?.map((e: any) => e.name).join(', ') || 'Néant',
        observation: data.observation || '',
        type: data.mode === 'gynecologie' ? 'Consultation Gynécologique' : data.mode === 'obstetrique' ? 'CPN / Maternité' : 'Consultation Générale',
        status: 'draft',
        createdAt: today.toISOString()
      };
      await setDoc(consDocRef, consultationPayload);

      // Keep consultationId stored inside activePatient so subsequent edits/closures reference the same doc
      setActivePatient((prev: any) => prev ? { ...prev, consultationId } : null);

      // 2. Write/update in 'patient_history' collection
      const historyId = `HIST-${activePatient.id}-${consultationId}`;
      await setDoc(doc(db, 'patient_history', historyId), {
        id: historyId,
        patientId: activePatient.id,
        consultationId: consultationId,
        date: dateStr,
        time: timeStr,
        doctor: user?.name || 'Dr. Sarr',
        motif: data.motif || '',
        diagnosis: data.hypotheses?.principal || 'Diagnostic non précisé',
        treatment: data.prescriptions || [],
        exams: data.examensDemandes || [],
        observation: data.observation || '',
        status: 'draft',
        updatedAt: today.toISOString()
      });

      // 3. Create entry in 'audit_logs'
      await setDoc(doc(collection(db, 'audit_logs')), {
        user: user?.name || user?.email || 'Docteur',
        role: 'DOCTOR',
        date: dateStr,
        time: timeStr,
        timestamp: today.toISOString(),
        action: `Enregistrement de consultation (Brouillon) - Patient: ${activePatient.lastName} ${activePatient.firstName}`,
        details: { consultationId, diagnosis: data.hypotheses?.principal },
        module: 'Consultation'
      });

      setCompilationData(data);

      window.dispatchEvent(new CustomEvent('app-notification', { 
        detail: `✓ Consultation enregistrée avec succès` 
      }));
    } catch (e) {
      console.error("Save draft failed: ", e);
      window.dispatchEvent(new CustomEvent('app-notification', { 
        detail: `✗ Échec de l'enregistrement de la consultation` 
      }));
    }
  };

  const handleCloturer = (data: any) => {
    if (!activePatient) return;

    if (!data || data.nativeEvent) {
      window.dispatchEvent(new CustomEvent('trigger-intelligent-cloturer'));
      return;
    }

    if (!data.hypotheses?.principal) {
      alert("⚠️ Erreur : Le diagnostic principal est obligatoire pour clore la consultation.");
      return;
    }
    if (!data.observation || data.observation.trim().length < 20) {
      alert("⚠️ Erreur : L'observation médicale générée ou validée est obligatoire pour clore la consultation.");
      return;
    }

    setCompilationData(data);
    setShowClosureDialog(true);
  };

  const handleConfirmClosure = async () => {
    if (!compilationData || !activePatient) return;
    const today = new Date();
    const dateStr = today.toLocaleDateString('fr-FR');
    const timeStr = today.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    try {
      const consultationId = activePatient.consultationId || `CONS-${Math.floor(Math.random() * 1000000)}`;

      // 1. Write the Clinical Observation document into 'consultations' as clotured
      const consDocRef = doc(db, 'consultations', consultationId);
      const consultationPayload = {
        id: consultationId,
        patientId: activePatient.id,
        patient: `${activePatient.lastName} ${activePatient.firstName}`,
        patientIdRaw: activePatient.id,
        age: activePatient.age,
        gender: activePatient.gender,
        date: dateStr,
        time: timeStr,
        doctor: user?.name || 'Dr. Sarr',
        doctorEmail: user?.email || '',
        motif: compilationData.motif,
        diagnosis: compilationData.hypotheses?.principal || 'Diagnostic non précisé',
        treatment: compilationData.prescriptions?.map((p: any) => p.name).join(', ') || 'Néant',
        exams: compilationData.examensDemandes?.map((e: any) => e.name).join(', ') || 'Néant',
        observation: compilationData.observation,
        type: compilationData.mode === 'gynecologie' ? 'Consultation Gynécologique' : compilationData.mode === 'obstetrique' ? 'CPN / Maternité' : 'Consultation Générale',
        status: 'cloture',
        createdAt: today.toISOString()
      };
      await setDoc(consDocRef, consultationPayload);

      // Write to patient_history collection with status 'cloture'
      const historyId = `HIST-${activePatient.id}-${consultationId}`;
      await setDoc(doc(db, 'patient_history', historyId), {
        id: historyId,
        patientId: activePatient.id,
        consultationId: consultationId,
        date: dateStr,
        time: timeStr,
        doctor: user?.name || 'Dr. Sarr',
        motif: compilationData.motif || '',
        diagnosis: compilationData.hypotheses?.principal || 'Diagnostic non précisé',
        treatment: compilationData.prescriptions || [],
        exams: compilationData.examensDemandes || [],
        observation: compilationData.observation || '',
        status: 'cloture',
        updatedAt: today.toISOString()
      });

      // 2. Create the Pharmacy Request document in 'pending_prescriptions'
      if (compilationData.prescriptions && compilationData.prescriptions.length > 0) {
        const pharmDocRef = doc(collection(db, 'pending_prescriptions'));
        await setDoc(pharmDocRef, {
          id: `ORD-${Math.floor(Math.random() * 1000000)}`,
          patientId: activePatient.id,
          patient: `${activePatient.lastName} ${activePatient.firstName}`,
          doctor: user?.name || 'Dr. Sarr',
          date: dateStr,
          items: compilationData.prescriptions.map((p: any) => ({
            name: p.name,
            posology: p.posologie,
            price: p.price || 1500
          })),
          createdAt: today.toISOString(),
          status: 'pending'
        });
      }

      // 3. Create the Laboratory Exam Request document in 'lab_requests'
      if (compilationData.examensDemandes && compilationData.examensDemandes.length > 0) {
        const labDocRef = doc(collection(db, 'lab_requests'));
        await setDoc(labDocRef, {
          id: `LAB-${Math.floor(Math.random() * 1000000)}`,
          patientId: activePatient.id,
          patientName: `${activePatient.lastName} ${activePatient.firstName}`,
          date: dateStr,
          time: timeStr,
          status: 'pending',
          exams: compilationData.examensDemandes.map((e: any) => ({
            name: e.name,
            urgent: e.urgent || false
          })),
          createdAt: today.toISOString()
        });
      }

      // 4. Generate the Cashier Payment Invoice (PaymentRequest)
      const invoiceItems: any[] = [
        { id: 'item-consult', name: 'Consultation Médicale Clinique', quantity: 1, unitPrice: 10000, totalPrice: 10000 }
      ];
      let billCount = 1;
      
      if (compilationData.prescriptions) {
        compilationData.prescriptions.forEach((p: any) => {
          const itemPrice = p.price || 1500;
          invoiceItems.push({
            id: `item-med-${billCount++}`,
            name: `Ordonnance : ${p.name}`,
            quantity: 1,
            unitPrice: itemPrice,
            totalPrice: itemPrice
          });
        });
      }
      
      if (compilationData.examensDemandes) {
        compilationData.examensDemandes.forEach((e: any) => {
          const itemPrice = e.price || 2500;
          invoiceItems.push({
            id: `item-exam-${billCount++}`,
            name: `Examen Lab : ${e.name}`,
            quantity: 1,
            unitPrice: itemPrice,
            totalPrice: itemPrice
          });
        });
      }

      const totalAmount = invoiceItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const invoiceId = `PR-${Math.floor(Math.random() * 1000000)}`;
      const newPaymentRequest: PaymentRequest = {
        id: invoiceId,
        patientId: activePatient.id,
        patientName: `${activePatient.lastName} ${activePatient.firstName}`,
        requestingService: 'Consultation',
        sourceModule: 'Consultation',
        type: 'CONSULTATION',
        items: invoiceItems,
        totalAmount: totalAmount,
        amountPaid: 0,
        status: 'PENDING',
        createdAt: today.toISOString(),
        createdBy: user?.name || 'Docteur'
      };

      await setDoc(doc(db, 'payment_requests', invoiceId), newPaymentRequest);

      if (setPaymentRequests) {
        setPaymentRequests(prev => [...prev, newPaymentRequest]);
      }

      // 5. Trace the final audit trail
      await setDoc(doc(collection(db, 'audit_logs')), {
        user: user?.name || user?.email || 'Docteur',
        role: 'DOCTOR',
        date: dateStr,
        time: timeStr,
        timestamp: today.toISOString(),
        action: `Clôture de consultation - Patient archivé : ${activePatient.lastName} ${activePatient.firstName}`,
        details: { consultationId, invoiceId, totalAmount, diagnosis: compilationData.hypotheses.principal },
        module: 'Consultation'
      });

      // 6. Delete or update patient in global waiting room
      if (setWaitingQueue) {
        setWaitingQueue(prev => prev.filter(p => p.id !== activePatient.id));
      }

      // 7. Update service queues status
      const q = query(collection(db, 'service_queues'), where('patientId', '==', activePatient.id));
      const snaps = await getDocs(q);
      for (const dSnap of snaps.docs) {
        await updateDoc(doc(db, 'service_queues', dSnap.id), { status: 'consulted' });
      }

      setActivePatient(null);
      setShowClosureDialog(false);
      setCompilationData(null);
      setActiveMenu('WAITING_ROOM');

      window.dispatchEvent(new CustomEvent('app-notification', { 
        detail: `✓ Consultation clôturée avec succès` 
      }));
    } catch (e) {
      console.error("Closure finalize failed: ", e);
      window.dispatchEvent(new CustomEvent('app-notification', { 
        detail: `✗ Échec de la clôture de la consultation` 
      }));
    }
  };

  const handleGenerateObservation = () => {
    console.log('Generating medical observation...');
  };

  const handleSendPrescription = async (data: any) => {
    if (!activePatient) return;

    if (!data || data.nativeEvent) {
      window.dispatchEvent(new CustomEvent('trigger-intelligent-send-prescription'));
      return;
    }

    const prescriptions = data.prescriptions || [];
    if (prescriptions.length === 0) {
      alert("⚠️ Erreur : Aucun médicament prescrit.");
      return;
    }

    const today = new Date();
    const dateStr = today.toLocaleDateString('fr-FR');
    const timeStr = today.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    try {
      const consultationId = activePatient.consultationId || `CONS-${Math.floor(Math.random() * 1000000)}`;
      const prescriptionId = `ORD-${Math.floor(Math.random() * 1000000)}`;

      // 1. Create entry in pending_prescriptions
      await setDoc(doc(db, 'pending_prescriptions', prescriptionId), {
        id: prescriptionId,
        patientId: activePatient.id,
        patient: `${activePatient.lastName} ${activePatient.firstName}`,
        doctor: user?.name || 'Dr. Sarr',
        date: dateStr,
        items: prescriptions.map((p: any) => ({
          name: p.name,
          posology: p.posologie || p.dosage || 'Selon prescription',
          price: p.price || 1500
        })),
        createdAt: today.toISOString(),
        status: 'pending'
      });

      // 2. Create entry in payment_requests (to let Cashier instantly invoice)
      const invoiceItems = prescriptions.map((p: any, idx: number) => {
        const itemPrice = p.price || 1500;
        return {
          id: `item-med-${prescriptionId}-${idx}`,
          name: `Ordonnance : ${p.name}`,
          quantity: 1,
          unitPrice: itemPrice,
          totalPrice: itemPrice
        };
      });

      const totalAmount = invoiceItems.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
      const invoiceId = `PR-${Math.floor(Math.random() * 1000000)}`;
      const paymentPayload: PaymentRequest = {
        id: invoiceId,
        patientId: activePatient.id,
        patientName: `${activePatient.lastName} ${activePatient.firstName}`,
        requestingService: 'Consultation',
        sourceModule: 'Consultation',
        type: 'PHARMACIE',
        items: invoiceItems,
        totalAmount: totalAmount,
        amountPaid: 0,
        status: 'PENDING',
        createdAt: today.toISOString(),
        createdBy: user?.name || 'Docteur'
      };

      await setDoc(doc(db, 'payment_requests', invoiceId), paymentPayload);

      if (setPaymentRequests) {
        setPaymentRequests(prev => [...prev, paymentPayload]);
      }

      // 3. Create Audit Log
      await setDoc(doc(collection(db, 'audit_logs')), {
        user: user?.name || user?.email || 'Docteur',
        role: 'DOCTOR',
        date: dateStr,
        time: timeStr,
        timestamp: today.toISOString(),
        action: `Transmission ordonnance à la pharmacie et à la caisse - Patient: ${activePatient.lastName} ${activePatient.firstName}`,
        details: { prescriptionId, invoiceId, totalAmount, medsCount: prescriptions.length },
        module: 'Consultation'
      });

      window.dispatchEvent(new CustomEvent('app-notification', { 
        detail: `✓ Ordonnance transmise à la pharmacie et à la caisse` 
      }));
    } catch (e) {
      console.error("Prescription dispatch failed: ", e);
      window.dispatchEvent(new CustomEvent('app-notification', { 
        detail: `✗ Échec de transmission` 
      }));
    }
  };

  const handleSendExams = async (data: any) => {
    if (!activePatient) return;

    if (!data || data.nativeEvent) {
      window.dispatchEvent(new CustomEvent('trigger-intelligent-send-exams'));
      return;
    }

    const exams = data.examensDemandes || [];
    if (exams.length === 0) {
      alert("⚠️ Erreur : Aucun examen prescrit.");
      return;
    }

    const today = new Date();
    const dateStr = today.toLocaleDateString('fr-FR');
    const timeStr = today.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    try {
      const consultationId = activePatient.consultationId || `CONS-${Math.floor(Math.random() * 1000000)}`;
      const labRequestId = `LAB-${Math.floor(Math.random() * 1000000)}`;

      // 1. Create entry in lab_requests
      await setDoc(doc(db, 'lab_requests', labRequestId), {
        id: labRequestId,
        patientId: activePatient.id,
        patientName: `${activePatient.lastName} ${activePatient.firstName}`,
        consultationId: consultationId,
        prescriberName: user?.name || 'Dr. Sarr',
        date: dateStr,
        time: timeStr,
        status: 'pending',
        exams: exams.map((e: any) => ({
          name: e.name,
          urgent: e.urgent || false
        })),
        createdAt: today.toISOString()
      });

      // 2. Also register billing for laboratory request so patient can pay
      const invoiceItems = exams.map((e: any, idx: number) => {
        const itemPrice = e.price || 2500;
        return {
          id: `item-exam-${labRequestId}-${idx}`,
          name: `Examen Lab : ${e.name}`,
          quantity: 1,
          unitPrice: itemPrice,
          totalPrice: itemPrice
        };
      });

      const totalAmount = invoiceItems.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
      const invoiceId = `PR-${Math.floor(Math.random() * 1000000)}`;
      const paymentPayload: PaymentRequest = {
        id: invoiceId,
        patientId: activePatient.id,
        patientName: `${activePatient.lastName} ${activePatient.firstName}`,
        requestingService: 'Consultation',
        sourceModule: 'Consultation',
        type: 'LABORATOIRE',
        items: invoiceItems,
        totalAmount: totalAmount,
        amountPaid: 0,
        status: 'PENDING',
        createdAt: today.toISOString(),
        createdBy: user?.name || 'Docteur'
      };

      await setDoc(doc(db, 'payment_requests', invoiceId), paymentPayload);

      if (setPaymentRequests) {
        setPaymentRequests(prev => [...prev, paymentPayload]);
      }

      // 3. Create Audit Log
      await setDoc(doc(collection(db, 'audit_logs')), {
        user: user?.name || user?.email || 'Docteur',
        role: 'DOCTOR',
        date: dateStr,
        time: timeStr,
        timestamp: today.toISOString(),
        action: `Transmission examens au laboratoire - Patient: ${activePatient.lastName} ${activePatient.firstName}`,
        details: { labRequestId, invoiceId, examsCount: exams.length },
        module: 'Consultation'
      });

      window.dispatchEvent(new CustomEvent('app-notification', { 
        detail: `✓ Examens transmis au laboratoire` 
      }));
    } catch (e) {
      console.error("Lab dispatch failed: ", e);
      window.dispatchEvent(new CustomEvent('app-notification', { 
        detail: `✗ Échec de transmission` 
      }));
    }
  };

  const handleHospitalize = () => {
    setShowHospitalizationDialog(true);
  };

  // Get current permanent context properties (Point 2)
  const getPermanentContext = (patient: any) => {
    if (!patient) return null;
    const defaultAllergies = patient.allergies && patient.allergies.length > 0 
      ? patient.allergies 
      : ['Aucune allergie connue'];
    
    const inputMotif = (patient.motif || '').toLowerCase();
    
    // Constant active medications derived from complaints
    const defaultMeds = inputMotif.includes('tension') || inputMotif.includes('hta')
      ? ['Amlodipine 5mg (1 comprimé le matin)']
      : inputMotif.includes('diab')
      ? ['Metformine 500mg (1 comp midi & soir)']
      : ['Aucun traitement de fond actif'];

    // Pending exams list
    const pendingExams = inputMotif.includes('fièvre') || inputMotif.includes('palu')
      ? ['Goutte Épaisse (en attente)', 'NFS (en attente)']
      : ['Aucun examen en attente'];

    // Structured programmed follow-ups
    const defaultAppointments = ['Consultation de contrôle programmée sous 15 jours'];

    // Hospitalization status
    const hospStatus = patient.hospitalisationStatus || 'Patient Externe (Aucun lit)';

    // Pregnancy & Chronic alerts (Point 2)
    const pregnancyStatus = patient.gender === 'F' && patient.age >= 15 && patient.age <= 45 && (inputMotif.includes('grossesse') || inputMotif.includes('cpn') || patient.pregnant)
      ? 'Grossesse active (G3 P2, 24 SA)' 
      : 'Aucune grossesse signalée';

    const chronicPathologies = inputMotif.includes('tension') || inputMotif.includes('hta')
      ? ['Hypertension Artérielle (HTA)']
      : inputMotif.includes('diab')
      ? ['Diabète de Type 2']
      : ['Pas de pathologie chronique déclarée'];

    // Calculation of BMI if height & weight exist
    let weightVal = patient.vitals?.weight || 75;
    let heightVal = patient.vitals?.height || 178;
    let bmiValue = (weightVal / ((heightVal / 100) * (heightVal / 100))).toFixed(1);

    return {
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      age: patient.age,
      gender: patient.gender,
      allergies: defaultAllergies,
      meds: defaultMeds,
      pendingExams,
      appointments: defaultAppointments,
      hospStatus,
      pregnancyStatus,
      chronicPathologies,
      vitals: {
        temp: patient.vitals?.temp || '37.2',
        bp: patient.vitals?.bp || '120/80',
        pulse: patient.vitals?.pulse || '72',
        spo2: patient.vitals?.spo2 || '98',
        respRate: patient.vitals?.respRate || '18',
        weight: weightVal,
        height: heightVal,
        bmi: bmiValue
      }
    };
  };

  const contextData = getPermanentContext(activePatient);

  return (
    <div className="bg-slate-50 min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="flex flex-col min-w-0">
        {/* Top Bar with Patient Context */}
        <DoctorTopBar 
          activePatient={activePatient} 
          doctorName={user?.name || "Dr. Sarr"}
        />

        {/* Dynamic Content Section */}
        <main className="flex-1 p-6 md:p-12 overflow-y-auto custom-scrollbar">
          {activeMenu === 'WAITING_ROOM' && (
            <WaitingRoom 
              waitingQueue={waitingQueue} 
              onStartConsultation={handleStartConsultation} 
              onCancelPatient={handleCancelPatient}
              onReorientPatient={handleReorientPatient}
            />
          )}

          {activeMenu === 'CONSULTATION' && (
            activePatient ? (
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start animate-in fade-in slide-in-from-right-6 duration-700">
                {/* Workspace area (3 columns) */}
                <div className="xl:col-span-3 flex flex-col h-full space-y-6">
                  {/* Hub Tabs Navigation */}
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-[32px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-[32px] border border-slate-200 overflow-x-auto">
                      {[
                        { id: 'GENERAL', label: 'Vue générale', icon: LayoutDashboard },
                        { id: 'MEDICAL', label: 'Consultation médicale', icon: ClipboardList },
                        { id: 'PRESCRIPTION', label: 'Ordonnance', icon: Pill },
                        { id: 'EXAMS', label: 'Examens', icon: TestTube },
                        { id: 'HISTORY', label: 'Historique', icon: History },
                        { id: 'AI', label: 'Assistant IA', icon: Brain },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setConsultationTab(tab.id as ConsultationTab)}
                          className={`flex items-center gap-3 px-5 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${
                            consultationTab === tab.id 
                              ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                              : 'text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <tab.icon size={16} />
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={handleEndSession}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-rose-50 text-rose-600 rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100 cursor-pointer"
                    >
                      <LogOut size={16} /> Terminer session
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="flex-1">
                    {consultationTab === 'GENERAL' && (
                      <VueGenerale 
                        patient={activePatient} 
                        onAction={(action) => {
                          if (action === 'HOSPITALIZE') handleHospitalize();
                          else if (action === 'APPOINTMENT') setActiveMenu('APPOINTMENTS');
                          else setConsultationTab(action as ConsultationTab);
                        }} 
                      />
                    )}

                    {consultationTab === 'MEDICAL' && (
                      <ActiveConsultation 
                        activePatient={activePatient} 
                        user={user}
                        paymentRequests={paymentRequests}
                        setPaymentRequests={setPaymentRequests}
                        onSave={handleSave}
                        onCloturer={handleCloturer}
                        onGenerateObservation={handleGenerateObservation}
                        onSendPrescription={handleSendPrescription}
                        onSendExams={handleSendExams}
                        onHospitalize={handleHospitalize}
                        onClose={() => setConsultationTab('GENERAL')}
                      />
                    )}

                    {consultationTab === 'PRESCRIPTION' && (
                      <OrdonnanceTab patient={activePatient} user={user!} />
                    )}

                    {consultationTab === 'EXAMS' && (
                      <ExamensTab patient={activePatient} user={user!} />
                    )}

                    {consultationTab === 'HISTORY' && (
                      <div className="bg-white rounded-[40px] border border-slate-200 p-10 shadow-sm animate-in fade-in">
                        <HistoryTab patientId={activePatient.id} />
                      </div>
                    )}

                    {consultationTab === 'AI' && (
                      <div className="bg-white rounded-[40px] border border-slate-200 p-10 shadow-sm animate-in fade-in">
                        <AIAssistantTab patient={activePatient} user={user!} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Permanent Patient Context Panel (1 column) -> Point 2 */}
                {contextData && (
                  <div className="xl:col-span-1 bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm flex flex-col gap-5 sticky top-36 max-h-[82vh] overflow-y-auto animate-in slide-in-from-right duration-500">
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Cadre Contexte Patient</h4>
                      <p className="text-sm font-black text-slate-800">Affichage Permanent Clinique</p>
                    </div>

                    {/* Patient identity block (Point 2.1) */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-1">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Identité Patient</p>
                      <p className="text-sm font-black text-slate-900">{contextData.lastName} {contextData.firstName}</p>
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1">
                        <span>Genre: {contextData.gender === 'F' ? 'Femme ♀' : 'Homme ♂'}</span>
                        <span>Âge: {contextData.age} ans</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">DME: {contextData.id}</p>
                    </div>

                    {/* Vitals summary with BMI (Point 2.2) */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-3">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Constantes de Triage</p>
                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="flex items-center gap-2">
                          <Thermometer size={14} className="text-rose-500" />
                          <div>
                            <p className="text-[8px] font-bold text-slate-500">Température</p>
                            <p className="text-xs font-black text-slate-800">{contextData.vitals.temp} °C</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity size={14} className="text-blue-500" />
                          <div>
                            <p className="text-[8px] font-bold text-slate-500">Tension (TA)</p>
                            <p className="text-xs font-black text-slate-800">{contextData.vitals.bp}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart size={14} className="text-emerald-500" />
                          <div>
                            <p className="text-[8px] font-bold text-slate-500">Pouls (FC)</p>
                            <p className="text-xs font-black text-slate-800">{contextData.vitals.pulse} bpm</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity size={14} className="text-orange-500" />
                          <div>
                            <p className="text-[8px] font-bold text-slate-500">SPO2</p>
                            <p className="text-xs font-black text-slate-800">{contextData.vitals.spo2} %</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 col-span-2 border-t border-slate-100 pt-2 text-[10px] font-bold text-slate-600 justify-between">
                          <span>FR: {contextData.vitals.respRate} cpm</span>
                          <span>Poids: {contextData.vitals.weight} kg</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2 text-[10px] font-bold text-slate-600 justify-between">
                          <span>Taille: {contextData.vitals.height} cm</span>
                          <span className="text-blue-600">IMC: {contextData.vitals.bmi}</span>
                        </div>
                      </div>
                    </div>

                    {/* Structured alerts Pregnancy & Chroniques (Point 2.3) */}
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col gap-2.5">
                      <p className="text-[8px] font-black uppercase tracking-widest text-rose-500 flex items-center gap-1">
                        <AlertTriangle size={10} /> Alertes Signalées
                      </p>
                      
                      {/* Allergies */}
                      <div>
                        <p className="text-[8px] font-bold text-rose-400 mb-1">Allergies</p>
                        <div className="flex flex-wrap gap-1.5">
                          {contextData.allergies.map((all, i) => (
                            <span key={i} className="bg-white text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[9px] font-black leading-tight">
                              {all}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Pregnancy Alert */}
                      <div>
                        <p className="text-[8px] font-bold text-rose-400 mb-0.5">Statut de grossesse</p>
                        <p className="text-[10px] font-black text-rose-800">{contextData.pregnancyStatus}</p>
                      </div>

                      {/* Chronic pathologies */}
                      <div>
                        <p className="text-[8px] font-bold text-rose-400 mb-1">Pathologies chroniques</p>
                        <ul className="text-[9px] font-black text-rose-800 list-disc list-inside">
                          {contextData.chronicPathologies.map((patho, i) => (
                            <li key={i}>{patho}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Ongoing activities (Point 2.4) */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-3">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Activités & Traitements en cours</p>
                      
                      {/* Active treatments */}
                      <div className="border-b border-slate-100 pb-2">
                        <p className="text-[8px] font-bold text-slate-500 mb-1">Traitements de fond actifs</p>
                        <ul className="text-[10px] font-semibold text-slate-700 space-y-1">
                          {contextData.meds.map((med, i) => (
                            <li key={i} className="flex gap-1.5 items-start">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 shrink-0"></span>
                              <span>{med}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Pending Exams */}
                      <div className="border-b border-slate-100 pb-2">
                        <p className="text-[8px] font-bold text-slate-500 mb-1">Examens en attente de résultats</p>
                        <ul className="text-[10px] font-semibold text-slate-700 space-y-1">
                          {contextData.pendingExams.map((ex, i) => (
                            <li key={i} className="flex gap-1.5 items-start">
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1 shrink-0"></span>
                              <span>{ex}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Hospitalization active status */}
                      <div className="border-b border-slate-100 pb-2">
                        <p className="text-[8px] font-bold text-slate-500 mb-1">Statut d'hospitalisation</p>
                        <div className="flex gap-1.5 items-center text-[10px] font-black text-slate-700 uppercase">
                          <MapPin size={10} className="text-blue-500 shrink-0" />
                          <span>{contextData.hospStatus}</span>
                        </div>
                      </div>

                      {/* Scheduled Appointments */}
                      <div>
                        <p className="text-[8px] font-bold text-slate-500 mb-1">Dernier RDV programmé</p>
                        <ul className="text-[10px] font-semibold text-slate-700 space-y-1">
                          {contextData.appointments.map((ap, i) => (
                            <li key={i} className="flex gap-1.5 items-start">
                              <Calendar size={10} className="text-emerald-500 mt-1 shrink-0" />
                              <span>{ap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 bg-white rounded-[50px] border-4 border-dashed border-slate-100">
                <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center text-blue-600 mb-8 animate-bounce">
                  <ClipboardList size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4">Aucun patient actif</h2>
                <p className="text-slate-500 max-w-md font-medium italic">
                  Veuillez sélectionner un patient dans la salle d'attente pour commencer une nouvelle consultation.
                </p>
                <button 
                  onClick={() => setActiveMenu('WAITING_ROOM')}
                  className="mt-10 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 cursor-pointer"
                >
                  Aller à la salle d'attente
                </button>
              </div>
            )
          )}

          {activeMenu === 'FOLLOW_UP' && (
            <FollowUp 
              onOpenDossier={(p) => { 
                setActivePatient(p); 
                setConsultationTab('GENERAL'); 
                setActiveMenu('CONSULTATION'); 
              }} 
              onStartVisite={(p) => handleStartConsultation(p)}
              onPlanifierRDV={(p) => {
                setPlanningPatient(p);
                setActiveMenu('APPOINTMENTS');
              }}
            />
          )}
          {activeMenu === 'HISTORY' && <HistoryTab />}
          {activeMenu === 'APPOINTMENTS' && <Appointments user={user} initialPatient={planningPatient} />}
        </main>
      </div>

      {/* 2. ADVANCED HOSPITALISATION FORM DIALOG (Point 7) */}
      {showHospitalizationDialog && activePatient && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <form 
            onSubmit={handleConfirmHospitalization}
            className="bg-white rounded-[40px] border border-slate-200 w-full max-w-md p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <button 
              type="button"
              onClick={() => setShowHospitalizationDialog(false)} 
              className="absolute top-8 right-8 p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all"
            >
              <X size={18} />
            </button>

            <h3 className="text-2xl font-black text-slate-900 mb-1">Demande d'Hospitalisation</h3>
            <p className="text-slate-500 text-sm mb-6 font-medium italic">
              Formulaire de transmission pour {activePatient.lastName} {activePatient.firstName}.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">Motif principal d'admission</label>
                <input
                  type="text"
                  value={hospForm.motif}
                  onChange={e => setHospForm({ ...hospForm, motif: e.target.value })}
                  className="w-full text-sm p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold"
                  placeholder="Ex. Surveillance paramètres cliniques, Réhydratation ..."
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">Service de destination</label>
                <select
                  value={hospForm.service}
                  onChange={e => setHospForm({ ...hospForm, service: e.target.value })}
                  className="w-full text-sm p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 bg-white font-bold"
                >
                  {['Médecine interne', 'Pédiatrie', 'Chirurgie', 'Gynécologie', 'Maternité', 'Urgences'].map(srv => (
                    <option key={srv} value={srv}>{srv}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">Priorité clinique</label>
                  <select
                    value={hospForm.priorite}
                    onChange={e => setHospForm({ ...hospForm, priorite: e.target.value })}
                    className="w-full text-sm p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 bg-white font-bold"
                  >
                    {['Haute', 'Moyenne', 'Basse'].map(pr => (
                      <option key={pr} value={pr}>{pr} priorité</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">Durée prévisionnelle (jours)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={hospForm.duree}
                    onChange={e => setHospForm({ ...hospForm, duree: parseInt(e.target.value) || 1 })}
                    className="w-full text-sm p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">Observations & remarques cliniques</label>
                <textarea
                  value={hospForm.observations}
                  onChange={e => setHospForm({ ...hospForm, observations: e.target.value })}
                  className="w-full text-sm p-4 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 h-24 resize-none font-medium"
                  placeholder="Ex. À isoler si possible, perfusions ..."
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowHospitalizationDialog(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 cursor-pointer"
              >
                Transmettre
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. STEPPED CLOSURE & BILLING VALIDATION DIALOG (Point 9) */}
      {showClosureDialog && compilationData && activePatient && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] border border-slate-200 w-full max-w-md p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowClosureDialog(false)} 
              className="absolute top-8 right-8 p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all"
            >
              <X size={18} />
            </button>

            <h3 className="text-2xl font-black text-slate-900 mb-1">Workflow Validation</h3>
            <p className="text-slate-500 text-sm mb-6 font-medium italic">
              Validation requise pour clôturer le dossier de {activePatient.lastName}.
            </p>

            <div className="space-y-4 mb-8">
              {/* Check 1: Observation note ready */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase">1. Observation clinique validée</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">Générée avec succès (~{compilationData.observation?.length} car.)</p>
                </div>
              </div>

              {/* Check 2: Diagnosis CIM-10 ready */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase">2. Diagnostic d'entrée codé</h4>
                  <p className="text-[10px] text-blue-600 font-black uppercase font-mono mt-0.5">{compilationData.hypotheses?.principal}</p>
                </div>
              </div>

              {/* Check 3: Digital Prescription / Pharmacy sync */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                {compilationData.prescriptions && compilationData.prescriptions.length > 0 ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={14} />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black">
                    -
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase">3. Ordonnance électronique transmise</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    {compilationData.prescriptions && compilationData.prescriptions.length > 0 
                      ? `${compilationData.prescriptions.length} médicaments configurés`
                      : 'Aucun médicament prescrit'
                    }
                  </p>
                </div>
              </div>

              {/* Check 4: Invoice breakdown */}
              <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl">
                <h4 className="text-xs font-black text-blue-900 uppercase mb-3 tracking-wider">4. Ventilation de paiement générée</h4>
                <div className="text-xs font-bold space-y-2 divide-y divide-blue-100/50">
                  <div className="flex justify-between text-slate-600 pt-1">
                    <span>Acte de Consultation</span>
                    <span>10 000 FCFA</span>
                  </div>
                  {compilationData.prescriptions && compilationData.prescriptions.map((p: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-slate-600 pt-2 font-medium">
                      <span className="truncate max-w-[200px]">{p.name}</span>
                      <span>{p.price || 1500} FCFA</span>
                    </div>
                  ))}
                  {compilationData.examensDemandes && compilationData.examensDemandes.map((e: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-slate-600 pt-2 font-medium">
                      <span className="truncate max-w-[200px]">Ex: {e.name}</span>
                      <span>{e.price || 2500} FCFA</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-blue-900 pt-3 font-black text-sm">
                    <span>Total facturé</span>
                    <span>
                      {10000 + 
                       (compilationData.prescriptions?.reduce((sum: number, p: any) => sum + (p.price || 1500), 0) || 0) + 
                       (compilationData.examensDemandes?.reduce((sum: number, e: any) => sum + (e.price || 2500), 0) || 0)
                      } FCFA
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowClosureDialog(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Retour
              </button>
              <button
                onClick={handleConfirmClosure}
                className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                Confirmer & Valoriser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Consultation;
