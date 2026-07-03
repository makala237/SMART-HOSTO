
export enum PatientStatus {
  WAITING_ADMISSION = 'En attente accueil',
  WAITING_TRIAGE = 'En attente triage',
  IN_CONSULTATION = 'En consultation',
  WAITING_LAB = 'En attente Labo',
  IN_EMERGENCY = 'En Urgence',
  INPATIENT = 'Hospitalisé',
  READY_TO_DISCHARGE = 'Prêt pour la sortie',
  IN_MATERNITY = 'En Maternité',
  DISCHARGED = 'Sorti',
  TRIAGE = 'TRIAGE',
  ER_ROOM = 'ER_ROOM',
  OBSERVATION = 'OBSERVATION',
  NON_URGENT = 'NON_URGENT',
  ORIENTED = 'ORIENTED'
}

export enum TriageLevel {
  RED = 'ROUGE',
  ORANGE = 'ORANGE',
  YELLOW = 'JAUNE',
  GREEN = 'VERT'
}

export interface TriageData {
  id: string;
  patientId: string;
  timestamp: string;
  motif: string;
  vitals: {
    bpSys: number;
    bpDia: number;
    heartRate: number;
    respRate: number;
    spo2: number;
    temp: number;
  };
  consciousness: 'ALERT' | 'VOICE' | 'PAIN' | 'UNCONSCIOUS';
  painScale: number;
  level: TriageLevel;
}

export interface EmergencyPatient extends Patient {
  emergencyId: string;
  arrivalTimestamp: string;
  triage?: TriageData;
  management?: EmergencyManagement;
  monitoring: EmergencyMonitoring[];
  orientation?: EmergencyOrientation;
  status: PatientStatus.TRIAGE | PatientStatus.ER_ROOM | PatientStatus.OBSERVATION | PatientStatus.NON_URGENT | PatientStatus.ORIENTED;
}

export interface EmergencyManagement {
  id: string;
  timestamp: string;
  doctorId: string;
  doctorName: string;
  diagnosis: string;
  acts: string[];
  treatments: string[];
}

export interface EmergencyMonitoring {
  id: string;
  timestamp: string;
  vitals: {
    bpSys: number;
    bpDia: number;
    heartRate: number;
    respRate: number;
    spo2: number;
    temp: number;
  };
  nurseId: string;
  nurseName: string;
  note?: string;
}

export interface EmergencyOrientation {
  id: string;
  timestamp: string;
  type: 'HOSPITALIZATION' | 'CONSULTATION' | 'DISCHARGE' | 'EXTERNAL_TRANSFER';
  summary: string;
}

