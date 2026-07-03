
import React, { useState } from 'react';
import { Lock, User, ShieldCheck, Activity, ChevronRight, AlertCircle } from 'lucide-react';
import { Role, User as UserType } from '../types';
import { auth } from '../src/firebase';
import { signInAnonymously } from 'firebase/auth';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Simulation d'une base de données d'utilisateurs avec données RH
  const mockUsers: Record<string, any> = {
    'admin': { name: 'Admin Système', role: Role.ADMIN, profession: 'Ingénieur SIH', salary: 'N/A', schedule: '24/7', quotePartRate: '0%' },
    'accueil': { name: 'Moussa Diop', role: Role.RECEPTION, profession: 'Agent d\'accueil', salary: '250,000 CFA', schedule: 'Lun-Ven (08h-17h)', quotePartRate: '1%' },
    'medecin': { name: 'Dr. Sarr Ousmane', role: Role.DOCTOR, profession: 'Médecin Gynécologue', salary: '850,000 CFA', schedule: 'Gardes rotatives', quotePartRate: '20%' },
    'infirmier': { name: 'Marie Gomis', role: Role.NURSE, profession: 'Infirmière d\'État', salary: '350,000 CFA', schedule: '3x8h', quotePartRate: '2%' },
    'labo': { name: 'Ibrahim Keita', role: Role.LAB, profession: 'Biologiste', salary: '450,000 CFA', schedule: 'Lun-Sam (08h-16h)', quotePartRate: '5%' },
    'maternite': { name: 'Fatou Cissé', role: Role.MATERNITY, profession: 'Sage-femme', salary: '400,000 CFA', schedule: 'Gardes', quotePartRate: '10%' },
    'pharmacie': { name: 'Jean Mendy', role: Role.PHARMACY, profession: 'Pharmacien', salary: '600,000 CFA', schedule: 'Lun-Sam', quotePartRate: '0%' },
    'caisse': { name: 'Awa Ndiaye', role: Role.CASHIER, profession: 'Caissière Centrale', salary: '280,000 CFA', schedule: 'Lun-Ven', quotePartRate: '0%' },
    'gestion': { name: 'Abdou Layre', role: Role.ACCOUNTANT, profession: 'Gestionnaire de Stock', salary: '500,000 CFA', schedule: 'Lun-Ven', quotePartRate: '0%' },
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulation d'un délai réseau
    setTimeout(async () => {
      try {
        // Sign in anonymously to Firebase to satisfy security rules
        await signInAnonymously(auth);
        
        // NOTE: Dans un MVP, nous utilisons le localStorage.
        // TODO: Pour la production, implémenter un hash sécurisé (bcrypt/Argon2) côté serveur.
        const savedUsers = localStorage.getItem('hospital_users');
        const users: UserType[] = savedUsers ? JSON.parse(savedUsers) : [
          { id: '1', username: 'admin', email: 'admin@smarthosto.com', name: 'Administrateur', role: Role.ADMIN, roles: ['role_admin'], status: 'ACTIVE', profession: 'Admin SYSTEM', token: 'fake', lastLogin: new Date().toISOString() }
        ];

        // Fallback to hardcoded superadmin / admin
        let user: UserType | undefined;
        
        if (username.toLowerCase() === 'superadmin') {
          user = {
            id: 'super_admin_id',
            username: 'superadmin',
            email: 'publisher@smarthosto.com',
            name: 'Éditeur SmartHosto',
            role: Role.SUPER_ADMIN,
            roles: ['role_super_admin', 'role_admin'],
            status: 'ACTIVE',
            profession: 'Super Administrateur SaaS',
            token: 'super_fake',
            lastLogin: new Date().toISOString()
          };
        } else {
          user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && (u.password === password || (username.toLowerCase() === 'admin' && password === 'admin123')));
        }

        if (user) {
          if (user.status === 'BLOCKED' || user.status === 'INACTIVE') {
            setError('Ce compte est désactivé ou bloqué.');
            setLoading(false);
            return;
          }

          const authenticatedUser = { ...user, lastLogin: new Date().toISOString() };
          
          if (username.toLowerCase() !== 'superadmin') {
            // Update last login in users list
            const updatedUsers = users.map(u => u.id === authenticatedUser.id ? authenticatedUser : u);
            localStorage.setItem('hospital_users', JSON.stringify(updatedUsers));
          }

          // Persistance de la session
          localStorage.setItem('hospital_session', JSON.stringify(authenticatedUser));
          onLogin(authenticatedUser);
        } else {
          setError('Identifiants incorrects.');
        }
      } catch (err) {
        console.error('Firebase Auth Error:', err);
        setError('Erreur de connexion au serveur de sécurité.');
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden text-slate-900">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-white/20 relative z-10">
          <div className="p-10">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-600/40 rotate-12 hover:rotate-0 transition-transform duration-500">
                <Activity size={40} className="text-white -rotate-12 group-hover:rotate-0" />
              </div>
            </div>

            <div className="text-center mb-10">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">SmartHosto</h1>
              <p className="text-slate-500 font-medium mt-2">Accès Professionnel Sécurisé</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Identifiant métier"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium"
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium"
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-2xl text-xs font-bold border border-red-100">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-slate-900/20 hover:bg-blue-600 hover:shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Connexion
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-8 space-y-2">
          <button 
            type="button"
            onClick={() => { setUsername('superadmin'); setPassword('admin123'); }}
            className="w-full bg-rose-600/20 text-rose-300 border border-rose-500/30 text-xs font-black uppercase tracking-widest py-3 rounded-2xl hover:bg-rose-600/30 transition-all flex items-center justify-center gap-2"
          >
            👑 SmartHosto Control Center (SaaS Admin)
          </button>
          
          <div className="grid grid-cols-3 gap-2 opacity-60 hover:opacity-100 transition-opacity">
            {['admin', 'medecin', 'accueil', 'pharmacie', 'caisse', 'gestion'].map(r => (
              <button 
                type="button"
                key={r}
                onClick={() => { setUsername(r); setPassword('admin123'); }}
                className="text-[9px] font-bold text-white bg-white/5 border border-white/10 py-2.5 rounded-xl hover:bg-white/10"
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
