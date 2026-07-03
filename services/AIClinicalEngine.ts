export interface ClinicalData {
  patientId: string;
  context: 'CPN' | 'PARTOGRAM' | 'TREATMENT' | 'LAB_EXAM' | 'GENERAL';
  data: any;
}

export interface AIAnalysisResult {
  summary: string;
  missingElements: { category: string; items: string[] }[];
  clinicalAnalysis: {
    status: 'NORMAL' | 'SLOW' | 'RISK';
    details: string[];
  };
  predictions: {
    title: string;
    description: string;
  }[];
  suggestions: {
    action: string;
    reason: string;
    dataUsed: string;
  }[];
}

export const analyzeClinicalData = (clinicalData: ClinicalData, mode: 'SIMPLE' | 'ADVANCED'): AIAnalysisResult => {
  // Mock AI Engine Logic
  
  let result: AIAnalysisResult = {
    summary: '',
    missingElements: [],
    clinicalAnalysis: { status: 'NORMAL', details: [] },
    predictions: [],
    suggestions: []
  };

  if (clinicalData.context === 'CPN') {
    result.summary = 'Grossesse 28 SA, suivi incomplet. Patiente éligible pour IPTp.';
    result.missingElements = [
      { category: 'Examens', items: ['Dépistage HBsAg manquant', 'Bandelette urinaire non réalisée'] },
      { category: 'Prévention', items: ['Dose 2 IPTp-SP en retard'] }
    ];
    result.clinicalAnalysis = {
      status: 'RISK',
      details: ['Suspicion d\'anémie légère', 'Surveillance tensionnelle recommandée']
    };
    result.predictions = [
      { title: 'Consultations restantes', description: '4 consultations recommandées avant terme.' },
      { title: 'Risque d\'évolution', description: 'Risque modéré de pré-éclampsie si TA non contrôlée.' }
    ];
    result.suggestions = [
      { action: 'Compléter les examens', reason: 'Bilan de base incomplet', dataUsed: 'Absence de résultat HBsAg dans le dossier' },
      { action: 'Surveiller TA', reason: 'Antécédent de TA limite à la dernière CPN', dataUsed: 'TA: 135/85 mmHg le 15/10' }
    ];
  } else if (clinicalData.context === 'PARTOGRAM') {
    result.summary = 'Phase active du travail, dilatation à 6cm. Progression lente depuis 2h. BCF normal.';
    result.missingElements = [
      { category: 'Surveillance', items: ['TV non fait depuis 3h', 'Température maternelle manquante'] }
    ];
    result.clinicalAnalysis = {
      status: 'SLOW',
      details: ['Progression de la dilatation < 1cm/h', 'Contractions régulières mais de faible intensité']
    };
    result.predictions = [
      { title: 'Projection dilatation', description: 'Franchissement de la ligne d\'alerte estimé dans 1h si la dynamique reste inchangée.' },
      { title: 'Ligne d\'action', description: 'Risque d\'atteindre la ligne d\'action dans 3h.' }
    ];
    result.suggestions = [
      { action: 'Réévaluer la dynamique utérine', reason: 'Progression lente malgré des contractions régulières', dataUsed: 'Dilatation stagnante à 6cm, contractions 3/10min' },
      { action: 'Recontrôler BCF', reason: 'Surveillance standard en phase active', dataUsed: 'Dernier BCF il y a 45 min' }
    ];
  } else if (clinicalData.context === 'TREATMENT') {
    const { prescriptions, tasks } = clinicalData.data || {};
    
    let lateTasks = 0;
    let totalTasks = 0;
    let missedTasks = 0;
    
    if (tasks && Array.isArray(tasks)) {
      totalTasks = tasks.length;
      lateTasks = tasks.filter(t => t.status === 'LATE').length;
      missedTasks = tasks.filter(t => t.status === 'MISSED').length;
    }

    const hasAnomalies = lateTasks > 0 || missedTasks > 0;

    result.summary = hasAnomalies 
      ? `Analyse des traitements en cours : ${lateTasks} retard(s) et ${missedTasks} oubli(s) détectés sur ${totalTasks} tâches planifiées.`
      : `Traitement en cours. Bonne observance globale sur les ${totalTasks} tâches planifiées.`;

    result.missingElements = [];
    if (hasAnomalies) {
      result.missingElements.push({ 
        category: 'Administration', 
        items: [`${lateTasks} prise(s) en retard`, `${missedTasks} prise(s) manquée(s)`].filter(s => !s.startsWith('0')) 
      });
    }
    result.missingElements.push({ category: 'Surveillance', items: ['Évaluation de la température post-administration manquante'] });

    result.clinicalAnalysis = {
      status: hasAnomalies ? 'RISK' : 'NORMAL',
      details: hasAnomalies 
        ? ['Observance thérapeutique sous-optimale', 'Risque de diminution de l\'efficacité du traitement']
        : ['Pas d\'effets secondaires signalés', 'Paramètres vitaux stables']
    };

    result.predictions = [
      { 
        title: 'Évolution sous traitement', 
        description: hasAnomalies 
          ? 'Risque d\'échec thérapeutique ou de résistance si les retards persistent.' 
          : 'Apyrexie attendue dans les prochaines 24h.' 
      },
      { 
        title: 'Efficacité', 
        description: hasAnomalies 
          ? 'Efficacité compromise par les retards d\'administration.'
          : 'Probabilité élevée de résolution de l\'infection si observance maintenue.' 
      }
    ];

    result.suggestions = [
      { 
        action: hasAnomalies ? 'Rattraper les doses en retard si possible' : 'Maintenir le schéma thérapeutique actuel', 
        reason: hasAnomalies ? 'Garantir la concentration plasmatique efficace' : 'Bonne tolérance et observance', 
        dataUsed: hasAnomalies ? `${lateTasks} retards constatés dans le planificateur` : 'Aucun retard signalé' 
      },
      { 
        action: 'Surveiller température', 
        reason: 'Évaluer l\'efficacité du traitement', 
        dataUsed: 'Prescription en cours pour syndrome infectieux' 
      }
    ];
  } else if (clinicalData.context === 'LAB_EXAM') {
    const { exams, clinicalContext } = clinicalData.data || {};
    const examNames = exams?.map((e: any) => e.name).join(', ') || 'Aucun examen';
    
    result.summary = `Analyse de la prescription : ${examNames}. Contexte : ${clinicalContext?.indication || 'Non précisé'}.`;
    
    result.missingElements = [];
    if (!clinicalContext?.suspectedDiagnosis) {
      result.missingElements.push({ category: 'Contexte', items: ['Diagnostic de présomption manquant'] });
    }
    
    // Simple mock logic for missing exams based on indication
    const indication = (clinicalContext?.indication || '').toLowerCase();
    if (indication.includes('fièvre') && !examNames.toLowerCase().includes('goutte épaisse')) {
      result.missingElements.push({ category: 'Examens suggérés', items: ['Goutte Épaisse / Frottis Sanguin (recherche paludisme)'] });
    }
    if (indication.includes('grossesse') && !examNames.toLowerCase().includes('groupe sanguin')) {
      result.missingElements.push({ category: 'Examens suggérés', items: ['Groupe Sanguin / Rhésus'] });
    }

    result.clinicalAnalysis = {
      status: result.missingElements.length > 0 ? 'RISK' : 'NORMAL',
      details: result.missingElements.length > 0 
        ? ['Prescription potentiellement incomplète par rapport au contexte clinique']
        : ['Prescription cohérente avec l\'indication']
    };

    result.predictions = [
      { title: 'Délai d\'obtention', description: 'Résultats attendus sous 2h à 4h selon la charge du laboratoire.' }
    ];

    result.suggestions = [
      { action: 'Vérifier les antécédents', reason: 'Éviter la redondance des examens', dataUsed: 'Historique patient' }
    ];
    
    if (result.missingElements.some(m => m.category === 'Examens suggérés')) {
      result.suggestions.unshift({
        action: 'Ajouter les examens suggérés',
        reason: 'Compléter le bilan étiologique',
        dataUsed: `Indication: ${clinicalContext?.indication}`
      });
    }
  } else if (clinicalData.context === 'GENERAL') {
    result.summary = 'Consultation générale en cours. Analyse des antécédents et des constantes vitales.';
    result.missingElements = [
      { category: 'Données de base', items: ['Poids non renseigné', 'Taille non renseignée'] }
    ];
    result.clinicalAnalysis = {
      status: 'NORMAL',
      details: ['Paramètres vitaux dans les normes', 'Pas d\'alerte immédiate détectée']
    };
    result.predictions = [
      { title: 'Évolution', description: 'Pronostic favorable sous réserve des résultats d\'examens.' }
    ];
    result.suggestions = [
      { action: 'Compléter le dossier physique', reason: 'Données anthropométriques manquantes', dataUsed: 'Vitals: BP 120/80, HR 72' }
    ];
  }

  // Filter based on mode
  if (mode === 'SIMPLE') {
    result.predictions = [];
    result.clinicalAnalysis.details = [result.clinicalAnalysis.details[0]]; // Keep only the first detail
    result.suggestions = result.suggestions.slice(0, 1); // Keep only the first suggestion
  }

  return result;
};