export enum Role {
  ADMIN = 'ADMIN',
  RECEPTION = 'ACCUEIL',
  DOCTOR = 'MEDECIN',
  NURSE = 'INFIRMIER',
  LAB = 'LABO',
  MATERNITY = 'SAGE_FEMME',
  PHARMACY = 'PHARMACIEN',
  CASHIER = 'CAISSIER',
  ACCOUNTANT = 'GESTIONNAIRE',
  URGENCE = 'URGENCE',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export type EmergencySubMenu = 'TRIAGE' | 'ER_ROOM' | 'OBSERVATION' | 'NON_URGENT' | 'MANAGEMENT' | 'DISCHARGE';

export type ReceptionSubMenu = 'triage' | 'sorties' | 'demandes' | 'profil';

export type CashierSubMenu = 'facturation' | 'pending' | 'daily' | 'search';

export type LabSubMenu = 'demandes' | 'encours' | 'resultats' | 'validations' | 'rapports';

export type InpatientSubMenu = 'beds' | 'planner';

export type PharmacySubMenu = 'prescriptions' | 'sales';

export type AccountingSubMenu = 'dashboard' | 'recettes' | 'depenses' | 'creances' | 'fournisseurs' | 'salaires' | 'quotes_parts' | 'analytique' | 'tresorerie' | 'rapports' | 'audit';

export type VisitMotif = 
  | 'CONSULTATION' 
  | 'URGENCE' 
  | 'LABORATOIRE' 
  | 'MATERNITE' 
  | 'PHARMACIE' 
  | 'SOIN_INFIRMIER';

export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'EXEMPT' | 'CANCELLED';

export interface PaymentRequestItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PaymentRequest {
  id: string;
  patientId: string;
  patientName: string;
  requestingService: string;
  sourceModule: string;
  type: 'CONSULTATION' | 'LABORATOIRE' | 'HOSPITALISATION' | 'MATERNITE' | 'PHARMACIE' | 'ADMINISTRATIF' | 'AUTRE';
  items: PaymentRequestItem[];
  totalAmount: number;
  amountPaid: number;
  status: PaymentStatus;
  createdAt: string;
  createdBy: string;
  targetCashier?: string;
}

export interface CashierTransaction {
  id: string;
  paymentRequestId: string;
  amount: number;
  paymentMethod: 'CASH' | 'CARD' | 'MOBILE_MONEY' | 'TRANSFER' | 'CHECK';
  date: string;
  cashierId: string;
  cashierName: string;
  notes?: string;
}

export interface ParametresCaisse {
  detteAutorisee: boolean;
  seuilDetteMax: number;
  paiementPartielAutorise: boolean;
  avoirPatientAutorise: boolean;
  applicationAutoAvoir: boolean;
  modesPaiement: {
    especes: boolean;
    mobileMoney: boolean;
    carte: boolean;
    virement: boolean;
    autre: boolean;
  };
  impression: {
    nomStructure: string;
    logo: string;
    adresse: string;
    telephone: string;
    slogan: string;
    piedDePage: string;
  };
  permissions: {
    autoriserDette: Role[];
    annulerTransaction: Role[];
    rembourserAvoir: Role[];
    modifierFacture: Role[];
  };
  technique: {
    caissesActives: string[];
    formatRecu: string;
    formatTransaction: string;
  };
}

export interface LigneFacturation {
  id: string;
  libelle: string;
  source: string;
  quantite: number;
  prixUnitaire: number;
  montantTotal: number;
  paymentRequestId?: string;
}

export interface TransactionFacturation {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  lignes: LigneFacturation[];
  sousTotal: number;
  totalGeneral: number;
  montantPaye: number;
  avoirUtilise: number;
  surplusConserve: number;
  detteCreee: number;
  modePaiement: 'CASH' | 'CARD' | 'MOBILE_MONEY' | 'TRANSFER' | 'CHECK' | 'OTHER';
  caissierId: string;
  caissierName: string;
  status: 'VALIDATED' | 'CANCELLED';
}

export interface AvoirPatient {
  id: string;
  patientId: string;
  montant: number;
  dateCreation: string;
  transactionSourceId: string;
  status: 'AVAILABLE' | 'USED' | 'REFUNDED';
}

export interface DettePatient {
  id: string;
  patientId: string;
  montantInitial: number;
  montantRestant: number;
  dateCreation: string;
  transactionSourceId: string;
  status: 'PENDING' | 'PARTIAL' | 'PAID';
}

export interface HistoriqueFinancierPatient {
  patientId: string;
  transactions: TransactionFacturation[];
  avoirs: AvoirPatient[];
  dettes: DettePatient[];
}

export interface Consumable {
  id: string;
  name: string;
  price: number;
  stock: number;
  
  // Général
  codeInterne?: string;
  description?: string;
  categorie?: string;
  sousCategorie?: string;
  servicePrincipal?: string;

  // Stock
  uniteGestion?: string;
  quantiteParConditionnement?: number;
  seuilAlerte?: number;
  gestionParLot?: boolean;
  datePeremptionApplicable?: boolean;
  numeroLot?: string;
  datePeremption?: string;

  // Utilisation
  venduAuPatient?: boolean;
  consommeEnInterne?: boolean;
  deductionAutomatique?: boolean;
  lieActeMedical?: boolean;
  lieExamenLabo?: boolean;
  lieSoinInfirmier?: boolean;
  lieHospitalisation?: boolean;
  lieDocumentAdministratif?: boolean;
  modeUtilisation?: string;

  // Tarification
  prixAchat?: number;
  facturableAuPatient?: boolean;
  caisseConcernee?: string;

  // Intégrations métier
  actesLies?: string[];
  examensLaboLies?: string[];
  soinsLies?: string[];
  modulesLies?: string[];

