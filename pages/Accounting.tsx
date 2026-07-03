import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  Truck, 
  Users, 
  Percent, 
  Calculator, 
  Landmark, 
  FileText, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Calendar, 
  Filter, 
  DownloadCloud, 
  Check, 
  X, 
  Eye, 
  Award, 
  Wallet, 
  Printer, 
  Building2, 
  Clock, 
  History,
  FileSpreadsheet,
  Home,
  LayoutDashboard
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart, 
  Pie, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { PaymentRequest, CashierTransaction, Role, AccountingSubMenu } from '../types';

interface AccountingProps {
  user: any;
  paymentRequests: PaymentRequest[];
  cashierTransactions: CashierTransaction[];
  onBackToDashboard: () => void;
  activeTab?: AccountingSubMenu;
  setActiveTab?: (tab: AccountingSubMenu) => void;
}

// Interne Types
interface Expense {
  id: string;
  reference: string;
  category: string;
  description: string;
  amount: number;
  supplier: string;
  date: string;
  receiptUrl?: string;
  createdBy: string;
  status: 'ACTIVE' | 'CANCELLED' | 'ARCHIVED';
}

interface Supplier {
  id: string;
  name: string;
  contact: string;
  address: string;
  category: string;
  historyCount: number;
  totalBought: number;
  outstandingDebt: number;
  nextDeadline: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  oldValue: string;
  newValue: string;
}

