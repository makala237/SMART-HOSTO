import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, ChevronRight, Plus, Filter, Search, Edit2, X, Check, Trash2, Calendar } from 'lucide-react';
import { db } from '../../src/firebase';
import { collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

interface AppointmentsProps {
  user?: {
    id?: string;
    name?: string;
    role?: string;
    email?: string;
  };
  initialPatient?: any;
}

const Appointments: React.FC<AppointmentsProps> = ({ user, initialPatient }) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    patient: '',
    age: '',
    gender: 'M',
    reason: '',
    doctor: user?.name || 'Dr. Sarr',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    status: 'PENDING'
  });

  useEffect(() => {
    if (initialPatient) {
      setFormData({
        patient: `${initialPatient.lastName || ''} ${initialPatient.firstName || ''}`.trim(),
        age: initialPatient.age ? String(initialPatient.age) : '',
        gender: initialPatient.gender || 'M',
        reason: 'Consultation de suivi',
        doctor: user?.name || 'Dr. Sarr',
        date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
        time: '10:00',
        status: 'PENDING'
      });
      setShowAddModal(true);
    }
  }, [initialPatient, user]);

  const staticFallback = [
    { id: 'RDV-101', date: '2026-04-03', time: '09:00', patient: 'Amadou DIOP', age: 39, gender: 'M', reason: 'Suivi Diabète', status: 'CONFIRMED', doctor: 'Dr. Sarr' },
    { id: 'RDV-102', date: '2026-04-03', time: '10:30', patient: 'Fatou NDIAYE', age: 28, gender: 'F', reason: 'Consultation Gynécologique', status: 'PENDING', doctor: 'Dr. Keita' },
    { id: 'RDV-103', date: '2026-04-03', time: '11:45', patient: 'Moussa SOW', age: 45, gender: 'M', reason: 'Suivi HTA', status: 'ABSENT', doctor: 'Dr. Sarr' },
    { id: 'RDV-104', date: '2026-04-03', time: '14:00', patient: 'Awa DIALLO', age: 34, gender: 'F', reason: 'CPN 4', status: 'POSTPONED', doctor: 'Dr. Diallo' },
    { id: 'RDV-105', date: '2026-04-03', time: '15:30', patient: 'Jean-Paul GOMIS', age: 62, gender: 'M', reason: 'Contrôle Post-Op', status: 'CONFIRMED', doctor: 'Dr. Sarr' },
  ];

  // Subscribe to real-time appointments collection in Firestore
  useEffect(() => {
    const q = query(collection(db, 'appointments'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Merge with static fallback to avoid empty pages, filtering out duplicates
      const merged: any[] = [...list];
      staticFallback.forEach(staticItem => {
        if (!merged.find(item => item.id === staticItem.id)) {
          merged.push(staticItem);
        }
      });
      // Sort unified list by date and time
      merged.sort((a: any, b: any) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      });
      
      setAppointments(merged);
      setLoading(false);
    }, (error) => {
      console.warn("Firestore collection subscriptions failed, using default registry fallback: ", error);
      setAppointments(staticFallback);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'ABSENT': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'POSTPONED': return 'bg-slate-50 text-slate-600 border-slate-100';
      case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const handleStatusUpdate = async (rdvId: string, newStatus: string) => {
    try {
      const today = new Date();
      const rdvRef = doc(db, 'appointments', rdvId);
      
      // Update Firestore
      await setDoc(rdvRef, { status: newStatus }, { merge: true });

      // Create Audit Log
      await setDoc(doc(collection(db, 'audit_logs')), {
        user: user?.name || 'Docteur Orientation',
        role: 'DOCTOR',
        date: today.toLocaleDateString('fr-FR'),
        time: today.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        timestamp: today.toISOString(),
        action: `Rendez-vous mis à jour - ID: ${rdvId}`,
        details: { rdvId, status: newStatus },
        module: 'Consultation'
      });

      window.dispatchEvent(new CustomEvent('app-notification', { 
        detail: `Le statut du rendez-vous ${rdvId} a été mis à jour: ${newStatus}.` 
      }));
    } catch (e) {
      console.error("Failed to update status in Firestore: ", e);
      // Fallback local update
      setAppointments(prev => prev.map(item => item.id === rdvId ? { ...item, status: newStatus } : item));
    }
  };

  const handleDelete = async (rdvId: string) => {
    if (!window.confirm("Voulez-vous vraiment annuler/supprimer ce rendez-vous ?")) return;
    try {
      const today = new Date();
      await deleteDoc(doc(db, 'appointments', rdvId));

      await setDoc(doc(collection(db, 'audit_logs')), {
        user: user?.name || 'Docteur Orientation',
        role: 'DOCTOR',
        date: today.toLocaleDateString('fr-FR'),
        time: today.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        timestamp: today.toISOString(),
        action: `Rendez-vous supprimé - ID: ${rdvId}`,
        details: { rdvId },
        module: 'Consultation'
      });

      window.dispatchEvent(new CustomEvent('app-notification', { 
        detail: `Le rendez-vous ${rdvId} a été correctement archivé/supprimé.` 
      }));
    } catch (e) {
      console.error("Failed to delete in Firestore: ", e);
      setAppointments(prev => prev.filter(item => item.id !== rdvId));
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient || !formData.reason) {
      alert("Le nom du patient et le motif sont obligatoires.");
      return;
    }

    try {
      const today = new Date();
      const rdvId = `RDV-${Math.floor(Math.random() * 89999 + 10000)}`;
      const payload = {
        id: rdvId,
        patient: formData.patient,
        age: parseInt(formData.age) || 30,
        gender: formData.gender,
        reason: formData.reason,
        doctor: formData.doctor,
        date: formData.date,
        time: formData.time,
        status: 'PENDING',
        createdAt: today.toISOString()
      };

      await setDoc(doc(db, 'appointments', rdvId), payload);

      await setDoc(doc(collection(db, 'audit_logs')), {
        user: user?.name || 'Docteur Orientation',
        role: 'DOCTOR',
        date: today.toLocaleDateString('fr-FR'),
        time: today.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        timestamp: today.toISOString(),
        action: `Plannification RDV - Patient: ${formData.patient}`,
        details: { rdvId, date: formData.date, time: formData.time },
        module: 'Consultation'
      });

      setShowAddModal(false);
      setFormData({
        patient: '',
        age: '',
        gender: 'M',
        reason: '',
        doctor: user?.name || 'Dr. Sarr',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        status: 'PENDING'
      });

      window.dispatchEvent(new CustomEvent('app-notification', { 
        detail: `Nouveau rendez-vous planifié avec succès pour ${formData.patient}.` 
      }));
    } catch (e) {
      console.error("Error creating appointment in Firestore: ", e);
    }
  };

  const handleEditClick = (rdv: any) => {
    setSelectedAppointment(rdv);
    setFormData({
      patient: rdv.patient,
      age: rdv.age.toString(),
      gender: rdv.gender,
      reason: rdv.reason,
      doctor: rdv.doctor || 'Dr. Sarr',
      date: rdv.date || new Date().toISOString().split('T')[0],
      time: rdv.time,
      status: rdv.status
    });
    setShowEditModal(true);
  };

  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      const today = new Date();
      const payload = {
        patient: formData.patient,
        age: parseInt(formData.age) || 30,
        gender: formData.gender,
        reason: formData.reason,
        doctor: formData.doctor,
        date: formData.date,
        time: formData.time,
        status: formData.status
      };

      await setDoc(doc(db, 'appointments', selectedAppointment.id), payload, { merge: true });

      await setDoc(doc(collection(db, 'audit_logs')), {
        user: user?.name || 'Docteur Orientation',
        role: 'DOCTOR',
        date: today.toLocaleDateString('fr-FR'),
        time: today.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        timestamp: today.toISOString(),
        action: `Rendez-vous modifié - ID: ${selectedAppointment.id}`,
        details: { id: selectedAppointment.id, patient: formData.patient },
        module: 'Consultation'
      });

      setShowEditModal(false);
      setSelectedAppointment(null);
      window.dispatchEvent(new CustomEvent('app-notification', { 
        detail: `Le rendez-vous pour ${formData.patient} a été mis à jour.` 
      }));
    } catch (e) {
      console.error("Error updating appointment in Firestore: ", e);
    }
  };

  // Filter & Search appointments
  const filteredAppointments = appointments.filter(rdv => {
    const matchesSearch = rdv.patient.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rdv.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rdv.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'ALL' || rdv.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Gestion des Rendez-vous</h1>
          <p className="text-slate-500 font-medium italic">Planifiez, modifiez et validez vos consultations d'orientation futures.</p>
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="relative group flex-1 md:flex-initial">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher un rendez-vous..." 
              className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all w-full md:w-80 shadow-sm"
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-600/20"
          >
            <Plus size={18} /> Nouveau RDV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Calendar Preview and Status Summary */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-md font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <CalendarIcon size={18} className="text-blue-600" /> Calendrier de Suivi
              </h3>
              <span className="text-xs font-black text-slate-400 uppercase">Dakar</span>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center mb-4">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                <span key={`${d}-${i}`} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 30 }).map((_, i) => (
                <button 
                  key={i} 
                  className={`aspect-square rounded-xl flex items-center justify-center text-xs font-black transition-all ${i + 1 === 19 ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-xl">
            <h3 className="text-lg font-black uppercase tracking-widest mb-6 text-blue-400">Statistiques</h3>
            <div className="space-y-4">
              <div 
                onClick={() => setFilterStatus('ALL')}
                className={`flex justify-between items-center p-4 rounded-2xl border cursor-pointer transition-colors ${filterStatus === 'ALL' ? 'bg-blue-600 border-blue-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                <span className="text-xs font-bold text-slate-300">Tous les RDV</span>
                <span className="text-sm font-black">{appointments.length}</span>
              </div>
              <div 
                onClick={() => setFilterStatus('CONFIRMED')}
                className={`flex justify-between items-center p-4 rounded-2xl border cursor-pointer transition-colors ${filterStatus === 'CONFIRMED' ? 'bg-emerald-600 border-emerald-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                <span className="text-xs font-bold text-slate-300">Confirmés</span>
                <span className="text-sm font-black text-emerald-400">{appointments.filter(a => a.status === 'CONFIRMED').length}</span>
              </div>
              <div 
                onClick={() => setFilterStatus('PENDING')}
                className={`flex justify-between items-center p-4 rounded-2xl border cursor-pointer transition-colors ${filterStatus === 'PENDING' ? 'bg-amber-600 border-amber-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                <span className="text-xs font-bold text-slate-300">En attente</span>
                <span className="text-sm font-black text-amber-400">{appointments.filter(a => a.status === 'PENDING').length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600"><Clock size={18} /></div>
              Rendez-vous ({filteredAppointments.length})
            </h2>
            <div className="flex gap-2">
              {['ALL', 'PENDING', 'CONFIRMED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterStatus === status ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {status === 'ALL' ? 'Tous' : status === 'PENDING' ? 'En attente' : 'Confirmés'}
                </button>
              ))}
            </div>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-[32px] border border-slate-200 p-12 text-center text-slate-400 font-medium">
              Aucun rendez-vous trouvé correspondant aux filtres.
            </div>
          ) : (
            filteredAppointments.map((rdv) => (
              <div key={rdv.id} className="bg-white rounded-[32px] border border-slate-200 p-6 hover:border-blue-500 transition-all group shadow-sm hover:shadow-xl hover:shadow-blue-600/5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="text-center w-20 shrink-0">
                      <p className="text-2xl font-black text-slate-900">{rdv.time}</p>
                      <p className="text-[9px] font-black text-slate-400 font-mono tracking-widest uppercase">{rdv.date || '03/04'}</p>
                    </div>
                    <div className="h-12 w-px bg-slate-100 hidden md:block"></div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 font-black overflow-hidden shrink-0">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${rdv.patient}`} alt="Patient" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900">{rdv.patient}</h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {rdv.age} ans • {rdv.gender} • {rdv.reason} <span className="text-slate-400 font-bold ml-1">({rdv.id})</span>
                        </p>
                        <p className="text-[10px] text-blue-600 font-bold mt-1">Médecin affecté: {rdv.doctor || 'Dr. Sarr'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full md:w-auto gap-4">
                    <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shrink-0 ${getStatusBadge(rdv.status)}`}>
                      {rdv.status}
                    </div>
                    <div className="flex gap-2">
                      {rdv.status !== 'CONFIRMED' && (
                        <button 
                          onClick={() => handleStatusUpdate(rdv.id, 'CONFIRMED')}
                          className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all shrink-0" 
                          title="Confirmer"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleEditClick(rdv)}
                        className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all shrink-0" 
                        title="Modifier"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(rdv.id)}
                        className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all shrink-0" 
                        title="Annuler"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL: ADD APPOINTMENT */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl w-full max-w-xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900">Nouveau Rendez-vous</h3>
              <button onClick={() => setShowAddModal(false)} className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateAppointment} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Patient d'Orientation</label>
                <input 
                  type="text" 
                  required
                  value={formData.patient}
                  onChange={e => setFormData({ ...formData, patient: e.target.value })}
                  placeholder="Ex: Moussa SOW"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Âge</label>
                  <input 
                    type="number" 
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Ex: 35"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Sexe</label>
                  <select 
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-blue-600"
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Motif du Rendez-vous / Spécialité</label>
                <input 
                  type="text" 
                  required
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Ex: Consultation Gynéco ou Suivi"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Médecin affecté</label>
                <input 
                  type="text" 
                  value={formData.doctor}
                  onChange={e => setFormData({ ...formData, doctor: e.target.value })}
                  placeholder="Ex: Dr. Sarr"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Date</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Heure</label>
                  <input 
                    type="time" 
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
              >
                Planifier le Rendez-vous
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT APPOINTMENT */}
      {showEditModal && selectedAppointment && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl w-full max-w-xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900">Modifier Rendez-vous</h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAppointment(null);
                }} 
                className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateAppointment} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Patient</label>
                <input 
                  type="text" 
                  required
                  value={formData.patient}
                  onChange={e => setFormData({ ...formData, patient: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Âge</label>
                  <input 
                    type="number" 
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Sexe</label>
                  <select 
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-blue-600"
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Motif</label>
                <input 
                  type="text" 
                  required
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Médecin</label>
                <input 
                  type="text" 
                  value={formData.doctor}
                  onChange={e => setFormData({ ...formData, doctor: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Date</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Heure</label>
                  <input 
                    type="time" 
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Statut</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-blue-600"
                >
                  <option value="PENDING">En attente (PENDING)</option>
                  <option value="CONFIRMED">Confirmé (CONFIRMED)</option>
                  <option value="ABSENT">Absent (ABSENT)</option>
                  <option value="POSTPONED">Reporter (POSTPONED)</option>
                  <option value="CANCELLED">Annuler (CANCELLED)</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full mt-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
              >
                Mettre à jour le Rendez-vous
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
