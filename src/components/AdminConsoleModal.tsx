import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Copy,
  Check,
  Search,
  Users,
  KeyRound,
  Sparkles,
  Smartphone,
  Calendar,
  Layers,
  Trash2,
  RefreshCw,
  Share2,
  ShieldCheck,
  Zap,
  Crown,
  FileText,
  DollarSign,
  TrendingUp,
  Download,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { ClientSubscription, UserPlan, BoutiqueProfile } from '../types';
import {
  getStoredSubscriptions,
  saveStoredSubscriptions,
  createClientSubscription,
  updateClientSubscription,
  deleteClientSubscription,
  generateAccessCode,
  formatWhatsAppMessage,
  redeemAccessCode,
} from '../services/subscriptionService';
import { audioSynth } from '../utils/audioSynth';

interface AdminConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: BoutiqueProfile;
  onProfileUpdate: (updated: BoutiqueProfile) => void;
}

export const AdminConsoleModal: React.FC<AdminConsoleModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onProfileUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'stats' | 'test'>('create');
  const [subscriptions, setSubscriptions] = useState<ClientSubscription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'used' | 'expired'>('all');

  // Form State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<UserPlan>('STANDARD');
  const [creditsGranted, setCreditsGranted] = useState<number>(150);
  const [validDays, setValidDays] = useState<number>(30);
  const [customCode, setCustomCode] = useState('');
  const [notes, setNotes] = useState('');
  const [createdSub, setCreatedSub] = useState<ClientSubscription | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [whatsappCopied, setWhatsappCopied] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Test code input
  const [testCodeInput, setTestCodeInput] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);

  // Load subscriptions on open
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    const data = getStoredSubscriptions();
    setSubscriptions(data);
  };

  if (!isOpen) return null;

  // Plan configuration presets
  const handlePlanChange = (plan: UserPlan) => {
    setSelectedPlan(plan);
    if (plan === 'START') {
      setCreditsGranted(50);
      setValidDays(30);
    } else if (plan === 'STANDARD') {
      setCreditsGranted(150);
      setValidDays(60);
    } else if (plan === 'PREMIUM') {
      setCreditsGranted(500);
      setValidDays(90);
    } else if (plan === 'VIP_UNLIMITED') {
      setCreditsGranted(9999);
      setValidDays(0);
    }
  };

  const handleGenerateRandomCode = () => {
    const newCode = generateAccessCode('VP', selectedPlan);
    setCustomCode(newCode);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newSub = createClientSubscription({
        clientName: clientName.trim() || 'Cliente Vendeuse',
        clientPhone: clientPhone.trim(),
        plan: selectedPlan,
        creditsGranted: Number(creditsGranted),
        validDays: Number(validDays),
        customCode: customCode.trim() || undefined,
        notes: notes.trim(),
      });

      setCreatedSub(newSub);
      loadData();
      audioSynth.playSuccessChime();
      setFeedbackMsg({
        type: 'success',
        text: `Code ${newSub.accessCode} créé avec succès pour ${newSub.clientName} !`,
      });

      // Clear form for next entry
      setClientName('');
      setClientPhone('');
      setCustomCode('');
      setNotes('');
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Erreur lors de la création du code.',
      });
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    audioSynth.playClickSound();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyWhatsApp = (sub: ClientSubscription) => {
    const msg = formatWhatsAppMessage(sub);
    navigator.clipboard.writeText(msg);
    setWhatsappCopied(true);
    audioSynth.playClickSound();
    setTimeout(() => setWhatsappCopied(false), 2500);
  };

  const handleDelete = (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer cet abonnement ?')) {
      deleteClientSubscription(id);
      loadData();
      if (createdSub?.id === id) setCreatedSub(null);
    }
  };

  const handleRenewOrAddCredits = (sub: ClientSubscription, addCredits: number) => {
    const updated: ClientSubscription = {
      ...sub,
      creditsGranted: sub.creditsGranted + addCredits,
      status: 'active',
      expiresAt: sub.validDays > 0 ? new Date(Date.now() + sub.validDays * 24 * 60 * 60 * 1000).toISOString() : null,
    };
    updateClientSubscription(updated);
    loadData();
    audioSynth.playSuccessChime();
  };

  const handleTestRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    const result = redeemAccessCode(testCodeInput, currentProfile);
    if (result.success && result.updatedProfile) {
      onProfileUpdate(result.updatedProfile);
      audioSynth.playSuccessChime();
      setTestResult(result.message);
      loadData();
    } else {
      audioSynth.playNoticeSound();
      setTestResult(result.message);
    }
  };

  // Filtered subscriptions
  const filteredSubs = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.accessCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.clientPhone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalCredits = subscriptions.reduce((acc, s) => acc + s.creditsGranted, 0);
  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const usedCount = subscriptions.filter((s) => s.status === 'used').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 text-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-700/80 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/70 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  Console Super Admin & Abonnements
                </h3>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  PIN 761278 OK
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Génération de codes de connexion, gestion des clientes et distribution de crédits
              </p>
            </div>
          </div>

          <button
            id="btn-close-admin-console"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 pb-2 bg-slate-900 border-b border-slate-800 flex gap-2 overflow-x-auto shrink-0">
          <button
            id="admin-tab-create"
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md'
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Code Client</span>
          </button>

          <button
            id="admin-tab-list"
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'list'
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md'
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Abonnements ({subscriptions.length})</span>
          </button>

          <button
            id="admin-tab-stats"
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'stats'
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md'
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Statistiques & Bilan</span>
          </button>

          <button
            id="admin-tab-test"
            onClick={() => setActiveTab('test')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'test'
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md'
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Tester Code</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-grow space-y-6">

          {/* Alert feedback */}
          {feedbackMsg && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 border ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}
            >
              <span>{feedbackMsg.text}</span>
              <button
                onClick={() => setFeedbackMsg(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 1: CREATE SUBSCRIPTION CODE */}
          {activeTab === 'create' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Column */}
              <div className="lg:col-span-7 space-y-4">
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  
                  {/* Client Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Nom de la Cliente / Boutique
                      </label>
                      <input
                        id="admin-input-client-name"
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Ex: Fatou Glam Dakar"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Numéro WhatsApp / Mobile
                      </label>
                      <input
                        id="admin-input-client-phone"
                        type="text"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="Ex: +221 77 123 45 67"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Plan Choice Pills */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Formule d'Abonnement
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'START', label: 'START', credits: 50, color: 'border-slate-600' },
                        { id: 'STANDARD', label: 'STANDARD', credits: 150, color: 'border-rose-500' },
                        { id: 'PREMIUM', label: 'PREMIUM', credits: 500, color: 'border-amber-500' },
                        { id: 'VIP_UNLIMITED', label: 'VIP ILLIMITÉ', credits: 9999, color: 'border-purple-500' },
                      ].map((planItem) => (
                        <button
                          key={planItem.id}
                          type="button"
                          onClick={() => handlePlanChange(planItem.id as UserPlan)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            selectedPlan === planItem.id
                              ? 'bg-amber-500/20 border-amber-400 text-white shadow-sm ring-1 ring-amber-400'
                              : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-extrabold">{planItem.label}</span>
                            {selectedPlan === planItem.id && (
                              <Check className="w-3.5 h-3.5 text-amber-400" />
                            )}
                          </div>
                          <p className="text-[10px] text-amber-300 font-semibold">
                            {planItem.credits === 9999 ? 'Illimité' : `+${planItem.credits} crédits`}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Credits & Validity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Crédits accordés
                      </label>
                      <input
                        id="admin-input-credits"
                        type="number"
                        min="1"
                        max="99999"
                        value={creditsGranted}
                        onChange={(e) => setCreditsGranted(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-amber-400 focus:outline-none font-bold text-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Durée de validité (Jours)
                      </label>
                      <select
                        id="admin-select-validity"
                        value={validDays}
                        onChange={(e) => setValidDays(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-amber-400 focus:outline-none"
                      >
                        <option value={30}>30 Jours (1 mois)</option>
                        <option value={60}>60 Jours (2 mois)</option>
                        <option value={90}>90 Jours (3 mois)</option>
                        <option value={180}>180 Jours (6 mois)</option>
                        <option value={365}>365 Jours (1 an)</option>
                        <option value={0}>Permanent / Illimité (À vie)</option>
                      </select>
                    </div>
                  </div>

                  {/* Code generator / Custom Code */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Code de Connexion Client
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateRandomCode}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Générer un code aléatoire</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="admin-input-custom-code"
                        type="text"
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                        placeholder="Ex: VP-FATOU-2026 ou laisser vide pour auto"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-sm focus:border-amber-400 focus:outline-none uppercase tracking-wider"
                      />
                      <KeyRound className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Notes internes (Mode de paiement, date, etc.)
                    </label>
                    <input
                      id="admin-input-notes"
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex: Paiement Wave 12 500 FCFA reçu le 17/08"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    id="btn-admin-submit-subscription"
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Créer le Code & Enregistrer l'Abonnement</span>
                  </button>
                </form>
              </div>

              {/* Live Output & WhatsApp Preview Column */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Résultat & Message WhatsApp
                  </h4>

                  {createdSub ? (
                    <div className="space-y-3.5">
                      {/* Code Card */}
                      <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 border border-amber-500/40 text-center relative">
                        <p className="text-[11px] text-slate-400 uppercase tracking-wider">
                          Code pour {createdSub.clientName}
                        </p>
                        <div className="text-xl sm:text-2xl font-black font-mono text-amber-300 my-1 tracking-wider select-all">
                          {createdSub.accessCode}
                        </div>
                        <p className="text-xs text-emerald-400 font-bold">
                          +{createdSub.creditsGranted} crédits • Formule {createdSub.plan}
                        </p>

                        <button
                          type="button"
                          onClick={() => handleCopyCode(createdSub.accessCode, 'created')}
                          className="mt-3 w-full py-2 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          {copiedId === 'created' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Code copié !</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copier uniquement le code</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* WhatsApp Share Button */}
                      <button
                        type="button"
                        onClick={() => handleCopyWhatsApp(createdSub)}
                        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all cursor-pointer"
                      >
                        {whatsappCopied ? (
                          <>
                            <Check className="w-4 h-4 text-white" />
                            <span>Message WhatsApp Copié !</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-4 h-4" />
                            <span>📲 Copier le Message WhatsApp Complet</span>
                          </>
                        )}
                      </button>

                      {/* Message Preview */}
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                        {formatWhatsAppMessage(createdSub)}
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 text-center text-slate-500 text-xs space-y-2">
                      <KeyRound className="w-8 h-8 mx-auto text-slate-600" />
                      <p>Remplissez le formulaire à gauche pour générer un code client et préparer le message WhatsApp.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUBSCRIPTIONS LIST & MANAGEMENT */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              
              {/* Search & Filter Header */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-grow max-w-md">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher par cliente, téléphone ou code..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>

                <div className="flex gap-1.5 overflow-x-auto">
                  {(['all', 'active', 'used', 'expired'] as const).map((filterKey) => (
                    <button
                      key={filterKey}
                      onClick={() => setStatusFilter(filterKey)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer capitalize whitespace-nowrap ${
                        statusFilter === filterKey
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {filterKey === 'all'
                        ? `Tous (${subscriptions.length})`
                        : filterKey === 'active'
                        ? 'Actifs'
                        : filterKey === 'used'
                        ? 'Utilisés'
                        : 'Expirés'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subscriptions Grid/Table */}
              {filteredSubs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredSubs.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-3 relative hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-extrabold text-white text-sm">
                              {sub.clientName}
                            </h5>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                sub.plan === 'VIP_UNLIMITED'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : sub.plan === 'PREMIUM'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : sub.plan === 'STANDARD'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-slate-700 text-slate-300'
                              }`}
                            >
                              {sub.plan}
                            </span>
                          </div>
                          {sub.clientPhone && (
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                              <Smartphone className="w-3 h-3 text-slate-500" />
                              {sub.clientPhone}
                            </p>
                          )}
                        </div>

                        {/* Status badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            sub.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : sub.status === 'used'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {sub.status === 'active'
                            ? '● Actif'
                            : sub.status === 'used'
                            ? '✓ Activé'
                            : '✕ Expiré'}
                        </span>
                      </div>

                      {/* Code Strip */}
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2 font-mono">
                        <div>
                          <span className="text-xs text-slate-500 block text-[10px]">CODE D'ACCÈS</span>
                          <span className="text-sm font-black text-amber-300 tracking-wider">
                            {sub.accessCode}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(sub.accessCode, sub.id)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedId === sub.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedId === sub.id ? 'Copié' : 'Copier'}</span>
                        </button>
                      </div>

                      {/* Details row */}
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-700/50">
                        <span className="font-semibold text-amber-400">
                          {sub.creditsGranted === 9999 ? 'Crédits Illimités' : `${sub.creditsGranted} crédits`}
                        </span>
                        <span>
                          {sub.validDays > 0 ? `${sub.validDays} jours` : 'Permanent'}
                        </span>
                        {sub.notes && (
                          <span className="text-[11px] text-slate-500 truncate max-w-[120px]" title={sub.notes}>
                            {sub.notes}
                          </span>
                        )}
                      </div>

                      {/* Card Action Buttons */}
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleCopyWhatsApp(sub)}
                          className="py-1.5 px-2 bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-600/40 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRenewOrAddCredits(sub, 50)}
                          className="py-1.5 px-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          title="Ajouter +50 crédits"
                        >
                          <Plus className="w-3 h-3 text-amber-400" />
                          <span>+50 Crédits</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(sub.id)}
                          className="py-1.5 px-2 bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 border border-rose-800/40 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <Users className="w-8 h-8 mx-auto text-slate-600" />
                  <p>Aucun abonnement ne correspond à votre recherche.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STATS & SUMMARY */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              
              {/* Stat metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Total Abonnés</p>
                  <p className="text-2xl font-extrabold text-white mt-1">{subscriptions.length}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Abonnements Actifs</p>
                  <p className="text-2xl font-extrabold text-emerald-400 mt-1">{activeCount}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Codes Utilisés</p>
                  <p className="text-2xl font-extrabold text-indigo-400 mt-1">{usedCount}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Crédits Distribués</p>
                  <p className="text-2xl font-extrabold text-amber-400 mt-1">{totalCredits}</p>
                </div>
              </div>

              {/* Instructions for Manager */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 border border-indigo-500/30 space-y-3">
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Guide d'exploitation pour le Gestionnaire VendeusePro
                </h4>
                <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                  <p>
                    • <strong>1. Encaissement client</strong> : Vous recevez le paiement par Wave, Orange Money, Moov ou MTN MoMo de votre cliente.
                  </p>
                  <p>
                    • <strong>2. Création du code</strong> : Dans l'onglet <em>"Nouveau Code Client"</em>, saisissez le nom de la cliente et choisissez sa formule.
                  </p>
                  <p>
                    • <strong>3. Envoi WhatsApp</strong> : Cliquez sur <em>"Copier le Message WhatsApp"</em> et collez-le directement dans votre conversation avec la cliente.
                  </p>
                  <p>
                    • <strong>4. Activation immédiate</strong> : La cliente entre son code dans son profil ou au démarrage de l'app pour débloquer immédiatement ses crédits et son statut.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TEST CODE REDEEM */}
          {activeTab === 'test' && (
            <div className="max-w-md mx-auto py-4 space-y-4">
              <div className="p-6 rounded-3xl bg-slate-800 border border-slate-700 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-base">
                    Tester l'activation d'un code
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Vérifiez comment un code d'accès recharge instantanément les crédits et active l'abonnement
                  </p>
                </div>

                <form onSubmit={handleTestRedeem} className="space-y-3">
                  <input
                    id="admin-test-code-input"
                    type="text"
                    required
                    value={testCodeInput}
                    onChange={(e) => setTestCodeInput(e.target.value.toUpperCase())}
                    placeholder="Ex: VP-START-50 ou VIP-761278-PASS"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-center text-base uppercase tracking-wider font-bold focus:border-amber-400 focus:outline-none"
                  />

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl transition-all cursor-pointer text-sm"
                  >
                    Valider & Activer sur mon compte
                  </button>
                </form>

                {testResult && (
                  <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-700 text-xs font-semibold text-amber-300">
                    {testResult}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
