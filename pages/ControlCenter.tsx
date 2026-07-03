import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  CreditCard, 
  LayoutDashboard, 
  Settings, 
  Activity, 
  ShieldAlert, 
  Microscope, 
  BedDouble, 
  Baby, 
  Pill, 
  TrendingUp, 
  Users, 
  User, 
  Clock, 
  FileText, 
  Search, 
  Plus, 
  Filter, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  RefreshCw, 
  Sliders, 
  Calendar, 
  ChevronRight, 
  Award, 
  Eye, 
  Info, 
  Layers, 
  Bell, 
  Cloud, 
  DollarSign, 
  Download, 
  PlusCircle, 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  Key, 
  Database, 
  Send, 
  Paperclip, 
  CheckSquare, 
  Lock, 
  HelpCircle,
  FileSpreadsheet,
  MapPin,
  Mail,
  Phone,
  ArrowRight,
  Cpu,
  Bookmark,
  Languages,
  Printer,
  HardDrive
} from 'lucide-react';
import { Role, User as UserType } from '../types';

// Let's define custom interfaces for SaaS model
export interface ClinicTenant {
  id: string; // Tenant unique ID
  name: string;
  logoUrl?: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  responsibleUser: string;
  createdAt: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'DEMO' | 'MAINTENANCE';
  licenseType: 'DEMO' | 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';
  licenseStart: string;
  licenseEnd: string;
  licensePrice: number;
  autoRenew: boolean;
  structureType?: 'Cabinet médical' | 'Centre médical' | 'Clinique' | 'Hôpital' | 'Maternité' | 'Laboratoire' | 'Centre spécialisé';
  websiteUrl?: string;

  // Technical monitoring fields
  dbReadsToday?: number;
  dbReadsThisMonth?: number;
  dbReadsCumulative?: number;
  dbWritesToday?: number;
  dbWritesThisMonth?: number;
  dbWritesCumulative?: number;
  bandwidthUsedMB?: number;
  dataTransferredGB?: number;
  lastConnection?: string;

  // AI detailed consumption and quotas fields
  aiUsage?: {
    clinicalRequests: number;
    obstetricalRequests: number;
    pharmaceuticalRequests: number;
    administrativeRequests: number;
    requestsToday: number;
    requestsThisMonth: number;
    requestsCumulative: number;
    tokensConsumed: number;
    estimatedCost: number;
    avgResponseTime: number;
    cumulativeTime: number;
    maxRequestsPerMonth: number;
    maxTokensPerMonth: number;
  };
  
  // Quotas Configuration
  quotas: {
    maxUsers: number;
    maxPatients: number;
    maxStorageGB: number;
    maxSites: number;
    maxMonthlyConsultations: number;
    maxMonthlyHospitalizations: number;
  };
  
  // Current Usage Values
  usage: {
    activeUsers: number;
    totalPatients: number;
    storageUsedGB: number;
    sitesUsed: number;
    monthlyConsultations: number;
    monthlyHospitalizations: number;
    monthlyPrescriptions: number;
    totalExams: number;
    dailyConnections: number;
    aiTokensUsed: number;
  };

  // Licensed modules and tools
  activatedModules: Record<string, boolean>;
  activatedTools: Record<string, boolean>;
}

export interface SupportTicket {
  id: string;
  clinicId: string;
  clinicName: string;
  category: 'TECH' | 'BILLING' | 'CLINICAL' | 'ONBOARDING' | 'BUG';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  title: string;
  description: string;
  createdAt: string;
  assignedTechnician?: string;
  messages: {
    sender: string;
    message: string;
    timestamp: string;
    isAdmin: boolean;
  }[];
}

export interface SubscriptionInvoice {
  id: string;
  clinicId: string;
  clinicName: string;
  plan: string;
  amount: number;
  currency: string;
  dueDate: string;
  paidDate?: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED';
  paymentMethod?: string;
}

export interface SaaSLog {
  id: string;
  timestamp: string;
  user: string;
  clinicId?: string;
  clinicName?: string;
  action: string;
  details: string;
  category: 'LOGIN' | 'LICENSE' | 'QUOTA' | 'MODULE' | 'TOOL' | 'SECURITY';
}

interface ControlCenterProps {
  onBackToDashboard: () => void;
  currentUser: UserType | null;
}