  // Paramètres intelligents
  prioriteApprovisionnement?: string;
  regleAlerteStock?: string;
  commentaireAdministratif?: string;
  recommandationsUsage?: string;
  servicePrioritaire?: string;
}

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface User {
  id: string;
  username: string;
  email?: string;
  password?: string; // TODO: For production, implement secure hashing (bcrypt/Argon2)
  forcePasswordChange?: boolean;
  name: string;
  role: Role; // Legacy single role for backward compatibility
  roles?: string[]; // Array of CustomRole IDs for multi-role support
  status?: UserStatus;
  lastLogin?: string;
  token: string;
  profession?: string;
  salary?: string;
  schedule?: string;
  quotePartRate?: string;
}

export interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, string[]>; // e.g., { 'module_consultation': ['read', 'write'], 'global': ['prescribe_meds'] }
  createdAt: string;
  updatedAt: string;
  isSystem?: boolean;
}

export interface EstablishmentConfig {
  name: string;
  address: string;
  phone: string;
  logo?: string;
  language: 'FR' | 'EN';
  currency: 'XAF' | 'USD' | 'EUR';
  theme?: string;
  email?: string;
  city?: string;
  country?: string;
  slogan?: string;
}

export interface LabExamRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  prescriberId: string;
  prescriberName: string;
  department?: string; // service demandeur
  date: string;
  status: 'en attente' | 'patient appelé' | 'prélèvement fait' | 'en cours' | 'terminé' | 'validé' | 'annulé';
  priority: 'normal' | 'urgent' | 'critique';
  clinicalContext: {
    motif: string;
    diagnostic: string;
    note: string;
  };
  exams: {
    actId: string;
    name: string;
    price: number;
    category: string;
  }[];
  totalAmount: number;
  comments?: string;
  billingStatus: 'pending' | 'partial' | 'paid' | 'exonéré';
  
  // Prélèvement
  sampleType?: string;
  sampleTime?: string;
  sampledBy?: string;
  sampleRemarks?: 'échantillon insuffisant' | 'hémolysé' | 'à refaire' | 'autre' | '';
  technicianId?: string;
}

export interface ParametreResultat {
  nom: string;
  unite: string;
  valeurReference: string;
  valeur: string;
  isAnormal?: boolean;
}

export interface LigneResultat {
  examId: string; // actId
  examName: string;
  parametres: ParametreResultat[];
  conclusion?: string;
}

export interface ResultatLaboratoire {
  id: string;
  demandeId: string;
  patientId: string;
  lignes: LigneResultat[];
  commentaireGlobal?: string;
  statut: 'brouillon' | 'prêt pour validation' | 'validé' | 'rejeté';
  saisiPar: string;
  dateSaisie: string;
  validePar?: string;
  dateValidation?: string;
  remarquesValidation?: string;
}

export interface RapportLaboratoirePDF {
  id: string;
  resultatId: string;
  patientId: string;
  dateGeneration: string;
  url?: string; // URL ou base64
}

export interface HistoriqueLaboratoirePatient {
  patientId: string;
  demandes: LabExamRequest[];
  resultats: ResultatLaboratoire[];
  rapports: RapportLaboratoirePDF[];
}

export interface MedicalAct {
  id: string;
  name: string;
  price: number;
  category: string;
  
  // New fields from AddMedicalActForm
  codeInterne?: string;
  description?: string;
  type?: string;
  
  servicePrincipal?: string;
  sousService?: string;
  priorite?: string;
  
  professionsAutorisees?: string[];
  dureeEstimee?: string;
  necessiteRdv?: boolean;
  peutEtreUrgent?: boolean;
  genereHospitalisation?: boolean;
  necessiteSurveillance?: boolean;
  necessiteConsentement?: boolean;
  
  modeTarification?: string;
  factureA?: string;
  remboursable?: boolean;
  partageRevenu?: boolean;
  pourcentageMedecin?: string;
  pourcentageStructure?: string;
  
  medicamentsUtilises?: string[];
  consommables?: string[];
  equipements?: string[];
  
  indications?: string;
  signesDeclencheurs?: string[];
  parametresSurveiller?: string[];
  niveauRisque?: string;
  actionsAssociees?: string[];
  
  // Paramètres de laboratoire (si type === 'Laboratoire')
  labParameters?: {
    nom: string;
    unite: string;
    valeurReferenceMin?: number;
    valeurReferenceMax?: number;
    valeurReferenceTexte?: string;
  }[];
}

