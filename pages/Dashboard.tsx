
import React from 'react';
import { 
  TrendingUp, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  ArrowUpRight, 
  Activity,
  CreditCard,
  BedDouble
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const data = [
  { name: 'Lun', patients: 40, rev: 4000 },
  { name: 'Mar', patients: 30, rev: 3000 },
  { name: 'Mer', patients: 20, rev: 2000 },
  { name: 'Jeu', patients: 27, rev: 2780 },
  { name: 'Ven', patients: 18, rev: 1890 },
  { name: 'Sam', patients: 23, rev: 2390 },
  { name: 'Dim', patients: 34, rev: 3490 },
];

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        <Icon size={24} />
      </div>
      <span className="flex items-center gap-1 text-xs font-bold text-green-500">
        <ArrowUpRight size={14} /> {change}
      </span>
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-black text-slate-900">{value}</p>
  </div>
);

const Dashboard = () => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tableau de Bord</h1>
          <p className="text-slate-500">Aperçu en temps réel de l'activité clinique et financière.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white border border-slate-200 p-2 rounded-2xl flex gap-1">
            <button className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg">Jour</button>
            <button className="px-4 py-1.5 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-bold">Semaine</button>
            <button className="px-4 py-1.5 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-bold">Mois</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Patients du jour" value="42" change="+12%" icon={Users} color="bg-blue-500" />
        <StatCard title="Urgences" value="05" change="+5%" icon={AlertCircle} color="bg-red-500" />
        <StatCard title="Taux d'occupation" value="78%" change="+2%" icon={BedDouble} color="bg-indigo-500" />
        <StatCard title="Recettes (CFA)" value="850k" change="+18%" icon={CreditCard} color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-bold text-slate-900">Fréquentation & Revenus</h2>
            <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
              <span className="flex items-center gap-2 text-blue-500"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Patients</span>
              <span className="flex items-center gap-2 text-indigo-500"><div className="w-3 h-3 bg-indigo-500 rounded-sm"></div> Revenus</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="patients" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Activités Récentes</h2>
            <div className="space-y-4">
              {[
                { time: '09:30', user: 'Dr. Sarr', action: 'Consultation terminée', patient: 'A. Diop' },
                { time: '09:45', user: 'Inf. Marie', action: 'Admin. Médicament', patient: 'C. Traoré' },
                { time: '10:00', user: 'Labo', action: 'Résultats validés', patient: 'Y. Koulibaly' },
                { time: '10:15', user: 'Caisse', action: 'Paiement reçu', patient: 'M. Sylla' },
              ].map((act, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-[10px]">
                    {act.time}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{act.action}</p>
                    <p className="text-xs text-slate-500">{act.user} • {act.patient}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 text-sm font-bold text-blue-600 border border-blue-50 rounded-xl hover:bg-blue-50 transition-colors">
              Voir tout le journal
            </button>
          </div>

          <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-xl shadow-blue-200">
            <div className="flex justify-between items-start mb-6">
              <Activity size={24} />
              <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold">LIVE</span>
            </div>
            <p className="text-blue-100 text-sm mb-1">Stock de Pharmacie</p>
            <h4 className="text-xl font-black mb-4">5 Médicaments en rupture</h4>
            <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mb-4">
              <div className="bg-white h-full w-[40%]"></div>
            </div>
            <button className="w-full bg-white text-blue-700 py-2 rounded-xl text-xs font-black">Gérer le stock</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
