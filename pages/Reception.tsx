
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, UserPlus, Heart, 
  Users, Stethoscope, Beaker, 
  Activity, AlertCircle, ChevronRight,
  CheckCircle2, CreditCard, ShieldAlert, Calendar,
  Clock, UserCheck, Printer,
  LogOut, FileText, CheckCircle, X,
  User as UserIcon, ArrowRightLeft,
  Scale, Thermometer, Info, Award, Settings,
  TrendingUp, Home
} from 'lucide-react';
import { Patient, VisitMotif, Role, User as UserType, PatientStatus, LabExamRequest, PaymentRequest } from '../types';
import LabExamRequestForm from '../components/LabExamRequestForm';

import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../src/firebase';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReceptionProps {
  user?: UserType;
  setGlobalWaitingQueue?: React.Dispatch<React.SetStateAction<any[]>>;
  paymentRequests?: PaymentRequest[];
  setPaymentRequests?: React.Dispatch<React.SetStateAction<PaymentRequest[]>>;
  activeTab: 'triage' | 'sorties' | 'demandes' | 'profil';
  setActiveTab: (tab: 'triage' | 'sorties' | 'demandes' | 'profil') => void;
  onBackToDashboard: () => void;
}

export interface MotifPriseEnCharge {
  id: string;
  label: string;
  category: 'CONSULTATIONS' | 'MATERNITE' | 'URGENCES' | 'AUTRES';
  serviceId: string;       // SRV-CONSULTATION, SRV-MATERNITE, etc.
  queueName: string;       // File de d'attente
  speciality: string;      // Spécialité médicale
  fee: number;             // Frais de consultation ou d'admission
}

export const ALL_MOTIFS: MotifPriseEnCharge[] = [
  // CONSULTATIONS
  { id: 'medecine_generale', label: 'Médecine générale', category: 'CONSULTATIONS', serviceId: 'SRV-CONSULTATION', queueName: 'Médecine Générale', speciality: 'Médecine générale', fee: 10000 },
  { id: 'pediatrie', label: 'Pédiatrie', category: 'CONSULTATIONS', serviceId: 'SRV-CONSULTATION', queueName: 'Pédiatrie', speciality: 'Pédiatrie', fee: 10000 },
  { id: 'gynecologie', label: 'Gynécologie', category: 'CONSULTATIONS', serviceId: 'SRV-CONSULTATION', queueName: 'Gynécologie', speciality: 'Gynécologie', fee: 10000 },
  { id: 'obstetrique', label: 'Obstétrique', category: 'CONSULTATIONS', serviceId: 'SRV-CONSULTATION', queueName: 'Obstétrique', speciality: 'Obstétrique', fee: 10000 },
  { id: 'cpn_consultation', label: 'Consultation prénatale (CPN)', category: 'CONSULTATIONS', serviceId: 'SRV-MATERNITE', queueName: 'CPN', speciality: 'Obstétrique', fee: 5000 },
  { id: 'postnatale_consultation', label: 'Consultation postnatale', category: 'CONSULTATIONS', serviceId: 'SRV-MATERNITE', queueName: 'Consultation Postnatale', speciality: 'Obstétrique', fee: 5000 },
  { id: 'chirurgie', label: 'Chirurgie', category: 'CONSULTATIONS', serviceId: 'SRV-CONSULTATION', queueName: 'Chirurgie', speciality: 'Chirurgie', fee: 10000 },
  { id: 'traumatologie', label: 'Traumatologie', category: 'CONSULTATIONS', serviceId: 'SRV-CONSULTATION', queueName: 'Traumatologie', speciality: 'Traumatologie', fee: 10000 },
  { id: 'medecine_interne', label: 'Médecine interne', category: 'CONSULTATIONS', serviceId: 'SRV-CONSULTATION', queueName: 'Médecine interne', speciality: 'Médecine interne', fee: 10000 },

  // MATERNITÉ
  { id: 'travail_accouchement', label: 'Travail / Accouchement', category: 'MATERNITE', serviceId: 'SRV-MATERNITE', queueName: 'Salle de travail', speciality: 'Obstétrique', fee: 5000 },
  { id: 'consultation_obstetricale', label: 'Consultation obstétricale', category: 'MATERNITE', serviceId: 'SRV-MATERNITE', queueName: 'Consultation Obstétricale', speciality: 'Obstétrique', fee: 5000 },
  { id: 'consultation_gynecologique', label: 'Consultation gynécologique', category: 'MATERNITE', serviceId: 'SRV-MATERNITE', queueName: 'Consultation Gynécologique', speciality: 'Gynécologie', fee: 5000 },
  { id: 'cpn_maternite', label: 'Consultation prénatale', category: 'MATERNITE', serviceId: 'SRV-MATERNITE', queueName: 'CPN', speciality: 'Obstétrique', fee: 5000 },
  { id: 'postnatale_maternite', label: 'Consultation postnatale', category: 'MATERNITE', serviceId: 'SRV-MATERNITE', queueName: 'Consultation Postnatale', speciality: 'Obstétrique', fee: 5000 },

  // URGENCES
  { id: 'urgence_adulte', label: 'Urgence adulte', category: 'URGENCES', serviceId: 'SRV-URGENCES', queueName: 'Urgence Adulte', speciality: 'Urgences Vitales', fee: 15000 },
  { id: 'urgence_pediatrique', label: 'Urgence pédiatrique', category: 'URGENCES', serviceId: 'SRV-URGENCES', queueName: 'Urgence Pédiatrique', speciality: 'Pédiatrie', fee: 15000 },
  { id: 'urgence_obstetricale', label: 'Urgence obstétricale', category: 'URGENCES', serviceId: 'SRV-URGENCES', queueName: 'Urgence Obstétricale', speciality: 'Obstétrique', fee: 15000 },
  { id: 'traumatisme', label: 'Traumatisme', category: 'URGENCES', serviceId: 'SRV-URGENCES', queueName: 'Traumatisme', speciality: 'Traumatologie', fee: 15000 },

  // AUTRES
  { id: 'laboratoire', label: 'Laboratoire', category: 'AUTRES', serviceId: 'SRV-LABO', queueName: 'Laboratoire', speciality: 'Biologie médicale', fee: 0 },
  { id: 'soins_infirmiers', label: 'Soins infirmiers', category: 'AUTRES', serviceId: 'SRV-INFIRMIER', queueName: 'Soins infirmiers', speciality: 'Soins infirmiers', fee: 2500 },
  { id: 'vaccination', label: 'Vaccination', category: 'AUTRES', serviceId: 'SRV-VACCINATION', queueName: 'Vaccination', speciality: 'Pédiatrie', fee: 1000 },
  { id: 'pharmacie', label: 'Pharmacie', category: 'AUTRES', serviceId: 'SRV-PHARMACIE', queueName: 'Pharmacie', speciality: 'Dispensaire', fee: 0 }
];

export const assessPriority = (vitals: any): { priority: 'normal' | 'urgent' | 'critique'; alerts: string[] } => {
  const alerts: string[] = [];
  if (!vitals) return { priority: 'normal', alerts };

  const temp = parseFloat(vitals.temp);
  const sys = parseInt(vitals.bpSys);
  const dia = parseInt(vitals.bpDia);
  const spo2 = parseInt(vitals.spo2);
  const hr = parseInt(vitals.heartRate || vitals.pulse);

  // Severe criteria (Critique)
  if (spo2 > 0 && spo2 < 90) {
    alerts.push("Saturation basse (< 90%)");
  }
  if ((sys > 0 && sys > 180) || (dia > 0 && dia > 110)) {
    alerts.push("TA critique (Hypertension sévère)");
  }
  if (sys > 0 && sys < 85) {
    alerts.push("TA critique (Hypotension sévère)");
  }
  if (temp > 0 && (temp >= 39.5 || temp < 35)) {
    alerts.push("Température critique (< 35°C ou >= 39.5°C)");
  }
  if (hr > 0 && (hr >= 130 || hr < 45)) {
    alerts.push("Fréquence cardiaque critique");
  }

  if (alerts.length > 0) {
    return { priority: 'critique', alerts };
  }

  // Moderate criteria (Urgent)
  if (spo2 > 0 && spo2 >= 90 && spo2 < 94) {
    alerts.push("Saturation faible (90-93%)");
  }
  if ((sys > 0 && (sys > 140 && sys <= 180)) || (dia > 0 && (dia > 90 && dia <= 110))) {
    alerts.push("TA élevée");
  }
  if (temp > 0 && (temp >= 38.5 && temp < 39.5)) {
    alerts.push("Fièvre modérée");
  }
  if (hr > 0 && ((hr >= 100 && hr < 130) || (hr >= 45 && hr < 55))) {
    alerts.push("Fréquence cardiaque anormale");
  }

  if (alerts.length > 0) {
    return { priority: 'urgent', alerts };
  }

  return { priority: 'normal', alerts };
};

const getOrientationData = (motif: VisitMotif) => {
  switch(motif) {
    case 'CONSULTATION': return { dest: Role.DOCTOR, fee: 10000, label: 'Consultation Générale' };
    case 'URGENCE': return { dest: Role.DOCTOR, fee: 15000, label: 'Urgences Vitales' };
    case 'LABORATOIRE': return { dest: Role.LAB, fee: 0, label: 'Prélèvements' };
    case 'MATERNITE': return { dest: Role.MATERNITY, fee: 5000, label: 'Suivi de Grossesse' };
    case 'SOIN_INFIRMIER': return { dest: Role.NURSE, fee: 2500, label: 'Soins / Pansements' };
    default: return { dest: Role.DOCTOR, fee: 10000, label: 'Général' };
  }
};

