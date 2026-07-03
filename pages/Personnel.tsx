
import React from 'react';
import { Users, Shield, Award, Clock, TrendingUp, Settings, ChevronRight } from 'lucide-react';

const Personnel = () => {
  const staff = [
    { name: 'Dr. Sarr Ousmane', role: 'Médecin Chef', specialty: 'Gynécologie', actions: 124, fees: '185,000', rate: '20%' },
    { name: 'Dr. Keita Ibrahim', role: 'Médecin', specialty: 'Pédiatrie', actions: 89, fees: '95,000', rate: '15%' },
    { name: 'Inf. Marie Gomis', role: 'Infirmière', specialty: 'Maternité', actions: 245, fees: '25,000', rate: '2%' },
    { name: 'Mme Cissé Fatou', role: 'Caissière', specialty: 'Finances', actions: 567, fees: '0', rate: '0%' },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestion du Personnel</h1>
          <p className="text-slate-500">Profils, droits d'accès et suivi de performance (Quote-parts).</p>
        </div>
        <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2">
          <Users size={20} />
          Ajouter Collaborateur
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
                <h2 className="font-bold flex items-center gap-2"><Shield size={18} className="text-blue-500" /> Annuaire & Rôles</h2>
                <span className="text-xs font-bold text-slate-400">12 Employés actifs</span>
             </div>
             <div className="divide-y divide-slate-100">
                {staff.map((s, i) => (
                  <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-full overflow-hidden border-2 border-white shadow-sm">
                        <img src={`https://picsum.photos/60/60?random=${i+20}`} alt={s.name} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{s.name}</h3>
                        <p className="text-xs text-slate-500">{s.role} • <span className="text-blue-500 font-medium">{s.specialty}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Actes</p>
                        <p className="font-bold text-slate-900">{s.actions}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Quote-part ({s.rate})</p>
                        <p className="font-black text-emerald-600">{s.fees} CFA</p>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500" />
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-200">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Award size={20} />
              Règle de Commissioning
            </h3>
            <p className="text-sm text-blue-100 mb-6 leading-relaxed">
              Le système calcule automatiquement les quote-parts sur chaque acte encaissé. Les taux sont définis par profil métier.
            </p>
            <div className="space-y-3">
              {[
                { label: 'Consultations', rate: '20%' },
                { label: 'Chirurgies', rate: '35%' },
                { label: 'Laboratoire', rate: '5%' },
              ].map((r, i) => (
                <div key={i} className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/10 text-xs font-bold">
                  <span>{r.label}</span>
                  <span className="bg-white text-blue-700 px-2 py-0.5 rounded-lg">{r.rate}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-colors">
              Modifier Paramètres Globaux
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-slate-400" />
              Derniers Accès
            </h4>
            <div className="space-y-4">
              {[
                { user: 'Dr. Sarr', time: 'Il y a 2 min', action: 'Consultation MAT-88' },
                { user: 'Fatou (Caisse)', time: 'Il y a 15 min', action: 'Encaissement Facture #1240' },
              ].map((log, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1"></div>
                  <div>
                    <p className="font-bold text-slate-900">{log.user}</p>
                    <p className="text-slate-500">{log.action}</p>
                    <p className="text-[10px] text-slate-400 italic mt-1">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Personnel;
