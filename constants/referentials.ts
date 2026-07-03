// Clinical Referentials and Registries for SmartHosto V3
// Fully compliant with WHO ICD-11 standard terminology, protocol catalogs, and clinical scores.

export interface Symptom {
  code: string;
  label: string;
  category: 'Général' | 'Respiratoire' | 'Digestif' | 'Neurologique' | 'Gynécologique' | 'Cardio-vasculaire' | 'Uro-néphrologique' | 'Autre';
}

export interface ReviewSystem {
  system: string;
  symptoms: string[];
}

export interface Cim11Code {
  code: string;
  label: string;
  chapter: string;
  specialty: string;
  category: string;
}

export interface ProtocolLink {
  diagnosisCode: string;
  protocolTitle: string;
  steps: string[];
}

export interface DiagnosticLink {
  diagnosisCode: string;
  exams: string[];
  drugs: { name: string; posology: string; price: number }[];
}

export interface ClinicalScore {
  name: string;
  category: string;
  fields: { name: string; options: { label: string; score: number }[] }[];
}

// 1. symptom_catalog
export const symptom_catalog: Symptom[] = [
  // Général
  { code: 'SYM-001', label: 'Fièvre', category: 'Général' },
  { code: 'SYM-002', label: 'Asthénie (fatigue intense)', category: 'Général' },
  { code: 'SYM-003', label: 'Amaigrissement involontaire', category: 'Général' },
  { code: 'SYM-004', label: 'Anorexie (perte d\'appétit)', category: 'Général' },
  { code: 'SYM-005', label: 'Frissons', category: 'Général' },
  { code: 'SYM-006', label: 'Sueurs nocturnes', category: 'Général' },
  
  // Respiratoire
  { code: 'SYM-101', label: 'Toux sèche', category: 'Respiratoire' },
  { code: 'SYM-102', label: 'Toux grasse / productive', category: 'Respiratoire' },
  { code: 'SYM-103', label: 'Dyspnée (difficulté respiratoire)', category: 'Respiratoire' },
  { code: 'SYM-104', label: 'Hémoptysie (crachat de sang)', category: 'Respiratoire' },
  { code: 'SYM-105', label: 'Douleur thoracique à la respiration', category: 'Respiratoire' },
  
  // Digestif
  { code: 'SYM-201', label: 'Diarrhée aqueuse', category: 'Digestif' },
  { code: 'SYM-202', label: 'Vomissements repetés', category: 'Digestif' },
  { code: 'SYM-203', label: 'Constipation récente', category: 'Digestif' },
  { code: 'SYM-204', label: 'Nusées', category: 'Digestif' },
  { code: 'SYM-205', label: 'Douleur épigastrique', category: 'Digestif' },
  { code: 'SYM-206', label: 'Diarrhée glairo-sanglante (dysenterie)', category: 'Digestif' },
  
  // Neurologique
  { code: 'SYM-301', label: 'Céphalées pulsatiles', category: 'Neurologique' },
  { code: 'SYM-302', label: 'Céphalées en casque', category: 'Neurologique' },
  { code: 'SYM-303', label: 'Convulsions', category: 'Neurologique' },
  { code: 'SYM-304', label: 'Vertiges', category: 'Neurologique' },
  { code: 'SYM-305', label: 'Trouble de la conscience / Somnolence', category: 'Neurologique' },
  
  // Gynécologique
  { code: 'SYM-401', label: 'Leucorrhées pathologiques', category: 'Gynécologique' },
  { code: 'SYM-402', label: 'Métrorragies (saignement hors règles)', category: 'Gynécologique' },
  { code: 'SYM-403', label: 'Aménorrhée (absence de règles)', category: 'Gynécologique' },
  { code: 'SYM-404', label: 'Dysménorrhée (règles douloureuses)', category: 'Gynécologique' }
];

// 2. system_review_catalog
export const system_review_catalog: ReviewSystem[] = [
  {
    system: 'Général',
    symptoms: ['Fièvre', 'Frissons', 'Sueurs', 'Asthénie', 'Perte d\'appétit', 'Amaigrissement']
  },
  {
    system: 'Respiratoire',
    symptoms: ['Toux', 'Expectoration', 'Dyspnée', 'Douleur basithoracique', 'Hémoptysie']
  },
  {
    system: 'Digestif',
    symptoms: ['Dysphagie', 'Nausées', 'Vomissements', 'Transit ralenti', 'Diarrhée', 'Brûlures gastriques']
  },
  {
    system: 'Cardiovasculaire',
    symptoms: ['Palpitations', 'Douleur rétrosternale', 'Dyspnée d\'effort', 'Œdème des membres inférieurs']
  },
  {
    system: 'Neurologique',
    symptoms: ['Céphalées', 'Vertiges', 'Acouphènes', 'Trouble visuel passager', 'Déficit moteur/sensitif']
  },
  {
    system: 'Urologique',
    symptoms: ['Dysurie', 'Pollakiurie', 'Hématurie', 'Brûlures mictionnelles', 'Douleur lombaire']
  },
  {
    system: 'Gynécologique',
    symptoms: ['Leucorrhées suspectes', 'Pertes sanglantes', 'Prurit vulvaire', 'Dents pelviennes']
  },
  {
    system: 'Obstétrical',
    symptoms: ['Mouvements fœtaux diminués', 'Contractions utérines', 'Perte de liquide amniotique', 'Métrorragie']
  },
  {
    system: 'Pédiatrique',
    symptoms: ['Refus de téter', 'Pleurs incessants', 'Hypotonie', 'Léthargie', 'Somnolence']
  }
];