export const Accounting: React.FC<AccountingProps> = ({
  user,
  paymentRequests = [],
  cashierTransactions = [],
  onBackToDashboard,
  activeTab: activeTabProp,
  setActiveTab: setActiveTabProp
}) => {
  // Navigation
  const [activeTabState, setActiveTabState] = useState<AccountingSubMenu>('dashboard');
  
  const activeTab = activeTabProp !== undefined ? activeTabProp : activeTabState;
  const setActiveTab = setActiveTabProp !== undefined ? setActiveTabProp : setActiveTabState;

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');
  const [filterService, setFilterService] = useState('all');

  // Dépenses state with realistic initial mock data
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: 'EXP-001', reference: 'RE-2026-0016', category: 'Réactifs laboratoire', description: 'Commande réactifs hématologie', amount: 450000, supplier: 'BioMérieux Sahel', date: '2026-05-28', createdBy: 'M. Diallo', status: 'ACTIVE' },
    { id: 'EXP-002', reference: 'FACT-45892', category: 'Consommables médicaux', description: 'Compresses, seringues, gants de chirurgie', amount: 350000, supplier: 'Sénégal Médical', date: '2026-05-29', createdBy: 'M. Diallo', status: 'ACTIVE' },
    { id: 'EXP-003', reference: 'ELEC-2026-05', category: 'Électricité', description: 'Facture Senelec Mai 2026', amount: 890000, supplier: 'SENELEC', date: '2026-05-30', createdBy: 'Système', status: 'ACTIVE' },
    { id: 'EXP-004', reference: 'EAU-2026-05', category: 'Eau', description: 'Facture Sen\'Eau Mai 2026', amount: 155000, supplier: 'SEN EAU', date: '2026-05-30', createdBy: 'Système', status: 'ACTIVE' },
    { id: 'EXP-005', reference: 'FUEL-023', category: 'Carburant', description: 'Plein générateur d\'urgence', amount: 120000, supplier: 'TotalEnergies St-Louis', date: '2026-05-31', createdBy: 'Sécurité Gérant', status: 'ACTIVE' },
    { id: 'EXP-006', reference: 'INT-452136', category: 'Internet', description: 'Abonnement fibre optique Orange', amount: 65000, supplier: 'Orange Business', date: '2026-05-25', createdBy: 'Mme Cissé', status: 'ACTIVE' },
  ]);

  // Expenses CRUD inputs
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formExpense, setFormExpense] = useState({
    category: 'Consommables médicaux',
    description: '',
    amount: '',
    supplier: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Fournisseurs state
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: 'SUP-001', name: 'BioMérieux Sahel', contact: '+221 33 824 15 15', address: 'Dakar Fann, Rue de l\'Est', category: 'Réactifs laboratoire', historyCount: 14, totalBought: 6800000, outstandingDebt: 450000, nextDeadline: '2026-06-15' },
    { id: 'SUP-002', name: 'Sénégal Médical', contact: '+221 33 892 40 40', address: 'Zone Industrielle Dakar, Lot 4', category: 'Consommables médicaux', historyCount: 38, totalBought: 14200000, outstandingDebt: 0, nextDeadline: '-' },
    { id: 'SUP-003', name: 'SENELEC', contact: '+221 800 00 11', address: 'Dakar Plateau, Av. Albert Sarraut', category: 'Électricité', historyCount: 60, totalBought: 54000000, outstandingDebt: 890000, nextDeadline: '2026-06-10' },
    { id: 'SUP-004', name: 'SEN EAU', contact: '+221 800 00 22', address: 'Hann Maristes, Dakar', category: 'Eau', historyCount: 60, totalBought: 9200000, outstandingDebt: 155000, nextDeadline: '2026-06-10' },
    { id: 'SUP-005', name: 'SANOFI Afrique de l\'Ouest', contact: '+221 33 869 10 10', address: 'Almadies, Dakar', category: 'Médicaments', historyCount: 22, totalBought: 19500000, outstandingDebt: 2300000, nextDeadline: '2026-06-05' },
  ]);

  // Add Supplier trigger
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [formSupplier, setFormSupplier] = useState({
    name: '',
    contact: '',
    address: '',
    category: 'Consommables médicaux',
  });

  // Pay supplier state
  const [selectedSupplierForPayment, setSelectedSupplierForPayment] = useState<Supplier | null>(null);
  const [suppPaymentAmount, setSuppPaymentAmount] = useState('');

  // Quotes-part Split percentage states
  const [quotePartsRules, setQuotePartsRules] = useState([
    { service: 'Consultation', providerPercent: 40, facilityPercent: 60 },
    { service: 'Laboratoire', providerPercent: 20, facilityPercent: 80 },
    { service: 'Maternité', providerPercent: 30, facilityPercent: 70 },
    { service: 'Hospitalisation', providerPercent: 15, facilityPercent: 85 },
    { service: 'Pharmacie', providerPercent: 5, facilityPercent: 95 },
  ]);

  // Salaires variables with initial calculations
  const [staffSalaries, setStaffSalaries] = useState([
    { id: 'S-101', name: 'Dr. Sarr Ousmane', role: 'Médecin Chef', specialty: 'Gynécologie', baseSalary: 850000, primes: 120000, gardes: 150000, deductions: 195000, actsCount: 124 },
    { id: 'S-102', name: 'Dr. Keita Ibrahim', role: 'Médecin', specialty: 'Pédiatrie', baseSalary: 680000, primes: 95000, gardes: 100000, deductions: 155000, actsCount: 89 },
    { id: 'S-103', name: 'Inf. Marie Gomis', role: 'Infirmière', specialty: 'Maternité', baseSalary: 350000, primes: 30000, gardes: 60000, deductions: 74000, actsCount: 245 },
    { id: 'S-104', name: 'Mme Cissé Fatou', role: 'Caissière', specialty: 'Finances', baseSalary: 280000, primes: 15000, gardes: 0, deductions: 58000, actsCount: 567 },
    { id: 'S-105', name: 'Dr. Sylla Aly', role: 'Laborantin', specialty: 'Hématologie', baseSalary: 450000, primes: 45000, gardes: 40000, deductions: 98000, actsCount: 110 },
  ]);

  // Selected Employee for isolated Payslip PDF simulation
  const [selectedEmployeeForPayslip, setSelectedEmployeeForPayslip] = useState<any | null>(null);

  // Trésorerie account balances with starting balance
  const [treasuryAccounts, setTreasuryAccounts] = useState([
    { id: 'ACC-01', name: 'Caisse Centrale (Espèces)', type: 'CAISSE', balance: 1450000, status: 'Active' },
    { id: 'ACC-02', name: 'Compte Société Générale', type: 'BANQUE', balance: 18230000, status: 'Active' },
    { id: 'ACC-03', name: 'Compte CBAO', type: 'BANQUE', balance: 14850000, status: 'Active' },
    { id: 'ACC-04', name: 'Orange Money Business', type: 'MOBILE_MONEY', balance: 2950000, status: 'Active' },
    { id: 'ACC-5', name: 'Wave Business', type: 'MOBILE_MONEY', balance: 1840000, status: 'Active' },
  ]);

  // Audit Logs state tracking all actions
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 'AUD-001', timestamp: '2026-06-01 08:32:15', user: 'Admin Gérant', action: 'Dépense Ajoutée', details: 'Ajout de la dépense EXP-005 pour TotalEnergies', oldValue: '-', newValue: '120,000 CFA' },
    { id: 'AUD-002', timestamp: '2026-06-01 09:12:44', user: 'Comptable Chef', action: 'Modification Taux', details: 'Changement de split Laboratoire de 15% à 20% praticien', oldValue: '15%', newValue: '20%' },
    { id: 'AUD-003', timestamp: '2026-06-01 09:44:02', user: 'Système', action: 'Réallocation Trésorerie', details: 'Versement de caisse automatique recettes du 2026-05-31', oldValue: '0 CFA', newValue: '450,000 CFA' },
  ]);

  // Log action helper
  const addAuditLog = (action: string, details: string, oldValue: string, newValue: string) => {
    const newLog: AuditLog = {
      id: `AUD-${Math.floor(Math.random() * 100000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
      user: user?.name || 'Comptable',
      action,
      details,
      oldValue,
      newValue
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // 1. RECOVERY OF REVENUE METRICS
  // Pre-load robust mock transactions if global transactions or paymentRequests are very short
  const preloadedRevenues = useMemo(() => {
    const historical = [
      { id: 'ORD-MOCK-1', date: '2025-12-10T14:22:00Z', patientName: 'Ndiaye Babacar', requestingService: 'Consultation', sourceModule: 'DOCTOR', amount: 15000, paymentMethod: 'CASH', user: 'Fatou Caisse' },
      { id: 'ORD-MOCK-2', date: '2026-01-15T09:40:00Z', patientName: 'Faye Adama', requestingService: 'Laboratoire', sourceModule: 'LAB', amount: 45000, paymentMethod: 'MOBILE_MONEY', user: 'Fatou Caisse' },
      { id: 'ORD-MOCK-3', date: '2026-02-20T11:15:00Z', patientName: 'Sall Ousmane', requestingService: 'Pharmacie', sourceModule: 'PHARMACY', amount: 32000, paymentMethod: 'CASH', user: 'Fatou Caisse' },
      { id: 'ORD-MOCK-4', date: '2026-03-05T16:00:00Z', patientName: 'Diagne Coumba', requestingService: 'Maternité', sourceModule: 'MATERNITY', amount: 120000, paymentMethod: 'CARD', user: 'Fatou Caisse' },
      { id: 'ORD-MOCK-5', date: '2026-04-18T10:05:00Z', patientName: 'Gueye Ndèye', requestingService: 'Urgences', sourceModule: 'URGENCE', amount: 85000, paymentMethod: 'MOBILE_MONEY', user: 'Fatou Caisse' },
      { id: 'ORD-MOCK-6', date: '2026-05-12T08:12:00Z', patientName: 'Diallo Thierno', requestingService: 'Hospitalisation', sourceModule: 'NURSE', amount: 250000, paymentMethod: 'TRANSFER', user: 'Fatou Caisse' },
      { id: 'ORD-MOCK-7', date: '2026-05-27T15:30:00Z', patientName: 'Wade Aïda', requestingService: 'Consultation', sourceModule: 'DOCTOR', amount: 10000, paymentMethod: 'CASH', user: 'Fatou Caisse' },
      { id: 'ORD-MOCK-8', date: '2026-05-29T11:55:00Z', patientName: 'Kane Souleymane', requestingService: 'Laboratoire', sourceModule: 'LAB', amount: 65000, paymentMethod: 'CARD', user: 'Fatou Caisse' },
    ];

    // Combine loaded live transactions
    const live = cashierTransactions.map(tx => {
      // Find matching payment request
      const req = paymentRequests.find(pr => pr.id === tx.paymentRequestId);
      return {
        id: tx.id,
        date: tx.date || new Date().toISOString(),
        patientName: req?.patientName || 'Patient Externe',
        requestingService: req?.requestingService || 'Caisse Directe',
        sourceModule: req?.sourceModule || 'CASHIER',
        amount: tx.amount,
        paymentMethod: tx.paymentMethod,
        user: tx.cashierName || 'Caissier'
      };
    });

    return [...live, ...historical];
  }, [cashierTransactions, paymentRequests]);

  // Filtered revenues according to criteria
  const finalRevenues = useMemo(() => {
    return preloadedRevenues.filter(r => {
      const matchSearch = r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.requestingService.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchService = filterService === 'all' || r.sourceModule === filterService;
      
      let matchDate = true;
      if (filterPeriod === 'today') {
        const todayStr = new Date().toISOString().split('T')[0];
        matchDate = r.date.startsWith(todayStr);
      } else if (filterPeriod === 'week') {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        matchDate = new Date(r.date) >= lastWeek;
      } else if (filterPeriod === 'month') {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const rDate = new Date(r.date);
        matchDate = rDate.getMonth() === currentMonth && rDate.getFullYear() === currentYear;
      } else if (filterPeriod === 'year') {
        const currentYear = new Date().getFullYear();
        matchDate = new Date(r.date).getFullYear() === currentYear;
      }
      return matchSearch && matchService && matchDate;
    });
  }, [preloadedRevenues, searchTerm, filterPeriod, filterService]);

  // Aggregate sum calculations
  const totalRevenuesSum = useMemo(() => {
    return preloadedRevenues.reduce((acc, r) => acc + r.amount, 0);
  }, [preloadedRevenues]);

  const activeExpenses = useMemo(() => expenses.filter(e => e.status === 'ACTIVE'), [expenses]);
  const totalExpensesSum = useMemo(() => {
    return activeExpenses.reduce((acc, e) => acc + e.amount, 0);
  }, [activeExpenses]);

  // 2. RECEIVABLES (Automatic patient debts calculation)
  const patientReceivablesFromRequests = useMemo(() => {
    const liveDebts = paymentRequests
      .filter(pr => pr.status === 'PENDING' || pr.status === 'PARTIAL')
      .map(pr => {
        const delayDays = Math.floor((Date.now() - new Date(pr.createdAt).getTime()) / (1000 * 60 * 60 * 24)) || 0;
        return {
          id: pr.id,
          patientName: pr.patientName,
          amountDue: pr.totalAmount - pr.amountPaid,
          date: pr.createdAt.split('T')[0],
          delayDays,
          status: delayDays > 30 ? 'CRITICAL_UNPAID' : (pr.amountPaid > 0 ? 'PARTIAL' : 'PENDING'),
          service: pr.requestingService
        };
      });

    const mockDebts = [
      { id: 'D-998', patientName: 'Ba Fatoumata', amountDue: 35000, date: '2026-04-12', delayDays: 50, status: 'CRITICAL_UNPAID', service: 'Hospitalisation' },
      { id: 'D-999', patientName: 'Sow Boubacar', amountDue: 55000, date: '2026-05-18', delayDays: 14, status: 'PENDING', service: 'Laboratoire' },
      { id: 'D-1000', patientName: 'Cissoko Alassane', amountDue: 75000, date: '2026-04-20', delayDays: 42, status: 'CRITICAL_UNPAID', service: 'Urgences' },
    ];

    return [...liveDebts, ...mockDebts];
  }, [paymentRequests]);

  const totalReceivablesSum = useMemo(() => {
    return patientReceivablesFromRequests.reduce((acc, r) => acc + r.amountDue, 0);
  }, [patientReceivablesFromRequests]);

  // Supplier debts total
  const totalSupplierDebtsSum = useMemo(() => {
    return suppliers.reduce((acc, s) => acc + s.outstandingDebt, 0);
  }, [suppliers]);

  // Payroll masse salariale total
  const payrollTotalSum = useMemo(() => {
    return staffSalaries.reduce((acc, s) => acc + (s.baseSalary + s.primes + s.gardes - s.deductions), 0);
  }, [staffSalaries]);

  // Recharts Monthly Revenue vs Expenses Trend Data
  const monthlyTrendData = [
    { name: 'Jan', Recettes: 1200000, Dépenses: 850000 },
    { name: 'Fév', Recettes: 1540000, Dépenses: 950000 },
    { name: 'Mar', Recettes: 1890000, Dépenses: 1100000 },
    { name: 'Avr', Recettes: 2200000, Dépenses: 1400000 },
    { name: 'Mai', Recettes: totalRevenuesSum || 3300000, Dépenses: totalExpensesSum || 1625000 },
  ];

  // Recharts Revenues Distribution by Service Data
  const revenuesByServiceData = useMemo(() => {
    const services = ['DOCTOR', 'LAB', 'PHARMACY', 'MATERNITY', 'NURSE', 'URGENCE'];
    const serviceLabels: Record<string, string> = {
      DOCTOR: 'Consultations',
      LAB: 'Laboratoire',
      PHARMACY: 'Pharmacie',
      MATERNITY: 'Maternité',
      NURSE: 'Hospitalisation',
      URGENCE: 'Urgences'
    };
    
    const totals: Record<string, number> = {
      DOCTOR: 450000,
      LAB: 540000,
      PHARMACY: 920000,
      MATERNITY: 320000,
      NURSE: 650000,
      URGENCE: 420000
    };

    preloadedRevenues.forEach(r => {
      if (totals[r.sourceModule] !== undefined) {
        totals[r.sourceModule] += r.amount;
      } else {
        totals[r.sourceModule] = r.amount;
      }
    });

    return Object.keys(totals).map(key => ({
      name: serviceLabels[key] || key,
      value: totals[key]
    }));
  }, [preloadedRevenues]);

  // Recharts Expenses Distribution by Category Data
  const expensesByCategoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    activeExpenses.forEach(e => {
      categories[e.category] = (categories[e.category] || 0) + e.amount;
    });

    return Object.keys(categories).map(key => ({
      name: key,
      value: categories[key]
    }));
  }, [activeExpenses]);

  // 3. EXPENSES CRUD IMPLEMENTATION
  const handleAddNewExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(formExpense.amount) || 0;
    if (amountVal <= 0) return;

    const newExp: Expense = {
      id: `EXP-${Math.floor(Math.random() * 100000)}`,
      reference: `EXP-REF-${Math.floor(Math.random() * 1000000)}`,
      category: formExpense.category,
      description: formExpense.description,
      amount: amountVal,
      supplier: formExpense.supplier || 'N/A',
      date: formExpense.date,
      createdBy: user?.name || 'Comptable',
      status: 'ACTIVE'
    };

    setExpenses(prev => [...prev, newExp]);
    addAuditLog('Dépense Ajoutée', `Ref: ${newExp.reference} - ${newExp.description}`, '-', `${amountVal} CFA`);
    
    // Deduct dynamically from cash if treasury account is activated
    setTreasuryAccounts(prev => prev.map(acc => {
      if (acc.id === 'ACC-01') { // Caisse Centrale
        return { ...acc, balance: Math.max(0, acc.balance - amountVal) };
      }
      return acc;
    }));

    setShowAddExpense(false);
    setFormExpense({
      category: 'Consommables médicaux',
      description: '',
      amount: '',
      supplier: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleCancelExpense = (id: string) => {
    const x = expenses.find(e => e.id === id);
    if (!x) return;
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'CANCELLED' } : e));
    addAuditLog('Dépense Annulée', `Dépense ref ${x.reference} annulée`, `${x.amount} CFA`, '0 CFA');
    
    // Refund to cash drawer drawer
    setTreasuryAccounts(prev => prev.map(acc => {
      if (acc.id === 'ACC-01') {
        return { ...acc, balance: acc.balance + x.amount };
      }
      return acc;
    }));
  };

  const handleArchiveExpense = (id: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'ARCHIVED' } : e));
    // Log archive
    const x = expenses.find(e => e.id === id);
    if (x) addAuditLog('Dépense Archivée', `Archivage ref ${x.reference}`, '-', '-');
  };

  // 4. SUPPLIERS CRUD IMPLEMENTATION
  const handleAddNewSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSupplier.name) return;

    const newSupp: Supplier = {
      id: `SUP-${Math.floor(Math.random() * 1000)}`,
      name: formSupplier.name,
      contact: formSupplier.contact,
      address: formSupplier.address,
      category: formSupplier.category,
      historyCount: 0,
      totalBought: 0,
      outstandingDebt: 0,
      nextDeadline: '-'
    };

    setSuppliers(prev => [...prev, newSupp]);
    addAuditLog('Fournisseur Ajouté', `Enregistrement de ${newSupp.name}`, '-', '-');
    setShowAddSupplier(false);
    setFormSupplier({
      name: '',
      contact: '',
      address: '',
      category: 'Consommables médicaux',
    });
  };

  const handlePaySupplierInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierForPayment) return;
    const paymentAmountFloat = parseFloat(suppPaymentAmount) || 0;
    if (paymentAmountFloat <= 0 || paymentAmountFloat > selectedSupplierForPayment.outstandingDebt) {
      alert("Montant de règlement invalide.");
      return;
    }

    // Process payment & reduce supplier debt
    setSuppliers(prev => prev.map(s => {
      if (s.id === selectedSupplierForPayment.id) {
        const remaining = s.outstandingDebt - paymentAmountFloat;
        return {
          ...s,
          outstandingDebt: remaining,
          nextDeadline: remaining === 0 ? '-' : s.nextDeadline,
          totalBought: s.totalBought + paymentAmountFloat
        };
      }
      return s;
    }));

    // Register an automatic expense to avoid double accounting omission
    const autoExpense: Expense = {
      id: `EXP-SUP-${Math.floor(Math.random() * 100000)}`,
      reference: `PAY-SUP-${selectedSupplierForPayment.id}`,
      category: selectedSupplierForPayment.category,
      description: `Règlement fournisseur: ${selectedSupplierForPayment.name}`,
      amount: paymentAmountFloat,
      supplier: selectedSupplierForPayment.name,
      date: new Date().toISOString().split('T')[0],
      createdBy: user?.name || 'Comptable',
      status: 'ACTIVE'
    };

    setExpenses(prev => [...prev, autoExpense]);
    addAuditLog('Paiement Fournisseur', `Règlement facture ${selectedSupplierForPayment.name}`, `${selectedSupplierForPayment.outstandingDebt} CFA`, `${selectedSupplierForPayment.outstandingDebt - paymentAmountFloat} CFA`);
    
    // Deduct from bank account
    setTreasuryAccounts(prev => prev.map(acc => {
      if (acc.id === 'ACC-02') { // SG bank
        return { ...acc, balance: Math.max(0, acc.balance - paymentAmountFloat) };
      }
      return acc;
    }));

    setSelectedSupplierForPayment(null);
    setSuppPaymentAmount('');
  };

  // 5. SPLIT QUOTES-PARTS live calculations
  const quotePartsSummary = useMemo(() => {
    const list = preloadedRevenues.map(r => {
      // Find split rate for service
      const rule = quotePartsRules.find(q => q.service.toLowerCase() === r.requestingService.toLowerCase()) || 
                   quotePartsRules.find(q => q.service.toLowerCase() === 'consultation'); // fallback
      
      const providerPercent = rule?.providerPercent || 40;
      const providerAmt = (r.amount * providerPercent) / 100;
      const clinicAmt = r.amount - providerAmt;

      // Assign to mock doctor name based on service
      let assignedDoctor = 'Dr. Sarr Ousmane';
      if (r.sourceModule === 'LAB') assignedDoctor = 'Dr. Sylla Aly';
      else if (r.sourceModule === 'PHARMACY') assignedDoctor = 'Mme Cissé Fatou';
      else if (r.sourceModule === 'NURSE') assignedDoctor = 'Inf. Marie Gomis';
      else if (r.sourceModule === 'DOCTOR') assignedDoctor = 'Dr. Keita Ibrahim';

      return {
        id: r.id,
        date: r.date.split('T')[0],
        service: r.requestingService,
        totalAmount: r.amount,
        providerAmt,
        clinicAmt,
        doctorName: assignedDoctor
      };
    });

    const physicianEarned = list.reduce((acc, r) => acc + r.providerAmt, 0);
    const clinicEarned = list.reduce((acc, r) => acc + r.clinicAmt, 0);

    return {
      items: list,
      physicianEarned,
      clinicEarned
    };
  }, [preloadedRevenues, quotePartsRules]);

  // 6. ANALYTICAL BUSINESS UNITS (Centres de coûts)
  const costCenters = useMemo(() => {
    const centers = [
      { id: 'C1', name: 'Consultation', serviceCode: 'DOCTOR', baseOverheadPercent: 15 },
      { id: 'C2', name: 'Urgences', serviceCode: 'URGENCE', baseOverheadPercent: 15 },
      { id: 'C3', name: 'Hospitalisation', serviceCode: 'NURSE', baseOverheadPercent: 20 },
      { id: 'C4', name: 'Maternité', serviceCode: 'MATERNITY', baseOverheadPercent: 10 },
      { id: 'C5', name: 'Laboratoire', serviceCode: 'LAB', baseOverheadPercent: 15 },
      { id: 'C6', name: 'Pharmacie', serviceCode: 'PHARMACY', baseOverheadPercent: 10 },
      { id: 'C7', name: 'Administration', serviceCode: 'ADMIN', baseOverheadPercent: 15 }
    ];

    return centers.map(center => {
      // Revenues sum
      const revs = preloadedRevenues
        .filter(r => r.sourceModule === center.serviceCode)
        .reduce((sum, r) => sum + r.amount, 0);

      // Dedicated direct expenses for this service
      let mappedExp = 0;
      if (center.name === 'Laboratoire') mappedExp += 450000;
      else if (center.name === 'Hospitalisation') mappedExp += 120000;
      else if (center.name === 'Pharmacie') mappedExp += 350000;
      
      // Dynamic allocation of administrative & utility expenses (water, electricity, internet, fueling)
      const genericAdminCosts = activeExpenses
        .filter(e => e.category === 'Électricité' || e.category === 'Eau' || e.category === 'Internet' || e.category === 'Carburant')
        .reduce((sum, e) => sum + e.amount, 0);

      const allocatedOverhead = (genericAdminCosts * center.baseOverheadPercent) / 100;
      const totalCostEstim = mappedExp + allocatedOverhead;

      return {
        id: center.id,
        name: center.name,
        revenues: center.name === 'Administration' ? 0 : (revs || 350000), // minimum bound to make realistic
        expenses: totalCostEstim || 95000,
        result: (center.name === 'Administration' ? 0 : (revs || 350000)) - (totalCostEstim || 95000)
      };
    });
  }, [preloadedRevenues, activeExpenses]);

  // Financial colors theme
  const COLORS = ['#3b82f6', '#10b981', '#dc2626', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

  return (
    <div className="p-8 text-slate-900 min-h-screen bg-slate-50">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm mb-8 gap-6">
         <div className="flex items-center gap-6">
           <button 
             onClick={onBackToDashboard}
             className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg group shrink-0"
             title="Retour au Dashboard"
           >
             <Home size={24} className="group-hover:scale-110 transition-transform" />
           </button>
           <div>
             <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 italic">
               <TrendingUp size={32} className="text-orange-600" />
               SIH Financier & Comptabilité
             </h1>
             <p className="text-sm font-medium text-slate-500 italic mt-0.5">ERP de gestion comptable, analytique, paie, trésorerie et quotes-parts</p>
           </div>
         </div>
       </header>

      {/* 2. TAB BLOCKS CONTENT */}

      {/* TAB 1: TABLEAU DE BORD FINANCIAL DASHBOARD */ }
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-300">
           {/* Row of Metrics */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              
              <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xs">
                 <p className="text-[10px] font-black uppercase text-emerald-500 tracking-wider flex items-center gap-1">
                    <TrendingUp size={12} /> Recettes globales
                 </p>
                 <h2 className="text-2xl font-black text-slate-950 mt-2">{(totalRevenuesSum).toLocaleString()} <span className="text-xs font-semibold text-slate-500">CFA</span></h2>
                 <p className="text-[10px] text-slate-400 font-medium mt-1">Cumulé récupéré auto</p>
              </div>

              <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xs">
                 <p className="text-[10px] font-black uppercase text-red-500 tracking-wider flex items-center gap-1">
                    <TrendingDown size={12} /> Dépenses cumulées
                 </p>
                 <h2 className="text-2xl font-black text-slate-950 mt-2">{(totalExpensesSum).toLocaleString()} <span className="text-xs font-semibold text-slate-500">CFA</span></h2>
                 <p className="text-[10px] text-slate-400 font-medium mt-1">Saisie & auto-règlements</p>
              </div>

              <div className="p-6 bg-indigo-600 rounded-3xl text-white shadow-lg shadow-indigo-600/10">
                 <p className="text-[10px] font-black uppercase text-indigo-200 tracking-wider flex items-center gap-1">
                    <Landmark size={12} /> Trésorerie dispo
                 </p>
                 <h2 className="text-2xl font-black mt-2">{(12500000 + totalRevenuesSum - totalExpensesSum).toLocaleString()} <span className="text-xs">CFA</span></h2>
                 <p className="text-[10px] text-indigo-200 font-medium mt-1">Solde des différents comptes</p>
              </div>

              <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xs">
                 <p className="text-[10px] font-black uppercase text-orange-500 tracking-wider flex items-center gap-1">
                    <AlertTriangle size={12} /> Créances Patient
                 </p>
                 <h2 className="text-2xl font-black text-slate-950 mt-2">{(totalReceivablesSum).toLocaleString()} <span className="text-xs font-semibold text-slate-500">CFA</span></h2>
                 <p className="text-[10px] text-slate-400 font-medium mt-1">Dettes en cours de règlement</p>
              </div>

              <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xs">
                 <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                    <Truck size={12} /> Dettes Fournisseur
                 </p>
                 <h2 className="text-2xl font-black text-slate-950 mt-2">{(totalSupplierDebtsSum).toLocaleString()} <span className="text-xs font-semibold text-slate-500">CFA</span></h2>
                 <p className="text-[10px] text-slate-400 font-medium mt-1">Factures dues à échoir</p>
              </div>

              <div className="p-6 bg-slate-950 rounded-3xl text-white">
                 <p className="text-[10px] font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1">
                    <Users size={12} /> Masse salariale
                 </p>
                 <h2 className="text-2xl font-black mt-2">{(payrollTotalSum).toLocaleString()} <span className="text-xs">CFA</span></h2>
                 <p className="text-[10px] text-slate-400 font-medium mt-1">Charges directes du personnel</p>
              </div>

           </div>

           {/* Performance Graph & Summary */}
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Recettes vs Dépenses AreaChart */}
              <div className="lg:col-span-8 bg-white p-6 rounded-[32px] border border-slate-100 shadow-xs">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">Évolution Recettes vs Dépenses</h3>
                      <p className="text-slate-400 text-xs font-medium">Comparatif sur les 5 derniers mois</p>
                    </div>
                    <div className="flex gap-4 text-xs font-black">
                       <span className="flex items-center gap-1 text-emerald-500"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> Recettes</span>
                       <span className="flex items-center gap-1 text-blue-500"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span> Dépenses</span>
                    </div>
                  </div>
                  <div className="h-80">
                     <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={monthlyTrendData}>
                            <defs>
                              <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorDep" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontStyle="bold" />
                            <YAxis stroke="#94a3b8" fontSize={11} />
                            <Tooltip formatter={(value) => value !== undefined && value !== null && !isNaN(Number(value)) ? `${Number(value).toLocaleString()} CFA` : '0 CFA'} />
                            <Area type="monotone" dataKey="Recettes" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRec)" />
                            <Area type="monotone" dataKey="Dépenses" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorDep)" />
                         </AreaChart>
                     </ResponsiveContainer>
                  </div>
              </div>

              {/* Service Distribution of Revenue */}
              <div className="lg:col-span-4 bg-white p-6 rounded-[32px] border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div>
                     <h3 className="font-black text-slate-900 text-lg mb-1">Recettes par Service</h3>
                     <p className="text-slate-400 text-xs font-medium mb-6">Répartition par pôle d'activité médical</p>
                  </div>
                  <div className="h-44 relative flex items-center justify-center">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={revenuesByServiceData} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={50} 
                            outerRadius={80} 
                            paddingAngle={4} 
                            dataKey="value"
                          >
                            {revenuesByServiceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => value !== undefined && value !== null && !isNaN(Number(value)) ? `${Number(value).toLocaleString()} CFA` : '0 CFA'} />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                     {revenuesByServiceData.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-xs font-bold font-mono">
                           <div className="flex items-center gap-1.5 text-slate-600">
                             <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                             {item.name}
                           </div>
                           <span className="text-slate-900">{item.value.toLocaleString()} CFA</span>
                        </div>
                     ))}
                  </div>
              </div>
           </div>

           {/* Second Row of charts: Expenses by category & Net margins */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xs">
                  <h3 className="font-black text-slate-900 text-lg mb-1">Dépenses par catégorie</h3>
                  <p className="text-slate-400 text-xs font-medium mb-6">Visualisation de la répartition budgétaire des sorties financière</p>
                  <div className="h-64">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={expensesByCategoryData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} fontStyle="bold" />
                          <YAxis stroke="#94a3b8" fontSize={10} />
                          <Tooltip formatter={(value) => value !== undefined && value !== null && !isNaN(Number(value)) ? `${Number(value).toLocaleString()} CFA` : '0 CFA'} />
                          <Bar dataKey="value" fill="#ec4899" radius={[8, 8, 0, 0]}>
                            {expensesByCategoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
              </div>

              <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">Résultat Financier Estimé</h3>
                    <p className="text-slate-400 text-xs font-medium">Bilan global (Solde net intermédiaire de gestion)</p>
                  </div>
                  
                  <div className="my-8 text-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
                     <p className="text-xs uppercase font-black text-slate-400 tracking-widest">Résultat global = Recettes - Dépenses</p>
                     <p className={`text-4xl font-black mt-2 font-mono ${(totalRevenuesSum - totalExpensesSum) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {(totalRevenuesSum - totalExpensesSum).toLocaleString()} CFA
                     </p>
                     <p className="text-xs font-medium text-slate-500 mt-2">Marge opérationnelle nette de <span className="font-bold text-slate-900">{((totalRevenuesSum - totalExpensesSum)/totalRevenuesSum * 100 || 0).toFixed(1)}%</span></p>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-500">Taux de couverture des dépenses</span>
                        <span className="text-slate-900 font-mono">{(totalRevenuesSum / totalExpensesSum * 100 || 0).toFixed(1)}%</span>
                     </div>
                     <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(100, (totalRevenuesSum / (totalExpensesSum || 1)) * 10)}%` }}></div>
                     </div>
                  </div>
              </div>

           </div>
        </div>
      )}

      {/* TAB 2: RECETTES AUTOMATIQUES */}
      {activeTab === 'recettes' && (
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
           <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-slate-50/50">
              <div>
                 <h2 className="font-black text-slate-950 text-xl flex items-center gap-2"><DollarSign className="text-blue-600" /> Journal Général des Recettes</h2>
                 <p className="text-slate-500 text-xs font-medium">Recouvrements flux réels et synchronisés de la clinique</p>
              </div>

              {/* SEARCH & FILTER CHIPS */}
              <div className="flex flex-wrap gap-3 items-center">
                 <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Rechercher patient / code..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 w-44 font-mono"
                    />
                 </div>
                 <select 
                   value={filterService}
                   onChange={(e) => setFilterService(e.target.value)}
                   className="py-1.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                 >
                    <option value="all">Tous Services</option>
                    <option value="DOCTOR">Consultations</option>
                    <option value="LAB">Laboratoire</option>
                    <option value="PHARMACY">Pharmacie</option>
                    <option value="MATERNITY">Maternité</option>
                    <option value="NURSE">Hospitalisation</option>
                    <option value="URGENCE">Urgences</option>
                 </select>
                 <button 
                   onClick={() => {
                     // Simulated export
                     alert("Export du journal des recettes généré avec succès en format CSV (Téléchargements).");
                   }}
                   className="flex items-center gap-1 bg-slate-900 text-white px-3 py-1.5 rounded-xl font-bold text-xs hover:bg-blue-600 transition"
                 >
                    <DownloadCloud size={14} /> CSV
                 </button>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                 <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[9px] tracking-wider">
                    <tr>
                       <th className="p-4">Référence/Date</th>
                       <th className="p-4">Patient</th>
                       <th className="p-4">Service Source</th>
                       <th className="p-4">Désignation Acts</th>
                       <th className="p-4">Montant Payé</th>
                       <th className="p-4">Mode Paiement</th>
                       <th className="p-4">Encaisseur</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 font-medium">
                    {finalRevenues.length > 0 ? (
                      finalRevenues.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                           <td className="p-4">
                              <p className="font-bold text-slate-900 font-mono">{r.id}</p>
                              <p className="text-slate-400 text-[10px]">{new Date(r.date).toLocaleString('fr-FR')}</p>
                           </td>
                           <td className="p-4 font-bold text-slate-900">{r.patientName}</td>
                           <td className="p-4">
                              <span className="bg-slate-100 text-slate-700 font-black text-[9px] px-2 py-0.5 rounded-full uppercase">
                                 {r.requestingService}
                              </span>
                           </td>
                           <td className="p-4 text-slate-500 truncate max-w-xs">Actes médicaux ordonnés</td>
                           <td className="p-4 font-black font-mono text-emerald-600">{(r.amount).toLocaleString()} CFA</td>
                           <td className="p-4">
                              <span className="font-extrabold text-[10px] text-slate-700">
                                 {r.paymentMethod}
                              </span>
                           </td>
                           <td className="p-4 text-slate-500 font-semibold">{r.user}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">Aucune recette trouvée avec ces critères.</td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* TAB 3: DÉPENSES COMPLET */}
      {activeTab === 'depenses' && (
        <div className="space-y-8 animate-in fade-in duration-300">
           <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h2 className="font-black text-slate-950 text-xl flex items-center gap-2"><TrendingDown className="text-red-500" /> Saisie & Validation des Dépenses</h2>
                    <p className="text-slate-500 text-xs font-medium">Livre de compte des flux débiteurs de l'établissement</p>
                 </div>
                 <button 
                   onClick={() => setShowAddExpense(true)}
                   className="flex items-center gap-2 bg-rose-600 text-white px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md shadow-rose-600/10 hover:bg-rose-700 transition"
                 >
                    <Plus size={16} /> Enregistrer Dépense
                 </button>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-100 tracking-wider">
                       <tr>
                          <th className="p-4">Référence / Date</th>
                          <th className="p-4">Catégorie</th>
                          <th className="p-4">Désignation / Description</th>
                          <th className="p-4">Fournisseur</th>
                          <th className="p-4">Émetteur</th>
                          <th className="p-4">Montant Total</th>
                          <th className="p-4">Statut</th>
                          <th className="p-4 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                       {expenses.map((e) => (
                         <tr key={e.id} className={`hover:bg-slate-50 transition-colors ${e.status === 'CANCELLED' ? 'opacity-40 line-through' : ''}`}>
                            <td className="p-4">
                               <p className="font-black text-slate-900 font-mono">{e.reference}</p>
                               <p className="text-slate-400 text-[10px]">{e.date}</p>
                            </td>
                            <td className="p-4">
                               <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                  {e.category}
                               </span>
                            </td>
                            <td className="p-4 font-semibold text-slate-900">{e.description}</td>
                            <td className="p-4 text-slate-500 font-bold">{e.supplier}</td>
                            <td className="p-4 text-slate-400 font-medium">{e.createdBy}</td>
                            <td className="p-4 font-black text-rose-600 font-mono">{e.amount.toLocaleString()} CFA</td>
                            <td className="p-4">
                               <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                 e.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
                                 e.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                               }`}>
                                  {e.status === 'ACTIVE' ? 'Observé' : e.status === 'CANCELLED' ? 'Annulé' : 'Archivé'}
                               </span>
                            </td>
                            <td className="p-4 text-right">
                               {e.status === 'ACTIVE' && (
                                 <div className="flex justify-end gap-2">
                                    <button 
                                      onClick={() => handleCancelExpense(e.id)}
                                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                                      title="Annuler/Rembourser"
                                    >
                                       <Trash2 size={14} />
                                    </button>
                                    <button 
                                      onClick={() => handleArchiveExpense(e.id)}
                                      className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg transition"
                                      title="Archiver"
                                    >
                                       <X size={14} />
                                    </button>
                                 </div>
                               )}
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* ADD EXPENSE MODAL */}
           {showAddExpense && (
             <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50">
                <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-6">
                       <h3 className="font-black text-slate-900 text-lg flex items-center gap-2"><TrendingDown className="text-red-600" /> Saisir Dépense</h3>
                       <button onClick={() => setShowAddExpense(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
                    </div>
                    <form onSubmit={handleAddNewExpense} className="space-y-4">
                       <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Catégorie Dépense</label>
                          <select 
                            value={formExpense.category}
                            onChange={(e) => setFormExpense({...formExpense, category: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                             <option>Consommables médicaux</option>
                             <option>Médicaments</option>
                             <option>Réactifs laboratoire</option>
                             <option>Fournitures administratives</option>
                             <option>Maintenance</option>
                             <option>Électricité</option>
                             <option>Eau</option>
                             <option>Internet</option>
                             <option>Carburant</option>
                             <option>Salaires</option>
                             <option>Divers</option>
                          </select>
                       </div>
                       <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Désignation / Description</label>
                          <input 
                            type="text" 
                            required
                            placeholder="ex: Achat 200 kits perfuseurs..."
                            value={formExpense.description}
                            onChange={(e) => setFormExpense({...formExpense, description: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Montant (CFA)</label>
                             <input 
                               type="number" 
                               required
                               placeholder="Montant en CFA"
                               value={formExpense.amount}
                               onChange={(e) => setFormExpense({...formExpense, amount: e.target.value})}
                               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                             />
                          </div>
                          <div>
                             <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Date</label>
                             <input 
                               type="date" 
                               required
                               value={formExpense.date}
                               onChange={(e) => setFormExpense({...formExpense, date: e.target.value})}
                               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                             />
                          </div>
                       </div>
                       <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Fournisseur lié</label>
                          <input 
                            type="text" 
                            placeholder="ex: Sénégal Médical"
                            value={formExpense.supplier}
                            onChange={(e) => setFormExpense({...formExpense, supplier: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Justificatif (Simulé)</label>
                          <div className="border-2 border-dashed border-slate-200 p-4 text-center rounded-2xl cursor-pointer hover:bg-slate-50 transition">
                             <p className="text-[10px] text-slate-400 font-bold mb-1">Déposer ou cliquer pour attacher une facture PDF/Image</p>
                          </div>
                       </div>
                       <button className="w-full mt-4 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-tight rounded-xl transition shadow-lg shadow-rose-600/10">
                          Valider et Encaisser Dépense
                       </button>
                    </form>
                </div>
             </div>
           )}
        </div>
      )}

      {/* TAB 4: CRÉANCES PATIENTS */}
      {activeTab === 'creances' && (
        <div className="space-y-6 animate-in fade-in duration-300">
           {/* Alerts panels */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex gap-4 text-amber-900 shadow-xs">
                 <AlertTriangle size={32} className="text-amber-600 shrink-0 mt-1 animate-pulse" />
                 <div>
                    <h4 className="font-extrabold text-sm mb-1">Créances Dépassant le Plafond</h4>
                    <p className="text-xs text-amber-700 leading-relaxed mb-3">Plusieurs dossiers patients ont des encours supérieurs au seuil critique de <span className="font-bold text-slate-900">50,000 CFA</span>. Suivi agent requis pour recouvrement.</p>
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">Plafond de sécurité actif</span>
                 </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-3xl p-6 flex gap-4 text-red-900 shadow-xs">
                 <AlertTriangle size={32} className="text-red-600 shrink-0 mt-1" />
                 <div>
                    <h4 className="font-extrabold text-sm mb-1">Alerte Dettes Anciennes (&gt;30 jours)</h4>
                    <p className="text-xs text-red-700 leading-relaxed mb-3">Certains dossiers d'hospitalisation non clôturés sont restés en souffrance depuis plus d'un mois. Risque de perte comptable.</p>
                    <span className="bg-red-100 text-red-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">Relancer les correspondants</span>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h2 className="font-black text-slate-950 text-xl flex items-center gap-2"><AlertTriangle className="text-orange-500" /> Recouvrement des Créances Patients</h2>
                    <p className="text-slate-500 text-xs font-medium">Suivi automatisé calculé à partir de la facturation hospitalière</p>
                 </div>
                 <span className="bg-rose-50 text-rose-600 border border-rose-100 px-4 py-1.5 rounded-full text-xs font-black uppercase">
                    Encours Dû: {totalReceivablesSum.toLocaleString()} CFA
                 </span>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-100 tracking-wider">
                       <tr>
                          <th className="p-4">Dossier / Date d'admission</th>
                          <th className="p-4">Patient concerné</th>
                          <th className="p-4">Service Emetteur</th>
                          <th className="p-4">Age Dette (Jours)</th>
                          <th className="p-4">Encours Restant</th>
                          <th className="p-4">Niveau Alerte</th>
                          <th className="p-4 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                       {patientReceivablesFromRequests.map((deb, i) => (
                         <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                               <p className="font-black text-slate-900 font-mono">{deb.id}</p>
                               <p className="text-slate-400 text-[10px]">{deb.date}</p>
                            </td>
                            <td className="p-4 font-bold text-slate-900">{deb.patientName}</td>
                            <td className="p-4 text-slate-500 font-semibold">{deb.service}</td>
                            <td className="p-4 font-mono font-bold text-slate-900">{deb.delayDays} Jours</td>
                            <td className="p-4 font-black font-mono text-red-600">{deb.amountDue.toLocaleString()} CFA</td>
                            <td className="p-4">
                               <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                                 deb.delayDays > 30 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                               }`}>
                                  {deb.delayDays > 30 ? 'Impayé Critique' : 'En attente réglement'}
                               </span>
                            </td>
                            <td className="p-4 text-right">
                               <button 
                                 onClick={() => {
                                   alert(`Notification de rappel envoyée avec succès à ${deb.patientName} par SMS.`);
                                 }}
                                 className="px-3 py-1.5 bg-slate-900 text-white hover:bg-blue-600 transition text-[10px] font-black uppercase tracking-tight rounded-xl"
                               >
                                  Relancer
                               </button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {/* TAB 5: FOURNISSEURS */}
      {activeTab === 'fournisseurs' && (
        <div className="space-y-8 animate-in fade-in duration-300">
           <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h2 className="font-black text-slate-950 text-xl flex items-center gap-2"><Truck className="text-indigo-600" /> Gestion des Fournisseurs et Échéancier</h2>
                    <p className="text-slate-500 text-xs font-medium">Bilan des dettes et commandes auprès des distributeurs officiels</p>
                 </div>
                 <button 
                   onClick={() => setShowAddSupplier(true)}
                   className="flex items-center gap-1 bg-slate-950 text-white px-5 py-2.5 rounded-2xl font-bold text-xs hover:bg-blue-600 transition"
                 >
                    <Plus size={16} /> Nouveau Fournisseur
                 </button>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-100 tracking-wider">
                       <tr>
                          <th className="p-4">ID / Distributeur</th>
                          <th className="p-4">Catégorie Matériel</th>
                          <th className="p-4">Contact direct</th>
                          <th className="p-4">Adresse siège</th>
                          <th className="p-4">Volume total Achat</th>
                          <th className="p-4">Facture Restante due</th>
                          <th className="p-4">Prochaine Échéance</th>
                          <th className="p-4 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                       {suppliers.map((s) => (
                         <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-black text-slate-950">{s.name}</td>
                            <td className="p-4">
                               <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                  {s.category}
                               </span>
                            </td>
                            <td className="p-4 font-bold text-slate-900">{s.contact}</td>
                            <td className="p-4 text-slate-500 font-semibold">{s.address}</td>
                            <td className="p-4 font-black font-mono text-slate-900">{s.totalBought.toLocaleString()} CFA</td>
                            <td className="p-4 font-black font-mono text-rose-600">{s.outstandingDebt.toLocaleString()} CFA</td>
                            <td className="p-4 font-bold text-slate-900">{s.nextDeadline}</td>
                            <td className="p-4 text-right">
                               {s.outstandingDebt > 0 ? (
                                 <button 
                                   onClick={() => {
                                     setSelectedSupplierForPayment(s);
                                     setSuppPaymentAmount(s.outstandingDebt.toString());
                                   }}
                                   className="px-3 py-1.5 bg-rose-600 text-white hover:bg-slate-900 transition text-[10px] font-black uppercase tracking-tight rounded-xl"
                                 >
                                    Payer Facture
                                 </button>
                               ) : (
                                 <span className="text-emerald-500 font-bold flex items-center justify-end gap-1"><Check size={14} /> Réglé</span>
                               )}
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* ADD SUPPLIER MODAL */}
           {showAddSupplier && (
             <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50">
                <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-6">
                       <h3 className="font-black text-slate-900 text-lg flex items-center gap-2"><Truck className="text-indigo-600" /> Ajouter Fournisseur</h3>
                       <button onClick={() => setShowAddSupplier(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
                    </div>
                    <form onSubmit={handleAddNewSupplier} className="space-y-4">
                       <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Nom du distributeur/société</label>
                          <input 
                            type="text" 
                            required
                            placeholder="ex: SANOFI Afrique..."
                            value={formSupplier.name}
                            onChange={(e) => setFormSupplier({...formSupplier, name: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Téléphone de contact</label>
                          <input 
                            type="text" 
                            placeholder="+221..."
                            value={formSupplier.contact}
                            onChange={(e) => setFormSupplier({...formSupplier, contact: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Siége commercial</label>
                          <input 
                            type="text" 
                            placeholder="ex: Dakar Ouest"
                            value={formSupplier.address}
                            onChange={(e) => setFormSupplier({...formSupplier, address: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Catégorie d'approvisionnement</label>
                          <select 
                            value={formSupplier.category}
                            onChange={(e) => setFormSupplier({...formSupplier, category: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                             <option>Consommables médicaux</option>
                             <option>Médicaments</option>
                             <option>Réactifs laboratoire</option>
                             <option>Fournitures administratives</option>
                             <option>Services généraux</option>
                          </select>
                       </div>
                       <button className="w-full mt-4 py-3.5 bg-indigo-600 hover:bg-slate-950 text-white font-bold text-xs uppercase tracking-tight rounded-xl transition shadow-lg">
                          Créer Fiche Fournisseur
                       </button>
                    </form>
                </div>
             </div>
           )}

           {/* REGLEMENT FACTURE FOURNISSEUR MODAL */}
           {selectedSupplierForPayment && (
             <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50">
                <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-6">
                       <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">Paiement Facture Fournisseur</h3>
                       <button onClick={() => setSelectedSupplierForPayment(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
                    </div>
                    <form onSubmit={handlePaySupplierInvoice} className="space-y-4">
                       <p className="text-xs font-medium text-slate-500 leading-relaxed mb-4">
                          Vous allez solder/régler la facture due à <span className="font-extrabold text-slate-900">{selectedSupplierForPayment.name}</span>. Cette opération va s'imputer directement sur le solde de la Banque pour un montant maximal de <span className="font-black font-mono text-rose-500">{selectedSupplierForPayment.outstandingDebt.toLocaleString()} CFA</span>.
                       </p>
                       <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Montant à payer (CFA)</label>
                          <input 
                            type="number" 
                            required
                            max={selectedSupplierForPayment.outstandingDebt}
                            placeholder="Entrez le montant"
                            value={suppPaymentAmount}
                            onChange={(e) => setSuppPaymentAmount(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                       </div>
                       <button className="w-full mt-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-tight rounded-xl transition shadow-lg">
                          Confirmer l'opération comptable
                       </button>
                    </form>
                </div>
             </div>
           )}
        </div>
      )}

      {/* TAB 6: SALAIRES ET RH (PAYROLL) */}
      {activeTab === 'salaires' && (
        <div className="space-y-8 animate-in fade-in duration-300">
           <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                 <div>
                    <h2 className="font-black text-slate-950 text-xl flex items-center gap-2"><Users className="text-blue-600" /> Livre de Paie du Personnel (Salaires)</h2>
                    <p className="text-slate-500 text-xs font-medium">Bilan salarial net mensuel, primes de garde et retenues d'impôt</p>
                 </div>
                 <span className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 px-3 py-1 rounded-full">Intégré au dossier RH</span>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-100 tracking-wider">
                       <tr>
                          <th className="p-4">ID / Employé</th>
                          <th className="p-4">Poste médical / Spéc</th>
                          <th className="p-4">Base Brut</th>
                          <th className="p-4">Prime Rendement</th>
                          <th className="p-4">Heures Garde</th>
                          <th className="p-4">Retenues Taxe/Ipres</th>
                          <th className="p-4">Salaire Net Estimé</th>
                          <th className="p-2 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                       {staffSalaries.map((st) => {
                         const brut = st.baseSalary + st.primes + st.gardes;
                         const net = brut - st.deductions;
                         return (
                           <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-4 font-black text-slate-950">{st.name}</td>
                              <td className="p-4 text-slate-500 font-semibold">{st.role} • {st.specialty}</td>
                              <td className="p-4 font-mono">{(st.baseSalary).toLocaleString()} CFA</td>
                              <td className="p-4 font-mono text-emerald-600">+{(st.primes || 0).toLocaleString()} CFA</td>
                              <td className="p-4 font-mono text-emerald-600">+{(st.gardes || 0).toLocaleString()} CFA</td>
                              <td className="p-4 font-mono text-red-500">-{(st.deductions).toLocaleString()} CFA</td>
                              <td className="p-4 font-black font-mono text-slate-900">{(net).toLocaleString()} CFA</td>
                              <td className="p-2 text-right">
                                 <button 
                                   onClick={() => setSelectedEmployeeForPayslip(st)}
                                   className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white hover:bg-indigo-600 transition text-[10px] font-black uppercase tracking-tight rounded-xl ml-auto"
                                 >
                                    <FileText size={12} /> Bulletin
                                 </button>
                              </td>
                           </tr>
                         );
                       })}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* PAYSLIP BULLETIN PRINT MODAL */}
           {selectedEmployeeForPayslip && (
             <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50">
                <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-2xl w-full max-w-xl animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                       <h3 className="font-black text-slate-900 text-lg flex items-center gap-2"><Award className="text-indigo-600" /> Bulletin de Paie Officiel</h3>
                       <button onClick={() => setSelectedEmployeeForPayslip(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
                    </div>
                    
                    {/* Payslip content frame */}
                    <div className="p-6 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-6 text-slate-900 leading-snug">
                       <div className="flex justify-between items-start">
                          <div>
                             <h4 className="font-black text-slate-950 uppercase tracking-tight text-lg">SmartHosto CLINIC</h4>
                             <p className="text-[10px] text-slate-500 font-bold">Dakar, Sénégal • SIH intelligent</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Période de Paie</p>
                             <p className="text-xs font-bold text-slate-900">Mai 2026</p>
                          </div>
                       </div>

                       <div className="bg-white p-4 rounded-xl border border-slate-150 grid grid-cols-2 gap-4 text-xs font-medium">
                          <div>
                             <p className="text-[9px] font-black uppercase text-slate-400">Collaborateur</p>
                             <p className="font-extrabold text-slate-900 text-sm mt-0.5">{selectedEmployeeForPayslip.name}</p>
                             <p className="text-slate-500 text-[11px] font-bold mt-1">ID Contrat: {selectedEmployeeForPayslip.id}</p>
                          </div>
                          <div>
                             <p className="text-[9px] font-black uppercase text-slate-400">Poste & Compte de charges</p>
                             <p className="font-extrabold text-blue-600 text-sm mt-0.5">{selectedEmployeeForPayslip.role}</p>
                             <p className="text-slate-500 text-[11px] font-bold mt-1">Direction médicale</p>
                          </div>
                       </div>

                       <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Détails des calculs de salaire</p>
                          <div className="bg-white rounded-xl border border-slate-150 divide-y divide-slate-100 text-xs font-medium font-mono">
                             <div className="flex justify-between p-3">
                                <span className="text-slate-600">Salaire de Base Brut</span>
                                <span className="text-slate-900">{selectedEmployeeForPayslip.baseSalary.toLocaleString()} CFA</span>
                             </div>
                             <div className="flex justify-between p-3 text-emerald-600">
                                <span>Primes & Commissions Activité ({selectedEmployeeForPayslip.actsCount} actes)</span>
                                <span>+{selectedEmployeeForPayslip.primes.toLocaleString()} CFA</span>
                             </div>
                             <div className="flex justify-between p-3 text-emerald-600">
                                <span>Indemnités Heures de Garde</span>
                                <span>+{selectedEmployeeForPayslip.gardes.toLocaleString()} CFA</span>
                             </div>
                             <div className="flex justify-between p-3 text-red-500">
                                <span>Retenues Fiscales & Prévoyance (IPRES, Impôts)</span>
                                <span>-{selectedEmployeeForPayslip.deductions.toLocaleString()} CFA</span>
                             </div>
                             <div className="flex justify-between p-4 bg-slate-950 text-white rounded-b-xl text-sm font-black">
                                <span>Salaire Net à verser</span>
                                <span className="text-cyan-400">{(selectedEmployeeForPayslip.baseSalary + selectedEmployeeForPayslip.primes + selectedEmployeeForPayslip.gardes - selectedEmployeeForPayslip.deductions).toLocaleString()} CFA</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                       <button 
                         onClick={() => {
                           alert("La commande d'impression physique a été envoyée avec succès à l'imprimante centrale.");
                         }}
                         className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 text-white py-3.5 rounded-xl font-bold text-xs uppercase"
                       >
                          <Printer size={16} /> Imprimer Bulletin
                       </button>
                    </div>
                </div>
             </div>
           )}
        </div>
      )}

      {/* TAB 7: QUOTES-PARTS MOTEUR DE REPARTITION */}
      {activeTab === 'quotes_parts' && (
        <div className="space-y-8 animate-in fade-in duration-300">
           
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Configuration panel */}
              <div className="lg:col-span-5 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                 <h3 className="font-black text-slate-950 text-lg flex items-center gap-2 mb-1"><Percent className="text-blue-600" /> Taux de Répartition</h3>
                 <p className="text-slate-400 text-xs font-medium mb-6">Ajuster ou modifier les redevances dues par acte de soin</p>
                 
                 <div className="space-y-4">
                    {quotePartsRules.map((rule, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="flex justify-between items-center mb-3">
                            <span className="font-bold text-slate-900 text-sm">{rule.service}</span>
                            <span className="text-xs bg-blue-100 text-blue-700 font-extrabold px-3 py-1 rounded-full">Redevance active</span>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Praticien / Docteur</p>
                               <div className="flex items-center gap-1">
                                  <input 
                                    type="number" 
                                    value={rule.providerPercent}
                                    onChange={(e) => {
                                      const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                      setQuotePartsRules(prev => prev.map((item, idx) => idx === i ? { ...item, providerPercent: val, facilityPercent: 100 - val } : item));
                                    }}
                                    className="p-1.5 w-16 text-center bg-white border rounded-lg text-xs font-bold"
                                  />
                                  <span className="text-xs font-black">%</span>
                               </div>
                            </div>
                            <div>
                               <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Etablissement / Clinique</p>
                               <div className="flex items-center gap-1 font-mono text-slate-500 text-xs font-bold select-none pt-1.5">
                                  <span>{rule.facilityPercent}%</span>
                               </div>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Shared earnings ledger */}
              <div className="lg:col-span-7 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col justify-between">
                 <div>
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <h3 className="font-black text-slate-950 text-lg">Moteur Automatique de Versement</h3>
                          <p className="text-slate-400 text-xs font-medium">Bilan redevances et bénéfice net par praticien</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-emerald-500 uppercase">Part Conservée Clinique</p>
                          <p className="text-lg font-black text-emerald-600 font-mono">{quotePartsSummary.clinicEarned.toLocaleString()} CFA</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                       <div className="p-4 bg-slate-50 border rounded-2xl">
                          <p className="text-[10px] font-black text-slate-400 uppercase">Masse globale versée aux médecins</p>
                          <p className="text-xl font-black font-mono text-slate-900 mt-1">{quotePartsSummary.physicianEarned.toLocaleString()} CFA</p>
                       </div>
                       <div className="p-4 bg-slate-950 text-white rounded-2xl">
                          <p className="text-[10px] font-black text-cyan-400 uppercase">Redevance Clinique Estimée</p>
                          <p className="text-xl font-black font-mono text-cyan-400 mt-1">{quotePartsSummary.clinicEarned.toLocaleString()} CFA</p>
                       </div>
                    </div>

                    <div className="space-y-3 font-medium text-xs">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calcul auto sur les recettes réelles</p>
                       <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
                          {quotePartsSummary.items.slice(0, 5).map((it, i) => (
                            <div key={i} className="p-3.5 flex justify-between items-center bg-slate-50/20">
                               <div>
                                  <p className="font-bold text-slate-900">{it.doctorName}</p>
                                  <p className="text-[10px] text-slate-400 font-bold">{it.service} • Acte {it.id}</p>
                               </div>
                               <div className="text-right font-mono">
                                  <p className="text-indigo-600 font-black">+{it.providerAmt.toLocaleString()} CFA Dr.</p>
                                  <p className="text-slate-400 text-[10px] font-bold">+{it.clinicAmt.toLocaleString()} CFA Clinique</p>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

           </div>
        </div>
      )}

      {/* TAB 8: COMPTABILITE ANALYTIQUE */}
      {activeTab === 'analytique' && (
        <div className="space-y-8 animate-in fade-in duration-300">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-4 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col justify-between">
                 <div>
                    <h3 className="font-black text-slate-950 text-lg">Bilan de Rentabilité Analytique</h3>
                    <p className="text-slate-400 text-xs font-medium mb-6">Marge de contribution par centre de coûts médical et logistique</p>
                 </div>
                 
                 <div className="space-y-4">
                    {costCenters.map((cc, i) => (
                      <div key={i} className="flex flex-col text-xs font-bold gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                         <div className="flex justify-between items-center">
                            <span className="text-slate-900">{cc.name}</span>
                            <span className={cc.result >= 0 ? 'text-emerald-600' : 'text-red-500 font-black'}>
                               {cc.result >= 0 ? `+${cc.result.toLocaleString()} CFA` : `${cc.result.toLocaleString()} CFA`}
                            </span>
                         </div>
                         <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-1.5 rounded-full ${cc.result >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                              style={{ width: `${Math.min(100, Math.max(10, (cc.revenues / (cc.expenses || 1)) * 40))}%` }}
                            ></div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Cost centers Table details */}
              <div className="lg:col-span-8 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                 <h3 className="font-black text-slate-950 text-lg mb-1">Détails des Imputations par Section</h3>
                 <p className="text-slate-400 text-xs font-medium mb-6">Allocation analytique des produits, charges directes et indirectes</p>
                 
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                       <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-100 tracking-wider">
                          <tr>
                             <th className="p-4">Code / Centre de coût</th>
                             <th className="p-4">Section Analytique</th>
                             <th className="p-4">Recettes Directes</th>
                             <th className="p-4">Charges & utilities</th>
                             <th className="p-4 text-right">Résultat Intermédiaire</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 font-semibold font-mono">
                          {costCenters.map((cc, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                               <td className="p-4 text-slate-400 font-bold">BU-0{i+1}</td>
                               <td className="p-4 font-black font-sans text-slate-900">{cc.name}</td>
                               <td className="p-4 text-emerald-600">{(cc.revenues).toLocaleString()} CFA</td>
                               <td className="p-4 text-slate-500">{(cc.expenses).toLocaleString()} CFA</td>
                               <td className={`p-4 text-right font-black ${cc.result >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                  {(cc.result).toLocaleString()} CFA
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>

           </div>
        </div>
      )}

      {/* TAB 9: TRESORERIE */}
      {activeTab === 'tresorerie' && (
        <div className="space-y-8 animate-in fade-in duration-300">
           
           {/* Account list */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {treasuryAccounts.map((account, i) => (
                <div key={i} className="p-6 bg-white rounded-3xl border border-slate-150 shadow-xs flex flex-col justify-between">
                   <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">{account.type}</p>
                      <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{account.name}</h4>
                   </div>
                   <div className="mt-6 border-t pt-4">
                      <p className="text-xl font-black font-mono text-slate-950">{account.balance.toLocaleString()} <span className="text-[10px] font-semibold text-slate-500">CFA</span></p>
                      <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-black uppercase mt-2 inline-block">Active</span>
                   </div>
                </div>
              ))}
           </div>

           {/* Ledger entries mock ledger */}
           <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                 <h3 className="font-black text-slate-950 text-xl flex items-center gap-2"><Landmark className="text-blue-600" /> Grand Livre des Mouvements de Fonds</h3>
                 <p className="text-slate-500 text-xs font-medium">Flux de trésorerie réel entre la caisse, les comptes bancaires et les comptes de Mobile Money</p>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left text-xs font-medium">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-100 tracking-wider">
                       <tr>
                          <th className="p-4">Heure / Type de mouvement</th>
                          <th className="p-4">Compte Source</th>
                          <th className="p-4">Compte Cible</th>
                          <th className="p-4">Motif Description</th>
                          <th className="p-4 font-mono">Montant</th>
                          <th className="p-4">Statut de l'opération</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold font-mono">
                       {[
                         { date: 'Aujourd\'hui, 10:25', type: 'Dépôt', source: 'Caisse Centrale', target: 'Compte SGBS', desc: 'Versement recettes espèces d\'hier', amount: 850000, color: 'text-slate-900' },
                         { date: 'Aujourd\'hui, 09:15', type: 'Retrait', source: 'CBAO Bank', target: 'Caisse Centrale', desc: 'Alimentation fonds de caisse du jour', amount: 200000, color: 'text-slate-900' },
                         { date: 'Hier, 15:00', type: 'Virement', source: 'Orange Money Corp', target: 'Compte CBAO', desc: 'Balancement recettes Orange money', amount: 1500000, color: 'text-slate-900' },
                       ].map((m, i) => (
                         <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                               <p className="font-bold text-slate-900 font-sans">{m.type}</p>
                               <span className="text-slate-400 font-sans font-medium text-[10px]">{m.date}</span>
                            </td>
                            <td className="p-4 font-sans text-slate-700">{m.source}</td>
                            <td className="p-4 font-sans text-slate-700">{m.target}</td>
                            <td className="p-4 font-sans text-slate-500 font-medium">{m.desc}</td>
                            <td className={`p-4 font-black ${m.color}`}>{m.amount.toLocaleString()} CFA</td>
                            <td className="p-4">
                               <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1 w-max">
                                  <Check size={12} /> Réconcilié
                                </span>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {/* TAB 10: RAPPORTS AUTOMATIQUES */}
      {activeTab === 'rapports' && (
        <div className="space-y-8 animate-in fade-in duration-300">
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {[
                { name: 'Rapport Journalier', desc: 'Synthèse des mouvements financiers des dernières 24h', icon: FileText, delay: '0h' },
                { name: 'Rapport Hebdomadaire', desc: 'Analyse hebdomadaire des recettes et quotes-parts', icon: FileText, delay: '12h' },
                { name: 'Rapport Mensuel', desc: 'Compte de résultat médical et analytique du mois', icon: FileSpreadsheet, delay: '1j' },
                { name: 'Rapport Trimestriel', desc: 'Dépouillement budgétaire sur 3 mois consolidés', icon: FileSpreadsheet, delay: 'A jour' },
                { name: 'Rapport Annuel', desc: 'Liasse fiscale hospitalière et bilan de fin d\'exercice', icon: Award, delay: 'A jour' },
              ].map((rap, i) => (
                <div key={i} className="p-6 bg-white rounded-3xl border border-slate-150 flex flex-col justify-between hover:border-blue-300 cursor-pointer transition">
                   <div>
                      <rap.icon size={26} className="text-blue-600 mb-4" />
                      <h4 className="font-extrabold text-slate-950 text-sm leading-snug mb-1">{rap.name}</h4>
                      <p className="text-slate-400 font-medium text-[11px] leading-relaxed">{rap.desc}</p>
                   </div>
                   <div className="mt-8 border-t pt-4 flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                      <span>{rap.delay}</span>
                      <button 
                        onClick={() => {
                          alert(`Génération du rapport '${rap.name}' lancée. Le fichier PDF a été compilé.`);
                        }}
                        className="text-blue-600 hover:text-slate-900 font-bold"
                      >
                         Générer PDF
                      </button>
                   </div>
                </div>
              ))}
           </div>

           <div className="bg-white rounded-[32px] border border-slate-200 p-8 text-center text-slate-500 max-w-xl mx-auto shadow-xs">
              <Building2 size={36} className="text-slate-300 mx-auto mb-4" />
              <h4 className="font-extrabold text-slate-900 text-base mb-1">Moteur d'édition financière consolidée</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                 Le système d'information de l'hôpital compile en arrière-plan toutes les écritures issues de la pharmacie, des encaissements de chirurgie, des redevances d'analyses et des dépenses de maintenance pour garantir un rapprochement constant à 100%.
              </p>
           </div>
        </div>
      )}

      {/* TAB 11: AUDIT COMPTABILITE */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
           <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                 <h3 className="font-black text-slate-950 text-xl flex items-center gap-2"><ShieldCheck className="text-blue-600" /> Journal de Traçabilité Financière (Audit Trail)</h3>
                 <p className="text-slate-500 text-xs font-medium">Historique inaltérable de toute opération de création, modification ou suppression financière</p>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-black uppercase">Tracer actif à 100%</span>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                 <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-100 tracking-wider">
                    <tr>
                       <th className="p-4">Identifiant / Horodatage</th>
                       <th className="p-4">Opérateur</th>
                       <th className="p-4">Type Mouvement</th>
                       <th className="p-4">Désignation de l'action</th>
                       <th className="p-4">Ancienne valeur</th>
                       <th className="p-4">Nouvelle valeur</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 font-medium font-mono">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                         <td className="p-4">
                            <p className="font-bold text-slate-900">{log.id}</p>
                            <p className="text-[10px] text-slate-400 font-sans font-medium">{log.timestamp}</p>
                         </td>
                         <td className="p-4 font-bold text-slate-900 font-sans">{log.user}</td>
                         <td className="p-4">
                            <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded-lg font-sans">
                               {log.action}
                            </span>
                         </td>
                         <td className="p-4 text-slate-500 font-sans font-semibold">{log.details}</td>
                         <td className="p-4 text-slate-400 font-bold">{log.oldValue}</td>
                         <td className="p-4 text-slate-900 font-extrabold">{log.newValue}</td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

    </div>
  );
};
