
import React from 'react';
import { User, Activity, Clock } from 'lucide-react';
import { Patient, PatientStatus } from '../types';

interface PatientCardProps {
  patient: Patient;
  status: PatientStatus;
  onClick?: () => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, status, onClick }) => {
  const getStatusColor = (s: PatientStatus) => {
    switch(s) {
      case PatientStatus.WAITING_ADMISSION: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case PatientStatus.IN_CONSULTATION: return 'bg-blue-100 text-blue-800 border-blue-200';
      case PatientStatus.WAITING_LAB: return 'bg-purple-100 text-purple-800 border-purple-200';
      case PatientStatus.INPATIENT: return 'bg-orange-100 text-orange-800 border-orange-200';
      case PatientStatus.DISCHARGED: return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
            <User size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{patient.lastName.toUpperCase()} {patient.firstName}</h3>
            <p className="text-sm text-slate-500">{new Date().getFullYear() - new Date(patient.birthDate).getFullYear()} ans • {patient.gender}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Activity size={14} className="text-blue-500" />
          <span>TA: 120/80</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Clock size={14} className="text-slate-400" />
          <span>Dernier passage: 12/05</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 text-xs py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 font-medium border border-slate-100 transition-colors">
          Historique
        </button>
        <button className="flex-1 text-xs py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors">
          Ouvrir Dossier
        </button>
      </div>
    </div>
  );
};

export default PatientCard;