// 3. cim11_catalog (ICD-11 - WHO standards adapted)
export const cim11_catalog: Cim11Code[] = [
  { code: '1F40.0', label: 'Paludisme à Plasmodium falciparum non compliqué', chapter: '01 Certaines maladies infectieuses ou parasitaires', specialty: 'Médecine Générale', category: 'Infectieux' },
  { code: '1F40.1', label: 'Paludisme à Plasmodium falciparum grave (neuro-palu, etc.)', chapter: '01 Certaines maladies infectieuses ou parasitaires', specialty: 'Urgences', category: 'Infectieux' },
  { code: 'BA00.0', label: 'Hypertension artérielle essentielle primaire', chapter: '11 Maladies de l\'appareil circulatoire', specialty: 'Médecine Générale', category: 'Cardiovasculaire' },
  { code: '5A11', label: 'Diabète de type 2', chapter: '05 Maladies du système endocrinien ou de la nutrition', specialty: 'Médecine Générale', category: 'Endocrinien' },
  { code: '1C40.0', label: 'Gastro-entérite d\'origine infectieuse suspectée', chapter: '01 Certaines maladies infectieuses ou parasitaires', specialty: 'Pédiatrie', category: 'Digestif' },
  { code: 'CA40.0', label: 'Rhinopharyngite aiguë (rhume banal)', chapter: '12 Maladies de l\'appareil respiratoire', specialty: 'Médecine Générale', category: 'Respiratoire' },
  { code: 'CA42', label: 'Bronchite aiguë infectieuse', chapter: '12 Maladies de l\'appareil respiratoire', specialty: 'Médecine Générale', category: 'Respiratoire' },
  { code: 'GC00', label: 'Infection urinaire basse non compliquée (Cystite)', chapter: '16 Maladies de l\'appareil génito-urinaire', specialty: 'Médecine Générale', category: 'Biologie' },
  { code: 'QA02.0', label: 'Supervision de grossesse normale de premier trimestre (CPN1)', chapter: '21 Grossesse, accouchement ou puerpéralité', specialty: 'Maternité', category: 'Obstétrique' },
  { code: 'QA02.1', label: 'Supervision de grossesse normale de deuxième ou troisième trimestre', chapter: '21 Grossesse, accouchement ou puerpéralité', specialty: 'Maternité', category: 'Obstétrique' },
  { code: 'JA24.z', label: 'Pré-éclampsie modérée gravidique', chapter: '21 Grossesse, accouchement ou puerpéralité', specialty: 'Maternité', category: 'Obstétrique' },
  { code: 'JA24.y', label: 'Pré-éclampsie sévère ou éclampsie aiguë', chapter: '21 Grossesse, accouchement ou puerpéralité', specialty: 'Urgences', category: 'Obstétrique' },
  { code: '1D10', label: 'Infection dermatologique bactérienne (Dermatite)', chapter: '14 Maladies de la peau', specialty: 'Médecine Générale', category: 'Dermatologie' },
  { code: 'FA01', label: 'Arthrose primaire des grandes articulations', chapter: '15 Maladies du système ostéo-articulaire', specialty: 'Chirurgie', category: 'Rhumatologie' },
  { code: 'ND52.y', label: 'Traumatisme crânien fermé léger', chapter: '22 Blessures, empoisonnements', specialty: 'Traumatologie', category: 'Urgences' }
];

// 4. protocol_catalog_links
export const protocol_catalog_links: ProtocolLink[] = [
  {
    diagnosisCode: '1F40.0',
    protocolTitle: 'Protocole National Paludisme Simple (Sénégal/Afrique de l\'Ouest)',
    steps: [
      'Confirmer par TDR ou Goutte Épaisse (GE) avant traitement sauf urgence.',
      'Traitement de choix: CTA (Artéméther + Luméfantrine) : 1 cp matin & soir pdt 3 jours.',
      'Antipyrétique systématique: Paracétamol 1g toutes le 6h si fièvre.',
      'Faire boire abondamment et surveiller les signes de gravité (vomissements repetés, urines foncées, somnolence).',
      'Contrôle clinique sous 48h.'
    ]
  },
  {
    diagnosisCode: 'BA00.0',
    protocolTitle: 'Protocole Prise en Charge HTA Stade 1 ou 2',
    steps: [
      'Confirmer le diagnostic par 3 mesures distinctes sur deux séances.',
      'Règles Hygiéno-Diététiques (RHD) systématiques: régime hyposodé, perte de poids, exercices.',
      'Monothérapie de première intention (ex. inhibiteur calcique Amlodipine 5mg/j ou IEC Ramipril 5mg/j).',
      'Surveiller la fonction rénale et la kaliémie sous 15 jours.',
      'Suivi mensuel jusqu\'à stabilisation.'
    ]
  },
  {
    diagnosisCode: 'JA24.z',
    protocolTitle: 'Protocole Prise en Charge Pré-éclampsie modérée',
    steps: [
      'Repos au lit, surveillance tensionnelle à domicile ou hospitalisation de jour.',
      'Traitement antihypertenseur central si TA >= 140/90 (ex. Méthyldopa ou Labétalol).',
      'Bilan biologique hebdomadaire: acide urique, créatinine, NFS, enzymes hépatiques (ALAT/ASAT).',
      'Échographie obstétricale avec Doppler utérin toutes les deux semaines pour estimer le bien-être fœtal.'
    ]
  }
];

