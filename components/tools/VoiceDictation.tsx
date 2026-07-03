import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Check, X, Wand2, Edit3, Trash2 } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';

interface VoiceDictationProps {
  section: 'motif' | 'hma' | 'examen' | 'conclusion' | 'note';
  onAnalysisComplete: (data: any) => void;
  currentValue?: string;
}

export const VoiceDictation: React.FC<VoiceDictationProps> = ({ section, onAnalysisComplete, currentValue }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(audioBlob));
        processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setShowResult(false);
    } catch (err) {
      console.error("Erreur micro:", err);
      alert("Impossible d'accéder au microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const sectionPrompts = {
          motif: "Extrais les symptômes principaux et la durée mentionnés.",
          hma: "Analyse l'histoire de la maladie : chronologie, mode d'installation, symptômes associés, traitements déjà pris, évolution.",
          examen: "Extrais les signes physiques : constantes (pouls, TA, Temp), signes de foyer, auscultation, palpation.",
          conclusion: "Analyse le raisonnement clinique, le diagnostic probable et le plan de prise en charge.",
          note: "Retranscris fidèlement les notes médicales dictées."
        };

        const responseSchema = {
          type: Type.OBJECT,
          properties: {
            transcript: { type: Type.STRING, description: "Transcription textuelle complète et fidèle de l'audio." },
            structuredData: { 
              type: Type.OBJECT, 
              description: "Données extraites de manière structurée selon la section.",
              properties: section === 'motif' ? {
                symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
                duration: { type: Type.STRING },
                unit: { type: Type.STRING, enum: ['heures', 'jours', 'semaines', 'mois'] }
              } : section === 'hma' ? {
                symptoms: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT, 
                    properties: {
                      name: { type: Type.STRING },
                      installation: { type: Type.STRING, enum: ['brutale', 'progressive'] },
                      characteristics: { type: Type.OBJECT },
                      conduiteType: { type: Type.STRING },
                      conduiteDetails: { type: Type.OBJECT },
                      evolution: { type: Type.STRING }
                    } 
                  } 
                }
              } : section === 'examen' ? {
                vitals: {
                  type: Type.OBJECT,
                  properties: {
                    temp: { type: Type.NUMBER },
                    pouls: { type: Type.NUMBER },
                    ta: { type: Type.STRING },
                    freqResp: { type: Type.NUMBER },
                    spo2: { type: Type.NUMBER }
                  }
                },
                clinicalSigns: { type: Type.ARRAY, items: { type: Type.STRING } }
              } : section === 'note' ? {
                content: { type: Type.STRING }
              } : {
                diagnosis: { type: Type.STRING },
                plan: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          required: ["transcript", "structuredData"]
        };

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: {
            parts: [
              { inlineData: { data: base64Audio, mimeType: "audio/webm" } },
              { text: `Tu es un assistant médical. Transcris l'audio et structure les informations pour la section "${section}". ${sectionPrompts[section]} Réponds en JSON.` }
            ]
          },
          config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema as any
          }
        });

        const result = JSON.parse(response.text);
        setTranscript(result.transcript);
        setAnalysis(result.structuredData);
        setShowResult(true);
      };
    } catch (err) {
      console.error("Analyse IA échouée:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const [analysis, setAnalysis] = useState<any>(null);
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);

  const handleApply = () => {
    onAnalysisComplete(analysis);
    setShowResult(false);
    setTranscript('');
    setAnalysis(null);
    setAudioUrl(null);
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    setShowResult(false);
    setTranscript('');
    setAnalysis(null);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-blue-200"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Mic size={18} />}
            <span className="text-sm font-bold">Dictée vocale</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all shadow-md shadow-rose-200"
          >
            <div className="flex gap-1 items-center h-4">
              {[1, 2, 3, 4].map(i => (
                <motion.div 
                  key={i}
                  animate={{ height: [4, 16, 4] }}
                  transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                  className="w-1 bg-white rounded-full"
                />
              ))}
            </div>
            <span className="text-sm font-bold">Arrêter ({Math.floor(chunksRef.current.length / 10)}s)</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-12 mt-2 w-[400px] bg-white border border-slate-200 rounded-3xl shadow-2xl z-[100] overflow-hidden"
          >
            <div className="p-5 bg-gradient-to-br from-slate-50 to-white">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Wand2 size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Transcription IA</h4>
                    <p className="text-[10px] font-bold text-slate-400">SECTION: {section.toUpperCase()}</p>
                  </div>
                </div>
                <button onClick={() => setShowResult(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                  <X size={18} />
                </button>
              </div>

              {audioUrl && (
                <div className="mb-4 p-3 bg-slate-100/50 rounded-2xl flex items-center gap-3">
                  <audio src={audioUrl} controls className="h-8 flex-1" />
                  <button onClick={deleteRecording} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              <div className="mb-4 group relative">
                <div className="flex justify-between items-end mb-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Transcript (Éditable)</label>
                  <button 
                    onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                    className="text-[10px] font-bold text-blue-600 hover:underline"
                  >
                    {isEditingTranscript ? 'Valider' : 'Modifier'}
                  </button>
                </div>
                {isEditingTranscript ? (
                  <textarea 
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    className="w-full p-4 text-sm text-slate-700 bg-white border-2 border-blue-100 rounded-2xl focus:border-blue-500 outline-none min-h-[100px] shadow-inner"
                  />
                ) : (
                  <p className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-2xl border border-slate-100 shadow-sm min-h-[60px]">
                    "{transcript}"
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                  <h5 className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Check size={12} /> Données extraites
                  </h5>
                  
                  <div className="flex flex-wrap gap-2">
                    {section === 'motif' && (
                      <>
                        {analysis?.symptoms?.map((s: string, idx: number) => (
                          <span key={idx} className="px-3 py-1.5 bg-white text-blue-700 text-xs font-bold rounded-xl border border-blue-200 shadow-sm">
                            {s}
                          </span>
                        ))}
                        {analysis?.duration && (
                          <span className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md">
                            🕒 {analysis.duration} {analysis.unit}
                          </span>
                        )}
                      </>
                    )}

                    {section === 'examen' && (
                      <div className="grid grid-cols-2 gap-2 w-full">
                        {analysis?.vitals && Object.entries(analysis.vitals).map(([k, v]) => (
                          v && <div key={k} className="px-3 py-2 bg-white rounded-xl border border-slate-100 text-xs font-bold text-slate-600 flex justify-between">
                            <span className="uppercase text-[9px] text-slate-400">{k}</span>
                            <span className="text-blue-700">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {section === 'conclusion' && (
                      <div className="space-y-2 w-full">
                        {analysis?.diagnosis && (
                          <div className="p-3 bg-white rounded-xl border border-blue-200 shadow-sm">
                            <div className="text-[9px] font-black text-blue-400 uppercase mb-1">Diag. Principal</div>
                            <div className="text-xs font-bold text-blue-900">{analysis.diagnosis}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleApply}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-95 transition-all"
                  >
                    Valider et structurer
                  </button>
                  <button
                    onClick={() => setShowResult(false)}
                    className="px-5 py-3 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all font-mono"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