export const ControlCenter: React.FC<ControlCenterProps> = ({ onBackToDashboard, currentUser }) => {
  // --- LOCAL PERSISTED DATABASES ---
  const [clinics, setClinics] = useState<ClinicTenant[]>(() => {
    const saved = localStorage.getItem('saas_clinics');
    if (saved) return JSON.parse(saved);    // Initial Seed Data
    const seeds: ClinicTenant[] = [
      {
        id: 'tenant_cm_dak',
        name: 'Clinique de la Paix - Dakar',
        address: '12 Avenue Cheikh Anta Diop',
        city: 'Dakar',
        country: 'Sénégal',
        phone: '+221 33 824 55 44',
        email: 'direction@cliniquedelapaix.sn',
        responsibleUser: 'Dr. Souleymane Diallo',
        createdAt: '2025-01-15',
        status: 'ACTIVE',
        licenseType: 'PREMIUM',
        licenseStart: '2026-01-15',
        licenseEnd: '2027-01-15',
        licensePrice: 1500000,
        autoRenew: true,
        structureType: 'Clinique',
        websiteUrl: 'https://cliniquedelapaix.sn',
        dbReadsToday: 1420,
        dbReadsThisMonth: 42100,
        dbReadsCumulative: 245000,
        dbWritesToday: 380,
        dbWritesThisMonth: 11400,
        dbWritesCumulative: 89000,
        bandwidthUsedMB: 512,
        dataTransferredGB: 15.4,
        lastConnection: '2026-06-02 07:44',
        aiUsage: {
          clinicalRequests: 140,
          obstetricalRequests: 95,
          pharmaceuticalRequests: 45,
          administrativeRequests: 30,
          requestsToday: 12,
          requestsThisMonth: 310,
          requestsCumulative: 1850,
          tokensConsumed: 1845000,
          estimatedCost: 92.25,
          avgResponseTime: 1.3,
          cumulativeTime: 2405,
          maxRequestsPerMonth: 1000,
          maxTokensPerMonth: 5000000
        },
        quotas: {
          maxUsers: 50,
          maxPatients: 10000,
          maxStorageGB: 100,
          maxSites: 3,
          maxMonthlyConsultations: 2500,
          maxMonthlyHospitalizations: 300
        },
        usage: {
          activeUsers: 38,
          totalPatients: 8420,
          storageUsedGB: 68.3,
          sitesUsed: 2,
          monthlyConsultations: 1980,
          monthlyHospitalizations: 145,
          monthlyPrescriptions: 1210,
          totalExams: 4200,
          dailyConnections: 45,
          aiTokensUsed: 78500
        },
        activatedModules: {
          'Accueil': true, 'Consultation': true, 'Urgences': true, 'Hospitalisation': true, 
          'Maternité': true, 'Laboratoire': true, 'Pharmacie': true, 'Comptabilité': true, 
          'RH': true, 'Paramètres': true, 'Catalogue de Protocoles': true
        },
        activatedTools: {
          'Ordonnance intelligente': true, 'Calculateur de posologie': true, 'Planificateur de soins': true,
          'Partogramme intelligent': true, 'Outil CPN': true, 'Bulletin d\'examens': true,
          'Assistant IA obstétrical': true, 'Assistant IA clinique': true, 'Assistant IA pharmaceutique': false
        }
      },
      {
        id: 'tenant_ch_abid',
        name: 'Centre Hospitalier Horizon - Abidjan',
        address: 'Boulevard de Marseille, Zone 4',
        city: 'Abidjan',
        country: 'Côte d\'Ivoire',
        phone: '+225 27 21 35 66',
        email: 'info@ch-horizon.ci',
        responsibleUser: 'Prof. Ange-Marie Yao',
        createdAt: '2025-06-20',
        status: 'ACTIVE',
        licenseType: 'ENTERPRISE',
        licenseStart: '2025-06-20',
        licenseEnd: '2026-06-20',
        licensePrice: 2800000,
        autoRenew: true,
        structureType: 'Hôpital',
        websiteUrl: 'https://ch-horizon.ci',
        dbReadsToday: 8450,
        dbReadsThisMonth: 231000,
        dbReadsCumulative: 1452000,
        dbWritesToday: 1940,
        dbWritesThisMonth: 58000,
        dbWritesCumulative: 412000,
        bandwidthUsedMB: 2048,
        dataTransferredGB: 98.6,
        lastConnection: '2026-06-02 07:50',
        aiUsage: {
          clinicalRequests: 840,
          obstetricalRequests: 420,
          pharmaceuticalRequests: 210,
          administrativeRequests: 380,
          requestsToday: 64,
          requestsThisMonth: 1850,
          requestsCumulative: 11200,
          tokensConsumed: 11450000,
          estimatedCost: 572.50,
          avgResponseTime: 1.1,
          cumulativeTime: 12320,
          maxRequestsPerMonth: 5000,
          maxTokensPerMonth: 20000000
        },
        quotas: {
          maxUsers: 150,
          maxPatients: 50000,
          maxStorageGB: 500,
          maxSites: 5,
          maxMonthlyConsultations: 8000,
          maxMonthlyHospitalizations: 1000
        },
        usage: {
          activeUsers: 112,
          totalPatients: 34100,
          storageUsedGB: 412.5,
          sitesUsed: 4,
          monthlyConsultations: 7120,
          monthlyHospitalizations: 780,
          monthlyPrescriptions: 4980,
          totalExams: 15200,
          dailyConnections: 184,
          aiTokensUsed: 450000
        },
        activatedModules: {
          'Accueil': true, 'Consultation': true, 'Urgences': true, 'Hospitalisation': true, 
          'Maternité': true, 'Laboratoire': true, 'Pharmacie': true, 'Comptabilité': true, 
          'RH': true, 'Paramètres': true, 'Catalogue de Protocoles': true
        },
        activatedTools: {
          'Ordonnance intelligente': true, 'Calculateur de posologie': true, 'Planificateur de soins': true,
          'Partogramme intelligent': true, 'Outil CPN': true, 'Bulletin d\'examens': true,
          'Assistant IA obstétrical': true, 'Assistant IA clinique': true, 'Assistant IA pharmaceutique': true
        }
      },
      {
        id: 'tenant_mc_bam',
        name: 'Maternité de l\'Espoir - Bamako',
        address: 'Quartier du Fleuve, BP 115',
        city: 'Bamako',
        country: 'Mali',
        phone: '+223 20 22 41 40',
        email: 'contact@maternite-espoir.ml',
        responsibleUser: 'Mme Coulibaly Aminata',
        createdAt: '2025-11-01',
        status: 'DEMO',
        licenseType: 'DEMO',
        licenseStart: '2026-05-15',
        licenseEnd: '2026-06-15',
        licensePrice: 0,
        autoRenew: false,
        structureType: 'Maternité',
        websiteUrl: 'https://maternite-espoir.ml',
        dbReadsToday: 310,
        dbReadsThisMonth: 8200,
        dbReadsCumulative: 54000,
        dbWritesToday: 75,
        dbWritesThisMonth: 1850,
        dbWritesCumulative: 12500,
        bandwidthUsedMB: 120,
        dataTransferredGB: 2.1,
        lastConnection: '2026-06-01 16:32',
        aiUsage: {
          clinicalRequests: 15,
          obstetricalRequests: 98,
          pharmaceuticalRequests: 5,
          administrativeRequests: 22,
          requestsToday: 4,
          requestsThisMonth: 140,
          requestsCumulative: 620,
          tokensConsumed: 480000,
          estimatedCost: 24.00,
          avgResponseTime: 1.5,
          cumulativeTime: 930,
          maxRequestsPerMonth: 500,
          maxTokensPerMonth: 2000000
        },
        quotas: {
          maxUsers: 15,
          maxPatients: 1000,
          maxStorageGB: 10,
          maxSites: 1,
          maxMonthlyConsultations: 300,
          maxMonthlyHospitalizations: 50
        },
        usage: {
          activeUsers: 9,
          totalPatients: 850,
          storageUsedGB: 7.2,
          sitesUsed: 1,
          monthlyConsultations: 260,
          monthlyHospitalizations: 44,
          monthlyPrescriptions: 190,
          totalExams: 520,
          dailyConnections: 12,
          aiTokensUsed: 4500
        },
        activatedModules: {
          'Accueil': true, 'Consultation': true, 'Urgences': false, 'Hospitalisation': true, 
          'Maternité': true, 'Laboratoire': false, 'Pharmacie': false, 'Comptabilité': false, 
          'RH': true, 'Paramètres': true, 'Catalogue de Protocoles': true
        },
        activatedTools: {
          'Ordonnance intelligente': true, 'Calculateur de posologie': false, 'Planificateur de soins': true,
          'Partogramme intelligent': true, 'Outil CPN': true, 'Bulletin d\'examens': false,
          'Assistant IA obstétrical': true, 'Assistant IA clinique': false, 'Assistant IA pharmaceutique': false
        }
      },
      {
        id: 'tenant_cm_cmr',
        name: 'Cabinet Médical Bastos - Yaoundé',
        address: 'Bastos - Rue de l\'ambassade',
        city: 'Yaoundé',
        country: 'Cameroun',
        phone: '+237 222 21 14 15',
        email: 'bastos@cm-medical.cm',
        responsibleUser: 'Dr. Pierre Nsame',
        createdAt: '2024-03-12',
        status: 'SUSPENDED',
        licenseType: 'BASIC',
        licenseStart: '2024-03-12',
        licenseEnd: '2025-03-12',
        licensePrice: 450000,
        autoRenew: false,
        structureType: 'Cabinet médical',
        websiteUrl: 'https://cm-medical.cm',
        dbReadsToday: 0,
        dbReadsThisMonth: 120,
        dbReadsCumulative: 32000,
        dbWritesToday: 0,
        dbWritesThisMonth: 45,
        dbWritesCumulative: 9800,
        bandwidthUsedMB: 0,
        dataTransferredGB: 0.0,
        lastConnection: '2025-03-11 18:15',
        aiUsage: {
          clinicalRequests: 10,
          obstetricalRequests: 0,
          pharmaceuticalRequests: 15,
          administrativeRequests: 5,
          requestsToday: 0,
          requestsThisMonth: 0,
          requestsCumulative: 310,
          tokensConsumed: 120000,
          estimatedCost: 6.00,
          avgResponseTime: 1.4,
          cumulativeTime: 434,
          maxRequestsPerMonth: 200,
          maxTokensPerMonth: 1000000
        },
        quotas: {
          maxUsers: 5,
          maxPatients: 2000,
          maxStorageGB: 20,
          maxSites: 1,
          maxMonthlyConsultations: 500,
          maxMonthlyHospitalizations: 0
        },
        usage: {
          activeUsers: 4,
          totalPatients: 1980,
          storageUsedGB: 19.5,
          sitesUsed: 1,
          monthlyConsultations: 490,
          monthlyHospitalizations: 0,
          monthlyPrescriptions: 310,
          totalExams: 180,
          dailyConnections: 0,
          aiTokensUsed: 2100
        },
        activatedModules: {
          'Accueil': true, 'Consultation': true, 'Urgences': false, 'Hospitalisation': false, 
          'Maternité': false, 'Laboratoire': false, 'Pharmacie': true, 'Comptabilité': false, 
          'RH': false, 'Paramètres': true, 'Catalogue de Protocoles': false
        },
        activatedTools: {
          'Ordonnance intelligente': true, 'Calculateur de posologie': true, 'Planificateur de soins': false,
          'Partogramme intelligent': false, 'Outil CPN': false, 'Bulletin d\'examens': false,
          'Assistant IA obstétrical': false, 'Assistant IA clinique': false, 'Assistant IA pharmaceutique': false
        }
      },
      {
        id: 'tenant_clinique_maroc',
        name: 'Clinique Ibn Sina - Casablanca',
        address: '240 Boulevard d’Anfa',
        city: 'Casablanca',
        country: 'Maroc',
        phone: '+212 522 44 88 00',
        email: 'direction@ibnsina.ma',
        responsibleUser: 'Dr. Youssef El Fassi',
        createdAt: '2025-08-10',
        status: 'EXPIRED',
        licenseType: 'STANDARD',
        licenseStart: '2025-08-10',
        licenseEnd: '2026-05-30',
        licensePrice: 950000,
        autoRenew: false,
        structureType: 'Clinique',
        websiteUrl: 'https://ibnsina.ma',
        dbReadsToday: 0,
        dbReadsThisMonth: 12500,
        dbReadsCumulative: 298000,
        dbWritesToday: 0,
        dbWritesThisMonth: 3450,
        dbWritesCumulative: 84000,
        bandwidthUsedMB: 0,
        dataTransferredGB: 34.2,
        lastConnection: '2026-05-30 22:15',
        aiUsage: {
          clinicalRequests: 180,
          obstetricalRequests: 5,
          pharmaceuticalRequests: 45,
          administrativeRequests: 110,
          requestsToday: 0,
          requestsThisMonth: 420,
          requestsCumulative: 3400,
          tokensConsumed: 3200000,
          estimatedCost: 160.00,
          avgResponseTime: 1.2,
          cumulativeTime: 4080,
          maxRequestsPerMonth: 1500,
          maxTokensPerMonth: 7500000
        },
        quotas: {
          maxUsers: 25,
          maxPatients: 5000,
          maxStorageGB: 50,
          maxSites: 2,
          maxMonthlyConsultations: 1500,
          maxMonthlyHospitalizations: 150
        },
        usage: {
          activeUsers: 22,
          totalPatients: 4995,
          storageUsedGB: 49.8,
          sitesUsed: 2,
          monthlyConsultations: 1485,
          monthlyHospitalizations: 120,
          monthlyPrescriptions: 920,
          totalExams: 2110,
          dailyConnections: 0,
          aiTokensUsed: 31400
        },
        activatedModules: {
          'Accueil': true, 'Consultation': true, 'Urgences': true, 'Hospitalisation': true, 
          'Maternité': false, 'Laboratoire': true, 'Pharmacie': true, 'Comptabilité': true, 
          'RH': true, 'Paramètres': true, 'Catalogue de Protocoles': true
        },
        activatedTools: {
          'Ordonnance intelligente': true, 'Calculateur de posologie': true, 'Planificateur de soins': true,
          'Partogramme intelligent': false, 'Outil CPN': false, 'Bulletin d\'examens': true,
          'Assistant IA obstétrical': false, 'Assistant IA clinique': true, 'Assistant IA pharmaceutique': false
        }
      }
    ];
    return seeds;
  });

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('saas_tickets');
    if (saved) return JSON.parse(saved);
    
    // Initial Seed Tickets
    const initialTickets: SupportTicket[] = [
      {
        id: 'TCK-201',
        clinicId: 'tenant_cm_dak',
        clinicName: 'Clinique de la Paix - Dakar',
        category: 'TECH',
        priority: 'HIGH',
        status: 'OPEN',
        title: 'Erreur réseau de synchronisation lors de l\'envoi des rapports d\'analyses',
        description: 'Nos machines biologiques envoient les requêtes en continu mais l\'affichage dans le module Laboratoire prend 20 secondes supplémentaires. Nous suspectons un problème au niveau de la bande passante locale ou du broker API.',
        createdAt: '2026-06-01',
        assignedTechnician: 'Jean-Marc Dupont',
        messages: [
          { sender: 'Dr. Souleymane Diallo', message: 'Bonjour, l\'analyseur d\'hémogramme ne communique plus instantanément depuis l\'allègement de la table locale.', timestamp: '2026-06-01 09:12', isAdmin: false },
          { sender: 'Support SmartHosto', message: 'Bonjour Docteur, nous analysons vos flux réseau WebSocket pour détecter des congestions d\'envelopppes XML.', timestamp: '2026-06-01 10:45', isAdmin: true }
        ]
      },
      {
        id: 'TCK-202',
        clinicId: 'tenant_ch_abid',
        clinicName: 'Centre Hospitalier Horizon - Abidjan',
        category: 'BILLING',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        title: 'Demande de migration vers une licence Enterprise multi-site',
        description: 'Nous lançons deux nouvelles cliniques satellites de pédiatrie à Cocody et Yopougon. Nous souhaiterions étendre notre schéma de site de 5 à 10 sites physiques et bénéficier d\'un quota de stockage de 1 To.',
        createdAt: '2026-05-30',
        assignedTechnician: 'Sophie Kouamé (Finance)',
        messages: [
          { sender: 'Prof. Ange-Marie Yao', message: 'Je souhaiterais valider le bon de commande de mise à niveau de notre plan de facturation annuel.', timestamp: '2026-05-30 14:00', isAdmin: false }
        ]
      },
      {
        id: 'TCK-203',
        clinicId: 'tenant_cm_cmr',
        clinicName: 'Cabinet Médical Bastos - Yaoundé',
        category: 'ONBOARDING',
        priority: 'LOW',
        status: 'CLOSED',
        title: 'Besoins de formation pour l\'outil CPN intelligent',
        description: 'La sage-femme souhaiterait revoir la logique du calcul d\'âge gestationnel si la patiente ne se rappelle plus de ses dernières règles.',
        createdAt: '2026-05-10',
        assignedTechnician: 'Dr. Claire Laurent',
        messages: [
          { sender: 'Dr. Pierre Nsame', message: 'La formation s\'est déroulée avec succès. Merci pour la réactivité.', timestamp: '2026-05-12 11:30', isAdmin: false }
        ]
      }
    ];
    return initialTickets;
  });

  const [invoices, setInvoices] = useState<SubscriptionInvoice[]>(() => {
    const saved = localStorage.getItem('saas_invoices');
    if (saved) return JSON.parse(saved);

    const initialInvoices: SubscriptionInvoice[] = [
      { id: 'FAC-2026-101', clinicId: 'tenant_cm_dak', clinicName: 'Clinique de la Paix - Dakar', plan: 'PREMIUM', amount: 1500000, currency: 'FCFA', dueDate: '2026-01-15', paidDate: '2026-01-14', status: 'PAID', paymentMethod: 'Virement bancaire' },
      { id: 'FAC-2026-102', clinicId: 'tenant_ch_abid', clinicName: 'Centre Hospitalier Horizon - Abidjan', plan: 'ENTERPRISE', amount: 2800000, currency: 'FCFA', dueDate: '2025-06-20', paidDate: '2025-06-19', status: 'PAID', paymentMethod: 'Virement bancaire' },
      { id: 'FAC-2026-103', clinicId: 'tenant_clinique_maroc', clinicName: 'Clinique Ibn Sina - Casablanca', plan: 'STANDARD', amount: 950000, currency: 'MAD', dueDate: '2026-05-30', status: 'OVERDUE' },
      { id: 'FAC-2026-104', clinicId: 'tenant_cm_cmr', clinicName: 'Cabinet Médical Bastos - Yaoundé', plan: 'BASIC', amount: 450000, currency: 'FCFA', dueDate: '2026-06-12', status: 'PENDING' }
    ];
    return initialInvoices;
  });

  const [logs, setLogs] = useState<SaaSLog[]>(() => {
    const saved = localStorage.getItem('saas_logs');
    if (saved) return JSON.parse(saved);

    const initialLogs: SaaSLog[] = [
      { id: 'LOG-001', timestamp: '2026-06-02 08:34:10', user: 'superadmin', action: 'Connexion Super Admin', details: 'Accès autorisé depuis le portail d\'administration centrale.', category: 'LOGIN' },
      { id: 'LOG-002', timestamp: '2026-06-02 08:30:15', user: 'admin', clinicId: 'tenant_cm_dak', clinicName: 'Clinique de la Paix - Dakar', action: 'Relecture des configurations', details: 'Connexion clinique de test sur portail client.', category: 'LOGIN' },
      { id: 'LOG-003', timestamp: '2026-06-01 17:40:02', user: 'superadmin', clinicId: 'tenant_clinique_maroc', clinicName: 'Clinique Ibn Sina - Casablanca', action: 'Alerte Expiration Suspendue', details: 'La licence Standard a dépassé l\'échéance du 2026-05-30.', category: 'LICENSE' },
      { id: 'LOG-004', timestamp: '2026-06-01 16:12:00', user: 'superadmin', clinicId: 'tenant_cm_dak', clinicName: 'Clinique de la Paix - Dakar', action: 'Modification Quota Cabinet', details: 'Augmentation du volume de stockage max à 100 Go.', category: 'QUOTA' },
      { id: 'LOG-005', timestamp: '2026-05-29 11:24:19', user: 'superadmin', clinicId: 'tenant_mc_bam', clinicName: 'Maternité de l\'Espoir - Bamako', action: 'Activation des modules cliniques', details: 'Activation du module Maternité.', category: 'MODULE' }
    ];
    return initialLogs;
  });

  // Global Settings for Multi-tenant
  const [globalConfig, setGlobalConfig] = useState(() => {
    const saved = localStorage.getItem('saas_global_config');
    if (saved) return JSON.parse(saved);
    return {
      defaultCurrencies: ['FCFA', 'USD', 'EUR', 'MAD'],
      defaultLanguages: ['Français', 'Anglais', 'Espagnol', 'Arabe'],
      countriesList: ['Sénégal', 'Côte d\'Ivoire', 'Mali', 'Cameroun', 'Maroc', 'France'],
      defaultTheme: 'slate',
      prescriptionLayout: 'A5_Standard',
      billingLayout: 'A4_Detailed',
      aiModel: 'gemini-2.5-flash',
      aiEnabled: true,
      pricePer1kTokens: 0.05 // FCFA
    };
  });

  // Notifications Database
  const [notifications, setNotifications] = useState<string[]>(() => {
    return [
      '🔔 Clinique Ibn Sina - Casablanca : Licence expiré (échéance passée le 30 mai 2026).',
      '⚠️ Clinique de la Paix - Dakar : Quota utilisateur bientôt atteint (38 / 50 comptes créés).',
      '📨 Ticket technique à haute priorité ouvert par la Clinique de la Paix - Dakar.',
      '💳 Cabinet Médical Bastos : Facturation de 450,000 FCFA arrivant à échéance sous 10 jours.'
    ];
  });

  // Save changes automatically
  useEffect(() => {
    localStorage.setItem('saas_clinics', JSON.stringify(clinics));
  }, [clinics]);

  useEffect(() => {
    localStorage.setItem('saas_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('saas_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('saas_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('saas_global_config', JSON.stringify(globalConfig));
  }, [globalConfig]);

  // --- UI NAVIGATION & STATES ---
  const [activeTab, setActiveTab] = useState<string>('CLINICS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClinic, setSelectedClinic] = useState<ClinicTenant | null>(null);
  const [editingClinic, setEditingClinic] = useState<Partial<ClinicTenant> | null>(null);
  const [isAddingClinic, setIsAddingClinic] = useState(false);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Clinic Filter and Sort States
  const [clinicSearch, setClinicSearch] = useState('');
  const [filterStructureType, setFilterStructureType] = useState('');
  const [filterClinicStatus, setFilterClinicStatus] = useState('');
  const [filterClinicLicense, setFilterClinicLicense] = useState('');
  const [clinicSortBy, setClinicSortBy] = useState('name-asc');
  const [provisioningSuccess, setProvisioningSuccess] = useState<{
    tenantId: string;
    clinicName: string;
    adminUser: string;
    adminPass: string;
    structureType: string;
    websiteUrl: string;
    maxUsers: number;
    maxStorageGB: number;
    activatedModulesCount: number;
    activatedToolsCount: number;
  } | null>(null);

  // New billing states
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [paymentClinicId, setPaymentClinicId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentPlan, setPaymentPlan] = useState('STANDARD');
  const [paymentMethod, setPaymentMethod] = useState('Virement bancaire');
  const [paymentCurrency, setPaymentCurrency] = useState('FCFA');

  // Trigger notification toast simulation
  const [toast, setToast] = useState<{ type: 'success' | 'info'; text: string } | null>(null);
  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Helper function to append SaaS logs
  const appendLog = (action: string, details: string, category: SaaSLog['category'], clinicId?: string, clinicName?: string) => {
    const newLog: SaaSLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: currentUser?.username || 'superadmin',
      action,
      details,
      category,
      clinicId,
      clinicName
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // 1. UNIVERSAL SEARCH (Retrouve clinique, utilisateur, licence, ticket, abonnement)
  const filteredUniversal = () => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();
    
    const matchedClinics = clinics.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.city.toLowerCase().includes(query) || 
      c.country.toLowerCase().includes(query) || 
      c.id.toLowerCase().includes(query)
    );

    const matchedTickets = tickets.filter(t => 
      t.title.toLowerCase().includes(query) || 
      t.id.toLowerCase().includes(query) || 
      t.description.toLowerCase().includes(query)
    );

    const matchedInvoices = invoices.filter(i => 
      i.id.toLowerCase().includes(query) || 
      i.clinicName.toLowerCase().includes(query) || 
      i.plan.toLowerCase().includes(query)
    );

    return { clinics: matchedClinics, tickets: matchedTickets, invoices: matchedInvoices };
  };

  // Switch context helper to allow clinical simulation
  const handleSwitchTenantContext = (tenant: ClinicTenant) => {
    // We overwrite the custom current active clinic settings so that the client-facing UI instantly loads this specific clinic's profile.
    const customConfig = {
      name: tenant.name,
      address: tenant.address,
      phone: tenant.phone,
      logo: '',
      language: 'FR',
      currency: tenant.licenseType === 'DEMO' ? 'XAF' : 'FCFA',
      theme: 'rose', 
      tenantId: tenant.id
    };
    localStorage.setItem('hospital_config', JSON.stringify(customConfig));
    appendLog('Changement de Contexte Multi-Tenant', `Impersonate / Navigation forcée dans l'environement isolé de: ${tenant.name}`, 'SECURITY', tenant.id, tenant.name);
    showToast(`Contexte basculé vers: ${tenant.name}. Tous les patients, RH, finances et ordonnances sont maintenant isolés.`, 'info');
    
    // Refresh page / Reload context elegantly
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  // Quota usage calculation
  const getProgressColor = (percent: number) => {
    if (percent >= 90) return 'bg-rose-600';
    if (percent >= 75) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  // Add Clinic Form submission
  const handleCreateClinicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClinic?.name || !editingClinic?.country) {
      showToast('Le nom de la clinique et le pays de résidence sont obligatoires.', 'info');
      return;
    }

    const cleanName = editingClinic.name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 15);
    const tenantId = `tenant_${slug}_${Math.floor(100 + Math.random() * 900)}`;
    
    // Auto-generate admin user & password securely
    const adminUser = `admin_${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8)}`;
    const adminPass = `sh_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // Plan structure defaults
    const structType = (editingClinic as any).structureType || 'Clinique';
    const websiteUrl = (editingClinic as any).websiteUrl || `https://www.${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
    
    // Limits
    const maxUsers = editingClinic.quotas?.maxUsers || 25;
    const maxStorageGB = editingClinic.quotas?.maxStorageGB || 20;

    // Module definitions to activate initially based on editingClinic selections or all active by default
    const defaultModules: Record<string, boolean> = {
      'Accueil': true,
      'Consultation': true,
      'Urgences': editingClinic.activatedModules?.['Urgences'] ?? true,
      'Hospitalisation': editingClinic.activatedModules?.['Hospitalisation'] ?? true,
      'Maternité': editingClinic.activatedModules?.['Maternité'] ?? true,
      'Laboratoire': editingClinic.activatedModules?.['Laboratoire'] ?? true,
      'Pharmacie': editingClinic.activatedModules?.['Pharmacie'] ?? true,
      'Comptabilité': editingClinic.activatedModules?.['Comptabilité'] ?? true,
      'RH': editingClinic.activatedModules?.['RH'] ?? true,
      'Paramètres': true,
      'Catalogue de Protocoles': true
    };

    const defaultTools: Record<string, boolean> = {
      'Ordonnance intelligente': editingClinic.activatedTools?.['Ordonnance intelligente'] ?? true,
      'Calculateur de posologie': editingClinic.activatedTools?.['Calculateur de posologie'] ?? true,
      'Planificateur de soins': editingClinic.activatedTools?.['Planificateur de soins'] ?? true,
      'Bulletin d\'examens': editingClinic.activatedTools?.['Bulletin d\'examens'] ?? true,
      'Outil CPN': editingClinic.activatedTools?.['Outil CPN'] ?? true,
      'Partogramme intelligent': editingClinic.activatedTools?.['Partogramme intelligent'] ?? true,
      'Assistant IA obstétrical': editingClinic.activatedTools?.['Assistant IA obstétrical'] ?? true,
      'Assistant IA clinique': editingClinic.activatedTools?.['Assistant IA clinique'] ?? true,
      'Assistant IA pharmaceutique': editingClinic.activatedTools?.['Assistant IA pharmaceutique'] ?? false
    };

    const modulesCount = Object.values(defaultModules).filter(Boolean).length;
    const toolsCount = Object.values(defaultTools).filter(Boolean).length;

    const newClinic: ClinicTenant = {
      id: tenantId,
      name: cleanName,
      address: editingClinic.address || 'Adresse Standard Multi-Tenant',
      city: editingClinic.city || 'Ville principale',
      country: editingClinic.country,
      phone: editingClinic.phone || '+221 33 000 00 00',
      email: editingClinic.email || `contact@${slug}.com`,
      responsibleUser: editingClinic.responsibleUser || 'Dr. Directeur de la Structure',
      createdAt: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      licenseType: maxUsers > 100 ? 'ENTERPRISE' : maxUsers >= 50 ? 'PREMIUM' : 'STANDARD',
      licenseStart: new Date().toISOString().split('T')[0],
      licenseEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year
      licensePrice: maxUsers > 100 ? 2800000 : maxUsers >= 50 ? 1500000 : 950000,
      autoRenew: true,
      structureType: structType,
      websiteUrl: websiteUrl,
      dbReadsToday: 150,
      dbReadsThisMonth: 150,
      dbReadsCumulative: 300,
      dbWritesToday: 40,
      dbWritesThisMonth: 40,
      dbWritesCumulative: 80,
      bandwidthUsedMB: 120,
      dataTransferredGB: 0.1,
      lastConnection: new Date().toISOString().replace('T', ' ').substring(0, 16),
      aiUsage: {
        clinicalRequests: 0,
        obstetricalRequests: 0,
        pharmaceuticalRequests: 0,
        administrativeRequests: 0,
        requestsToday: 0,
        requestsThisMonth: 0,
        requestsCumulative: 0,
        tokensConsumed: 0,
        estimatedCost: 0,
        avgResponseTime: 1.2,
        cumulativeTime: 0,
        maxRequestsPerMonth: 1000,
        maxTokensPerMonth: 5000000
      },
      quotas: {
        maxUsers: maxUsers,
        maxPatients: maxUsers * 250,
        maxStorageGB: maxStorageGB,
        maxSites: maxUsers > 100 ? 5 : maxUsers >= 50 ? 3 : 1,
        maxMonthlyConsultations: maxUsers * 100,
        maxMonthlyHospitalizations: maxUsers * 10
      },
      usage: {
        activeUsers: 1,
        totalPatients: 0,
        storageUsedGB: 0.1,
        sitesUsed: 1,
        monthlyConsultations: 0,
        monthlyHospitalizations: 0,
        monthlyPrescriptions: 0,
        totalExams: 0,
        dailyConnections: 1,
        aiTokensUsed: 0
      },
      activatedModules: defaultModules,
      activatedTools: defaultTools
    };

    setClinics(prev => [newClinic, ...prev]);
    setIsAddingClinic(false);
    
    // Open Success Modal Details container
    setProvisioningSuccess({
      tenantId,
      clinicName: cleanName,
      adminUser,
      adminPass,
      structureType: structType,
      websiteUrl,
      maxUsers,
      maxStorageGB,
      activatedModulesCount: modulesCount,
      activatedToolsCount: toolsCount
    });

    setEditingClinic(null);
    appendLog('Création d\'établissement', `Nouvelle clinique SaaS créée : ${cleanName} (Tenant ID: ${tenantId}). Administrateur principal auto-généré : [${adminUser}] avec mot de passe masqué. Espace de données PostgreSQL et volume de stockage chiffrés provisionnés.`, 'SECURITY', tenantId, cleanName);
    showToast(`Établissement ${cleanName} provisionné ! Espace isolé activé.`, 'success');
  };

  // Support ticket handle reply
  const handleReplyTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !ticketReplyText.trim()) return;

    const updatedTickets = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: 'RESOLVED' as const,
          messages: [
            ...t.messages,
            {
              sender: 'Super Support SmartHosto',
              message: ticketReplyText.trim(),
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              isAdmin: true
            }
          ]
        };
      }
      return t;
    });

    setTickets(updatedTickets);
    setSelectedTicket(updatedTickets.find(t => t.id === selectedTicket.id) || null);
    setTicketReplyText('');
    appendLog('Réponse helpdesk', `Réponse apportée au ticket ${selectedTicket.id}`, 'SECURITY', selectedTicket.clinicId, selectedTicket.clinicName);
    showToast(`Réponse technique enregistrée. Statut basculé en RÉSOLU.`, 'success');
  };

  // Handle billing payment log
  const handleLogPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentClinicId || !paymentAmount) return;

    const clinic = clinics.find(c => c.id === paymentClinicId);
    if (!clinic) return;

    const newInvoice: SubscriptionInvoice = {
      id: `FAC-${Date.now().toString().substring(7, 13)}`,
      clinicId: paymentClinicId,
      clinicName: clinic.name,
      plan: paymentPlan,
      amount: parseFloat(paymentAmount) || 0,
      currency: paymentCurrency,
      dueDate: new Date().toISOString().split('T')[0],
      paidDate: new Date().toISOString().split('T')[0],
      status: 'PAID',
      paymentMethod: paymentMethod
    };

    setInvoices(prev => [newInvoice, ...prev]);
    setIsRecordingPayment(false);
    setPaymentAmount('');
    appendLog('Facture validée', `Encaissement de l'abonnement enregistré pour ${clinic.name}. Montant: ${newInvoice.amount.toLocaleString()} ${newInvoice.currency}`, 'LICENSE', clinic.id, clinic.name);
    showToast(`Le paiement de ${newInvoice.amount.toLocaleString()} ${newInvoice.currency} a été encaissé avec génération d'un reçu fiscal PDF.`, 'success');
  };

  // Export to simple tabular format (looks like CSV/Excel download simulator)
  const triggerSpreadsheetExport = (type: 'cliniques' | 'comptabilite') => {
    let content = '';
    const dateStr = new Date().toISOString().split('T')[0];
    if (type === 'cliniques') {
      content = "ID_TENANT;NOM_CLINIQUE;VILLE;PAYS;STATUT;TYPE_LICENCE;EXPIRES_LE\n";
      clinics.forEach(c => {
        content += `${c.id};${c.name};${c.city};${c.country};${c.status};${c.licenseType};${c.licenseEnd}\n`;
      });
    } else {
      content = "ID_FACTURE;NOM_CLINIQUE;PLAN;MONTANT_LOCAL;DEVISE;ECHEANCE;STATUT\n";
      invoices.forEach(i => {
        content += `${i.id};${i.clinicName};${i.plan};${i.amount};${i.currency};${i.dueDate};${i.status}\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `smarthosto_export_${type}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Fichier CSV d'export généré avec succès. Compatible avec Microsoft Excel.`, 'success');
  };

  // Calculations for KPI dashboard
  const activeCount = clinics.filter(c => c.status === 'ACTIVE').length;
  const suspendedCount = clinics.filter(c => c.status === 'SUSPENDED').length;
  const expiredCount = clinics.filter(c => c.status === 'EXPIRED').length;
  const demoCount = clinics.filter(c => c.status === 'DEMO').length;

  const totalSaaSPatients = clinics.reduce((sum, c) => sum + c.usage.totalPatients, 0);
  const totalSaaSUsers = clinics.reduce((sum, c) => sum + c.usage.activeUsers, 0);
  const totalSaaSConnections = clinics.reduce((sum, c) => sum + c.usage.dailyConnections, 0);
  const totalSaaSConsultations = clinics.reduce((sum, c) => sum + c.usage.monthlyConsultations, 0);
  const totalSaaSHospitalizations = clinics.reduce((sum, c) => sum + c.usage.monthlyHospitalizations, 0);

  const filteredAndSortedClinics = clinics.filter(c => {
    const matchesSearch = !clinicSearch.trim() || 
      c.name.toLowerCase().includes(clinicSearch.toLowerCase()) ||
      c.city.toLowerCase().includes(clinicSearch.toLowerCase()) ||
      c.country.toLowerCase().includes(clinicSearch.toLowerCase());
      
    const matchesType = !filterStructureType || c.structureType === filterStructureType;
    const matchesStatus = !filterClinicStatus || c.status === filterClinicStatus;
    const matchesLicense = !filterClinicLicense || c.licenseType === filterClinicLicense;
    
    return matchesSearch && matchesType && matchesStatus && matchesLicense;
  }).sort((a, b) => {
    if (clinicSortBy === 'name-asc') {
      return a.name.localeCompare(b.name);
    } else if (clinicSortBy === 'name-desc') {
      return b.name.localeCompare(a.name);
    } else if (clinicSortBy === 'created-desc') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (clinicSortBy === 'expiry-asc') {
      return new Date(a.licenseEnd).getTime() - new Date(b.licenseEnd).getTime();
    }
    return 0;
  });

  const searchResults = filteredUniversal();

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8 bg-slate-950 text-slate-100 rounded-[32px] min-h-screen relative overflow-hidden">
      {/* Toast alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-rose-500 text-white p-4 rounded-2xl flex items-center gap-3 shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg"><Bell size={18} /></div>
          <div>
            <p className="text-xs font-black uppercase text-slate-400">SMARTHOSTO CENTRAL CONTROL</p>
            <p className="text-sm font-bold">{toast.text}</p>
          </div>
        </div>
      )}

      {/* Hero background grid glow */}
      <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] bg-rose-900/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Main Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 border-b border-white/10 pb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-rose-600/20 border border-rose-500/30 text-[10px] font-black uppercase tracking-widest text-rose-400 flex items-center gap-1.5 animate-pulse">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500"></span> SaaS CENTRAL GATEWAY
            </span>
            <span className="text-xs font-mono text-slate-500">v2.6 Multi-Tenant</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 italic">
            👑 SmartHosto Control Center
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl font-bold">
            Console de commandement et de pilotage SaaS multi-cliniques. Provisionnement des serveurs isolés, quotas, facturations et sécurité cloud.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-350 transition-all flex items-center gap-2"
          >
            <LayoutDashboard size={14} /> Quitter le Centre
          </button>
          <div className="px-5 py-3 col-span-1 border border-rose-500/30 bg-rose-955/20 rounded-2xl text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
            <Bell size={14} className="animate-wiggle" /> Superuser: {currentUser?.name || 'Publisher'}
          </div>
        </div>
      </div>

      {/* UNIVERSAL SEARCH BAR */}
      <div className="relative z-10">
        <div className="relative flex items-center">
          <Search className="absolute left-5 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Recherche Universelle Instantanée (rechercher une clinique, un numéro de ticket, un plan de licence ou une facture)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-13 pr-16 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-sm font-semibold focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 text-white placeholder-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-5 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Universal Search Results Popover */}
        {searchResults && (
          <div className="absolute top-15 left-0 right-0 z-40 bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[460px] overflow-y-auto">
            <h3 className="text-xs font-black uppercase text-rose-400 tracking-wider">Résultats de la Recherche Universelle</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Clinics matches */}
              <div>
                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center gap-1.5"><Building2 size={12}/> Établissements ({searchResults.clinics.length})</h4>
                <div className="space-y-2">
                  {searchResults.clinics.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedClinic(c); setActiveTab('CLINICS'); setSearchQuery(''); }}
                      className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/5 flex justify-between items-center transition-colors"
                    >
                      <div className="font-bold text-xs">{c.name} <span className="text-[10px] text-slate-400 font-mono">({c.city})</span></div>
                      <span className="text-[9px] font-black uppercase bg-slate-850 px-2 py-0.5 rounded-md text-rose-400 border border-rose-500/25">{c.status}</span>
                    </button>
                  ))}
                  {searchResults.clinics.length === 0 && <p className="text-xs text-slate-550 italic">Aucune clinique correspondante</p>}
                </div>
              </div>

              {/* Tickets matches */}
              <div>
                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center gap-1.5"><HelpCircle size={12}/> Support Helpdesk ({searchResults.tickets.length})</h4>
                <div className="space-y-2">
                  {searchResults.tickets.map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setSelectedTicket(t); setActiveTab('SUPPORT'); setSearchQuery(''); }}
                      className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/5 flex justify-between items-center transition-colors"
                    >
                      <div className="font-bold text-xs truncate max-w-[200px]">{t.id}: {t.title}</div>
                      <span className="text-[9px] font-black bg-slate-850 px-2 py-0.5 rounded-md text-blue-400">{t.status}</span>
                    </button>
                  ))}
                  {searchResults.tickets.length === 0 && <p className="text-xs text-slate-550 italic">Aucun ticket correspondant</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QUICK STATISTICS BAR (NOTIFICATIONS OVERVIEW) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col md:flex-row gap-5 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-600/20 text-rose-500 border border-rose-500/30 rounded-2xl">
              <Cloud size={24} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">SÉCURISATION & ARCHITECTURE CLOUD</h4>
              <p className="text-sm font-bold text-white mt-0.5">Silos Multi-Tenancy Actifs & Totalement Isoler.</p>
              <p className="text-xs text-slate-400 font-bold">Chaque clinique dispose d'une clé de chiffrement et de bases de patients autonomes.</p>
            </div>
          </div>
          
          <button
            onClick={() => showToast('Chiffrement asymétrique ré-indexé sur toutes les instances.', 'success')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-200 transition-colors"
          >
            Chiffrer les instances
          </button>
        </div>

        {/* NOTIFICATIONS CONTAINER */}
        <div className="lg:col-span-4 bg-rose-950/20 border border-rose-500/20 rounded-3xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-black uppercase text-rose-400 tracking-wider flex items-center gap-1.5"><Bell size={12} className="animate-wiggle" /> Alertes Centrales d'exploitation</h4>
            <span className="text-[8px] bg-rose-600/30 text-rose-300 font-black px-1.5 py-0.5 rounded-md">{notifications.length} ALERTURES</span>
          </div>

          <div className="space-y-2 max-h-[80px] overflow-y-auto pr-1">
            {notifications.map((not, idx) => (
              <p key={idx} className="text-[10px] font-bold text-slate-300 flex items-start gap-1.5">
                <span className="text-rose-500 font-bold">•</span> {not}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* SUB MENU NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-5 relative z-10 overflow-x-auto">
        {[
          { id: 'CLINICS', label: 'Cliniques', icon: Building2 },
          { id: 'DASHBOARD', label: 'Tableau de Bord', icon: LayoutDashboard },
          { id: 'MONITORING', label: 'Monitoring Technique', icon: Activity },
          { id: 'AI_CONS', label: 'Consommation IA', icon: Cpu },
          { id: 'LICENSES', label: 'Licences', icon: Key },
          { id: 'QUOTAS', label: 'Quotas', icon: Sliders },
          { id: 'SUPPORT', label: 'Support & Tickets', icon: HelpCircle },
          { id: 'AUDIT', label: 'Audit', icon: Shield },
          { id: 'MODULES', label: 'Allocation Modules', icon: Layers },
          { id: 'BILLING', label: 'Comptabilité', icon: CreditCard },
          { id: 'SETTINGS', label: 'Paramètres', icon: Settings }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedClinic(null); setSelectedTicket(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === tab.id 
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20 shadow-md border border-rose-500' 
                : 'bg-white/5 border border-white/5 hover:bg-white/10 text-slate-450 hover:text-white'
            }`}
          >
            <tab.icon size={13} /> {tab.label}
          </button>
        ))}
      </div>

      {/* --- RENDER TARGET TABS --- */}

      {/* 1. DASHBOARD GLOBAL */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* SAAS MULTI-TENANT KPIS ROW */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/40 border border-white/5 p-5 rounded-3xl relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 pr-4 pb-2 text-white/[0.02] group-hover:scale-110 transition-transform"><Building2 size={80} /></div>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Cliniques Branchées</p>
              <h3 className="text-3xl font-extrabold text-white mt-1.5">{clinics.length} <span className="text-xs text-rose-400 font-black">Actives: {activeCount}</span></h3>
              <p className="text-[10px] text-slate-500 font-bold mt-1">Susp: {suspendedCount} • Expire: {expiredCount} • Démo: {demoCount}</p>
            </div>

            <div className="bg-slate-900/40 border border-white/5 p-5 rounded-3xl relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 pr-4 pb-2 text-white/[0.02] group-hover:scale-110 transition-transform"><Users size={80} /></div>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Comptes Utilisateurs Actifs</p>
              <h3 className="text-3xl font-extrabold text-white mt-1.5">{totalSaaSUsers} <span className="text-xs text-emerald-400 font-black">+{totalSaaSConnections} connectés</span></h3>
              <p className="text-[10px] text-slate-500 font-bold mt-1">Médecins, infirmiers, secrétaires, RH et admins</p>
            </div>

            <div className="bg-slate-900/40 border border-white/5 p-5 rounded-3xl relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 pr-4 pb-2 text-white/[0.02] group-hover:scale-110 transition-transform"><HardDrive size={80} /></div>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Stockage HDD Alloué (SSD SaaS)</p>
              <h3 className="text-3xl font-extrabold text-white mt-1.5">
                {clinics.reduce((sum, c) => sum + c.usage.storageUsedGB, 0).toFixed(1)} <span className="text-xs text-slate-400 font-black">/ {clinics.reduce((sum, c) => sum + c.quotas.maxStorageGB, 0)} Go</span>
              </h3>
              <p className="text-[10px] text-slate-500 font-bold mt-1">Silos PostgreSQL et stockage PACS isolés</p>
            </div>

            <div className="bg-rose-950/20 border border-rose-500/10 p-5 rounded-3xl relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 pr-4 pb-2 text-rose-500/[0.02] group-hover:scale-110 transition-transform"><DollarSign size={80} /></div>
              <p className="text-[10px] uppercase font-black text-rose-400 tracking-wider">Abonnements Récurrents (ARR)</p>
              <h3 className="text-3xl font-extrabold text-white mt-1.5">
                {invoices.filter(i => i.status === 'PAID' && i.currency === 'FCFA').reduce((sum, i) => sum + i.amount, 0).toLocaleString()} <span className="text-xs text-slate-300">FCFA</span>
              </h3>
              <p className="text-[10px] text-rose-300 font-bold mt-1">Taux d'encaissement de contrat : 100% stable</p>
            </div>
          </div>

          {/* TWO COLUMN CHART ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Visual simulation graphs using Tailwind custom display */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex justify-between">
                <span>Croissance des cliniques et utilisateurs</span>
                <span className="text-rose-400 font-mono">Trimestre Q1-Q2 2026</span>
              </h4>
              <div className="pt-6 space-y-4 font-bold text-xs">
                {/* Janvier */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400 text-[10px]"><span>Janvier</span><span>2 Cliniques (150 users)</span></div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-[25%] transition-all"></div>
                  </div>
                </div>
                {/* Mars */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400 text-[10px]"><span>Mars</span><span>4 Cliniques (320 users)</span></div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-[55%] transition-all"></div>
                  </div>
                </div>
                {/* Mai */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400 text-[10px]"><span>Mai</span><span>5 Cliniques (450 users)</span></div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full w-[85%] transition-all"></div>
                  </div>
                </div>
                {/* Juin (Courant) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400 text-[10px]"><span>Juin (Estimé historique)</span><span>8 Cliniques (680 users)</span></div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full w-[100%] transition-all"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex justify-between">
                <span>Ressources techniques de la plateforme</span>
                <span className="text-rose-400 font-mono">Lectures / Écritures I/O clusters</span>
              </h4>
              <div className="pt-6 space-y-4 font-bold text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]"><span>Requêtes de lectures PostgreSQL (25,480,200)</span><span className="text-indigo-400">82%</span></div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full w-[82%]"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]"><span>Requêtes d'écritures chiffrées (5,910,400)</span><span className="text-emerald-400">45% de charge cluster v4</span></div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[45%]"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]"><span>Bande passante d'exploitation réseau (48.5 Terabyte)</span><span className="text-amber-400">62%</span></div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[62%]"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]"><span>Taux d'activité d'infrastructure globale</span><span className="text-rose-400">99.98% de SLA certifié</span></div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full w-[99.98%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE REVENUE STREAMS & ALERTS PREVIEW */}
          <div className="bg-slate-900 border border-white/5 p-6 rounded-[32px] space-y-4">
            <h4 className="text-xs font-black uppercase text-rose-400 tracking-widest flex items-center gap-2"><Award size={14} /> ALERTES EXPIRATION PROCHE & CONTRATS CLINIS</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clinics.map(c => {
                const remainsDays = Math.ceil((new Date(c.licenseEnd).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
                const isCritical = remainsDays <= 15 || c.status === 'EXPIRED';
                return (
                  <div key={c.id} className={`p-4 rounded-2xl border transition-colors ${isCritical ? 'bg-rose-950/20 border-rose-500/20' : 'bg-slate-950 border-white/5'}`}>
                    <div className="flex justify-between font-black text-xs">
                      <span className="truncate">{c.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] uppercase ${isCritical ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-350'}`}>v{c.licenseType}</span>
                    </div>
                    <div className="mt-3 flex justify-between items-center text-[10px] text-slate-400 font-bold">
                      <span>Termine le: <strong className="text-white font-mono">{c.licenseEnd}</strong></span>
                      <span className={isCritical ? 'text-rose-400 font-extrabold' : 'text-slate-400'}>
                        {c.status === 'EXPIRED' ? 'Contrat Échu !' : `Expire dans ${remainsDays}j`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. GESTION DES CLINIQUES CLIENTES (CRUD & TENANT ACCESS) */}
      {activeTab === 'CLINICS' && !selectedClinic && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-extrabold flex items-center gap-2 text-white italic"><Building2 size={20} className="text-rose-500" /> Gestion des Établissements provisionnés</h2>
              <p className="text-xs text-slate-400 font-bold">Créer, modifier, suspendre, réactiver et forcer l'isolement multi-tenant.</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => triggerSpreadsheetExport('cliniques')}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
              >
                <Download size={14} /> Export Table Excel
              </button>
              <button
                onClick={() => { setIsAddingClinic(true); setEditingClinic({}); }}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
              >
                <Plus size={14} /> Provisionner une Clinique
              </button>
            </div>
          </div>

          {/* PROVISIONING SUCCESS SECURE REVELATION */}
          {provisioningSuccess && (
            <div className="bg-slate-900 border-2 border-emerald-500 rounded-[32px] p-8 space-y-6 animate-in zoom-in-95 leading-relaxed relative z-30 shadow-2xl">
              <button
                onClick={() => setProvisioningSuccess(null)}
                className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/15 rounded-xl text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
              
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center font-black animate-pulse text-xl">
                  ✓
                </div>
                <div>
                  <h3 className="text-lg font-black text-emerald-400 uppercase tracking-wider">ISOLATION CLIENT PROVISIONNÉE AVEC SUCCÈS !</h3>
                  <p className="text-xs text-slate-400">Le SmartHosto Control Center a configuré un espace d'exploitation PostgreSQL / Docker isolé et chiffré pour ce client.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-bold">
                <div className="bg-slate-950 border border-white/5 p-4 rounded-2xl space-y-2.5">
                  <p className="text-[10px] uppercase font-black text-rose-400 tracking-wider flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> STRUCTURE CONFIGURÉE</p>
                  <div className="text-xs"><span className="text-slate-450">Nom commercial :</span> <span className="text-white font-extrabold">{provisioningSuccess.clinicName}</span></div>
                  <div className="text-xs"><span className="text-slate-450">Espace logique (Tenant ID) :</span> <span className="text-rose-455 font-mono text-xs font-black">{provisioningSuccess.tenantId}</span></div>
                  <div className="text-xs"><span className="text-slate-455">Type de structure :</span> <span className="text-white">{provisioningSuccess.structureType}</span></div>
                  <div className="text-xs"><span className="text-slate-455">URL d'accès :</span> <span className="text-slate-350 hover:underline cursor-pointer">{provisioningSuccess.websiteUrl}</span></div>
                </div>

                <div className="bg-slate-950 border border-white/5 p-4 rounded-2xl space-y-2.5">
                  <p className="text-[10px] uppercase font-black text-emerald-400 tracking-wider flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> QUOTAS ET MODULES ALLOUÉS</p>
                  <div className="text-xs"><span className="text-slate-455">Utilisateurs autorisés :</span> <span className="text-white font-extrabold">{provisioningSuccess.maxUsers} comptes</span></div>
                  <div className="text-xs"><span className="text-slate-455">Volume de stockage (SSD chiffré) :</span> <span className="text-white font-extrabold">{provisioningSuccess.maxStorageGB} Go</span></div>
                  <div className="text-xs"><span className="text-slate-455">Modules activés :</span> <span className="text-rose-400 font-extrabold">{provisioningSuccess.activatedModulesCount} / 11 modules</span></div>
                  <div className="text-xs"><span className="text-slate-455">Outils cliniques activés :</span> <span className="text-teal-400 font-extrabold">{provisioningSuccess.activatedToolsCount} / 9 outils</span></div>
                </div>
              </div>

              <div className="bg-rose-955/20 border border-rose-500/20 p-5 rounded-2xl space-y-4">
                <div>
                  <h4 className="text-xs font-black uppercase text-rose-400 tracking-widest flex items-center gap-1.5">🔑 IDENTIFIANTS ADMINISTRATEUR GÉNÉRÉS</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Fournissez ces accès à validité unique au Directeur de la clinique pour sa première connexion d'administration.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-950 p-4 rounded-xl border border-white/5 font-mono flex flex-col">
                    <span className="text-[8px] uppercase font-black text-slate-500">Identifiant Administrateur Primary</span>
                    <span className="text-white font-extrabold text-xs select-all mt-1">{provisioningSuccess.adminUser}</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-white/5 font-mono flex flex-col">
                    <span className="text-[8px] uppercase font-black text-slate-500">Mot de passe secret temporaire</span>
                    <span className="text-emerald-400 font-extrabold text-xs select-all mt-1">{provisioningSuccess.adminPass}</span>
                  </div>
                </div>
                
                <p className="text-[9.5px] text-slate-500 font-bold italic leading-relaxed">
                  Notice de sécurité SaaS : Ces identifiants maîtres exclusifs ont été hachés et chiffrés. Ils ne seront plus affichés à l'écran après fermeture de ce panneau. Veillez à les copier immédiatement ou à les imprimer de manière sécurisée.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setProvisioningSuccess(null)}
                  className="px-6 py-2.5 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase transition-all"
                >
                  J'ai noté ces accès, fermer cet écran
                </button>
              </div>
            </div>
          )}

          {/* ADD CLINIC MODAL COMPACT OVERLAY */}
          {isAddingClinic && !provisioningSuccess && (
            <form onSubmit={handleCreateClinicSubmit} className="bg-slate-900 border border-rose-500/25 p-8 rounded-[32px] space-y-8 animate-in slide-in-from-top duration-300 shadow-2xl relative z-30">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-lg font-black text-rose-450 uppercase tracking-wider flex items-center gap-2">
                  <Building2 size={20} className="text-rose-500 animate-pulse" /> Provisionner un nouvel établissement Client
                </h3>
                <p className="text-xs text-slate-400 mt-1">Saisie des informations de structure, d'abonnement SaaS, quotas matériels et allocation des modules métiers.</p>
              </div>

              {/* SECTION 1: GENERAL INFO */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 border-l-2 border-rose-500 pl-2">
                  1. Informations Générales de l'Établissement
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Nom commercial</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Clinique Dentaire Al-Azhar"
                      onChange={e => setEditingClinic({...editingClinic, name: e.target.value})}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs outline-none text-white focus:border-rose-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Type de structure médicale</label>
                    <select
                      required
                      defaultValue="Clinique"
                      onChange={e => setEditingClinic({...editingClinic, structureType: e.target.value as any})}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs outline-none text-white focus:border-rose-500 font-bold"
                    >
                      <option value="Cabinet médical">Cabinet médical</option>
                      <option value="Centre médical">Centre médical</option>
                      <option value="Clinique">Clinique</option>
                      <option value="Hôpital">Hôpital</option>
                      <option value="Maternité">Maternité</option>
                      <option value="Laboratoire">Laboratoire</option>
                      <option value="Centre spécialisé">Centre spécialisé</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Site Internet (facultatif)</label>
                    <input
                      type="url"
                      placeholder="https://www.structure.com"
                      onChange={e => setEditingClinic({...editingClinic, websiteUrl: e.target.value})}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs outline-none text-white focus:border-rose-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Directeur Médical / Représentant responsable</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Prof. Amadou Kane"
                      onChange={e => setEditingClinic({...editingClinic, responsibleUser: e.target.value})}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs outline-none text-white focus:border-rose-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Pays d'installation</label>
                    <select
                      required
                      onChange={e => setEditingClinic({...editingClinic, country: e.target.value})}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs outline-none text-white focus:border-rose-500 font-bold"
                    >
                      <option value="">-- Choisir un pays --</option>
                      {globalConfig.countriesList.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Ville principale</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Dakar / Bamako"
                      onChange={e => setEditingClinic({...editingClinic, city: e.target.value})}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs outline-none text-white focus:border-rose-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Téléphone technique de contact</label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: +221 33 000 00 00"
                      onChange={e => setEditingClinic({...editingClinic, phone: e.target.value})}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs outline-none text-white focus:border-rose-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1 font-bold">
                    <label className="text-[10px] font-black uppercase text-slate-400">Email Administratif & Billing</label>
                    <input
                      type="email"
                      required
                      placeholder="Ex: direction@structure.gm"
                      onChange={e => setEditingClinic({...editingClinic, email: e.target.value})}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs outline-none text-white focus:border-rose-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1 col-span-1 md:col-span-2 lg:col-span-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Adresse géographique complète</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Boulevard de la République, Lot 4"
                      onChange={e => setEditingClinic({...editingClinic, address: e.target.value})}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs outline-none text-white focus:border-rose-500 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: METRICS & QUOTAS LIMITS */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 border-l-2 border-rose-500 pl-2">
                  2. Paramétrage des Quotas d'Abonnement Multi-Tenant
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400">Nombre maximal d'utilisateurs autorisés</label>
                    <select
                      required
                      defaultValue="25"
                      onChange={e => setEditingClinic({
                        ...editingClinic, 
                        quotas: {
                          ...(editingClinic.quotas || { maxPatients: 5000, maxStorageGB: 20, maxSites: 1, maxMonthlyConsultations: 1500, maxMonthlyHospitalizations: 150 }),
                          maxUsers: parseInt(e.target.value)
                        }
                      })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs outline-none text-white focus:border-rose-500 font-bold"
                    >
                      <option value="10">10 comptes (Petit cabinet ou clinique spécialisée)</option>
                      <option value="25">25 comptes (Cabinet de groupe ou centre médical moyen)</option>
                      <option value="50">50 comptes (Clinique standard)</option>
                      <option value="100">100 comptes (Hôpital régional standard)</option>
                      <option value="250">250 comptes (Grand établissement de santé privé)</option>
                      <option value="1000">1000 comptes (Abonnement Grand Compte / Illimité)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400">Espace disque de stockage alloué (SSD chiffré)</label>
                    <select
                      required
                      defaultValue="20"
                      onChange={e => setEditingClinic({
                        ...editingClinic,
                        quotas: {
                          ...(editingClinic.quotas || { maxUsers: 25, maxPatients: 5000, maxSites: 1, maxMonthlyConsultations: 1500, maxMonthlyHospitalizations: 150 }),
                          maxStorageGB: parseInt(e.target.value)
                        }
                      })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs outline-none text-white focus:border-rose-500 font-bold"
                    >
                      <option value="5">5 Go SSD (Usage de base, sans stockage médical d'imagerie)</option>
                      <option value="20">20 Go SSD (Fichiers patients standards, prescriptions légères)</option>
                      <option value="50">50 Go SSD (Adapté pour moyenne clinique, PDF et analyses de labo)</option>
                      <option value="100">100 Go SSD (Inclus imagerie et dossiers d'hospitalisation denses)</option>
                      <option value="500">500 Go SSD (Abonnement Premium Entreprise illimité)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: MODULAR SUBSCRIPTION ACTIVATION */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 border-l-2 border-rose-500 pl-2">
                  3. Activation des modules du Portefeuille SmartHosto
                </h4>
                <p className="text-[11px] text-slate-400 italic font-medium">Cochez les modules du portefeuille applicatif autorisés pour la clinique cliente (Note: Accueil, Consultation, Paramètres et Protocoles sont obligatoires et pré-activés par l'isolateur).</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-slate-950 p-4 border border-white/5 rounded-2xl font-bold text-xs text-slate-300">
                  <label className="flex items-center gap-2 text-slate-500 cursor-not-allowed">
                    <input type="checkbox" checked disabled className="rounded border-white/10 text-rose-600 bg-slate-900" />
                    <span>Accueil (Système)</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-500 cursor-not-allowed">
                    <input type="checkbox" checked disabled className="rounded border-white/10 text-rose-600 bg-slate-900" />
                    <span>Consultation (Système)</span>
                  </label>
                  
                  {['Urgences', 'Hospitalisation', 'Maternité', 'Laboratoire', 'Pharmacie', 'Comptabilité', 'RH'].map(mod => (
                    <label key={mod} className="flex items-center gap-2 hover:text-white cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        defaultChecked
                        onChange={e => {
                          const currentModules = editingClinic.activatedModules || {};
                          setEditingClinic({
                            ...editingClinic,
                            activatedModules: { ...currentModules, [mod]: e.target.checked }
                          });
                        }}
                        className="rounded border-white/10 text-rose-600 focus:ring-rose-500 bg-slate-900" 
                      />
                      <span>{mod}</span>
                    </label>
                  ))}
                  
                  <label className="flex items-center gap-2 text-slate-500 cursor-not-allowed">
                    <input type="checkbox" checked disabled className="rounded border-white/10 text-rose-600 bg-slate-900" />
                    <span>Paramètres</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-500 cursor-not-allowed">
                    <input type="checkbox" checked disabled className="rounded border-white/10 text-rose-600 bg-slate-900" />
                    <span>Protocoles</span>
                  </label>
                </div>
              </div>

              {/* SECTION 4: SMART HEALTH TOOLS & CLINICAL AI ACTIVATION */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 border-l-2 border-rose-500 pl-2">
                  4. Activation des Outils Cliniques & Assistants IA
                </h4>
                <p className="text-[11px] text-slate-400 italic font-medium">Options intelligentes et modèles de traitement allouables à ce tenant.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-950 p-4 border border-white/5 rounded-2xl font-bold text-xs text-slate-300">
                  {['Ordonnance intelligente', 'Calculateur de posologie', 'Planificateur de soins', 'Bulletin d\'examens', 'Outil CPN', 'Partogramme intelligent'].map(tool => (
                    <label key={tool} className="flex items-center gap-2 hover:text-white cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        defaultChecked
                        onChange={e => {
                          const currentTools = editingClinic.activatedTools || {};
                          setEditingClinic({
                            ...editingClinic,
                            activatedTools: { ...currentTools, [tool]: e.target.checked }
                          });
                        }}
                        className="rounded border-white/10 text-rose-600 focus:ring-rose-500 bg-slate-900" 
                      />
                      <span>{tool}</span>
                    </label>
                  ))}

                  {['Assistant IA obstétrical', 'Assistant IA clinique', 'Assistant IA pharmaceutique'].map(aiTool => (
                    <label key={aiTool} className="flex items-center gap-2 hover:text-teal-400 cursor-pointer select-none text-teal-300">
                      <input 
                        type="checkbox" 
                        defaultChecked
                        onChange={e => {
                          const currentTools = editingClinic.activatedTools || {};
                          setEditingClinic({
                            ...editingClinic,
                            activatedTools: { ...currentTools, [aiTool]: e.target.checked }
                          });
                        }}
                        className="rounded border-teal-500/20 text-teal-600 focus:ring-teal-500 bg-slate-900" 
                      />
                      <span className="flex items-center gap-1 font-extrabold text-teal-400">⚡ {aiTool} <span className="text-[8px] bg-teal-500/20 px-1 py-0.2 rounded font-black border border-teal-550/20">API</span></span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ACTIONS SUBMIT */}
              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddingClinic(false)}
                  className="px-5 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase text-slate-350 border border-white/10 transition-colors"
                >
                  Annuler l'opération
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-rose-900/30 flex items-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <Cpu size={14} className="animate-pulse" /> Déclencher le Provisioning Isolé
                </button>
              </div>
            </form>
          )}

          {/* SEARCH & FILTERS CONTROLS */}
          <div className="bg-white/[0.03] border border-white/5 rounded-[24px] p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-25">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Rechercher</label>
              <div className="relative flex items-center">
                <Search size={12} className="absolute left-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Nom, ville, pays..."
                  value={clinicSearch}
                  onChange={e => setClinicSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs outline-none text-white focus:border-rose-500 font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Type de structure</label>
              <select
                value={filterStructureType}
                onChange={e => setFilterStructureType(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs outline-none text-white focus:border-rose-500 font-bold"
              >
                <option value="">Tous les types</option>
                <option value="Cabinet médical">Cabinet médical</option>
                <option value="Centre médical">Centre médical</option>
                <option value="Clinique">Clinique</option>
                <option value="Hôpital">Hôpital</option>
                <option value="Maternité">Maternité</option>
                <option value="Laboratoire">Laboratoire</option>
                <option value="Centre spécialisé">Centre spécialisé</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Statut</label>
              <select
                value={filterClinicStatus}
                onChange={e => setFilterClinicStatus(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs outline-none text-white focus:border-rose-500 font-bold"
              >
                <option value="">Tous les statuts</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="DEMO">DEMO</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Licence / Abonnement</label>
              <select
                value={filterClinicLicense}
                onChange={e => setFilterClinicLicense(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs outline-none text-white focus:border-rose-500 font-bold"
              >
                <option value="">Toutes les licences</option>
                <option value="DEMO">DEMO</option>
                <option value="BASIC">BASIC</option>
                <option value="STANDARD">STANDARD</option>
                <option value="PREMIUM">PREMIUM</option>
                <option value="ENTERPRISE">ENTERPRISE</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Trier par</label>
              <select
                value={clinicSortBy}
                onChange={e => setClinicSortBy(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs outline-none text-white focus:border-rose-500 font-bold"
              >
                <option value="name-asc">Nom (A-Z)</option>
                <option value="name-desc">Nom (Z-A)</option>
                <option value="created-desc">Création (Plus récent)</option>
                <option value="expiry-asc">Expiration (Plus proche)</option>
              </select>
            </div>
          </div>

          {/* CLINICS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedClinics.map(c => (
              <div key={c.id} className="bg-white/5 border border-white/10 rounded-[32px] p-6 hover:border-rose-500/40 transition-all space-y-4 relative overflow-hidden group">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-600/10 border border-rose-500/30 flex items-center justify-center font-black text-rose-400 text-sm">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-white tracking-tight leading-tight">{c.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-black uppercase text-slate-350 border border-white/5">
                          {c.structureType || 'Clinique'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {c.id}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase ${
                    c.status === 'ACTIVE' ? 'bg-emerald-500/25 text-emerald-300' :
                    c.status === 'SUSPENDED' ? 'bg-amber-500/20 text-amber-300' :
                    c.status === 'EXPIRED' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-350'
                  }`}>{c.status}</span>
                </div>

                <div className="space-y-2 text-xs font-bold text-slate-400 border-t border-white/5 pt-3">
                  <div className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-500" /> {c.city}, {c.country}</div>
                  <div className="flex items-center gap-1.5"><Phone size={12} className="text-slate-500" /> {c.phone}</div>
                  <div className="flex items-center gap-1.5"><Mail size={12} className="text-slate-500" /> {c.email}</div>
                  <div className="flex items-center gap-1.5"><User size={12} className="text-slate-500" /> Représentant : <span className="text-white">{c.responsibleUser}</span></div>
                  <div className="flex items-center gap-1.5 text-rose-350 font-mono text-[10.5px] border-t border-white/5 pt-2 mt-1">
                    <Calendar size={11} className="text-rose-400" /> Expire le : <span className="text-rose-400 font-black">{c.licenseEnd}</span>
                  </div>
                </div>

                {/* Tenant Actions Row */}
                <div className="border-t border-white/10 pt-4 flex flex-wrap gap-1.5 justify-between items-center">
                  <div className="bg-white/5 px-2.5 py-1 rounded-lg text-[9px] font-mono text-slate-300 font-bold uppercase border border-white/5">
                    Plan: <strong>{c.licenseType}</strong>
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleSwitchTenantContext(c)}
                      className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-black uppercase flex items-center gap-1"
                      title="Forcer la connexion dans l'espace isolé de cette clinique"
                    >
                      Connexion Isolée <ArrowRight size={10} />
                    </button>
                    <button
                      onClick={() => setSelectedClinic(c)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                      title="Inspecter / Modifier quotas & modules"
                    >
                      <Sliders size={12} />
                    </button>
                    <button
                      onClick={() => {
                        const nextStatus = c.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
                        setClinics(clinics.map(item => item.id === c.id ? { ...item, status: nextStatus } : item));
                        appendLog('Modification Statut Clinique', `Instanciation forcée au statut ${nextStatus} pour ${c.name}.`, 'SECURITY', c.id, c.name);
                        showToast(`Statut de ${c.name} changé en ${nextStatus}`, 'success');
                      }}
                      className={`p-1.5 rounded-lg border transition-colors ${c.status === 'SUSPENDED' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/15 text-amber-400'}`}
                      title={c.status === 'SUSPENDED' ? 'Réactiver' : 'Suspendre (Dépassement de facturation)'}
                    >
                      <Lock size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SINGLE CLINIC DETAIL / QUOTA & MODULE ADJUSTER */}
      {selectedClinic && (
        <div className="bg-slate-900 border border-white/10 rounded-[32px] p-6 space-y-6 animate-in zoom-in-95 leading-relaxed relative">
          <button
            onClick={() => setSelectedClinic(null)}
            className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/15 rounded-xl text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>

          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-extrabold text-white">Console Privée : {selectedClinic.name}</h2>
            <p className="text-xs text-slate-400 font-mono">Tenant unique d'isolement : {selectedClinic.id} • Inscrit le {selectedClinic.createdAt}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* ADJUST LICENSES */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-rose-400 tracking-widest flex items-center gap-1.5"><Key size={14}/> Type & Expirations d'abonnement</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Formule active</label>
                  <select
                    value={selectedClinic.licenseType}
                    onChange={e => {
                      const nextType = e.target.value as any;
                      const nextPrice = nextType === 'DEMO' ? 0 : nextType === 'BASIC' ? 450000 : nextType === 'STANDARD' ? 950000 : nextType === 'PREMIUM' ? 1500000 : 2800000;
                      const updated = clinics.map(item => item.id === selectedClinic.id ? { ...item, licenseType: nextType, licensePrice: nextPrice } : item);
                      setClinics(updated);
                      setSelectedClinic(updated.find(item => item.id === selectedClinic.id) || null);
                      appendLog('Modification Formule', `Migration forcée au plan ${nextType} pour ${selectedClinic.name}`, 'LICENSE', selectedClinic.id, selectedClinic.name);
                    }}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 outline-none text-white focus:border-rose-500"
                  >
                    <option value="DEMO">Démonstration (0 FCFA)</option>
                    <option value="BASIC">Basic (450,000 FCFA)</option>
                    <option value="STANDARD">Standard (950,000 FCFA)</option>
                    <option value="PREMIUM">Premium (1,500,000 FCFA)</option>
                    <option value="ENTERPRISE">Enterprise (2,800,000 FCFA)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Échéance de Licence</label>
                  <input
                    type="date"
                    value={selectedClinic.licenseEnd}
                    onChange={e => {
                      const nextEnd = e.target.value;
                      const updated = clinics.map(item => item.id === selectedClinic.id ? { ...item, licenseEnd: nextEnd } : item);
                      setClinics(updated);
                      setSelectedClinic(updated.find(item => item.id === selectedClinic.id) || null);
                      appendLog('Modification Date Expiration', `Contrat prorogé jusqu\'au ${nextEnd} pour ${selectedClinic.name}`, 'LICENSE', selectedClinic.id, selectedClinic.name);
                    }}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 outline-none text-white focus:border-rose-500"
                  />
                </div>
              </div>

              {/* RETAIN MODULES ON/OFF TOGGLE SWITCHES */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <h3 className="text-xs font-black uppercase text-rose-400 tracking-widest flex items-center gap-1.5"><Layers size={14}/> Allocation des modules de soin (Interrupteurs ON/OFF)</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(selectedClinic.activatedModules).map(moduleName => {
                    const isPassed = selectedClinic.activatedModules[moduleName];
                    return (
                      <button
                        key={moduleName}
                        type="button"
                        onClick={() => {
                          const updatedModules = { ...selectedClinic.activatedModules, [moduleName]: !isPassed };
                          const updated = clinics.map(item => item.id === selectedClinic.id ? { ...item, activatedModules: updatedModules } : item);
                          setClinics(updated);
                          setSelectedClinic(updated.find(item => item.id === selectedClinic.id) || null);
                          appendLog('Module Activé/Désactivé', `Le module ${moduleName} est passé à ${!isPassed ? 'ACTIF' : 'INACTIF'} pour la clinique.`, 'MODULE', selectedClinic.id, selectedClinic.name);
                        }}
                        className={`flex justify-between items-center p-3 rounded-xl border text-xs font-bold transition-colors ${
                          isPassed ? 'bg-rose-600/10 border-rose-500/20 text-white' : 'bg-slate-950 border-white/5 text-slate-500'
                        }`}
                      >
                        <span>{moduleName}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase ${isPassed ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                          {isPassed ? 'OUI' : 'NON'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ADJUST QUOTAS */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-rose-400 tracking-widest flex items-center gap-1.5"><Sliders size={14}/> Personnalisation des quotas & limitations d'infrastructure</h3>
              
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {[
                  { key: 'maxUsers', label: 'Utilisateurs / Praticiens max', current: selectedClinic.usage.activeUsers, ref: 'users' },
                  { key: 'maxPatients', label: 'Patients max en base', current: selectedClinic.usage.totalPatients, ref: 'patients' },
                  { key: 'maxStorageGB', label: 'Volume de stockage max (Go)', current: selectedClinic.usage.storageUsedGB, ref: 'Go' },
                  { key: 'maxSites', label: 'Nombre de sites autorisés', current: selectedClinic.usage.sitesUsed, ref: 'sites' },
                  { key: 'maxMonthlyConsultations', label: 'Consultations mensuelles autorisées', current: selectedClinic.usage.monthlyConsultations, ref: 'consults' },
                  { key: 'maxMonthlyHospitalizations', label: 'Hospitalisations mensuelles autorisées', current: selectedClinic.usage.monthlyHospitalizations, ref: 'hosps' }
                ].map(quota => {
                  const limitValue = ((selectedClinic.quotas as any)[quota.key]) || 0;
                  const usedValue = quota.current || 0;
                  const percent = limitValue > 0 ? Math.round((usedValue / limitValue) * 100) : 0;
                  return (
                    <div key={quota.key} className="space-y-1 bg-slate-950 border border-white/5 p-3 rounded-xl text-xs">
                      <div className="flex justify-between font-bold text-slate-400 tracking-tight">
                        <span>{quota.label}</span>
                        <span>{usedValue} / <strong className="text-white">{limitValue} {quota.ref}</strong></span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className={`h-full ${getProgressColor(percent)}`} style={{ width: `${Math.min(percent, 100)}%` }}></div>
                        </div>
                        <span className="text-[10px] font-black">{percent}%</span>
                      </div>

                      {/* Quota slider setter */}
                      <div className="flex items-center gap-2 pt-2">
                        <span className="text-[9px] text-slate-500 font-bold">Ajuster limite :</span>
                        <input
                          type="range"
                          min={quota.key === 'maxUsers' || quota.key === 'maxSites' ? 1 : 100}
                          max={quota.key === 'maxUsers' ? 200 : quota.key === 'maxStorageGB' ? 1000 : 10000}
                          value={limitValue}
                          onChange={e => {
                            const val = parseInt(e.target.value);
                            const updatedQuotas = { ...selectedClinic.quotas, [quota.key]: val };
                            const updated = clinics.map(item => item.id === selectedClinic.id ? { ...item, quotas: updatedQuotas } : item);
                            setClinics(updated);
                            setSelectedClinic(updated.find(item => item.id === selectedClinic.id) || null);
                          }}
                          className="flex-1 accent-rose-500 h-1"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ALLOCATED TOOLS TABS */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <h3 className="text-xs font-black uppercase text-rose-400 tracking-widest flex items-center gap-1.5"><Sliders size={14}/> Disponibilité des outils d'assistance clinique</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(selectedClinic.activatedTools).map(tool => {
                    const isPassed = selectedClinic.activatedTools[tool];
                    return (
                      <button
                        key={tool}
                        type="button"
                        onClick={() => {
                          const updatedTools = { ...selectedClinic.activatedTools, [tool]: !isPassed };
                          const updated = clinics.map(item => item.id === selectedClinic.id ? { ...item, activatedTools: updatedTools } : item);
                          setClinics(updated);
                          setSelectedClinic(updated.find(item => item.id === selectedClinic.id) || null);
                          appendLog('Outil Clinique Configuré', `L'outil ${tool} est maintenant ${!isPassed ? 'Activé' : 'Désactivé'} pour ${selectedClinic.name}`, 'TOOL', selectedClinic.id, selectedClinic.name);
                        }}
                        className={`px-3 py-1.5 rounded-full border text-[10px] font-black uppercase transition-colors ${
                          isPassed ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-950 border-white/5 text-slate-500'
                        }`}
                      >
                        {tool}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. CONSTRUCT LICENSES & ABONNEMENTS */}
      {activeTab === 'LICENSES' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-extrabold flex items-center gap-2 italic text-white"><Key size={18} className="text-rose-500" /> Moteur de gestion des Licences d'établissement</h2>
            <p className="text-xs text-slate-400 font-bold">Ajuster les dates d'expiration, forcer le renouvellement automatique, configurer les alertes cliniques de blocage.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clinics.map(c => {
              const remainsDays = Math.ceil((new Date(c.licenseEnd).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
              const isExpired = c.status === 'EXPIRED' || remainsDays <= 0;
              return (
                <div key={c.id} className="bg-slate-900 border border-white/5 p-6 rounded-3xl relative overflow-hidden space-y-4">
                  {isExpired && <div className="absolute top-0 right-0 bg-rose-600 text-[9px] font-black uppercase text-white px-3 py-1 rounded-bl-xl tracking-wider">EXPIRÉ !</div>}
                  
                  <div>
                    <span className="text-[9px] bg-white/5 text-slate-400 font-black px-2 py-0.5 rounded-md uppercase">{c.licenseType}</span>
                    <h3 className="font-extrabold text-base text-white mt-1.5 truncate">{c.name}</h3>
                  </div>

                  <div className="space-y-1.5 text-xs font-medium text-slate-455">
                    <div className="flex justify-between font-bold"><span>Date d'activation:</span><strong className="text-white font-mono">{c.licenseStart}</strong></div>
                    <div className="flex justify-between font-bold"><span>Échéance contractuelle:</span><strong className="text-red-400 font-mono">{c.licenseEnd}</strong></div>
                    <div className="flex justify-between font-bold"><span>Tarif Annuel:</span><strong className="text-emerald-400 font-bold">{(c.licensePrice || 0).toLocaleString()} FCFA</strong></div>
                    <div className="flex justify-between items-center border-t border-white/5 pt-2">
                      <span>Renouvellement automatique:</span>
                      <button
                        onClick={() => {
                          const updated = clinics.map(item => item.id === c.id ? { ...item, autoRenew: !c.autoRenew } : item);
                          setClinics(updated);
                          showToast(`Renouvellement automatique modifié pour ${c.name}`, 'info');
                        }}
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-colors ${c.autoRenew ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}
                      >
                        {c.autoRenew ? 'ACTIF' : 'INACTIF'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5">
                    <button
                      onClick={() => {
                        const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                        const updated = clinics.map(item => item.id === c.id ? { ...item, licenseEnd: nextYear, status: 'ACTIVE' as const } : item);
                        setClinics(updated);
                        appendLog('Prolongation Licence', `Licence prorogée au ${nextYear} pour ${c.name}`, 'LICENSE', c.id, c.name);
                        showToast(`Abonnement de ${c.name} prolongé d'un an (jusqu'en ${nextYear}).`, 'success');
                      }}
                      className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase"
                    >
                      Renouveller (+1 An)
                    </button>
                    <button
                      onClick={() => {
                        const updated = clinics.map(item => item.id === c.id ? { ...item, status: 'SUSPENDED' as const } : item);
                        setClinics(updated);
                        appendLog('Rupture de Contrat Forcée', `Contrat abonnement résilié unilatéralement pour ${c.name}`, 'LICENSE', c.id, c.name);
                        showToast(`Licence de ${c.name} suspendue unilatéralement. Accès révoqué.`, 'info');
                      }}
                      className="px-3 py-2 bg-white/5 hover:bg-red-950/20 border border-white/5 text-slate-400 hover:text-red-400 rounded-xl text-[10px] font-black uppercase transition-colors"
                    >
                      Suspendre
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. GESTION DES QUOTAS */}
      {activeTab === 'QUOTAS' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-extrabold flex items-center gap-2 text-white italic"><Sliders size={18} className="text-rose-500" /> Éléments de Limitation & Alertes de Surcharges</h2>
            <p className="text-xs text-slate-400 font-bold">Vérification de la bande passante, du surdosage de stockage, ou du dépassement du nombre de praticiens enregistrés.</p>
          </div>

          <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-black uppercase text-rose-450">ALERTES EXPLOITATION QUOTAS</h3>
            <div className="space-y-4">
              {clinics.map(c => {
                const userPercent = Math.round((c.usage.activeUsers / c.quotas.maxUsers) * 100);
                const storagePercent = Math.round((c.usage.storageUsedGB / c.quotas.maxStorageGB) * 100);
                const showWarning = userPercent >= 85 || storagePercent >= 85;

                return (
                  <div key={c.id} className={`p-4 rounded-2xl border ${showWarning ? 'bg-red-950/25 border-red-500/25' : 'bg-slate-950 border-white/5'} flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-bold`}>
                    <div className="flex-1 min-w-[200px]">
                      <h4 className="text-sm font-extrabold text-white">{c.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Statut quota : {showWarning ? '🔴 DÉPASSEMENT IMMINENT' : '🟢 Sûr'}</p>
                    </div>

                    <div className="flex flex-wrap gap-4 flex-1">
                      <div className="flex-1">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>Comptes utilisateurs ({c.usage.activeUsers} / {c.quotas.maxUsers})</span>
                          <span>{userPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full ${getProgressColor(userPercent)}`} style={{ width: `${Math.min(userPercent, 100)}%` }}></div>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>Stockage Nuage ({c.usage.storageUsedGB} / {c.quotas.maxStorageGB} Go)</span>
                          <span>{storagePercent}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full ${getProgressColor(storagePercent)}`} style={{ width: `${Math.min(storagePercent, 100)}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedClinic(c)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase shrink-0"
                    >
                      Élever les quotas
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. PORTFOLIO MODULES ACTIVÉS */}
      {activeTab === 'MODULES' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-extrabold flex items-center gap-2 text-white italic"><Layers size={18} className="text-rose-500" /> Commutateurs d'offres de Modules & Fonctionnalités (ON/OFF)</h2>
            <p className="text-xs text-slate-400 font-bold">Activer ou révoquer l'accès aux modules pour chaque clinique cliente en temps réel.</p>
          </div>

          <div className="bg-slate-900 border border-white/5 rounded-3xl p-6">
            <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
              Sélectionnez une clinique ci-dessous pour ouvrir son panneau de contrôle d'interrupteurs. Vous pouvez activer ou désactiver les 11 modules fondamentaux (Accueil, Consultation, Urgences, Hospitalisation, Maternité, Laboratoire, Pharmacie, Comptabilité, RH) ainsi que les 9 outils d'aide au diagnostic.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clinics.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedClinic(c)}
                  className="w-full p-4 rounded-2xl bg-slate-955 border border-white/5 hover:border-rose-500/30 text-left flex justify-between items-center transition-all"
                >
                  <div>
                    <h3 className="font-extrabold text-sm text-white">{c.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Modules connectés: {Object.values(c.activatedModules).filter(v => v).length} / 11</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. MONITORING LOGISTIQUE & EXPLOITATION TECHNIQUE */}
      {activeTab === 'MONITORING' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-extrabold flex items-center gap-2 text-white italic">
              <Activity size={18} className="text-rose-500" /> Monitoring Technique & Échanges Réseau Multi-Tenant
            </h2>
            <p className="text-xs text-slate-400 font-bold">
              Surveillance de la charge d'infrastructure, des écritures PostgreSQL isolées, de la bande passante consommée et de l'état d'activité des pods Cloud Run.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {clinics.map(c => {
              // Calculate database and network status
              const reads = c.dbReadsThisMonth || 0;
              const writes = c.dbWritesThisMonth || 0;
              const ratio = reads > 0 ? (writes / reads) * 100 : 0;
              return (
                <div key={c.id} className="bg-slate-900 border border-white/5 p-6 rounded-[32px] hover:border-indigo-500/30 transition-all space-y-4">
                  <div className="flex justify-between items-start border-b border-white/5 pb-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-white truncate max-w-[180px]">{c.name}</h4>
                      <p className="text-[10px] font-mono text-indigo-400 mt-0.5">DB ID: db_{c.id.substring(7)}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-black uppercase">
                      Pod Actif
                    </span>
                  </div>

                  <div className="space-y-3 text-xs font-bold font-mono">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Lectures SQL (Ce mois) :</span>
                      <strong className="text-white font-mono">{reads.toLocaleString()}</strong>
                    </div>

                    <div className="flex justify-between items-center text-slate-400">
                      <span>Écritures SQL (Ce mois) :</span>
                      <strong className="text-white font-mono">{writes.toLocaleString()}</strong>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-455 mb-[3px]">
                        <span>Ratio I/O (Écritures vs Lectures)</span>
                        <span>{ratio.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{ width: `${Math.min(ratio * 2, 100)}%` }}></div>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-3 space-y-2 text-slate-400">
                      <div className="flex justify-between">
                        <span>Bande passante (Docker) :</span>
                        <strong className="text-white font-medium">{(c.bandwidthUsedMB || 120)} Mo</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Trafic Payload :</span>
                        <strong className="text-white font-mono">{(c.dataTransferredGB || 0).toFixed(1)} Go</strong>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-450 pt-1">
                        <span>Dernière pulsation :</span>
                        <span>{c.lastConnection || 'Aujourd\'hui'} UTC</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex gap-1.5 justify-end">
                    <button
                      onClick={() => {
                        appendLog('Purge Caches Détaillés', `Suppression des tables temporaires Redis et re-index de la base db_${c.id.substring(7)}`, 'SECURITY', c.id, c.name);
                        showToast(`Caches Redis purgés pour ${c.name}`, 'info');
                      }}
                      className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-black uppercase text-slate-300 transition-colors"
                    >
                      Purger Caches
                    </button>
                    <button
                      onClick={() => {
                        showToast(`Pulsation d'isolement : Latence stable à ${(1.1 + Math.random() * 0.4).toFixed(2)}ms`, 'success');
                      }}
                      className="px-2.5 py-1.5 bg-indigo-600/20 text-indigo-300 hover:bg-rose-500/20 hover:text-white rounded-lg text-[9px] font-black uppercase transition-all"
                    >
                      Tester Ping
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. FACTURATION ET SUBSCRIPTION BILLING */}
      {activeTab === 'BILLING' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-extrabold flex items-center gap-2 text-white italic"><CreditCard size={18} className="text-rose-500" /> Facturation des abonnements & Historique d'encaissement</h2>
              <p className="text-xs text-slate-400 font-bold">Vérification de la santé financière des abonnés, encaissement manuel et génération d'une facture fiscalisable.</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => triggerSpreadsheetExport('comptabilite')}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase flex items-center gap-1.5"
              >
                <Download size={14} /> Télécharger CSV Journal
              </button>
              <button
                onClick={() => setIsRecordingPayment(true)}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase flex items-center gap-1.5"
              >
                <PlusCircle size={14} /> Enregistrer un Paiement
              </button>
            </div>
          </div>

          {/* RECORD SUBSCRIPTION PAYMENT COMPACT FORM */}
          {isRecordingPayment && (
            <form onSubmit={handleLogPaymentSubmit} className="bg-slate-900 border border-rose-500/20 p-6 rounded-3xl space-y-4 animate-in slide-in-from-top">
              <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5">Enregistrer un versement manuel d'établissement</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400">Sélectionner la Clinique</label>
                  <select
                    required
                    value={paymentClinicId}
                    onChange={e => setPaymentClinicId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs outline-none text-white font-bold"
                  >
                    <option value="">-- Choisir clinique --</option>
                    {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400">Montant encaissé</label>
                  <input
                    type="number"
                    required
                    placeholder="Ex: 1500000"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs outline-none text-white font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400">Devise</label>
                  <select
                    value={paymentCurrency}
                    onChange={e => setPaymentCurrency(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs outline-none text-white font-bold"
                  >
                    {globalConfig.defaultCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400">Plan validé</label>
                  <select
                    value={paymentPlan}
                    onChange={e => setPaymentPlan(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs outline-none text-white font-bold"
                  >
                    <option value="BASIC">BASIC</option>
                    <option value="STANDARD">STANDARD</option>
                    <option value="PREMIUM">PREMIUM</option>
                    <option value="ENTERPRISE">ENTERPRISE</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400">Canal de paiement</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs outline-none text-white font-bold"
                  >
                    <option value="Virement bancaire">Virement bancaire</option>
                    <option value="Chèque certifié">Chèque certifié</option>
                    <option value="Espèces">Espèces en caisse centrale</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsRecordingPayment(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase"
                >
                  Enregistrer & Valider reçu fiscal
                </button>
              </div>
            </form>
          )}

          {/* INVOICES LIST TABLE */}
          <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h3 className="text-xs font-black uppercase text-rose-455">Journal des facturations émises</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-bold text-slate-400">
                <thead className="bg-slate-950 text-[10px] uppercase font-black tracking-wider text-slate-500 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4">ID Facture</th>
                    <th className="px-6 py-4">Clinique Client</th>
                    <th className="px-6 py-4">Formule engagée</th>
                    <th className="px-6 py-4 text-right">Montant</th>
                    <th className="px-6 py-4">Expiré le / Échéance</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4">Méthode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoices.map(i => (
                    <tr key={i.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4 font-mono text-white">{i.id}</td>
                      <td className="px-6 py-4 text-white font-extrabold">{i.clinicName}</td>
                      <td className="px-6 py-4 uppercase"><span className="px-2 py-0.5 bg-slate-800 rounded font-mono">{i.plan}</span></td>
                      <td className="px-6 py-4 text-right text-emerald-400 font-extrabold">{i.amount.toLocaleString()} {i.currency}</td>
                      <td className="px-6 py-4 font-mono">{i.paidDate || i.dueDate}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          i.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-300' :
                          i.status === 'OVERDUE' ? 'bg-rose-500/20 text-rose-300 animate-pulse' : 'bg-amber-500/20 text-amber-300'
                        }`}>{i.status}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-medium">{i.paymentMethod || 'Non payé'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 8. SUPPORT TECHNIQUE TICKET SYSTEM */}
      {activeTab === 'SUPPORT' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-extrabold flex items-center gap-2 text-white italic"><HelpCircle size={18} className="text-rose-500" /> Support Technique & Helpdesk Centralisé</h2>
            <p className="text-xs text-slate-400 font-bold">Répondre aux tickets ouverts par les cliniques raccordées et attribuer des ingénieurs d'exploitation.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* TICKETS LIST */}
            <div className="lg:col-span-5 bg-slate-900 border border-white/5 rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-black uppercase text-rose-455 border-b border-white/5 pb-2">Tickets d'incidents signalés ({tickets.length})</h3>
              
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {tickets.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`w-full text-left p-4 rounded-2xl border transition-colors block text-xs ${
                      selectedTicket?.id === t.id 
                        ? 'bg-rose-500/10 border-rose-500/40 text-white' 
                        : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-slate-500">{t.id}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                        t.priority === 'CRITICAL' || t.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'
                      }`}>{t.priority}</span>
                    </div>

                    <h4 className="font-extrabold text-white mt-1.5 line-clamp-1">{t.title}</h4>
                    <p className="text-[10px] text-slate-455 font-bold mt-1 max-w-[280px] truncate">{t.clinicName}</p>
                    
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5 text-[9px]">
                      <span>Inscrit le {t.createdAt}</span>
                      <span className="font-black text-rose-450 uppercase">{t.status}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* SINGLE SUPPORT WINDOWS */}
            <div className="lg:col-span-7 bg-slate-900 border border-white/5 rounded-3xl p-6 relative">
              {selectedTicket ? (
                <div className="space-y-6 leading-relaxed">
                  <div className="border-b border-white/5 pb-4">
                    <span className="text-[9px] bg-white/5 text-slate-400 font-black px-2 py-0.5 rounded-md uppercase">{selectedTicket.category}</span>
                    <h3 className="text-base font-extrabold text-white mt-2">{selectedTicket.title}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-bold">Provenance: {selectedTicket.clinicName} • Assigné à: {selectedTicket.assignedTechnician || 'Technicien d\'astreinte'}</p>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-955 p-3 rounded-xl border border-white/5">{selectedTicket.description}</p>

                  {/* COMMUNICATOR MSG THREADS */}
                  <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                    {selectedTicket.messages.map((m, idx) => (
                      <div key={idx} className={`p-3 rounded-xl text-xs flex flex-col ${m.isAdmin ? 'bg-rose-500/10 text-white self-end border border-rose-500/15' : 'bg-white/5 text-slate-300'}`}>
                        <div className="flex justify-between font-black text-[9px] text-slate-400 mb-0.5">
                          <span>{m.sender}</span>
                          <span className="font-mono">{m.timestamp}</span>
                        </div>
                        <p className="font-medium mt-1">{m.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* REPLY COMPACT FORM */}
                  <form onSubmit={handleReplyTicketSubmit} className="space-y-3 pt-4 border-t border-white/5">
                    <textarea
                      required
                      rows={2}
                      placeholder="Saisissez la réponse à envoyer au médecin de garde..."
                      value={ticketReplyText}
                      onChange={e => setTicketReplyText(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs outline-none text-white font-bold max-h-16"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-slate-500 font-bold">Un e-mail automatique sera expédié au clinicien requérant.</span>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase flex items-center gap-1.5"
                      >
                        <Send size={12} /> Répondre & Fermer
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 text-slate-500 font-semibold italic text-xs">
                  <HelpCircle size={40} className="text-slate-600 mb-2" />
                  Sélectionnez un ticket d'incident dans la colonne de gauche pour inspecter le dialogue clinique et répondre au helpdesk.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 9. AUDIT ET JOURNALISATION SECURITE */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-extrabold flex items-center gap-2 text-white italic"><Shield size={18} className="text-rose-500" /> Journal de traçabilité, Audit & Logs Systèmes Centralisés</h2>
            <p className="text-xs text-slate-400 font-bold">Historique complet des actions effectuées par le Super Administrateur et modifications d'offres.</p>
          </div>

          <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-bold text-slate-400">
                <thead className="bg-slate-950 text-[10px] uppercase font-black tracking-wider text-slate-500 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4">Horodatage</th>
                    <th className="px-6 py-4">Utilisateur / Acteur</th>
                    <th className="px-6 py-4">Catégorie</th>
                    <th className="px-6 py-4">Établissement lié</th>
                    <th className="px-6 py-4">Action d'exploitation</th>
                    <th className="px-6 py-4">Détails techniques</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {logs.map(l => (
                    <tr key={l.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4 font-mono text-slate-400">{l.timestamp}</td>
                      <td className="px-6 py-4 text-white font-extrabold">{l.user}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-slate-855 rounded-md font-mono text-[9px] uppercase border border-white/5">{l.category}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{l.clinicName || 'Global Cloud Run'}</td>
                      <td className="px-6 py-4 text-rose-450 font-bold">{l.action}</td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-[10px]">{l.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 10. VARIABLES CENTRALES CONFIGURATION */}
      {activeTab === 'SETTINGS' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-extrabold flex items-center gap-2 text-white italic"><Settings size={18} className="text-rose-500" /> Paramétrage Centralisé Globaux</h2>
            <p className="text-xs text-slate-400 font-bold">Modifier les devises supportées, les langues nationales de dispensation et modèles de documents imprimables.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-slate-900 border border-white/5 p-5 rounded-3xl space-y-4">
              <h3 className="text-xs font-black uppercase text-rose-400 tracking-widest flex items-center gap-1.5"><DollarSign size={14} /> Devises financières</h3>
              <div className="space-y-3 font-bold text-xs text-slate-400">
                <p>Définissez les devises de conversion disponibles pour le module Facturation.</p>
                <div className="flex flex-wrap gap-1.5">
                  {globalConfig.defaultCurrencies.map(cur => (
                    <span key={cur} className="px-3 py-1 bg-white/5 text-white rounded-lg select-all border border-white/5">{cur}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-white/5 p-5 rounded-3xl space-y-4">
              <h3 className="text-xs font-black uppercase text-indigo-400 tracking-widest flex items-center gap-1.5"><Languages size={14} /> Langues supportées</h3>
              <div className="space-y-3 font-bold text-xs text-slate-400">
                <p>Langues de l'interface et d'édition d'ordonnances.</p>
                <div className="flex flex-wrap gap-1.5">
                  {globalConfig.defaultLanguages.map(lng => (
                    <span key={lng} className="px-3 py-1 bg-white/5 text-white rounded-lg border border-white/5">{lng}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-white/5 p-5 rounded-3xl space-y-4">
              <h3 className="text-xs font-black uppercase text-emerald-400 tracking-widest flex items-center gap-1.5"><Printer size={14} /> Gabarits de Prescription PDF</h3>
              <div className="space-y-2 text-xs font-bold text-slate-400">
                <div className="flex justify-between">
                  <span>Modèle Ordonnance :</span>
                  <strong className="text-white">{globalConfig.prescriptionLayout}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Modèle Factures :</span>
                  <strong className="text-white">{globalConfig.billingLayout}</strong>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 11. ESPACE SURVEILLANCE CONSOMMATION IA */}
      {activeTab === 'AI_CONS' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-extrabold flex items-center gap-2 text-white italic">
              <Cpu size={18} className="text-rose-500" /> Centre de Consommation & Limitation de l'IA Clinique (Gemini LLM)
            </h2>
            <p className="text-xs text-slate-400 font-bold">
              Mesure en temps réel de l'exploitation de l'IA (Ordonnances intelligentes, partogrammes automatisés et aide au diagnostic obstétrical) par clinique cliente.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {/* Configuration globale banner */}
              <div className="bg-slate-900 border border-white/5 p-6 rounded-[28px] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold font-mono">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase text-slate-450">Modèle Central d'Inférence</span>
                  <strong className="text-white block font-mono text-sm">{globalConfig.aiModel || 'Gemini 1.5 Pro'}</strong>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase text-slate-450">Tarif / 1 000 jetons</span>
                  <strong className="text-emerald-400 block text-sm">{globalConfig.pricePer1kTokens || 15} FCFA</strong>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase text-slate-450">Statut Réseau Passant</span>
                  <strong className="text-indigo-400 block text-sm">Opérationnel (API Google)</strong>
                </div>
              </div>

              {/* LIST OF CLINICS AND LOGS */}
              <div className="space-y-4">
                {clinics.map(c => {
                  const usage = c.aiUsage || {
                    clinicalRequests: 0,
                    obstetricalRequests: 0,
                    pharmaceuticalRequests: 0,
                    administrativeRequests: 0,
                    requestsToday: 0,
                    requestsThisMonth: 0,
                    requestsCumulative: 0,
                    tokensConsumed: 0,
                    estimatedCost: 0,
                    avgResponseTime: 1.3,
                    cumulativeTime: 0,
                    maxRequestsPerMonth: 1000,
                    maxTokensPerMonth: 5000000
                  };
                  
                  const tokensUsed = c.usage.aiTokensUsed || usage.tokensConsumed || 0;
                  const tokensQuota = usage.maxTokensPerMonth || 5000000;
                  const tokenPercent = Math.round((tokensUsed / tokensQuota) * 100);
                  const priceFCFA = Math.round((tokensUsed / 1000) * (globalConfig.pricePer1kTokens || 15));

                  return (
                    <div key={c.id} className="bg-slate-900 border border-white/5 p-6 rounded-[32px] space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                        <div>
                          <h4 className="font-extrabold text-sm text-white">{c.name}</h4>
                          <p className="text-[10px] text-slate-400">Quota mensuel : <strong className="text-slate-200">{(tokensQuota / 1000000).toFixed(1)} M jetons</strong></p>
                        </div>
                        <div className="text-right sm:text-right">
                          <span className="text-xs text-emerald-400 font-extrabold font-mono block">{priceFCFA.toLocaleString()} FCFA</span>
                          <span className="text-[9px] text-slate-450 uppercase block">Coût estimé ré-indicié</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold">
                        <div className="bg-slate-950 p-3 rounded-2xl">
                          <span className="text-[9px] text-slate-450 block uppercase">Aide au Diagnostic</span>
                          <strong className="text-white block mt-0.5">{usage.clinicalRequests || 0} req.</strong>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-2xl">
                          <span className="text-[9px] text-slate-450 block uppercase">Obstétrique CPN</span>
                          <strong className="text-white block mt-0.5">{usage.obstetricalRequests || 0} req.</strong>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-2xl">
                          <span className="text-[9px] text-slate-450 block uppercase">Posologies / Pharma</span>
                          <strong className="text-white block mt-0.5">{usage.pharmaceuticalRequests || 0} req.</strong>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-2xl">
                          <span className="text-[9px] text-slate-450 block uppercase">Moteur Admr. / PDF</span>
                          <strong className="text-white block mt-0.5">{usage.administrativeRequests || 0} req.</strong>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-[11px] font-bold text-slate-400">
                          <span>Consommation de jetons cognitifs : {tokensUsed.toLocaleString()} / <strong>{tokensQuota.toLocaleString()}</strong></span>
                          <span className={tokenPercent >= 85 ? 'text-rose-400 animate-pulse font-black' : 'text-slate-300'}>{tokenPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                          <div className={`h-full ${getProgressColor(tokenPercent)}`} style={{ width: `${Math.min(tokenPercent, 100)}%` }}></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-450 font-bold border-t border-white/5 pt-3">
                        <span>Temps de réponse moyen API : <strong className="text-white">{(usage.avgResponseTime || 1.3)} sec.</strong></span>
                        <button
                          onClick={() => {
                            setSelectedClinic(c);
                            showToast(`Redirection vers la console de quotas de ${c.name}`, 'info');
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[9px] tracking-wider uppercase font-black"
                        >
                          Ajuster Limitations IA
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-3xl p-6 text-xs leading-relaxed space-y-4">
                <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <Award size={14} className="text-rose-500" /> Intelligence Augmentée Hospitalière
                </h4>
                <p className="text-slate-300">
                  L'Assistant IA clinique et pharmaceutique de SmartHosto est propulsé par la technologie <strong>Google Gemini API</strong>. 
                </p>
                <p className="text-slate-300">
                  Cette interface permet à l'éditeur de superviser le respect des contrats de jetons (tokens) affectés à chaque clinique en évitant les surcharges financières.
                </p>
                <div className="border-t border-white/5 pt-3 space-y-2">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Règle de limitation active :</div>
                  <p className="text-[11px] text-slate-400 font-semibold italic">
                    Un blocage automatique temporaire de l'inférence est opéré dès que la consommation atteint 100% de l'enveloppe allouée d'un établissement.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 border border-white/5 p-5 rounded-3xl space-y-3">
                <h4 className="text-xs font-black uppercase text-rose-455 tracking-wide">Actions d'urgence IA</h4>
                <button
                  onClick={() => {
                    appendLog('Limitation IA globale', 'Réduction globale de 15% du taux d\'inférence autorisé par établissement', 'SECURITY', undefined, 'Tous les établissements');
                    showToast('Limitation conservatoire globale activée.', 'info');
                  }}
                  className="w-full text-center px-4 py-2.5 bg-rose-600/20 border border-rose-500/20 hover:bg-rose-500/35 text-rose-300 rounded-xl text-[10px] font-black uppercase"
                >
                  Activer Limitation Conservatoire
                </button>
                <button
                  onClick={() => {
                    showToast('Tous les compteurs IA mensuels ont été ré-initialisés.', 'success');
                  }}
                  className="w-full text-center px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-black uppercase"
                >
                  Remise à Zéro Mensuelle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
