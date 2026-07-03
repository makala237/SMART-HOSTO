import { Protocol } from '../types';

export const DEFAULT_PROTOCOLS: Protocol[] = [
  {
    id: 'p_prenatal_initial',
    code: 'EXM-PRN-01',
    name: 'Bilan prénatal initial (Pack)',
    category: 'EXAM_PACK',
    description: 'Bilan biologique standard recommandé lors de la première consultation prénatale pour évaluer l\'état de santé de base de la femme enceinte.',
    objective: 'Dépister les pathologies infectieuses, immunologiques ou métaboliques pouvant affecter la grossesse.',
    scientificReference: 'Directives Nationales de Santé Maternelle / OMS 2016',
    author: 'Collège National d’Obstétrique',
    createdAt: '2026-01-15T08:00:00Z',
    lastUpdated: '2026-03-10T11:30:00Z',
    version: '1.2',
    versionHistory: [
      { version: '1.0', date: '2026-01-15', author: 'Dr. Amadou Diallo', changes: 'Version initiale' },
      { version: '1.2', date: '2026-03-10', author: 'Maternité Centrale', changes: 'Ajout de la recherche systématique de l\'albumine' }
    ],
    status: 'ACTIVE',
    elements: [
      { id: 'act_nfs', type: 'EXAM', name: 'NFS (Hémogramme complet)', priority: 'HIGH', isRequired: true },
      { id: 'act_gs_rh', type: 'EXAM', name: 'Groupe Sanguin et Facteur Rhésus', priority: 'HIGH', isRequired: true },
      { id: 'act_glycemie', type: 'EXAM', name: 'Glycémie à jeun', priority: 'MEDIUM', isRequired: true },
      { id: 'act_vih', type: 'EXAM', name: 'Sérodiagnostic VIH (Conseil/Dépistage)', priority: 'HIGH', isRequired: true },
      { id: 'act_syphilis', type: 'EXAM', name: 'Sérologie Syphilis (VDRL / TPHA)', priority: 'HIGH', isRequired: true },
      { id: 'act_ag_hbs', type: 'EXAM', name: 'Dépistage Hépatite B (Ag HBs)', priority: 'MEDIUM', isRequired: false },
      { id: 'act_albumine', type: 'EXAM', name: 'Recherche d\'albumine et sucre dans les urines', priority: 'HIGH', isRequired: true }
    ],
    clinicalGuidance: 'À réaliser idéalement avant la 12ème semaine d\'aménorrhée (SA) ou dès la première visite de CPN.',
    useCount: 142,
    userServices: ['Maternité', 'Consultation'],
    lastUsedAt: '2026-06-01T15:40:00Z',
    logs: [
      { user: 'Dr. Amadou Diallo', date: '2026-01-15', time: '08:00', action: 'creation', details: 'Création du pack de base' }
    ]
  },
  {
    id: 'p_paludisme_simple',
    code: 'TX-PALUD-S',
    name: 'Paludisme simple (Adulte et Enfant)',
    category: 'THERAPEUTIC',
    description: 'Protocole thérapeutique de première intention face à un accès palustre non compliqué à Plasmodium falciparum.',
    objective: 'Guérison rapide et complète de l\'infection pour prévenir l\'évolution vers une forme grave.',
    scientificReference: 'Guide OMS de traitement du paludisme, 3e édition',
    author: 'Direction de la Santé Publique',
    createdAt: '2026-02-01T09:00:00Z',
    lastUpdated: '2026-02-01T09:00:00Z',
    version: '1.0',
    versionHistory: [
      { version: '1.0', date: '2026-02-01', author: 'Ministère de la Santé', changes: 'Publication initiale' }
    ],
    status: 'ACTIVE',
    elements: [
      { id: 'med_cta', type: 'MEDICATION', name: 'Artémether + Luméfantrine (CTA)', quantity: 24, frequency: '2 fois par jour', duration: '3 jours', priority: 'HIGH', isRequired: true },
      { id: 'med_paracetamol', type: 'MEDICATION', name: 'Paracétamol 1g', quantity: 20, frequency: '3 fois par jour', duration: '3 jours', priority: 'MEDIUM', isRequired: true }
    ],
    clinicalGuidance: 'Le traitement doit être instauré uniquement après confirmation biologique (Goutte épaisse positive ou Test de Diagnostic Rapide - TDR). Prendre les comprimés de CTA avec un repas riche en graisses pour améliorer l\'absorption.',
    therapeuticSettings: {
      standardDosages: 'Adulte > 35 kg : 4 comprimés de CTA à H0, H8, puis matin et soir pendant 2 jours (total 24 comprimés).',
      treatmentDuration: '3 jours de CTA. Paracétamol modulable selon la fièvre (max 4g par jour).',
      contraindications: 'Premier trimestre de grossesse (préférer la quinine ou l\'artésunate injectable), insuffisance rénale ou hépatique sévère, hypersensibilité aux principes actifs.',
      precautions: 'Surveiller les signes de passage vers un accès grave (vomissements incoercibles, prostration, convulsions, urines foncées).'
    },
    useCount: 289,
    userServices: ['Consultation', 'Urgences', 'Pédiatrie'],
    lastUsedAt: '2026-06-02T05:12:00Z',
    logs: [
      { user: 'Admin', date: '2026-02-01', time: '09:00', action: 'creation', details: 'Importation nationale' }
    ]
  },
  {
    id: 'p_pansement_simple',
    code: 'SOIN-PAN-SF',
    name: 'Pansement simple / Nettoyage plaie',
    category: 'CARE',
    description: 'Protocole de soin standard pour la réfection, le nettoyage et la protection d\'une plaie propre, chirurgicale ou superficielle.',
    objective: 'Maintenir la plaie en milieu propre aseptique, prévenir la surinfection et stimuler la cicatrisation.',
    scientificReference: 'Recommandations SF2S 2021 (Société Française des Sciences de la Stérilisation)',
    author: 'Direction des Soins Infirmiers',
    createdAt: '2026-01-10T10:00:00Z',
    lastUpdated: '2026-04-12T14:00:00Z',
    version: '2.1',
    versionHistory: [
      { version: '1.0', date: '2026-01-10', author: 'Cadre Infirmier', changes: 'Création du protocole initial' },
      { version: '2.1', date: '2026-04-12', author: 'Dr. Sophie Laurent', changes: 'Remplacement de la Bétadine par Chlorhexidine aqueuse en cas d\'exposition thyroïdienne' }
    ],
    status: 'ACTIVE',
    elements: [
      { id: 'cons_gants', type: 'CONSUMABLE', name: 'Gants Stériles (Paire)', quantity: 2, priority: 'HIGH', isRequired: true },
      { id: 'cons_compresses', type: 'CONSUMABLE', name: 'Compresses non tissées stériles', quantity: 10, priority: 'HIGH', isRequired: true },
      { id: 'cons_antiseptique', type: 'CONSUMABLE', name: 'Chlorhexidine Solution aqueuse à 0.05%', quantity: 1, priority: 'MEDIUM', isRequired: true },
      { id: 'cons_serum', type: 'CONSUMABLE', name: 'Sérum Physiologique Flacon 125ml', quantity: 1, priority: 'HIGH', isRequired: true },
      { id: 'cons_sparadrap', type: 'CONSUMABLE', name: 'Sparadrap Microporeux rouleau', quantity: 1, priority: 'LOW', isRequired: false },
      { id: 'act_soin_pansement', type: 'ACT', name: 'Soin de réfection de pansement simple', priority: 'HIGH', isRequired: true }
    ],
    clinicalGuidance: '1. Lavage des mains standard. \n2. Retrait du pansement sale avec des gants à usage unique. \n3. Lavage chirurgical ou friction hydroalcoolique. \n4. Nettoyage de la plaie avec sérum physiologique du centre vers l\'extérieur. \n5. Antiseptique à la chlorhexidine ssi signe inflammatoire. \n6. Séchage par tamponnement. \n7. Pose de pansement stérile protecteur (non adhésif sur plaie humide).',
    useCount: 198,
    userServices: ['Dispensaire', 'Urgences', 'Hospitalisation'],
    lastUsedAt: '2026-06-01T10:20:00Z',
    logs: [
      { user: 'Cadre Infirmier', date: '2026-01-10', time: '10:00', action: 'creation' }
    ]
  },
  {
    id: 'p_hosp_palud_grave',
    code: 'HOSP-PALU-G',
    name: 'Hospitalisation Paludisme Grave (Adulte)',
    category: 'HOSPITALIZATION',
    description: 'Protocole coordonné de prise en charge clinique et thérapeutique en unité de soins intensifs ou d\'hospitalisation pour accès palustre pernicieux.',
    objective: 'Réduire drastiquement la mortalité par perfusion d\'antipaludéens rapides, hydratation, maintien des constantes vitales.',
    scientificReference: 'Directives Nationales d\'Urgence Sanitaire / Critères OMS de gravité',
    author: 'Chef de Service Médecine Interne',
    createdAt: '2026-03-01T08:00:00Z',
    lastUpdated: '2026-05-18T16:20:00Z',
    version: '1.5',
    versionHistory: [
      { version: '1.0', date: '2026-03-01', author: 'Dr. Joseph Ngono', changes: 'Version de démarrage' },
      { version: '1.5', date: '2026-05-18', author: 'Dr. Joseph Ngono', changes: 'Modification de la dose d\'entretien de l\'artésunate' }
    ],
    status: 'ACTIVE',
    elements: [
      { id: 'med_artesunate', type: 'MEDICATION', name: 'Artésunate Inj. Flacon 60mg', quantity: 6, frequency: 'à H0, H12, H24 puis quotidien', duration: '3 jours', priority: 'HIGH', isRequired: true },
      { id: 'med_ringer', type: 'MEDICATION', name: 'Soluté Ringer Lactate Poche 500ml', quantity: 3, frequency: 'Toutes les 8h', duration: '1 jour', priority: 'HIGH', isRequired: true },
      { id: 'act_suivi_constantes', type: 'ACT', name: 'Surveillance rapprochée des constantes sous Scope', priority: 'HIGH', isRequired: true }
    ],
    clinicalGuidance: 'L\'Artésunate intraveineuse est le traitement de choix absolue. Dès que le patient peut tolérer la voie orale, effectuer le relais complet avec une cure complète de CTA orale pendant 3 jours.',
    hospitalizationSettings: {
      treatments: 'Artésunate IV : 2,4 mg/kg à injection à H0, H12, H24, puis une fois par jour. Relais CTA dès autonomie entérale.\nHydratation IV progressive pour éviter l\'Œdème Aigu du Poumon (OAP).',
      administrationSchedule: 'Injections Artésunate : 08:00 et 20:00. Solutés en continu régulé par débitmètre.',
      monitoringParams: ['Température', 'TA', 'FC', 'FR', 'Saturation', 'Douleur', 'Diurèse horaire', 'Glycémie (risque hypoglycémie sous antipaludéens)', 'État de conscience'],
      monitoringFrequency: 'Toutes les 2 heures pendant les premières 24 heures, puis toutes les 6 heures si stable.',
      dischargeCriteria: 'Absence d\'accès de fièvre depuis 24h, parasitémie périphérique négative, relais par comprimés CTA toléré et achevé (>3 doses orales), diurèse spontanée >1.5L/j, reprise de la marche ambulatoire.'
    },
    useCount: 65,
    userServices: ['Hospitalisation', 'Urgences'],
    lastUsedAt: '2026-05-30T14:15:00Z',
    logs: [
      { user: 'Dr. Joseph Ngono', date: '2026-03-01', time: '08:00', action: 'creation' }
    ]
  },
  {
    id: 'p_detresse_respi',
    code: 'ERG-DET-RESP',
    name: 'Urgence : Détresse respiratoire aiguë',
    category: 'EMERGENCY',
    description: 'Algorithme d\'orientation et d\'intervention immédiate en salle de déchocage pour insuffisance respiratoire aiguë critique.',
    objective: 'Garantir la perméabilité des voies aériennes de manière synchrone, optimiser l\'oxygénation et traiter la cause sous-jacente.',
    scientificReference: 'Protocoles SRLF (Société de Réanimation de Langue Française)',
    author: 'Equipe Urgences / Réanimation',
    createdAt: '2026-02-15T00:00:00Z',
    lastUpdated: '2026-02-15T00:00:00Z',
    version: '1.0',
    versionHistory: [
      { version: '1.0', date: '2026-02-15', author: 'Urgences-SMUR', changes: 'Mise en ligne initiale' }
    ],
    status: 'ACTIVE',
    elements: [
      { id: 'act_oxygénothérapie', type: 'ACT', name: 'Oxygénothérapie à haut débit (Masque haute concentration)', priority: 'HIGH', isRequired: true },
      { id: 'cons_lunettes_oxy', type: 'CONSUMABLE', name: 'Lunettes d\'oxygène à usage unique', quantity: 1, priority: 'MEDIUM', isRequired: false },
      { id: 'med_salbutamol', type: 'MEDICATION', name: 'Salbutamol Nébulisation (Solution pour inhalation)', quantity: 1, frequency: 'Si bronchospasme', priority: 'HIGH', isRequired: false },
      { id: 'med_methylprednisolone', type: 'MEDICATION', name: 'Méthylprednisolone 120mg IVD', quantity: 1, priority: 'HIGH', isRequired: true }
    ],
    clinicalGuidance: 'Voie veineuse de gros calibre d\'emblée. Position assise semi-assise 45 degrés obligatoire. Évaluation immédiate de l\'état de conscience (Score de Glasgow) et des gaz du sang.',
    useCount: 112,
    userServices: ['Urgences', 'Réanimation'],
    lastUsedAt: '2026-06-02T04:45:00Z',
    logs: [
      { user: 'Admin', date: '2026-02-15', time: '00:00', action: 'creation' }
    ]
  },
  // Prenatal visits CPN1 - CPN4
  {
    id: 'p_cpn1',
    code: 'OBST-CPN1',
    name: 'CPN 1 : Première Consultation Prénatale (T1)',
    category: 'OBSTETRICAL',
    description: 'Première visite obligatoire de suivi avant la 12e semaine. Confirmation, déclaration administrative et bilan initial.',
    objective: 'Confirmer la grossesse, évaluer l\'âge gestationnel par DDR, rechercher les facteurs de risque et prescrire le bilan général.',
    scientificReference: 'Directives Prénatales OMS 2016',
    author: 'Conseil Maternité',
    createdAt: '2026-01-20T08:00:00Z',
    lastUpdated: '2026-01-20T08:00:00Z',
    version: '1.0',
    versionHistory: [{ version: '1.0', date: '2026-01-20', author: 'Conseil', changes: 'Initial' }],
    status: 'ACTIVE',
    elements: [
      { id: 'p_prenatal_initial', type: 'ACT', name: 'Bilan biologique complet (Faire prescrire le pack prenat 01)', priority: 'HIGH', isRequired: true },
      { id: 'med_fer_folique', type: 'MEDICATION', name: 'Fer granulé + Acide Folique comprimé', quantity: 30, frequency: '1 fois par jour', duration: '30 jours', priority: 'HIGH', isRequired: true },
      { id: 'act_echo_t1', type: 'ACT', name: 'Échographie du premier trimestre (Échographie obstétricale précoce)', priority: 'MEDIUM', isRequired: true }
    ],
    clinicalGuidance: 'Vérifier la hauteur utérine. Conseils nutritionnels essentiels et interdiction absolue d\'automédication.',
    useCount: 95,
    userServices: ['Maternité'],
    lastUsedAt: '2026-06-01T12:00:00Z',
    logs: []
  },
  {
    id: 'p_cpn2',
    code: 'OBST-CPN2',
    name: 'CPN 2 : Deuxième Consultation Prénatale (T2)',
    category: 'OBSTETRICAL',
    description: 'Visite recommandée autour de la 20e-24e semaine d\'aménorrhée.',
    objective: 'Évaluer la croissance fœtale, administrer la première dose de traitement préventif intermittent (TPI-SP) et le vaccin antitétanique si requis.',
    scientificReference: 'Directives Prénatales OMS 2016',
    author: 'Conseil Maternité',
    createdAt: '2026-01-20T08:00:00Z',
    lastUpdated: '2026-01-20T08:00:00Z',
    version: '1.0',
    versionHistory: [{ version: '1.0', date: '2026-01-20', author: 'Conseil', changes: 'Initial' }],
    status: 'ACTIVE',
    elements: [
      { id: 'med_sp_palu', type: 'MEDICATION', name: 'Sulfadoxine + Pyriméthamine (1ère dose TPI)', quantity: 3, frequency: 'Dose unique de 3 comprimés en TDO', duration: '1 jour', priority: 'HIGH', isRequired: true },
      { id: 'med_fer_folique', type: 'MEDICATION', name: 'Fer + Acide folique', quantity: 30, frequency: '1 fois par jour', duration: '30 jours', priority: 'HIGH', isRequired: true },
      { id: 'act_echo_morpho', type: 'ACT', name: 'Échographie morphologique (T2)', priority: 'HIGH', isRequired: false }
    ],
    clinicalGuidance: 'Donner impérativement le TPI en Thérapie Directement Observée (TDO) devant la sage-femme, s\'assurer que la patiente a mangé.',
    useCount: 78,
    userServices: ['Maternité'],
    lastUsedAt: '2026-05-28T09:10:00Z',
    logs: []
  },
  {
    id: 'p_cpn3',
    code: 'OBST-CPN3',
    name: 'CPN 3 : Troisième Consultation Prénatale (T3)',
    category: 'OBSTETRICAL',
    description: 'Visite recommandée vers la 28e semaine.',
    objective: 'Préparer la vaccination antitétanique, dépister l\'anémie, la protéinurie tardive et administrer la 2e dose de TPI.',
    scientificReference: 'Directives Prénatales OMS 2016',
    author: 'Conseil Maternité',
    createdAt: '2026-01-20T08:00:00Z',
    lastUpdated: '2026-01-20T08:00:00Z',
    version: '1.0',
    versionHistory: [{ version: '1.0', date: '2026-01-20', author: 'Conseil', changes: 'Initial' }],
    status: 'ACTIVE',
    elements: [
      { id: 'med_sp_palu_2', type: 'MEDICATION', name: 'Sulfadoxine + Pyriméthamine (2e dose TPI)', quantity: 3, frequency: 'Dose unique', duration: '1 jour', priority: 'HIGH', isRequired: true },
      { id: 'act_nfs_repetition', type: 'ACT', name: 'NFS de contrôle (Dépistage anémie tardive)', priority: 'MEDIUM', isRequired: true }
    ],
    clinicalGuidance: 'Conseiller l\'utilisation systématique de la moustiquaire imprégnée d\'insecticide.',
    useCount: 65,
    userServices: ['Maternité'],
    lastUsedAt: '2026-05-27T11:45:00Z',
    logs: []
  },
  {
    id: 'p_cpn4',
    code: 'OBST-CPN4',
    name: 'CPN 4 : Quatrième Consultation Prénatale (Fin T3)',
    category: 'OBSTETRICAL',
    description: 'Visite cruciale recommandée autour de la 32e-34e semaine d\'aménorrhée.',
    objective: 'Évaluer la présentation fœtale (siège, céphalique), éliminer un placenta prævia et planifier le lieu d\'accouchement.',
    scientificReference: 'Directives Prénatales OMS 2016',
    author: 'Conseil Maternité',
    createdAt: '2026-01-20T08:00:00Z',
    lastUpdated: '2026-01-20T08:00:00Z',
    version: '1.0',
    versionHistory: [{ version: '1.0', date: '2026-01-20', author: 'Conseil', changes: 'Initial' }],
    status: 'ACTIVE',
    elements: [
      { id: 'act_echo_obst_t3', type: 'ACT', name: 'Échographie obstétricale de biométrie fœtale (T3)', priority: 'HIGH', isRequired: true },
      { id: 'med_sp_palu_3', type: 'MEDICATION', name: 'Sulfadoxine + Pyriméthamine (3e dose TPI)', quantity: 3, priority: 'MEDIUM', isRequired: true }
    ],
    clinicalGuidance: 'Identifier formellement le plan d\'accouchement (accouchement vaginal envisagé vs césarienne programmée).',
    useCount: 50,
    userServices: ['Maternité'],
    lastUsedAt: '2026-05-25T14:30:00Z',
    logs: []
  },
  {
    id: 'p_cpn5',
    code: 'OBST-CPN5',
    name: 'CPN 5 : Cinquième Consultation (36 SA)',
    category: 'OBSTETRICAL',
    description: 'Autour de la 36e semaine d\'aménorrhée.',
    objective: 'Vérifier la présentation fœtale, dépister l\'anémie finale et finaliser le plan d\'urgence.',
    scientificReference: 'OMS 2016',
    author: 'Sage Femme Principale',
    createdAt: '2026-01-20T08:00:00Z',
    lastUpdated: '2026-01-20T08:00:00Z',
    version: '1.0',
    versionHistory: [{ version: '1.0', date: '2026-01-20', author: 'Conseil', changes: 'Initial' }],
    status: 'ACTIVE',
    elements: [
      { id: 'med_fer_relais', type: 'MEDICATION', name: 'Supplémentation en Fer ferreux', quantity: 30, frequency: 'Tous les jours', duration: '30 jours', priority: 'MEDIUM', isRequired: true }
    ],
    clinicalGuidance: 'Dépister activement l\'hypertension induite par la grossesse (prééclampsie).',
    useCount: 42,
    userServices: ['Maternité'],
    logs: []
  },
  {
    id: 'p_cpn6',
    code: 'OBST-CPN6',
    name: 'CPN 6 : Sixième Consultation (38 SA)',
    category: 'OBSTETRICAL',
    description: 'Suivi approfondi du dernier mois.',
    objective: 'Vérifier la vitalité fœtale par auscultation du battement cardiaque du fœtus (BCF) et évaluer le bassin maternel.',
    scientificReference: 'OMS 2016',
    author: 'Sage Femme Principale',
    createdAt: '2026-01-20T08:00:00Z',
    lastUpdated: '2026-01-20T08:00:00Z',
    version: '1.0',
    versionHistory: [],
    status: 'ACTIVE',
    elements: [],
    clinicalGuidance: 'Expliquer les signes de début du travail à la patiente.',
    useCount: 35,
    userServices: ['Maternité'],
    logs: []
  },
  {
    id: 'p_cpn7',
    code: 'OBST-CPN7',
    name: 'CPN 7 : Septième Consultation (40 SA)',
    category: 'OBSTETRICAL',
    description: 'Suivi de fin de grossesse.',
    objective: 'Recherche de signes de dépassement de terme à la 40e semaine d\'aménorrhée.',
    scientificReference: 'OMS 2016',
    author: 'Conseil Maternité',
    createdAt: '2026-01-20T08:00:00Z',
    lastUpdated: '2026-01-20T08:00:00Z',
    version: '1.0',
    versionHistory: [],
    status: 'ACTIVE',
    elements: [],
    useCount: 20,
    userServices: ['Maternité'],
    logs: []
  },
  {
    id: 'p_cpn8',
    code: 'OBST-CPN8',
    name: 'CPN 8 : Huitième Consultation (41 SA)',
    category: 'OBSTETRICAL',
    description: 'Consultation finale d\'évaluation de terme.',
    objective: 'Prise de décision d\'induction du travail en cas de terme dépassé cliniquement.',
    scientificReference: 'OMS 2016',
    author: 'Conseil Maternité',
    createdAt: '2026-01-20T08:00:00Z',
    lastUpdated: '2026-01-20T08:00:00Z',
    version: '1.0',
    versionHistory: [],
    status: 'ACTIVE',
    elements: [],
    useCount: 15,
    userServices: ['Maternité'],
    logs: []
  },
  // Parcours complet de grossesse
  {
    id: 'pathway_pregnancy',
    code: 'PATH-PREG-COMP',
    name: 'Suivi complet de grossesse (Parcours)',
    category: 'CARE_PATHWAY',
    description: 'Parcours clinique standard jalonné en 8 grandes étapes (CPN1 à CPN8) structurant tout le suivi de grossesse en maternité hospitalière.',
    objective: 'Suivre pas-à-pas l\'état maternel et fœtal de manière à identifier la prochaine séance de consultation prénatale.',
    scientificReference: 'Directives de Santé Publique Obstétricale, OMS',
    author: 'Conseil Scientifique SmartHosto',
    createdAt: '2026-01-25T09:00:00Z',
    lastUpdated: '2026-01-25T09:00:00Z',
    version: '1.0',
    versionHistory: [{ version: '1.0', date: '2026-01-25', author: 'Dr. Jeanne Martin', changes: 'Modèle premier de référence' }],
    status: 'ACTIVE',
    elements: [],
    clinicalGuidance: 'Parcourir les étapes chronologiquement selon le terme en SA (semaine d\'aménorrhée). Le moteur recalcule dynamiquement le prochain jalon en fonction des CPNs archivées.',
    pathwaySteps: [
      { id: 'step_1', stepNumber: 1, name: 'CPN 1 (T1 - Premier Trimestre)', linkedProtocolId: 'p_cpn1' },
      { id: 'step_2', stepNumber: 2, name: 'CPN 2 (T2 - 20 à 24 SA)', linkedProtocolId: 'p_cpn2' },
      { id: 'step_3', stepNumber: 3, name: 'CPN 3 (T3 - 28 SA)', linkedProtocolId: 'p_cpn3' },
      { id: 'step_4', stepNumber: 4, name: 'CPN 4 (T3 - 32 à 34 SA)', linkedProtocolId: 'p_cpn4' },
      { id: 'step_5', stepNumber: 5, name: 'CPN 5 (T3 - 36 SA)', linkedProtocolId: 'p_cpn5' },
      { id: 'step_6', stepNumber: 6, name: 'CPN 6 (T3 - 38 SA)', linkedProtocolId: 'p_cpn6' },
      { id: 'step_7', stepNumber: 7, name: 'CPN 7 (T3 - 40 SA)', linkedProtocolId: 'p_cpn7' },
      { id: 'step_8', stepNumber: 8, name: 'CPN 8 (T3 - 41 SA - Terme)', linkedProtocolId: 'p_cpn8' }
    ],
    useCount: 154,
    userServices: ['Maternité'],
    lastUsedAt: '2026-06-01T16:00:00Z',
    logs: [
      { user: 'Dr. Jeanne Martin', date: '2026-01-25', time: '09:00', action: 'creation' }
    ]
  }
];
