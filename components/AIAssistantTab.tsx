import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, Info, Clock, Activity, ListChecks, BrainCircuit, ArrowRight, CheckCircle2 } from 'lucide-react';
import { analyzeClinicalData, ClinicalData, AIAnalysisResult } from '../services/AIClinicalEngine';

interface AIAssistantTabProps {
  context?: 'CPN' | 'PARTOGRAM' | 'TREATMENT' | 'LAB_EXAM' | 'GENERAL';
  patientId?: string;
  data?: any;
  mode?: 'SIMPLE' | 'ADVANCED';
  patient?: any;
  user?: any;
}

const AIAssistantTab: React.FC<AIAssistantTabProps> = ({ 
  context = 'GENERAL', 
  patientId, 
  data, 
  mode = 'SIMPLE',
  patient,
  user
}: AIAssistantTabProps) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulate API call to AI Engine
    setTimeout(() => {
      const result = analyzeClinicalData({ 
        patientId: patientId || patient?.id || 'unknown', 
        context: context as any, 
        data: data || patient?.vitals || {} 
      }, mode);
      setAnalysis(result);
      setLoading(false);
    }, 800);
  }, [context, patientId, data, mode, patient]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Analyse clinique en cours...</p>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex items-center gap-4">
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          <BrainCircuit size={32} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Assistant IA</h2>
          <p className="text-indigo-100">Agent obstétrical intelligent - Analyse en temps réel</p>
        </div>
        <div className="ml-auto bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20">
          <span className="text-sm font-medium">Mode: {mode === 'ADVANCED' ? 'Avancé' : 'Simple'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Summary & Missing Elements */}
        <div className="space-y-6 lg:col-span-1">
          {/* Bloc 1 — Résumé intelligent */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <Activity size={20} className="text-indigo-600" />
              <h3 className="font-bold text-slate-800">Résumé Intelligent</h3>
            </div>
            <div className="p-5">
              <p className="text-slate-700 leading-relaxed">{analysis.summary}</p>
            </div>
          </div>

          {/* Bloc 2 — Éléments manquants */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
              <ListChecks size={20} className="text-amber-600" />
              <h3 className="font-bold text-slate-800">Éléments Manquants</h3>
            </div>
            <div className="p-5 space-y-4">
              {analysis.missingElements.length > 0 ? (
                analysis.missingElements.map((group, idx) => (
                  <div key={idx}>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">{group.category}</h4>
                    <ul className="space-y-2">
                      {group.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 italic">Aucun élément manquant détecté.</p>
              )}
            </div>
          </div>
        </div>

        {/* Middle Column: Analysis & Predictions */}
        <div className="space-y-6 lg:col-span-1">
          {/* Bloc 3 — Analyse clinique */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
              <Activity size={20} className="text-blue-600" />
              <h3 className="font-bold text-slate-800">Analyse Clinique</h3>
            </div>
            <div className="p-5">
              <div className="mb-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                  analysis.clinicalAnalysis.status === 'NORMAL' ? 'bg-emerald-100 text-emerald-700' :
                  analysis.clinicalAnalysis.status === 'SLOW' ? 'bg-amber-100 text-amber-700' :
                  'bg-rose-100 text-rose-700'
                }`}>
                  {analysis.clinicalAnalysis.status === 'NORMAL' && <CheckCircle2 size={16} />}
                  {analysis.clinicalAnalysis.status === 'SLOW' && <Clock size={16} />}
                  {analysis.clinicalAnalysis.status === 'RISK' && <AlertTriangle size={16} />}
                  {analysis.clinicalAnalysis.status === 'NORMAL' ? 'Évolution Normale' :
                   analysis.clinicalAnalysis.status === 'SLOW' ? 'Progression Lente' : 'Risque Détecté'}
                </span>
              </div>
              <ul className="space-y-3">
                {analysis.clinicalAnalysis.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl text-sm text-slate-700">
                    <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-400 mt-4 italic flex items-center gap-1">
                <AlertTriangle size={12} />
                Ceci n'est pas un diagnostic automatique.
              </p>
            </div>
          </div>

          {/* Bloc 4 — Prédiction (centralisée) - Only in ADVANCED mode */}
          {mode === 'ADVANCED' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-purple-50 border-b border-purple-100 flex items-center gap-2">
                <Sparkles size={20} className="text-purple-600" />
                <h3 className="font-bold text-slate-800">Prédictions</h3>
              </div>
              <div className="p-5 space-y-4">
                {analysis.predictions.length > 0 ? (
                  analysis.predictions.map((pred, idx) => (
                    <div key={idx} className="p-3 border border-purple-100 bg-purple-50/50 rounded-xl">
                      <h4 className="text-sm font-bold text-purple-900 mb-1">{pred.title}</h4>
                      <p className="text-sm text-purple-700">{pred.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic">Aucune prédiction disponible.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Suggestions & Explanations */}
        <div className="space-y-6 lg:col-span-1">
          {/* Bloc 5 & 6 — Suggestions et Explications */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full">
            <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2">
              <Sparkles size={20} className="text-emerald-600" />
              <h3 className="font-bold text-slate-800">Suggestions Cliniques</h3>
            </div>
            <div className="p-5 space-y-4">
              {analysis.suggestions.length > 0 ? (
                analysis.suggestions.map((sugg, idx) => (
                  <div key={idx} className="p-4 border border-emerald-100 bg-white rounded-xl shadow-sm relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400"></div>
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowRight size={16} className="text-emerald-600" />
                      <h4 className="font-bold text-slate-800">{sugg.action}</h4>
                    </div>
                    
                    {/* Explication */}
                    <div className="mt-3 space-y-2">
                      <div className="bg-slate-50 p-2.5 rounded-lg text-sm">
                        <span className="font-semibold text-slate-600 block mb-1 text-xs uppercase">Raison :</span>
                        <span className="text-slate-700">{sugg.reason}</span>
                      </div>
                      <div className="bg-indigo-50 p-2.5 rounded-lg text-sm">
                        <span className="font-semibold text-indigo-600 block mb-1 text-xs uppercase">Basé sur :</span>
                        <span className="text-indigo-800 font-medium">{sugg.dataUsed}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 italic">Aucune suggestion pour le moment.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantTab;
