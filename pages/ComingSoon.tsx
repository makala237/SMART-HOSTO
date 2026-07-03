
import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';

interface ComingSoonProps {
  moduleName: string;
  onBack: () => void;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ moduleName, onBack }) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-8 animate-bounce">
        <Construction size={48} />
      </div>
      
      <h1 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tight">
        Module {moduleName}
      </h1>
      
      <p className="text-xl text-slate-500 max-w-md mb-10 font-medium">
        Module en cours de développement – Bientôt disponible pour optimiser votre gestion hospitalière.
      </p>
      
      <button 
        onClick={onBack}
        className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10"
      >
        <ArrowLeft size={20} />
        Retour au Dashboard
      </button>
    </div>
  );
};

export default ComingSoon;