export interface Medication {
  id: string;
  name: string;
  dci?: string;
  dosage: string;
  price: number;
  stock: number;
  routes?: string[];
  forms?: string[];
  concentrations?: string[];
  units?: string;
  quantityPerBox?: number;
  contraindications?: string[];
  alerts?: string[];
  
  // New fields from AddMedicationForm
  codeInterne?: string;
  codeBarre?: string;
  laboratoire?: string;
  classeTherapeutique?: string;
  sousClasseTherapeutique?: string;
  indications?: string;
  formeGalenique?: string;
  dosageValeur?: string;
  dosageUnite?: string;
  concentration?: string;
  volumeParUnite?: string;
  voiesAdministration?: string[];
  typePosologie?: string;
  doseMinimale?: string;
  doseMaximale?: string;
  frequenceStandard?: string;
  dureeStandard?: string;
  doseMaxParPrise?: string;
  doseMaxParJour?: string;
  effetsSecondaires?: string[];
  interactions?: string;
  typeConditionnement?: string;
  unitesParConditionnement?: string;
  volumeParUniteStock?: string;
  prixAchat?: string;
  prixVente?: string;
  seuilAlerte?: string;
  parametresSurveiller?: string[];
  signesAlerte?: string[];
  niveauRisque?: string;
  recommandations?: string;
}

export interface Tool {
  id: string;
  name: string;
  code: string;
  description: string;
  moduleParent: string;
  status: 'ACTIVE' | 'INACTIVE';
  criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  visibility: 'VISIBLE' | 'HIDDEN' | 'OPTIONAL' | 'MANDATORY';
  authorizedRoles: string[];
  dependencies: string[];
  impacts: string[];
  createdAt: string;
  updatedAt: string;
  mode?: 'SIMPLE' | 'ADVANCED';
}

export interface Ordonnance {
  id: string;
  patientId: string;
  prescripteurId: string;
  prescripteurName: string;
  prescripteurRole?: string;
  date: string;
  status: 'DRAFT' | 'VALIDATED' | 'TRANSMITTED' | 'PREPARED' | 'DELIVERED' | 'CANCELLED';
  diagnostic?: string;
  indication?: string;
  notes?: string;
  traitements: Prescription[];
  pharmacyStatus?: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED';
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  medicationId: string;
  medicationName: string;
  indication?: string;
  route: string;
  dosageScheme: string;
  frequency: number;
  duration: number;
  calculationType: 'FIXED' | 'MG_KG_PRISE' | 'MG_KG_JOUR' | 'M2';
  dosePerIntake: number;
  dosePer24h: number;
  totalDose: number;
  volumePerIntake?: number;
  unitsPerIntake: number;
  totalUnits: number;
  totalBoxes: number;
  createdAt: string;
  status: 'DRAFT' | 'VALIDATED' | 'SUSPENDED' | 'STOPPED';
  monitoringParams?: string[];
  sideEffects?: string[];
  instructions?: string;
}

export interface CareTask {
  id: string;
  patientId: string;
  prescriptionId: string;
  medicationName: string;
  scheduledAt: string;
  executedAt?: string;
  executedBy?: string;
  status: 'TODO' | 'DONE' | 'LATE' | 'MISSED' | 'REFUSED' | 'SUSPENDED' | 'STOPPED';
  dose: number;
  volume?: number;
  units: number;
  route: string;
  instructions?: string;
  monitoringParams?: string[];
  sideEffects?: string[];
  comment?: string;
}

export type ServiceType = 'clinique' | 'technique' | 'administratif' | 'soutien' | 'specialise';

export interface Service {
  id: string;
  name: string;
  description: string;
  type: ServiceType;
  status: 'active' | 'inactive';
  users: string[]; // User IDs
  activeTools: string[]; // Tool IDs or codes
  linkedModules: string[]; // Module IDs or names
  specificSettings: Record<string, any>;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: 'M' | 'F';
  phone: string;
  residence: string;
  emergencyContact: string;
  emergencyPhone: string;
  maritalStatus: 'CELIBATAIRE' | 'MARIE' | 'VEUF' | 'DIVORCE';
  ethnicity?: string;
  religion?: string;
  bloodGroup?: string;
  allergies?: string[];
  lastVisit?: string;
  status?: PatientStatus;
  // Paramètres cliniques de triage
  vitals?: {
    bpSys: number;
    bpDia: number;
    heartRate: number;
    respRate: number;
    pulse: number;
    spo2: number;
    temp: number;
    height: number;
    weight: number;
    bmi: number;
    waistCirc: number;
  };
}

