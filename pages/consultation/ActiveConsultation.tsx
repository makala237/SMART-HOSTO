
import React, { useState } from 'react';
import { Save, FileText, Send, Hospital, CreditCard, Mic, MicOff, Check } from 'lucide-react';
import IntelligentConsultation from '../tools/IntelligentConsultation';

interface ActiveConsultationProps {
  activePatient: any;
  user: any;
  paymentRequests: any[];
  setPaymentRequests: React.Dispatch<React.SetStateAction<any[]>>;
  onSave: (data: any) => void;
  onCloturer: (data: any) => void;
  onGenerateObservation: () => void;
  onSendPrescription: (data: any) => void;
  onSendExams: (data: any) => void;
  onHospitalize: () => void;
  onClose: () => void;
}

const ActiveConsultation: React.FC<ActiveConsultationProps> = ({ 
  activePatient, 
  user, 
  paymentRequests,
  setPaymentRequests,
  onSave, 
  onCloturer,
  onGenerateObservation, 
  onSendPrescription, 
  onSendExams, 
  onHospitalize,
  onClose
}) => {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-6 duration-700">
      {/* Main Workspace Area */}
      <div className={`flex-1 rounded-[48px] border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/50 flex flex-col bg-white relative`}>
        {/* Voice Input Floating Button */}
        <button 
          onClick={() => setIsRecording(!isRecording)}
          className={`absolute bottom-10 right-10 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all z-50 group ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-900 text-white hover:bg-blue-600'}`}
        >
          {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
          <span className="absolute -top-12 right-0 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {isRecording ? 'Arrêter l\'écoute' : 'Dictée vocale intelligente'}
          </span>
        </button>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="animate-in fade-in duration-500">
            <IntelligentConsultation 
              patient={activePatient} 
              user={user} 
              onSave={onSave}
              onCloturer={onCloturer}
              onSendPrescription={onSendPrescription}
              onSendExams={onSendExams}
              onClose={onClose}
              paymentRequests={paymentRequests}
              setPaymentRequests={setPaymentRequests}
            />
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-slate-50 border-t border-slate-100 p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onSave}
              className="bg-white border border-slate-200 text-slate-900 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-2 shadow-sm"
            >
              <Save size={16} /> Enregistrer Brouillon
            </button>
            <button 
              onClick={onGenerateObservation}
              className="bg-white border border-slate-200 text-slate-900 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-2 shadow-sm"
            >
              <FileText size={16} /> Générer Observation
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={onHospitalize}
              className="bg-amber-50 text-amber-600 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-100 transition-all flex items-center gap-1.5 border border-amber-100"
            >
              <Hospital size={16} /> Hospitaliser
            </button>
            <button 
              onClick={onSendExams}
              className="bg-purple-600 text-white px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-700 transition-all flex items-center gap-1.5 shadow-xl shadow-purple-600/20"
            >
              <Send size={16} /> Envoyer Examens
            </button>
            <button 
              onClick={onSendPrescription}
              className="bg-emerald-600 text-white px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-xl shadow-emerald-600/20"
            >
              <CreditCard size={16} /> Transmettre Ordo
            </button>
            <button 
              onClick={onCloturer}
              className="bg-rose-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center gap-1.5 shadow-xl shadow-rose-600/20"
            >
              <Check size={16} /> Clôturer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveConsultation;