const Reception: React.FC<ReceptionProps> = ({ 
  user, 
  setGlobalWaitingQueue, 
  paymentRequests = [], 
  setPaymentRequests,
  activeTab,
  setActiveTab,
  onBackToDashboard
}) => {
  const [step, setStep] = useState<'search' | 'register' | 'triage' | 'pre-consultation' | 'payment' | 'summary'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(new Date().toISOString().split('T')[0]);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsToDischarge, setPatientsToDischarge] = useState<any[]>([]);
  const [dischargeError, setDischargeError] = useState<{ patientId: string; message: string } | null>(null);

  const [currentPatient, setCurrentPatient] = useState<Partial<Patient>>({
    gender: 'M',
    maritalStatus: 'CELIBATAIRE',
    vitals: {
      bpSys: 120, bpDia: 80, heartRate: 75, respRate: 18, pulse: 75, spo2: 98, temp: 37,
      height: 170, weight: 70, bmi: 24.2, waistCirc: 85
    }
  });
  
  const [visitMotif, setVisitMotif] = useState<VisitMotif | null>(null);
  const [selectedMotif, setSelectedMotif] = useState<MotifPriseEnCharge | null>(null);
  const [currentMotifCategory, setCurrentMotifCategory] = useState<'CONSULTATIONS' | 'MATERNITE' | 'URGENCES' | 'AUTRES'>('CONSULTATIONS');
  const [notebookAdded, setNotebookAdded] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [amountReceived, setAmountReceived] = useState<string>('');
  const [showProforma, setShowProforma] = useState(false);
  const [selectedTxForProforma, setSelectedTxForProforma] = useState<any>(null);
  const [showLabExamForm, setShowLabExamForm] = useState(false);
  const [isLabExamEnabled, setIsLabExamEnabled] = useState(false);

  const activeMotifs = useMemo(() => {
    const savedServices = localStorage.getItem('hospital_services');
    if (!savedServices) return ALL_MOTIFS;
    try {
      const services = JSON.parse(savedServices);
      return ALL_MOTIFS.filter(motif => {
        const s = services.find((srv: any) => srv.id === motif.serviceId);
        if (!s || s.status === 'inactive') return false;
        if (s.specificSettings?.activeSpecialties) {
          return s.specificSettings.activeSpecialties.includes(motif.id);
        }
        return true;
      });
    } catch (e) {
      console.error("Error reading hospital services:", e);
      return ALL_MOTIFS;
    }
  }, []);

  // Firestore Synchronizer Hooks
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    const setupListeners = () => {
      // 1. Synchronize Patients with Firestore & auto-seed if empty
      const unsubPatients = onSnapshot(collection(db, 'patients'), (snapshot) => {
        if (snapshot.empty) {
          const initial = [
            { id: 'PAT-2026-000001', firstName: 'Amadou', lastName: 'DIOP', birthDate: '1985-05-12', gender: 'M', phone: '771234567', residence: 'Dakar Plateau', emergencyContact: 'Mariam Diop', emergencyPhone: '778889900', maritalStatus: 'MARIE', status: PatientStatus.DISCHARGED },
            { id: 'PAT-2026-000002', firstName: 'Aminata', lastName: 'SOW', birthDate: '1992-09-24', gender: 'F', phone: '782345678', residence: 'Fann Résidence', emergencyContact: 'Abdou Sow', emergencyPhone: '789998877', maritalStatus: 'MARIE', status: PatientStatus.READY_TO_DISCHARGE }
          ];
          initial.forEach(async (p) => {
            await setDoc(doc(db, 'patients', p.id), p);
          });
        } else {
          const list = snapshot.docs.map(doc => doc.data() as Patient);
          setPatients(list);
        }
      }, (error) => {
        if (auth.currentUser) {
          handleFirestoreError(error, OperationType.LIST, 'patients');
        }
      });

      // 2. Synchronize PatientsToDischarge list with Firestore (discharges_waiting)
      const unsubDischarges = onSnapshot(collection(db, 'discharges_waiting'), (snapshot) => {
        if (snapshot.empty) {
          const initial = [
            { 
              id: 'P-101', 
              name: 'DIALLO Mamadou', 
              admissionDate: '12/05/2024', 
              department: 'Médecine Interne', 
              status: PatientStatus.READY_TO_DISCHARGE,
              medicalClearance: true,
              hospitalizationClosed: true,
              financialClearance: false 
            },
            { 
              id: 'P-102', 
              name: 'SOW Aminata', 
              admissionDate: '10/05/2024', 
              department: 'Maternité', 
              status: PatientStatus.READY_TO_DISCHARGE,
              medicalClearance: true,
              hospitalizationClosed: true,
              financialClearance: true 
            }
          ];
          initial.forEach(async (p) => {
            await setDoc(doc(db, 'discharges_waiting', p.id), p);
          });
        } else {
          const list = snapshot.docs.map(doc => doc.data());
          setPatientsToDischarge(list);
        }
      }, (error) => {
        if (auth.currentUser) {
          handleFirestoreError(error, OperationType.LIST, 'discharges_waiting');
        }
      });

      unsubs = [unsubPatients, unsubDischarges];
    };

    const unsubscribeAuth = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setupListeners();
      } else {
        unsubs.forEach(unsub => unsub());
        unsubs = [];
      }
    });

    return () => {
      unsubscribeAuth();
      unsubs.forEach(unsub => unsub());
    };
  }, []);

  // Reusable Helper to Generate sequential serial Enterprise patient ID
  const getNextSequentialIdsAndAssign = async () => {
    let nextNum = 3; // start from 3 because 1 & 2 are auto-seeded
    try {
      const snap = await getDocs(collection(db, 'patients'));
      let maxNum = 2; // initial seeds have 1 and 2
      snap.forEach(doc => {
        const data = doc.data();
        const checkId = (idStr: string) => {
          if (!idStr) return;
          const parts = idStr.split('-');
          if (parts.length === 3) {
            const num = parseInt(parts[2], 10);
            if (!isNaN(num) && num > maxNum) {
              maxNum = num;
            }
          }
        };
        checkId(data.id);
        checkId(data.patientId);
      });
      nextNum = maxNum + 1;
    } catch (err) {
      console.error("Error generating sequential patient ID:", err);
      nextNum = Math.floor(Math.random() * 100000) + 3;
    }
    const padded = String(nextNum).padStart(6, '0');
    return {
      patientId: `PAT-2026-${padded}`,
      dmeId: `DME-2026-${padded}`
    };
  };

  // Reusable Audit Log Helper
  const logAudit = async (action: string, details?: any) => {
    try {
      const today = new Date();
      const logData = {
        user: user?.name || user?.email || 'Agent Accueil',
        role: user?.role || 'RECEPTION',
        date: today.toLocaleDateString('fr-FR'),
        time: today.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        timestamp: today.toISOString(),
        action,
        details: details || {},
        module: 'Reception'
      };
      await setDoc(doc(collection(db, 'audit_logs')), logData);
    } catch (err) {
      console.error('Audit trace failed:', err);
    }
  };

  // Modern PDF Generator for Receipts, Proformas, Prescriptions and Discharges
  const handleGeneratePDF = (docType: string, data: any) => {
    let logoText = "SH";
    let nameEst = "SmartHosto SIH";
    let addressEst = "Dakar, Senegal";
    let phoneEst = "+221 77 000 00 00";
    let emailEst = "contact@smarthosto.com";
    let sloganEst = "Systeme d'Information Hospitalier Connecte";

    const savedConfig = localStorage.getItem('hospital_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.name) nameEst = config.name;
        if (config.phone) phoneEst = config.phone;
        
        const addressParts = [];
        if (config.address) addressParts.push(config.address);
        if (config.city) addressParts.push(config.city);
        if (config.country) addressParts.push(config.country);
        if (addressParts.length > 0) {
          addressEst = addressParts.join(', ');
        }
        
        if (config.logo) logoText = config.logo;
        if (config.email) emailEst = config.email;
        if (config.slogan) sloganEst = config.slogan;
      } catch (e) {
        console.error("Failed to parse hospital_config", e);
      }
    }

    const today = new Date();
    const dateStr = today.toLocaleDateString('fr-FR');
    const timeStr = today.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    if (docType === "autorisation_sortie") {
      const isArchivedCompleted = data && (data.status === 'completed' || data.validated === true);
      const isCleared = data && (data.medicalClearance === true && data.hospitalizationClosed === true && data.financialClearance === true);
      
      if (!isCleared && !isArchivedCompleted) {
        setDischargeError({
          patientId: data.id,
          message: "Impossible d'imprimer l'autorisation de sortie.\n\nLa sortie administrative n'a pas encore été validée.\n\nVeuillez vérifier :\n- Autorisation médicale\n- Clôture de l'hospitalisation\n- Validation financière"
        });
        setTimeout(() => {
          setDischargeError(null);
        }, 12000);
        return; // block PDF generation
      }

      // Trace logs inside audit_logs collection
      logAudit("Impression d'autorisation de sortie", {
        patient: data.patientName || data.name || 'Patient Inconnu',
        patientId: data.patientId || data.id || 'N/A',
        utilisateur: user?.name || 'Agent d\'accueil',
        date: dateStr,
        heure: timeStr,
        document_imprime: `autorisation_sortie_${data.id || today.getTime()}.pdf`
      });
    }

    const pdfDoc = new jsPDF() as any;

    // Header Design (Slate Dark Theme Banner)
    pdfDoc.setFillColor(30, 41, 59);
    pdfDoc.rect(10, 10, 190, 40, 'F');

    // Logo badge white card
    pdfDoc.setFillColor(255, 255, 255);
    pdfDoc.roundedRect(15, 15, 16, 16, 3, 3, 'F');
    pdfDoc.setTextColor(30, 41, 59);
    pdfDoc.setFont("helvetica", "bold");
    pdfDoc.setFontSize(10);
    pdfDoc.text(logoText, 20, 25);

    // Hospital info
    pdfDoc.setTextColor(255, 255, 255);
    pdfDoc.setFontSize(14);
    pdfDoc.text(nameEst, 38, 23);
    pdfDoc.setFont("helvetica", "normal");
    pdfDoc.setFontSize(8);
    pdfDoc.text(`${addressEst} | Tel: ${phoneEst}`, 38, 30);
    pdfDoc.text(`${sloganEst} ${emailEst ? ' | Email: ' + emailEst : ''}`, 38, 35);

    // Right header block (Document Type details)
    let docTitle = "DOCUMENT GÉNERIQUE";
    if (docType === "ticket_accueil") docTitle = "TICKET D'ACCUEIL";
    if (docType === "proforma") docTitle = "FACTURE PRO-FORMA";
    if (docType === "demande_paiement") docTitle = "DEMANDE DE PAIEMENT";
    if (docType === "bulletin_examens") docTitle = "BULLETIN D'EXAMENS";
    if (docType === "autorisation_sortie") docTitle = "AUTORISATION DE SORTIE";

    pdfDoc.setFont("helvetica", "bold");
    pdfDoc.setFontSize(9);
    pdfDoc.text(docTitle, 140, 23);
    pdfDoc.setFont("helvetica", "normal");
    pdfDoc.setFontSize(8);
    pdfDoc.text(`ID Document: ${data.id || 'N/A'}`, 140, 30);
    pdfDoc.text(`Imprime: ${dateStr} - ${timeStr}`, 140, 35);

    // Patient Infobox Block
    pdfDoc.setFillColor(248, 250, 252);
    pdfDoc.rect(10, 55, 190, 30, 'F');
    pdfDoc.setDrawColor(226, 232, 240);
    pdfDoc.rect(10, 55, 190, 30, 'S');

    pdfDoc.setTextColor(30, 41, 59);
    pdfDoc.setFont("helvetica", "bold");
    pdfDoc.setFontSize(9);
    pdfDoc.text("IDENTIFICATION DU PATIENT", 15, 62);
    pdfDoc.setFont("helvetica", "normal");
    pdfDoc.text(`Nom: ${data.patientName || data.name || 'Patient Inconnu'}`, 15, 70);
    pdfDoc.text(`ID DME: ${data.patientId || data.id || 'N/A'}`, 15, 76);
    if (data.age) pdfDoc.text(`Age: ${data.age} ans`, 110, 70);
    if (data.gender) pdfDoc.text(`Sexe: ${data.gender}`, 150, 70);
    if (data.phone) pdfDoc.text(`Tel: ${data.phone}`, 110, 76);

    // Label Section
    pdfDoc.setFont("helvetica", "bold");
    pdfDoc.setFontSize(10);
    pdfDoc.text("DETAILS PROCEDURES & ACTES", 10, 95);

    let finalY = 100;
    if (docType === "ticket_accueil" || docType === "proforma" || docType === "demande_paiement") {
      const items = data.items || [
        { name: data.motif || data.type || 'Frais d\'Orientation / Dossier', quantity: 1, unitPrice: data.totalAmount || 10000, totalPrice: data.totalAmount || 10000 }
      ];

      const columns = ["Prestation", "Quantite", "Prix Unitaire (CFA)", "Total (CFA)"];
      const rows = items.map((item: any) => [
        item.name || 'Acte Medical',
        item.quantity || 1,
        (item.unitPrice || 0).toLocaleString(),
        (item.totalPrice || 0).toLocaleString()
      ]);

      autoTable(pdfDoc, {
        head: [columns],
        body: rows,
        startY: 100,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8 },
        margin: { left: 10, right: 10 }
      });

      finalY = (pdfDoc as any).lastAutoTable.finalY + 15;

      // Draw total price box
      pdfDoc.setFillColor(30, 41, 59);
      pdfDoc.rect(120, finalY, 80, 24, 'F');
      pdfDoc.setTextColor(255, 255, 255);
      pdfDoc.setFontSize(9);
      pdfDoc.setFont("helvetica", "bold");
      const amountVal = data.totalAmount || items.reduce((sum: number, it: any) => sum + (it.totalPrice || 0), 0);
      pdfDoc.text(`MONTANT NET:`, 125, finalY + 10);
      pdfDoc.setFontSize(12);
      pdfDoc.text(`${amountVal.toLocaleString()} CFA`, 125, finalY + 18);

    } else if (docType === "bulletin_examens") {
      const listExams = data.exams || [];
      const columns = ["Examens Demandes", "Categorie", "Indication Clinique"];
      const rows = listExams.map((e: any) => [
        e.name || e,
        e.category || 'Analyse Medicale',
        e.indication || 'N/A'
      ]);

      autoTable(pdfDoc, {
        head: [columns],
        body: rows,
        startY: 100,
        theme: 'striped',
        headStyles: { fillColor: [147, 51, 234], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8 },
        margin: { left: 10, right: 10 }
      });

      finalY = (pdfDoc as any).lastAutoTable.finalY + 15;

      pdfDoc.setTextColor(30, 41, 59);
      pdfDoc.setFontSize(9);
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.text(`Prescripteur: ${data.prescriberName || 'Agent Accueil'}`, 10, finalY);
      pdfDoc.text(`Service d'admission: ${data.requestingService || 'Accueil'}`, 10, finalY + 6);

    } else if (docType === "autorisation_sortie") {
      pdfDoc.setFillColor(240, 253, 250); // Teal-50
      pdfDoc.rect(10, 100, 190, 85, 'F');
      pdfDoc.setDrawColor(20, 184, 166); // Teal-500
      pdfDoc.rect(10, 100, 190, 85, 'S');

      pdfDoc.setTextColor(15, 118, 110);
      pdfDoc.setFontSize(14);
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.text("SORTIE ADMINISTRATIVE VALIDEE", 55, 112);
      
      pdfDoc.setDrawColor(204, 251, 241);
      pdfDoc.line(15, 118, 195, 118);

      pdfDoc.setTextColor(30, 41, 59);
      pdfDoc.setFontSize(9);
      pdfDoc.setFont("helvetica", "normal");
      pdfDoc.text(`Le patient ${data.patientName || data.name} est officiellement autorise a quitter`, 20, 126);
      pdfDoc.text(`l'enceinte de l'etablissement hospitalier en toute conformite.`, 20, 132);

      const userValidator = data.user || user?.name || 'Agent d\'accueil de garde';
      const dischargeDateStr = data.dischargeDate || dateStr;
      const dischargeTimeStr = data.dischargeTime || timeStr;

      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.text("INFORMATIONS DE VALIDATION :", 20, 142);
      pdfDoc.setFont("helvetica", "normal");
      pdfDoc.text(`- Date de sortie : ${dischargeDateStr}`, 25, 148);
      pdfDoc.text(`- Heure de sortie : ${dischargeTimeStr}`, 25, 153);
      pdfDoc.text(`- Valide par : ${userValidator}`, 25, 158);

      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.text("STATUT DES CRITERES OBLIGATOIRES :", 20, 166);
      pdfDoc.setTextColor(15, 118, 110);
      pdfDoc.text(`- Autorisation medicale : VALIDEE`, 25, 172);
      pdfDoc.text(`- Validation financiere : VALIDEE`, 25, 177);
      pdfDoc.text(`- Hospitalisation cloturee : VALIDEE`, 25, 182);

      finalY = 200;
    }

    // Signatures block
    pdfDoc.setFont("helvetica", "normal");
    pdfDoc.setFontSize(8);
    pdfDoc.setTextColor(100, 116, 139);
    pdfDoc.text(`Immatriculation: SH-${docType.toUpperCase()}-${data.id || today.getTime()}`, 10, 275);
    pdfDoc.text(`Etablissement de sante ${nameEst}. Document certifie conforme.`, 10, 280);

    pdfDoc.setTextColor(30, 41, 59);
    pdfDoc.setFont("helvetica", "bold");
    pdfDoc.text("Cachet et Signature de l'accueil", 130, 252);
    pdfDoc.line(130, 268, 190, 268);

    // Save PDF
    pdfDoc.save(`${docType}_${data.id || today.getTime()}.pdf`);
  };

  useEffect(() => {
    const savedTools = localStorage.getItem('hospital_tools');
    if (savedTools) {
      const parsedTools = JSON.parse(savedTools);
      const labTool = parsedTools.find((t: any) => t.code === 'BULLETIN_EXAMENS');
      if (labTool && labTool.status === 'ACTIVE' && user && labTool.authorizedRoles.includes(user.role)) {
        setIsLabExamEnabled(true);
      }
    }
  }, [user]);

  useEffect(() => {
    if (currentPatient.vitals?.height && currentPatient.vitals?.weight) {
      const hMeters = currentPatient.vitals.height / 100;
      const bmi = parseFloat((currentPatient.vitals.weight / (hMeters * hMeters)).toFixed(1));
      setCurrentPatient(prev => ({
        ...prev,
        vitals: { ...prev.vitals!, bmi }
      }));
    }
  }, [currentPatient.vitals?.height, currentPatient.vitals?.weight]);

  const computedBMI = useMemo(() => {
    const w = currentPatient.vitals?.weight;
    const h = currentPatient.vitals?.height;
    if (w && h) {
      const imc = (w / ((h / 100) * (h / 100))).toFixed(1);
      return parseFloat(imc);
    }
    return currentPatient.vitals?.bmi || 0;
  }, [currentPatient.vitals?.weight, currentPatient.vitals?.height, currentPatient.vitals?.bmi]);

  const computedPriorityAndAlerts = useMemo(() => {
    return assessPriority(currentPatient.vitals);
  }, [currentPatient.vitals]);

  const totalToPay = useMemo(() => {
    if (selectedMotif) {
      return selectedMotif.fee + (notebookAdded ? 1000 : 0);
    }
    if (!visitMotif) return 0;
    return getOrientationData(visitMotif).fee + (notebookAdded ? 1000 : 0);
  }, [selectedMotif, visitMotif, notebookAdded]);

  const paymentStats = useMemo(() => {
    const received = parseFloat(amountReceived) || 0;
    const diff = received - totalToPay;
    return { 
      received, 
      remaining: diff < 0 ? Math.abs(diff) : 0, 
      change: diff > 0 ? diff : 0 
    };
  }, [totalToPay, amountReceived]);

  const agentProfile = user || {
    name: "Moussa Diop", profession: "Agent d'accueil Principal", role: Role.RECEPTION,
    schedule: "Lun-Ven (08h00 - 17h00)", salary: "250,000 CFA", quotePartRate: "1%"
  };

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return patients.filter(p => 
      p.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, patients]);

  useEffect(() => {
    if (visitMotif === 'CONSULTATION' || visitMotif === 'SOIN_INFIRMIER') {
      setShowUpsell(true);
    } else {
      setShowUpsell(false);
    }
  }, [visitMotif]);

  const handleSelectPatient = (p: Patient) => {
    setCurrentPatient(p);
    setStep('triage');
    setSearchQuery('');
  };

  const finalizeAdmission = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    // Generate sequential IDs if current patient has temporary ones
    let patientId = currentPatient.patientId || currentPatient.id || '';
    let dmeId = currentPatient.id || '';

    if (!patientId.startsWith('PAT-2026') || !dmeId.startsWith('DME-2026')) {
      const seqIds = await getNextSequentialIdsAndAssign();
      patientId = seqIds.patientId;
      dmeId = seqIds.dmeId;
    }

    const finalVitals = currentPatient.vitals ? {
      ...currentPatient.vitals,
      bmi: computedBMI
    } : undefined;

    const finalPatient: Patient = {
      ...currentPatient,
      id: dmeId,
      patientId: patientId,
      status: PatientStatus.DISCHARGED,
      vitals: finalVitals
    } as Patient;

    // Create PaymentRequest
    const items = [];
    if (selectedMotif) {
      items.push({
        id: `ITEM-${Math.floor(Math.random() * 1000)}`,
        name: selectedMotif.label,
        quantity: 1,
        unitPrice: selectedMotif.fee,
        totalPrice: selectedMotif.fee
      });
    } else if (visitMotif) {
      items.push({
        id: `ITEM-${Math.floor(Math.random() * 1000)}`,
        name: getOrientationData(visitMotif).label,
        quantity: 1,
        unitPrice: getOrientationData(visitMotif).fee,
        totalPrice: getOrientationData(visitMotif).fee
      });
    }

    if (notebookAdded) {
      items.push({
        id: `ITEM-CARNET`,
        name: 'Carnet Médical',
        quantity: 1,
        unitPrice: 1000,
        totalPrice: 1000
      });
    }

    const reqType = selectedMotif?.category === 'CONSULTATIONS' ? 'CONSULTATION' :
                     selectedMotif?.category === 'MATERNITE' ? 'MATERNITE' :
                     selectedMotif?.category === 'URGENCES' ? 'HOSPITALISATION' : // compatible with original type limits
                     visitMotif === 'CONSULTATION' ? 'CONSULTATION' : 
                     visitMotif === 'LABORATOIRE' ? 'LABORATOIRE' : 
                     visitMotif === 'MATERNITE' ? 'MATERNITE' : 
                     visitMotif === 'HOSPITALISATION' ? 'HOSPITALISATION' : 'AUTRE';

    const newPaymentRequest: PaymentRequest = {
      id: `REQ-${Math.floor(Math.random() * 9000) + 1000}`,
      patientId: patientId,
      patientName: `${finalPatient.lastName} ${finalPatient.firstName}`,
      requestingService: 'Accueil',
      sourceModule: 'Reception',
      type: reqType,
      items: items,
      totalAmount: totalToPay,
      amountPaid: 0,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      createdBy: user?.name || 'Système'
    };

    // Calculate Routing Destination Service Name and Queue
    let targetService = 'Consultation';
    let targetQueue = 'Médecine Générale';
    let targetSpeciality = 'Médecine générale';

    if (selectedMotif) {
      targetQueue = selectedMotif.queueName;
      targetSpeciality = selectedMotif.speciality;

      // Check hospital services configurations
      const savedServices = localStorage.getItem('hospital_services');
      if (savedServices) {
        try {
          const parsed = JSON.parse(savedServices);
          const matched = parsed.find((s: any) => s.id === selectedMotif.serviceId);
          if (matched) {
            targetService = matched.name;
          } else {
            // fallback standard mappings
            if (selectedMotif.serviceId === 'SRV-MATERNITE') targetService = 'Maternité';
            else if (selectedMotif.serviceId === 'SRV-URGENCES') targetService = 'Urgences';
            else if (selectedMotif.serviceId === 'SRV-LABO') targetService = 'Laboratoire';
            else if (selectedMotif.serviceId === 'SRV-INFIRMIER') targetService = 'Soins infirmiers';
            else if (selectedMotif.serviceId === 'SRV-VACCINATION') targetService = 'Vaccination';
            else if (selectedMotif.serviceId === 'SRV-PHARMACIE') targetService = 'Pharmacie';
            else targetService = 'Consultation';
          }
        } catch (e) {
          console.error("Failed to parse hospital services config:", e);
        }
      } else {
        if (selectedMotif.serviceId === 'SRV-MATERNITE') targetService = 'Maternité';
        else if (selectedMotif.serviceId === 'SRV-URGENCES') targetService = 'Urgences';
        else if (selectedMotif.serviceId === 'SRV-LABO') targetService = 'Laboratoire';
        else if (selectedMotif.serviceId === 'SRV-INFIRMIER') targetService = 'Soins infirmiers';
        else if (selectedMotif.serviceId === 'SRV-VACCINATION') targetService = 'Vaccination';
        else if (selectedMotif.serviceId === 'SRV-PHARMACIE') targetService = 'Pharmacie';
      }
    } else {
      targetService = 
        visitMotif === 'CONSULTATION' ? 'Consultation' :
        visitMotif === 'URGENCE' ? 'Urgences' :
        visitMotif === 'LABORATOIRE' ? 'Laboratoire' :
        visitMotif === 'SOIN_INFIRMIER' ? 'Soins infirmiers' :
        visitMotif === 'MATERNITE' ? 'Maternité' : 'Consultation';
    }

    try {
      // 1. Create Patient document inside Firestore
      await setDoc(doc(db, 'patients', finalPatient.id), finalPatient);

      // 2. Create Electronic Medical Record (DME) inside Firestore
      await setDoc(doc(db, 'medical_records', dmeId), {
        id: dmeId,
        patientId: patientId,
        createdAt: new Date().toISOString(),
        createdBy: user?.name || 'Agent Accueil',
        vitals: finalPatient.vitals || {},
        history: [
          {
            action: `Patient enregistré - Motif de recours: ${selectedMotif?.label || visitMotif}`,
            user: user?.name || 'Agent Accueil',
            date: todayStr,
            time: timeStr
          }
        ]
      });

      // 3. Create Reception Visit inside Firestore
      const visitDocRef = doc(collection(db, 'reception_visits'));
      const visitData = {
        id: visitDocRef.id,
        patientId: patientId,
        patientName: `${finalPatient.lastName} ${finalPatient.firstName}`,
        date: todayStr,
        time: timeStr,
        motif: visitMotif,
        motifId: selectedMotif?.id || '',
        motifLabel: selectedMotif?.label || '',
        orientation: selectedMotif?.label || getOrientationData(visitMotif || 'CONSULTATION').label,
        user: user?.name || 'Agent Accueil',
        createdAt: new Date().toISOString()
      };
      await setDoc(visitDocRef, visitData);

      // 4. Create Triage constant records inside Firestore
      if (finalPatient.vitals) {
        const triageDocRef = doc(collection(db, 'triage_records'));
        await setDoc(triageDocRef, {
          id: triageDocRef.id,
          patientId: patientId,
          visitId: visitDocRef.id,
          vitals: finalPatient.vitals,
          priority: computedPriorityAndAlerts.priority,
          priorityAlerts: computedPriorityAndAlerts.alerts,
          createdAt: new Date().toISOString(),
          createdBy: user?.name || 'Agent Accueil'
        });
      }

      // 5. Create Payment Request in 'payment_requests' collection
      await setDoc(doc(db, 'payment_requests', newPaymentRequest.id), newPaymentRequest);

      // 6. Connect Orientation to 'service_queues' collection
      const queueDocRef = doc(collection(db, 'service_queues'));
      await setDoc(queueDocRef, {
        id: queueDocRef.id,
        patientId: patientId,
        dmeId: dmeId,
        firstName: finalPatient.firstName,
        lastName: finalPatient.lastName,
        age: calculateAge(finalPatient.birthDate),
        gender: finalPatient.gender,
        time: timeStr,
        date: todayStr,
        motif: visitMotif,
        motifId: selectedMotif?.id || '',
        motifLabel: selectedMotif?.label || '',
        speciality: targetSpeciality,
        queueName: targetQueue,
        service: targetService,
        serviceId: selectedMotif?.serviceId || '',
        status: 'waiting',
        paymentStatus: 'PENDING',
        priority: computedPriorityAndAlerts.priority,
        priorityAlerts: computedPriorityAndAlerts.alerts,
        vitals: {
          temp: finalPatient.vitals?.temp,
          bp: `${finalPatient.vitals?.bpSys}/${finalPatient.vitals?.bpDia}`,
          pulse: finalPatient.vitals?.pulse,
          spo2: finalPatient.vitals?.spo2,
          weight: finalPatient.vitals?.weight,
          height: finalPatient.vitals?.height,
          bmi: finalPatient.vitals?.bmi
        },
        createdAt: new Date().toISOString()
      });

      // 7. Write traceability audit logs
      await logAudit(`Création Dossier Patient & Admission`, { patientId, patientName: `${finalPatient.lastName} ${finalPatient.firstName}` });
      await logAudit(`Création Visite d'admission`, { visitId: visitDocRef.id, motif: selectedMotif?.label || visitMotif });
      if (finalPatient.vitals) await logAudit(`Triage avec calcul priorité effectué: ${computedPriorityAndAlerts.priority}`, { patientId });
      await logAudit(`Orientation Patient vers ${targetService} (${targetQueue})`, { patientId });
      await logAudit(`Création de la demande de paiement d'admission`, { reqId: newPaymentRequest.id, amount: totalToPay });

      // Live trigger notifications toast
      window.dispatchEvent(new CustomEvent('app-notification', { 
        detail: `Admission et orientation effectuées pour ${finalPatient.lastName} ${finalPatient.firstName}` 
      }));

    } catch (err: any) {
      console.error("Firestore persistence failed matching requirements:", err);
    }

    if (setPaymentRequests) {
      setPaymentRequests(prev => [newPaymentRequest, ...prev]);
    }

    if (!patients.find(p => p.id === finalPatient.id)) {
      setPatients(prev => [...prev, finalPatient]);
    }

    if (setGlobalWaitingQueue) {
      const waitPatient = {
        id: finalPatient.id,
        firstName: finalPatient.firstName,
        lastName: finalPatient.lastName,
        age: calculateAge(finalPatient.birthDate),
        gender: finalPatient.gender,
        time: timeStr,
        motif: selectedMotif?.label || visitMotif,
        motifId: selectedMotif?.id || '',
        speciality: targetSpeciality,
        queueName: targetQueue,
        service: targetService,
        paymentStatus: 'PENDING',
        priority: computedPriorityAndAlerts.priority,
        priorityAlerts: computedPriorityAndAlerts.alerts,
        vitals: {
          temp: finalPatient.vitals?.temp,
          bp: `${finalPatient.vitals?.bpSys}/${finalPatient.vitals?.bpDia}`,
          pulse: finalPatient.vitals?.pulse,
          spo2: finalPatient.vitals?.spo2,
          weight: finalPatient.vitals?.weight,
          height: finalPatient.vitals?.height,
          bmi: finalPatient.vitals?.bmi
        }
      };
      setGlobalWaitingQueue(prev => [...prev, waitPatient]);
    }

    setSelectedHistoryDate(todayStr);
    setSelectedTxForProforma(newPaymentRequest);
    setStep('summary');
  };

  const todaysRequests = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return paymentRequests.filter(pr => (pr.sourceModule === 'Reception' || pr.sourceModule === 'RECEPTION') && pr.createdAt.startsWith(todayStr));
  }, [paymentRequests]);

  const calculateAge = (dateString?: string) => {
    if (!dateString) return 0;
    const today = new Date();
    const birthDate = new Date(dateString);
    if (isNaN(birthDate.getTime())) return 0;
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleDischarge = async (id: string) => {
    const patient = patientsToDischarge.find(p => p.id === id);
    if (!patient) return;

    // Strict criteria safety checks
    const unmet = [];
    if (patient.medicalClearance !== true) unmet.push("Autorisation médicale obligatoire manquante");
    if (patient.hospitalizationClosed !== true) unmet.push("Dossier d'hospitalisation non clos");
    if (patient.financialClearance !== true) unmet.push("Solde ou régularisation de facturation de caisse non accomplie");

    if (unmet.length > 0) {
      setDischargeError({
        patientId: id,
        message: `${unmet.join('. ')}.`
      });
      // Clear message after 10 seconds
      setTimeout(() => {
        setDischargeError(null);
      }, 10000);
      return;
    }

    try {
      setDischargeError(null);

      // 1. Create entrance inside 'discharges' collection
      const dischargeDocRef = doc(collection(db, 'discharges'));
      const dischargeData = {
        id: dischargeDocRef.id,
        patientId: patient.id,
        patientName: patient.name,
        department: patient.department || 'Général',
        admissionDate: patient.admissionDate,
        dischargeDate: new Date().toLocaleDateString('fr-FR'),
        dischargeTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        user: user?.name || 'Agent d\'accueil',
        status: 'completed',
        createdAt: new Date().toISOString()
      };
      await setDoc(dischargeDocRef, dischargeData);

      // 2. Archive and remove from waiting list (discharges_waiting)
      await deleteDoc(doc(db, 'discharges_waiting', patient.id));

      // 3. Notify other modules dynamically via collection `notifications`
      const notifDocRef = doc(collection(db, 'notifications'));
      await setDoc(notifDocRef, {
        id: notifDocRef.id,
        message: `Sortie administrative validée pour ${patient.name} (${patient.id})`,
        module: 'Reception',
        targetModules: ['Cashier', 'Dashboard', 'Doctor'],
        createdAt: new Date().toISOString()
      });

      // Local state sync
      setPatientsToDischarge(prev => prev.filter(p => p.id !== id));

      // System notification toast
      window.dispatchEvent(new CustomEvent('app-notification', { 
        detail: `Sortie administrative validee pour ${patient.name}` 
      }));

      // 4. Trace in Audit
      await logAudit(`Sortie administrative validée`, { patientId: patient.id, patientName: patient.name });

      // 5. Generate and download official discharge PDF
      handleGeneratePDF('autorisation_sortie', patient);

    } catch (err: any) {
      console.error("Discharge validation failure:", err);
      alert(`Erreur lors du traitement de la sortie: ${err.message}`);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-900">
      {/* MODAL PRO-FORMA IMPRIMABLE */}
      {showProforma && selectedTxForProforma && (() => {
        const txId = selectedTxForProforma.id || '';
        
        let txDate = selectedTxForProforma.date || '';
        let txTime = selectedTxForProforma.time || '';
        if (selectedTxForProforma.createdAt) {
          try {
            const d = new Date(selectedTxForProforma.createdAt);
            if (!isNaN(d.getTime())) {
              txDate = d.toLocaleDateString('fr-FR');
              txTime = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            }
          } catch (err) {}
        }
        if (!txDate) txDate = new Date().toLocaleDateString('fr-FR');
        if (!txTime) txTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        const patientName = selectedTxForProforma.patient || selectedTxForProforma.patientName || 'Patient Anonyme';
        const dme = selectedTxForProforma.dme || selectedTxForProforma.patientId || 'VENTE DIRECTE';
        
        let motif = selectedTxForProforma.motif || selectedTxForProforma.requestingService || selectedTxForProforma.type || 'Acte Médical';
        if (motif === 'CONSULTATION') motif = 'Consultation Générale';
        
        const totalVal = selectedTxForProforma.total !== undefined ? selectedTxForProforma.total : (selectedTxForProforma.totalAmount || 0);
        const paidVal = selectedTxForProforma.paid !== undefined ? selectedTxForProforma.paid : (selectedTxForProforma.amountPaid || 0);
        
        const changeVal = selectedTxForProforma.change !== undefined ? selectedTxForProforma.change : Math.max(0, paidVal - totalVal);
        const remainingVal = selectedTxForProforma.remaining !== undefined ? selectedTxForProforma.remaining : Math.max(0, totalVal - paidVal);

        return (
          <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
             <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
               <div className="p-10">
                 <div className="flex justify-between items-start mb-10 border-b border-slate-100 pb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white italic shadow-lg">SH</div>
                      <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter">SmartHosto SIH</h2>
                        <p className="text-[10px] font-bold text-slate-400">Reçu de Caisse N° {txId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Date & Heure</p>
                      <p className="font-bold text-sm text-slate-900">{txDate} • {txTime}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-10 mb-10">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient</p>
                      <p className="font-black text-lg text-slate-900">{patientName}</p>
                      <p className="text-xs text-blue-600 font-mono font-bold tracking-tighter">{dme}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Guichetier</p>
                      <p className="font-bold text-sm text-slate-700">{agentProfile.name}</p>
                    </div>
                 </div>

                 <div className="space-y-4 mb-10">
                    <div className="flex justify-between items-center p-6 bg-slate-50 rounded-[30px] border border-slate-100">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600"><FileText size={18} /></div>
                          <span className="text-sm font-black text-slate-700 italic">{motif}</span>
                       </div>
                       <span className="font-black text-xl text-slate-900">{totalVal.toLocaleString()} CFA</span>
                    </div>
                 </div>

                 <div className="bg-slate-900 text-white p-10 rounded-[40px] mb-10 space-y-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><Activity size={120} /></div>
                    <div className="flex justify-between text-slate-400 text-xs font-bold uppercase tracking-widest">
                      <span>Montant Net à Payer</span>
                      <span className="text-white">{totalVal.toLocaleString()} CFA</span>
                    </div>
                    <div className="flex justify-between text-blue-400 text-xs font-bold uppercase tracking-widest">
                      <span>Espèces Encaissées</span>
                      <span className="text-white">{paidVal.toLocaleString()} CFA</span>
                    </div>
                    <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                      {changeVal > 0 ? (
                        <>
                          <span className="text-xs font-black uppercase text-emerald-400 tracking-tighter">Monnaie à Rendre</span>
                          <span className="text-4xl font-black text-emerald-400">{changeVal.toLocaleString()} <span className="text-sm font-normal opacity-50 italic">CFA</span></span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs font-black uppercase text-rose-400 tracking-tighter">Reste à Payer (Reliquat)</span>
                          <span className="text-4xl font-black text-rose-400">{remainingVal.toLocaleString()} <span className="text-sm font-normal opacity-50 italic">CFA</span></span>
                        </>
                      )}
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <button onClick={() => setShowProforma(false)} className="flex-1 py-5 bg-slate-100 text-slate-600 font-black rounded-3xl hover:bg-slate-200 transition-colors">Fermer</button>
                    <button onClick={() => handleGeneratePDF("proforma", selectedTxForProforma)} className="flex-[2] bg-blue-600 text-white py-5 rounded-3xl font-black shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                      <Printer size={20} /> Imprimer Ticket
                    </button>
                 </div>
               </div>
             </div>
          </div>
        );
      })()}

      {/* HEADER PRINCIPAL */}
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
               <Users size={32} className="text-blue-600" />
               {activeTab === 'triage' ? 'Admissions' : 
                activeTab === 'sorties' ? 'Sorties Admin' : 
                activeTab === 'demandes' ? 'Demandes de Paiement' : 'Mon Profil'}
             </h1>
             <p className="text-sm font-medium text-slate-500 italic">Espace Accueil SIH • Gestion des flux de patients</p>
           </div>
         </div>
         
         <div className="text-right hidden md:block">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisateur</p>
           <p className="font-bold text-slate-900 text-sm">{agentProfile.name}</p>
         </div>
      </header>

      {activeTab === 'triage' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {step === 'search' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                {/* Tableau de Bord des Indicateurs d'Orientation */}
                <div className="bg-slate-900 p-8 rounded-[40px] text-white overflow-hidden relative shadow-xl">
                  {/* Background glowing rings */}
                  <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl"></div>
                  <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl"></div>

                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-cyan-400">SIH SMARTHOSTO</h3>
                      <h2 className="text-xl font-black">Performance & Orientation en Temps Réel</h2>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live Monitoring
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Délai d'orientation</p>
                      <p className="text-2xl font-black text-white mt-1">11.4 <span className="text-xs font-normal opacity-60">min</span></p>
                      <p className="text-[9px] text-emerald-400 font-bold mt-1">✓ Conforme SLA (&lt; 15 min)</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Taux d'Adéquation</p>
                      <p className="text-2xl font-black text-cyan-300 mt-1">98.6%</p>
                      <p className="text-[9px] text-slate-400 font-bold mt-1">Parcours automatisés optimisés</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Urgences Triées</p>
                      <p className="text-2xl font-black text-rose-400 mt-1">
                        {todaysRequests.filter((r: any) => r.type === 'HOSPITALISATION' || r.type === 'URGENCE').length}
                      </p>
                      <p className="text-[9px] text-rose-300 font-bold mt-1">⚡ Prise en charge prioritaire</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Flux Admissions</p>
                      <p className="text-2xl font-black text-emerald-400 mt-1">
                        {todaysRequests.length} <span className="text-xs font-normal opacity-60">pats</span>
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold mt-1">Aujourd'hui</p>
                    </div>
                  </div>

                  {/* Micro breakdown of categories in mini graph */}
                  <div className="mt-6 pt-6 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fréquentation par grand type de recours :</span>
                    <div className="flex gap-4 items-center">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-400 bg-blue-400/5 px-2.5 py-1 rounded-xl">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Consultation
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-pink-400 bg-pink-400/5 px-2.5 py-1 rounded-xl">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span> Maternité
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-400 bg-rose-400/5 px-2.5 py-1 rounded-xl">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Urgendes
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-400 bg-indigo-400/5 px-2.5 py-1 rounded-xl">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Autres
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-200">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Search className="text-blue-600" /> Identifier Patient</h2>
                <div className="relative mb-4">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Nom ou N° DME..." className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-blue-500 transition-all text-xl font-medium" />
                </div>
                {searchQuery.length > 0 && (
                  <div className="mb-8 overflow-hidden rounded-3xl border border-slate-100 bg-slate-50">
                    {filteredPatients.length > 0 ? filteredPatients.map((p, idx) => (
                      <button key={`${p.id || idx}-${idx}`} onClick={() => handleSelectPatient(p)} className="w-full p-6 flex items-center justify-between hover:bg-blue-50 transition-colors border-b last:border-0 border-slate-100 group">
                        <div className="flex items-center gap-4 text-left">
                          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm"><UserIcon /></div>
                          <div><p className="font-black text-slate-900">{p.lastName} {p.firstName}</p><p className="text-xs text-slate-500 font-bold font-mono">{p.id}</p></div>
                        </div>
                        <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-600" />
                      </button>
                    )) : <div className="p-10 text-center"><p className="text-slate-400 font-bold text-sm">Aucun dossier trouvé</p></div>}
                  </div>
                )}
                <button onClick={async () => { const ids = await getNextSequentialIdsAndAssign(); setCurrentPatient({ id: ids.dmeId, patientId: ids.patientId, gender: 'M', maritalStatus: 'CELIBATAIRE', vitals: { bpSys: 120, bpDia: 80, heartRate: 75, respRate: 18, pulse: 75, spo2: 98, temp: 37, height: 170, weight: 70, bmi: 24.2, waistCirc: 85 } }); setStep('register'); }} className="w-full p-8 border-2 border-dashed border-slate-200 rounded-3xl hover:border-blue-500 hover:bg-blue-50/50 transition-all flex flex-col items-center text-center group">
                  <UserPlus size={40} className="text-slate-300 group-hover:text-blue-500 mb-2" /><h3 className="font-bold">Créer un nouveau Dossier DME</h3>
                </button>
              </div>
            </div>
          )}

            {step === 'register' && (
              <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-200 animate-in slide-in-from-right-4">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-black italic">Admission DME</h2>
                  <button onClick={() => setStep('search')} className="text-slate-400 hover:text-slate-900 font-bold text-xs uppercase">Retour</button>
                </div>
                
                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="space-y-6">
                    <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-blue-500" placeholder="Nom" value={currentPatient.lastName || ''} onChange={e => setCurrentPatient({...currentPatient, lastName: e.target.value})} />
                    <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-blue-500" placeholder="Prénom" value={currentPatient.firstName || ''} onChange={e => setCurrentPatient({...currentPatient, firstName: e.target.value})} />
                    <div className="flex gap-4">
                       <div className="flex-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Date de Naissance</label>
                          <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-blue-500" value={currentPatient.birthDate || ''} onChange={e => setCurrentPatient({...currentPatient, birthDate: e.target.value})} />
                       </div>
                       <div className="w-24">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Sexe</label>
                          <select className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold" value={currentPatient.gender} onChange={e => setCurrentPatient({...currentPatient, gender: e.target.value as 'M'|'F'})}>
                             <option value="M">M</option>
                             <option value="F">F</option>
                          </select>
                       </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-blue-500" placeholder="Résidence" value={currentPatient.residence || ''} onChange={e => setCurrentPatient({...currentPatient, residence: e.target.value})} />
                    <input type="tel" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-blue-500" placeholder="Téléphone" value={currentPatient.phone || ''} onChange={e => setCurrentPatient({...currentPatient, phone: e.target.value})} />
                    <div className="p-4 bg-blue-50 rounded-2xl flex items-center gap-3">
                       <Info size={20} className="text-blue-500" />
                       <p className="text-xs font-bold text-blue-700 italic">Âge automatique: {calculateAge(currentPatient.birthDate)} ans</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setStep('triage')} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2">Définir Motif de Visite <ChevronRight size={18} /></button>
              </div>
            )}

            {step === 'triage' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-200">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">Orientation Intelligente</h2>
                      <p className="text-xs text-slate-500 font-medium italic mt-1">Sélectionnez le motif réel de recours. Le service destinataire, la file d'attente et la spécialité seront configurés automatiquement.</p>
                    </div>
                    <div className="text-right whitespace-nowrap bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Patient en cours d'admission</p>
                       <p className="font-bold text-slate-950 text-sm">{currentPatient.lastName} {currentPatient.firstName}</p>
                       <p className="text-xs text-slate-500 font-medium">{calculateAge(currentPatient.birthDate)} ans • {currentPatient.gender === 'F' ? 'Féminin' : 'Masculin'}</p>
                    </div>
                  </div>

                  {/* Category Switches */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                    {(['CONSULTATIONS', 'MATERNITE', 'URGENCES', 'AUTRES'] as const).map((catName) => {
                      const isActive = currentMotifCategory === catName;
                      const catAttrs = {
                        CONSULTATIONS: { label: 'Consultations', color: 'blue', icon: Stethoscope },
                        MATERNITE: { label: 'Maternité', color: 'pink', icon: Award },
                        URGENCES: { label: 'Urgences', color: 'rose', icon: ShieldAlert },
                        AUTRES: { label: 'Autres Services', color: 'indigo', icon: Activity }
                      }[catName];

                      const CatIcon = catAttrs.icon;
                      
                      return (
                        <button
                          key={catName}
                          onClick={() => {
                            setCurrentMotifCategory(catName);
                            // Clear selected motif when switching tabs to ensure explicit user choices
                            setSelectedMotif(null);
                            setVisitMotif(null);
                          }}
                          className={`flex items-center gap-3 p-4 rounded-2xl border-2 font-black text-xs uppercase tracking-wider transition-all justify-center ${
                            isActive 
                              ? 'bg-slate-900 text-white border-transparent shadow-lg scale-105' 
                              : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100/50'
                          }`}
                        >
                          <CatIcon size={16} />
                          {catAttrs.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* List Motifs for Active Category */}
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Motifs réels de recours disponible</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeMotifs
                        .filter(m => m.category === currentMotifCategory)
                        .map((motif) => {
                          const isSelected = selectedMotif?.id === motif.id;
                          
                          // Custom colors
                          const colorClass = 
                            motif.category === 'CONSULTATIONS' ? 'blue' :
                            motif.category === 'MATERNITE' ? 'rose' :
                            motif.category === 'URGENCES' ? 'red' : 'indigo';

                          return (
                            <button
                              key={motif.id}
                              onClick={() => {
                                setSelectedMotif(motif);
                                // Adapt to legacy VisitMotif
                                let legacyVal: VisitMotif = 'CONSULTATION';
                                if (motif.category === 'CONSULTATIONS') legacyVal = 'CONSULTATION';
                                else if (motif.category === 'MATERNITE') legacyVal = 'MATERNITE';
                                else if (motif.category === 'URGENCES') legacyVal = 'URGENCE';
                                else {
                                  if (motif.serviceId === 'SRV-LABO') legacyVal = 'LABORATOIRE';
                                  else if (motif.serviceId === 'SRV-INFIRMIER') legacyVal = 'SOIN_INFIRMIER';
                                  else if (motif.serviceId === 'SRV-VACCINATION') legacyVal = 'SOIN_INFIRMIER';
                                  else if (motif.serviceId === 'SRV-PHARMACIE') legacyVal = 'PHARMACIE';
                                }
                                setVisitMotif(legacyVal);
                              }}
                              className={`p-6 rounded-3xl border-2 text-left transition-all relative flex flex-col justify-between h-44 group ${
                                isSelected 
                                  ? 'border-indigo-600 bg-indigo-50/50 shadow-xl scale-[1.02]' 
                                  : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                              }`}
                            >
                              <div>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white border border-slate-100 shadow-sm ${
                                  isSelected ? 'border-indigo-300 text-indigo-700' : 'text-slate-500'
                                }`}>
                                  {motif.speciality}
                                </span>
                                <h4 className="font-black text-slate-800 text-sm mt-3 group-hover:text-slate-900 transition-colors">{motif.label}</h4>
                              </div>

                              <div className="mt-4 border-t border-slate-200 pt-3 flex items-center justify-between">
                                <div>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">SALLE D'ATTENTE</p>
                                  <p className="font-bold text-slate-700 text-[10px] truncate max-w-[150px]">{motif.queueName}</p>
                                </div>
                                <div className="text-right">
                                  <span className="font-black text-xs text-slate-900">{motif.fee.toLocaleString()} F</span>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase">CFA</p>
                                </div>
                              </div>
                            </button>
                          );
                        })}

                      {activeMotifs.filter(m => m.category === currentMotifCategory).length === 0 && (
                        <div className="col-span-full py-12 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-100">
                          <p className="text-slate-400 text-xs font-bold font-mono">AUCUN RECOURS DISPONIBLE DANS CETTE CATÉGORIE</p>
                          <p className="text-[10px] text-slate-400 italic mt-1">Vérifiez les paramètres pour activer les spécialités correspondantes.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedMotif && (
                  <div className="bg-slate-900 p-8 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl animate-in slide-in-from-bottom-6">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-white/10 rounded-2xl text-blue-400">
                        <Activity size={24} />
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">Routage automatique configuré</span>
                        <h4 className="font-black text-md text-slate-100">{selectedMotif.label}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 font-medium mt-1">
                          <p>Service: <strong className="text-slate-200">
                            {selectedMotif.serviceId === 'SRV-CONSULTATION' ? 'Consultation externe' :
                             selectedMotif.serviceId === 'SRV-MATERNITE' ? 'Maternité' :
                             selectedMotif.serviceId === 'SRV-URGENCES' ? 'Urgences' :
                             selectedMotif.serviceId === 'SRV-LABO' ? 'Laboratoire' :
                             selectedMotif.serviceId === 'SRV-INFIRMIER' ? 'Soins infirmiers' :
                             selectedMotif.serviceId === 'SRV-VACCINATION' ? 'Vaccination' :
                             selectedMotif.serviceId === 'SRV-PHARMACIE' ? 'Pharmacie' : 'Général'}
                          </strong></p>
                          <p>File: <strong className="text-slate-200">{selectedMotif.queueName}</strong></p>
                          <p>Spécialité: <strong className="text-slate-200">{selectedMotif.speciality}</strong></p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                      <button 
                        onClick={() => {
                          const isClinical = selectedMotif.category === 'CONSULTATIONS' || selectedMotif.category === 'MATERNITE' || selectedMotif.category === 'URGENCES';
                          setStep(isClinical ? 'pre-consultation' : 'payment');
                        }}
                        className="flex-1 md:flex-initial bg-white text-slate-900 hover:bg-blue-50 hover:text-blue-600 px-8 py-5 rounded-3xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-3 shadow-lg"
                      >
                        <ChevronRight size={16} /> 
                        {selectedMotif.category === 'CONSULTATIONS' || selectedMotif.category === 'MATERNITE' || selectedMotif.category === 'URGENCES' ? 'Prendre les Signes Vitaux' : 'Passer au paiement'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 'pre-consultation' && (
              <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-200 animate-in zoom-in-95 duration-300">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 border-b border-slate-100 pb-8">
                   <div className="flex items-center gap-4">
                      <div className="p-4 bg-emerald-100 text-emerald-700 rounded-3xl"><Activity size={24} /></div>
                      <div>
                        <h2 className="text-2xl font-black italic">Triage & Constantes vitales</h2>
                        <p className="text-sm text-slate-500 font-medium tracking-tight">Veuillez renseigner les constantes vitales pour calculer l'orientation prioritaire du patient.</p>
                      </div>
                   </div>
                   
                   {/* Triage Priority Board */}
                   <div className="flex gap-4 items-center self-stretch md:self-auto justify-between bg-slate-50 border border-slate-150 p-4 rounded-3xl">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IMC dynamique</p>
                        <p className={`text-2xl font-black ${computedBMI > 25 ? 'text-rose-600' : 'text-emerald-600'}`}>{computedBMI} <span className="text-xs font-normal opacity-50">kg/m²</span></p>
                      </div>

                      <div className="h-10 w-px bg-slate-200"></div>

                      <div className="text-right flex flex-col items-end">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Priorité clinique calculée</p>
                        <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${
                          computedPriorityAndAlerts.priority === 'critique' ? 'bg-rose-500 text-white border-transparent animate-pulse' :
                          computedPriorityAndAlerts.priority === 'urgent' ? 'bg-amber-500 text-white border-transparent' :
                          'bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}>
                          {computedPriorityAndAlerts.priority}
                        </div>
                        {computedPriorityAndAlerts.alerts.length > 0 && (
                          <span className="text-[8px] font-bold text-rose-600 mt-1 max-w-[150px] truncate" title={computedPriorityAndAlerts.alerts.join(", ")}>
                            ⚠️ {computedPriorityAndAlerts.alerts.join(", ")}
                          </span>
                        )}
                      </div>
                   </div>
                </div>

                <div className="space-y-10">
                   <section>
                      <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 border-b border-blue-50 pb-2">
                        <UserCheck size={16} /> Identité 360°
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-2">Ethnie</label>
                          <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500" value={currentPatient.ethnicity || ''} onChange={e => setCurrentPatient({...currentPatient, ethnicity: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-2">Statut Matrimonial</label>
                          <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold" value={currentPatient.maritalStatus} onChange={e => setCurrentPatient({...currentPatient, maritalStatus: e.target.value as any})}>
                             <option value="CELIBATAIRE">Célibataire</option>
                             <option value="MARIE">Marié(e)</option>
                             <option value="VEUF">Veuf/Veuve</option>
                             <option value="DIVORCE">Divorcé(e)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-2">Religion</label>
                          <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500" value={currentPatient.religion || ''} onChange={e => setCurrentPatient({...currentPatient, religion: e.target.value})} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-2">Contact d'Urgence (Nom complet)</label>
                          <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500" value={currentPatient.emergencyContact || ''} onChange={e => setCurrentPatient({...currentPatient, emergencyContact: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-2">Tél. Urgence</label>
                          <input type="tel" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500" value={currentPatient.emergencyPhone || ''} onChange={e => setCurrentPatient({...currentPatient, emergencyPhone: e.target.value})} />
                        </div>
                      </div>
                   </section>

                   <section>
                      <h3 className="text-xs font-black text-rose-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 border-b border-rose-50 pb-2">
                        <Heart size={16} /> Signes Vitaux
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        {[
                          { label: 'TA Syst.', unit: 'mmHg', key: 'bpSys' },
                          { label: 'TA Diast.', unit: 'mmHg', key: 'bpDia' },
                          { label: 'Fréq. Card.', unit: 'bpm', key: 'heartRate' },
                          { label: 'Fréq. Resp.', unit: 'm/min', key: 'respRate' },
                          { label: 'Pouls', unit: 'bpm', key: 'pulse' },
                          { label: 'SPO2', unit: '%', key: 'spo2' },
                        ].map((vital) => (
                          <div key={vital.key} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                             <p className="text-[9px] font-black text-slate-400 uppercase mb-2">{vital.label}</p>
                             <input type="number" className="w-full bg-transparent font-black text-xl outline-none text-slate-900" value={(currentPatient.vitals as any)?.[vital.key]} onChange={e => setCurrentPatient({...currentPatient, vitals: {...currentPatient.vitals!, [vital.key]: parseInt(e.target.value)}})} />
                             <span className="absolute right-4 bottom-4 text-[9px] font-bold text-slate-300 italic">{vital.unit}</span>
                          </div>
                        ))}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative md:col-span-2">
                           <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Température</p>
                           <div className="flex items-center gap-2">
                              <Thermometer size={18} className="text-rose-400" />
                              <input type="number" step="0.1" className="w-full bg-transparent font-black text-3xl outline-none text-slate-900" value={currentPatient.vitals?.temp} onChange={e => setCurrentPatient({...currentPatient, vitals: {...currentPatient.vitals!, temp: parseFloat(e.target.value)}})} />
                              <span className="text-sm font-black text-slate-300">°C</span>
                           </div>
                        </div>
                      </div>
                   </section>

                   <section>
                      <h3 className="text-xs font-black text-amber-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 border-b border-amber-50 pb-2">
                        <Scale size={16} /> Anthropométrie
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="p-6 bg-slate-50 rounded-[30px] border border-slate-100 group">
                           <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Taille (cm)</p>
                           <input type="number" className="w-full bg-transparent font-black text-4xl outline-none text-slate-900 group-focus-within:text-blue-600" value={currentPatient.vitals?.height} onChange={e => setCurrentPatient({...currentPatient, vitals: {...currentPatient.vitals!, height: parseInt(e.target.value)}})} />
                        </div>
                        <div className="p-6 bg-slate-50 rounded-[30px] border border-slate-100 group">
                           <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Poids (kg)</p>
                           <input type="number" className="w-full bg-transparent font-black text-4xl outline-none text-slate-900 group-focus-within:text-blue-600" value={currentPatient.vitals?.weight} onChange={e => setCurrentPatient({...currentPatient, vitals: {...currentPatient.vitals!, weight: parseInt(e.target.value)}})} />
                        </div>
                        <div className="p-6 bg-slate-900 rounded-[30px] text-white flex flex-col justify-center border-4 border-blue-600/20">
                           <p className="text-[10px] font-black text-slate-400 uppercase mb-1">IMC Calculé</p>
                           <p className="text-4xl font-black">{currentPatient.vitals?.bmi} <span className="text-xs font-normal opacity-50">kg/m²</span></p>
                           <p className={`text-[10px] font-bold mt-2 uppercase ${currentPatient.vitals?.bmi! > 25 ? 'text-rose-400' : 'text-emerald-400'}`}>
                             {currentPatient.vitals?.bmi! > 30 ? 'Obésité' : currentPatient.vitals?.bmi! > 25 ? 'Surpoids' : 'Normal'}
                           </p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-[30px] border border-slate-100 group">
                           <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Circ. Abd. (cm)</p>
                           <input type="number" className="w-full bg-transparent font-black text-4xl outline-none text-slate-900 group-focus-within:text-blue-600" value={currentPatient.vitals?.waistCirc} onChange={e => setCurrentPatient({...currentPatient, vitals: {...currentPatient.vitals!, waistCirc: parseInt(e.target.value)}})} />
                        </div>
                      </div>
                   </section>
                </div>

                <div className="flex gap-4 mt-12 pt-10 border-t border-slate-50">
                  <button onClick={() => setStep('triage')} className="flex-1 bg-slate-100 text-slate-600 py-6 rounded-3xl font-black hover:bg-slate-200 transition-all">Retour</button>
                  <button onClick={finalizeAdmission} className="flex-[3] bg-blue-600 text-white py-6 rounded-3xl font-black shadow-2xl hover:bg-blue-700 flex items-center justify-center gap-4 transition-all scale-105">
                    Enregistrer & Générer Demande de Paiement <ChevronRight />
                  </button>
                </div>
              </div>
            )}

            {step === 'summary' && (
              <div className="bg-white p-16 rounded-[50px] border border-slate-200 text-center animate-in zoom-in-95 duration-700 shadow-xl">
                <div className="w-32 h-32 bg-emerald-50 rounded-[40px] flex items-center justify-center mx-auto mb-10 border-4 border-white shadow-2xl rotate-12">
                  <CheckCircle2 size={64} className="text-emerald-500" />
                </div>
                <h2 className="text-4xl font-black mb-4 tracking-tight">Admission Réussie</h2>
                <p className="text-slate-500 font-medium mb-12 max-w-md mx-auto italic">Le patient est maintenant visible dans la file d'attente du médecin. Pensez à lui remettre son ticket.</p>
                <div className="flex gap-6 justify-center max-w-lg mx-auto">
                   <button onClick={() => setShowProforma(true)} className="flex-1 bg-slate-900 text-white py-6 rounded-3xl font-black flex items-center justify-center gap-3 shadow-xl hover:bg-slate-800 transition-all"><Printer size={24} /> Voir le Ticket</button>
                   <button onClick={() => { setStep('search'); setAmountReceived(''); setNotebookAdded(false); setVisitMotif(null); }} className="flex-1 bg-blue-600 text-white py-6 rounded-3xl font-black hover:bg-blue-700 shadow-xl transition-all">Nouveau Patient</button>
                </div>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden text-slate-900">
              <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-black text-[10px] uppercase tracking-widest italic flex items-center gap-2"><Activity size={16} /> Salle d'Attente</h3>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black">{todaysRequests.length} PATIENTS</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
                {todaysRequests.map((p, i) => (
                  <div key={i} className="p-8 hover:bg-slate-50 group transition-all relative overflow-hidden">
                    {p.status === 'PENDING' && <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 animate-pulse"></div>}
                    <div className="flex justify-between items-start mb-3">
                       <div>
                         <p className="font-black text-slate-900">{p.patientName}</p>
                         <p className="text-[10px] text-slate-400 font-black font-mono tracking-tighter uppercase">{p.patientId} • {p.type}</p>
                       </div>
                       <button onClick={() => { setSelectedTxForProforma(p); setShowProforma(true); }} className="p-3 text-slate-300 hover:text-blue-600 hover:bg-white rounded-2xl transition-all shadow-sm"><Printer size={18} /></button>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                       <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl border-2 ${p.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' : p.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                         {p.status === 'PENDING' ? 'EN ATTENTE DE PAIEMENT' : p.status === 'PAID' ? 'FACTURE SOLDÉE' : 'ANNULÉ'}
                       </span>
                       <span className="text-[10px] text-slate-400 font-bold italic">{new Date(p.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sorties' && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
           <div className="bg-white p-12 rounded-[50px] border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5"><LogOut size={200} /></div>
              <div className="relative z-10 flex justify-between items-center mb-12">
                 <div>
                    <h2 className="text-3xl font-black italic tracking-tight text-slate-900">Sorties Administratives</h2>
                    <p className="text-slate-500 font-medium max-w-md italic">Validation finale avant que le patient ne quitte l'enceinte hospitalière.</p>
                 </div>
                 <div className="bg-emerald-100 text-emerald-700 px-6 py-3 rounded-full text-xs font-black italic shadow-inner">
                    {patientsToDischarge.length} PATIENTS PRÊTS
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                 {patientsToDischarge.map((patient) => (
                   <div key={patient.id} className="p-10 bg-slate-50 rounded-[40px] border border-slate-200 hover:border-blue-500 hover:shadow-2xl transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRightLeft size={40} className="text-blue-500" /></div>
                      <div className="flex justify-between mb-6">
                         <span className="text-[10px] font-black text-slate-400 font-mono tracking-widest uppercase">{patient.id}</span>
                         <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">Clôture Prête</span>
                      </div>
                      <h3 className="text-2xl font-black mb-2 text-slate-900">{patient.name}</h3>
                      <p className="text-xs text-slate-500 mb-6 font-medium italic">Service: <span className="text-blue-600 font-bold">{patient.department}</span> • Admis le {patient.admissionDate}</p>

                       {/* Critère Checklist Indicators */}
                       <div className="grid grid-cols-3 gap-2 mb-6 bg-white p-3 rounded-2xl border border-slate-100">
                         <div className="flex flex-col items-center text-center">
                           <CheckCircle2 size={14} className={patient.medicalClearance ? "text-emerald-500 mb-0.5" : "text-rose-400 mb-0.5"} />
                           <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Médicale</span>
                           <span className="text-[9px] font-bold text-slate-700">{patient.medicalClearance ? "Validée" : "Manquante"}</span>
                         </div>
                         <div className="flex flex-col items-center text-center">
                           <CheckCircle2 size={14} className={patient.hospitalizationClosed ? "text-emerald-500 mb-0.5" : "text-rose-400 mb-0.5"} />
                           <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Clôture Hosp</span>
                           <span className="text-[9px] font-bold text-slate-700">{patient.hospitalizationClosed ? "Validée" : "En cours"}</span>
                         </div>
                         <div className="flex flex-col items-center text-center">
                           <CheckCircle2 size={14} className={patient.financialClearance ? "text-emerald-500 mb-0.5" : "text-rose-400 mb-0.5"} />
                           <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Financière</span>
                           <span className="text-[9px] font-bold text-slate-700">{patient.financialClearance ? "Soldée" : "Impayée"}</span>
                         </div>
                       </div>

                       {dischargeError && dischargeError.patientId === patient.id && (
                         <div className="mb-6 p-4 bg-rose-50 text-rose-800 border-2 border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs font-semibold shadow-sm animate-bounce">
                           <ShieldAlert className="text-rose-600 flex-shrink-0" size={16} />
                           <div>
                             <p className="font-bold uppercase tracking-wider text-rose-950 mb-0.5">Impression refusée</p>
                             <p className="text-[11px] leading-snug whitespace-pre-line">{dischargeError.message}</p>
                           </div>
                         </div>
                       )}
                      
                      <div className="flex gap-4">
                        <button 
                          onClick={() => handleDischarge(patient.id)}
                          className="flex-1 bg-slate-900 text-white py-5 rounded-3xl font-black text-sm hover:bg-emerald-600 hover:scale-[1.02] transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3"
                        >
                          <CheckCircle size={20} /> Valider la Sortie
                        </button>
                        <button 
                          disabled={!(patient.medicalClearance === true && patient.hospitalizationClosed === true && patient.financialClearance === true)}
                          onClick={() => handleGeneratePDF('autorisation_sortie', patient)}
                          className={`p-5 rounded-3xl transition-all shadow-sm flex items-center justify-center ${
                            (patient.medicalClearance === true && patient.hospitalizationClosed === true && patient.financialClearance === true)
                              ? "bg-white border text-blue-600 hover:text-blue-700 hover:border-blue-200 cursor-pointer"
                              : "bg-slate-100 border border-slate-200 text-slate-300 cursor-not-allowed opacity-50"
                          }`}
                          title="Imprimer l'Autorisation de Sortie"
                        >
                          <Printer size={22} />
                        </button>
                      </div>
                   </div>
                 ))}

                 {patientsToDischarge.length === 0 && (
                   <div className="col-span-2 py-24 text-center bg-slate-100 rounded-[50px] border-4 border-dashed border-slate-200">
                      <Activity size={64} className="text-slate-300 mx-auto mb-6 opacity-20" />
                      <p className="text-slate-400 font-black uppercase tracking-widest text-sm italic">Aucun patient n'est en attente de sortie administrative</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'demandes' && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8">
          <div className="bg-white rounded-[50px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
             <div className="p-10 border-b flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-6">
                  <h3 className="font-black italic text-slate-900 flex items-center gap-3">
                    <CreditCard className="text-blue-600" /> Demandes de Paiement (Accueil)
                  </h3>
                </div>
             </div>
             <div className="flex-1 overflow-y-auto max-h-[700px]">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 sticky top-0 z-10">
                    <tr>
                      <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                      <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant Total</th>
                      <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paymentRequests.filter(pr => pr.sourceModule === 'RECEPTION').length > 0 ? paymentRequests.filter(pr => pr.sourceModule === 'RECEPTION').map((pr) => (
                      <tr key={pr.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="p-8 text-xs font-bold text-slate-400 italic">{new Date(pr.createdAt).toLocaleString()}</td>
                        <td className="p-8">
                           <p className="font-black text-slate-900 text-sm">{pr.patientName}</p>
                           <p className="text-[10px] text-slate-500 font-bold uppercase">{pr.patientId}</p>
                        </td>
                        <td className="p-8 font-black text-sm">{pr.totalAmount.toLocaleString()} CFA</td>
                        <td className="p-8">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                             pr.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                             pr.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                             'bg-rose-100 text-rose-700'
                           }`}>
                             {pr.status === 'PENDING' ? 'En Attente' : pr.status === 'PAID' ? 'Payé' : 'Annulé'}
                           </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="p-20 text-center">
                           <div className="flex flex-col items-center opacity-30">
                             <FileText size={48} className="mb-4" />
                             <p className="text-sm font-black uppercase tracking-[0.2em]">Aucune demande</p>
                           </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'profil' && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             <div className="lg:col-span-4 space-y-8">
                <div className="bg-white p-12 rounded-[50px] border border-slate-200 shadow-sm text-center relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-full h-24 bg-blue-600 group-hover:h-32 transition-all duration-500"></div>
                   <div className="relative z-10 mt-4">
                      <div className="w-32 h-32 rounded-full border-8 border-white bg-slate-100 mx-auto overflow-hidden shadow-2xl relative mb-6">
                        <img src={`https://picsum.photos/200/200?u=${agentProfile.name}`} alt="Profile" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><UserIcon size={32} className="text-white" /></div>
                      </div>
                      <h2 className="text-3xl font-black italic text-slate-900 tracking-tight">{agentProfile.name}</h2>
                      <p className="text-blue-600 font-black text-xs uppercase tracking-widest mt-2">{agentProfile.role}</p>
                      
                      <div className="mt-10 flex gap-4 justify-center">
                         <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Actes du jour</p>
                            <p className="text-xl font-black text-slate-900">{todaysRequests.length}</p>
                         </div>
                         <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100">
                            <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">Quote-part</p>
                            <p className="text-xl font-black text-emerald-600">{agentProfile.quotePartRate}</p>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-900 p-10 rounded-[45px] text-white shadow-2xl">
                   <h3 className="text-xl font-black mb-8 flex items-center gap-3 italic"><Award className="text-blue-400" /> Mon Badge Digital</h3>
                   <div className="space-y-6">
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-slate-400 font-bold uppercase">Profession</span>
                         <span className="font-black text-blue-400">{agentProfile.profession}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-slate-400 font-bold uppercase">ID Badge</span>
                         <span className="font-black font-mono tracking-tighter">#SH-2024-{agentProfile.name.split(' ')[0].toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-slate-400 font-bold uppercase">Salaire Base</span>
                         <span className="font-black text-emerald-400">{agentProfile.salary}</span>
                      </div>
                   </div>
                   <button className="w-full mt-10 py-5 bg-white/10 hover:bg-white/20 rounded-3xl font-black text-xs uppercase tracking-widest transition-all">Consulter Mes Bulletins</button>
                </div>
             </div>

             <div className="lg:col-span-8 space-y-8">
                <div className="bg-white p-12 rounded-[50px] border border-slate-200 shadow-sm h-full">
                   <div className="flex items-center justify-between mb-12">
                      <h3 className="text-2xl font-black italic flex items-center gap-3"><Clock size={24} className="text-blue-600" /> Planning & Activité</h3>
                      <button className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-900 transition-colors uppercase italic"><Settings size={16} /> Gérer Mes Disponibilités</button>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-8 mb-12">
                      <div className="p-8 bg-blue-50 rounded-[40px] border border-blue-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><Calendar size={100} /></div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 italic">Mon Horaire Officiel</p>
                        <h4 className="text-2xl font-black text-blue-900">{agentProfile.schedule}</h4>
                        <div className="text-xs text-blue-600 mt-4 font-bold italic flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Session en cours depuis 08:00</div>
                      </div>
                      <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp size={100} /></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">Dernières Demandes Traitées</p>
                        <div className="space-y-2 mt-4 relative z-10">
                           {todaysRequests.slice(0, 3).map((tx, idx) => (
                             <div key={idx} className="flex justify-between items-center text-[11px] font-bold">
                               <span className="text-slate-900 italic">{tx.patientName}</span>
                               <span className="text-blue-600 font-mono">{tx.totalAmount.toLocaleString()} CFA</span>
                             </div>
                           ))}
                        </div>
                      </div>
                   </div>

                   <section>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">Droit d'accès & Sécurité</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {[
                           { label: "Accès Admissions", enabled: true },
                           { label: "Accès Caisse Centrale", enabled: true },
                           { label: "Accès Boutique SIH", enabled: true },
                           { label: "Accès Dossier Médical (Lecture)", enabled: false },
                           { label: "Accès Stock Pharmacie", enabled: false },
                           { label: "Accès Rapports Financiers", enabled: true }
                         ].map((perm, i) => (
                           <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                             <span className="text-xs font-bold text-slate-700">{perm.label}</span>
                             <div className={`w-3 h-3 rounded-full ${perm.enabled ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-300'}`}></div>
                           </div>
                         ))}
                      </div>
                   </section>
                </div>
             </div>
           </div>
        </div>
      )}

      {showLabExamForm && currentPatient && (
        <LabExamRequestForm
          patientId={currentPatient.id || 'unknown'}
          patientName={`${currentPatient.lastName} ${currentPatient.firstName}`}
          patientAge={calculateAge(currentPatient.birthDate || '')}
          patientSex={currentPatient.gender || 'M'}
          patientDossier={currentPatient.id || 'unknown'}
          prescriberId={user?.id || 'unknown'}
          prescriberName={user?.name || 'Réceptionniste'}
          requestingService="Accueil"
          onClose={() => setShowLabExamForm(false)}
          onSave={async (request) => {
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
            
            // 1. Save to Firebase Firestore custom collection `laboratory_requests` and standard `lab_requests`
            try {
              await setDoc(doc(db, 'laboratory_requests', newRequest.id), {
                ...newRequest,
                user: user?.name || 'Agent Accueil',
                createdAt: new Date().toISOString()
              });
              await setDoc(doc(db, 'lab_requests', newRequest.id), newRequest);

              // 2. Multi-user laboratory notification inside `notifications`
              const notifDocRef = doc(collection(db, 'notifications'));
              await setDoc(notifDocRef, {
                id: notifDocRef.id,
                message: `Prescription d'analyses de laboratoire pour ${newRequest.patientName}`,
                module: 'Reception',
                targetModules: ['Lab'],
                createdAt: new Date().toISOString()
              });

              // 3. Dispatch local notification as toast
              window.dispatchEvent(new CustomEvent('app-notification', { 
                detail: `Nouvelle prescription d'examens labo pour ${newRequest.patientName}` 
              }));

              // 4. Trace the prescription action in audit logs
              await logAudit(`Création bulletin d'examens`, { reqId: newRequest.id, exams: newRequest.exams });

            } catch (error) {
              console.error('Error saving laboratory requirements to Firestore:', error);
            }
            
            // Generate PDF on save too so the user gets a physical bulletin!
            handleGeneratePDF('bulletin_examens', newRequest);

            setShowLabExamForm(false);
            setStep('payment'); // Move to payment after prescribing
          }}
        />
      )}
    </div>
  );
};

export default Reception;