export interface VisitRecord {
  id: string;
  patientId: string;
  motif: VisitMotif;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  destination: Role;
  arrivalTime: string;
  fee: number;
}

export interface PregnancyDossier {
  id: string;
  patientId: string;
  gestity: number;
  parity: number;
  obstetricalHistory: string;
  ddr: string; // Date des Dernières Règles
  dpa: string; // Date Prévue d'Accouchement
  gestationalAgeWeeks: number;
  riskFactors: string[];
  status: 'A_JOUR' | 'EN_RETARD' | 'TERMINEE';
  cpnCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CPNVisit {
  id: string;
  pregnancyId: string;
  patientId: string;
  date: string;
  week: number; // Semaine d'aménorrhée
  motif: string;
  complaints: string[];
  bpSys: number;
  bpDia: number;
  weight: number;
  edema: boolean;
  temp: number;
  pulse: number;
  fundalHeight: number;
  bcf: number;
  fetalMovements: boolean;
  presentation: string;
  conclusion: string;
  isRiskPregnancy: boolean;
  orientation: string;
  nextVisitDate: string;
  userId: string;
}

export interface CPNExam {
  id: string;
  pregnancyId: string;
  type: string;
  status: 'RECOMMANDE' | 'EN_ATTENTE' | 'FAIT';
  date?: string;
  result?: string;
  anomalyDetected: boolean;
}

export interface CPNPrevention {
  id: string;
  pregnancyId: string;
  type: string;
  category: 'SUPPLEMENTATION' | 'PALUDISME' | 'VACCINATION';
  status: 'A_FAIRE' | 'FAIT';
  administrationDate?: string;
  nextDoseDate?: string;
}

// CATALOGUE DE PROTOCOLES TYPES
export type ProtocolCategory =
  | 'EXAM_PACK'          // Packs d'examens
  | 'THERAPEUTIC'         // Protocoles thérapeutiques
  | 'CARE'                // Protocoles de soins
  | 'HOSPITALIZATION'     // Protocoles d'hospitalisation
  | 'OBSTETRICAL'         // Protocoles obstétricaux
  | 'EMERGENCY'           // Protocoles d'urgence
  | 'CARE_PATHWAY';       // Parcours de soins

export interface ProtocolVersion {
  version: string;
  date: string;
  author: string;
  changes: string;
}

export interface ProtocolLog {
  user: string;
  date: string;
  time: string;
  action: 'creation' | 'modification' | 'activation' | 'deactivation' | 'archiving';
  details?: string;
}

export interface ProtocolElement {
  id: string; // ID from referential or custom name
  type: 'EXAM' | 'MEDICATION' | 'CONSUMABLE' | 'ACT' | 'VITAL';
  name: string;
  quantity?: number;
  frequency?: string;
  duration?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  isRequired?: boolean;
}

export interface Protocol {
  id: string;
  code: string;
  name: string;
  category: ProtocolCategory;
  description: string;
  objective: string;
  scientificReference: string;
  author: string;
  createdAt: string;
  lastUpdated: string;
  version: string;
  versionHistory: ProtocolVersion[];
  status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'ARCHIVED';
  
  // Composition elements
  elements: ProtocolElement[];
  clinicalGuidance?: string; // Conseils
  
  // Specific settings for therapeutic protocol
  therapeuticSettings?: {
    standardDosages: string;
    treatmentDuration: string;
    contraindications: string;
    precautions: string;
  };
  
  // Specific settings for hospitalization protocol
  hospitalizationSettings?: {
    treatments: string;
    administrationSchedule: string; // Horaires d'administration
    monitoringParams: string[]; // Paramètres à surveiller
    monitoringFrequency: string; // Fréquence de surveillance
    dischargeCriteria: string; // Critères de sortie
  };
  
  // Specific settings for care pathways (steps)
  pathwaySteps?: {
    id: string;
    stepNumber: number;
    name: string;
    linkedProtocolId?: string; // Link to another protocol ID (e.g. CPN1)
  }[];

  // Stats
  useCount: number;
  userServices: string[]; // E.g., ['Maternité', 'Urgences']
  lastUsedAt?: string;
  
  // Traceability logs
  logs: ProtocolLog[];
}