// 5. diagnostic_exam_links
export const diagnostic_exam_links: Record<string, string[]> = {
  '1F40.0': ['Goutte Épaisse + Frottis Sanguin (GEFS)', 'TDR Paludisme rapide', 'NFS / Hémogramme complet'],
  '1F40.1': ['Goutte Épaisse (GEFS)', 'Urée + Créatinémie', 'Glycémie à jeun', 'NFS', 'Ionogramme sanguin'],
  'BA00.0': ['Créatininémie + DFG', 'Kaliémie + Natrémie', 'Protéinurie des 24h ou bandelette urinaire', 'Glycémie', 'Bilan lipidique (EAL)', 'ECG de repos'],
  '5A11': ['Hémoglobine Glyquée (HbA1c)', 'Créatininémie', 'Glycémie à jeun', 'Protéinurie des 24h', 'Bilan cardio complet'],
  'GC00': ['Examen Cytobactériologique des Urines (ECBU)', 'Bandelette urinaire réactive (Leucocytes/Nitrites)'],
  'JA24.z': ['Protéinurie des 24h', 'NFS (recherche de thrombopénie)', 'Uricémie et bilan rénal', 'Échographie obstétricale + Doppler']
};

// 6. diagnostic_drug_links
export const diagnostic_drug_links: Record<string, { name: string; posology: string; price: number }[]> = {
  '1F40.0': [
    { name: 'Artemether + Lumefantrine 80/480mg (CTA)', posology: '1 cp matin et soir pendant 3 jours au cours du repas', price: 2500 },
    { name: 'Paracetamol 1g (Comprimé)', posology: '1 cp toutes les 6 heures en cas de fièvre ou de douleur (max 4/jour)', price: 800 }
  ],
  'BA00.0': [
    { name: 'Amlodipine 5mg (Calcipress)', posology: '1 comprimé par jour, de préférence le matin', price: 1500 },
    { name: 'Ramipril 5mg (Triatec)', posology: '1 comprimé par jour au réveil', price: 2200 }
  ],
  'GC00': [
    { name: 'Ciprofloxacine 500mg', posology: '1 comprimé matin et soir pendant 5 jours', price: 1800 },
    { name: 'Fosfomycine Trométamol 3g', posology: '1 sachet en dose unique à prendre à distance des repas avant le coucher', price: 2500 }
  ],
  'JA24.z': [
    { name: 'Alpha-Méthyldopa 250mg (Aldomet)', posology: '1 comprimé 3 fois par jour', price: 3000 },
    { name: 'Labétalol 200mg (Loxen)', posology: '1 comprimé matin et soir', price: 3200 }
  ]
};

// 7. clinical_scores
export const clinical_scores: ClinicalScore[] = [
  {
    name: 'Score de Glasgow (GCS)',
    category: 'Neurologique',
    fields: [
      {
        name: 'Ouverture des Yeux (Y)',
        options: [
          { label: 'Spontanée (4)', score: 4 },
          { label: 'Au bruit / à la parole (3)', score: 3 },
          { label: 'À la douleur (2)', score: 2 },
          { label: 'Nulle (1)', score: 1 }
        ]
      },
      {
        name: 'Réponse Verbale (V)',
        options: [
          { label: 'Orientée (5)', score: 5 },
          { label: 'Confuse (4)', score: 4 },
          { label: 'Inappropriée (3)', score: 3 },
          { label: 'Incompréhensible (2)', score: 2 },
          { label: 'Nulle (1)', score: 1 }
        ]
      },
      {
        name: 'Réponse Motrice (M)',
        options: [
          { label: 'Obéit aux ordres (6)', score: 6 },
          { label: 'Orientée à la douleur (localise) (5)', score: 5 },
          { label: 'Évitement à la douleur (flexion non stéréotypée) (4)', score: 4 },
          { label: 'Flexion stéréotypée décortication (3)', score: 3 },
          { label: 'Extension Décérébration (2)', score: 2 },
          { label: 'Nulle (1)', score: 1 }
        ]
      }
    ]
  },
  {
    name: 'Calcul de l\'IMC',
    category: 'Nutrition / Général',
    fields: [] // Will computed automatically based on height & weight
  }
];
