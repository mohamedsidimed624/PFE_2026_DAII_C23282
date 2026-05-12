import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CreditCard, CheckCircle2, Clock, AlertTriangle,
  X, Loader2, Calendar, RefreshCw, ShieldCheck, Copy, Check,
} from "lucide-react";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import {
  getMyCotisations, getCotisationCourante,
  initierPaiement, confirmerPaiement,
} from "../../services/cotisationApi";

// ── Status helpers ────────────────────────────────────────────────────────────

function statutMeta(statut) {
  if (statut === "PAYEE")      return { label: "Payée",      cls: "border-green-200 bg-green-50 text-green-700",  dot: "bg-green-500"  };
  if (statut === "EN_RETARD")  return { label: "En retard",  cls: "border-red-200 bg-red-50 text-red-700",        dot: "bg-red-500"    };
  return                              { label: "En attente", cls: "border-amber-200 bg-amber-50 text-amber-700",  dot: "bg-amber-500"  };
}

function StatutBadge({ statut }) {
  const { label, cls, dot } = statutMeta(statut);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

// ── Bankily payment modal ─────────────────────────────────────────────────────

const MERCHANT_CODE = "ONMM01";

function BankilyModal({ data, onConfirm, onClose, loading }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(MERCHANT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleConfirm = async () => {
    if (!/^[234]\d{7}$/.test(phone.trim())) {
      setErr("Le numéro doit contenir 8 chiffres et commencer par 2, 3 ou 4.");
      return;
    }

    if (!/^\d{4}$/.test(code.trim())) {
      setErr("Le code B-Pay doit contenir 4 chiffres.");
      return;
    }

    setErr("");
    try {
      await onConfirm(code.trim());
    } catch (e) {
      setErr(e.response?.data?.message || "Code incorrect. Veuillez réessayer.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 16 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Paiement Bankily B-Pay
                </h2>
                <p className="text-xs text-slate-500">
                  Vérifiez les informations avant confirmation.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Payment summary */}
        <div className="bg-slate-50 px-6 py-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">
                Montant à payer
              </span>
              <span className="text-2xl font-black text-slate-900">
                {data.montant} MRU
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Référence</span>
                <span className="max-w-[220px] truncate font-mono text-xs font-bold text-slate-700">
                  {data.referenceBankily}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Code commerçant</span>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-1.5 font-bold text-green-700 transition hover:bg-green-100"
                >
                  {MERCHANT_CODE}
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700">
              Ouvrez Bankily, choisissez B-Pay, saisissez le code commerçant,
              effectuez le paiement puis entrez le code reçu.
            </p>
          </div>
        </div>

        {/* Simulated SMS code from Bankily */}
        <div className="px-6 pb-1">
          <div className="rounded-2xl border border-green-200 bg-green-50 py-3 text-center">
            <p className="text-[11px] font-medium text-green-700">Code B-Pay reçu par SMS (simulation)</p>
            <p className="mt-1 text-3xl font-black tracking-[0.35em] text-green-800">{data.codeTransaction}</p>
            <p className="mt-0.5 text-[10px] text-green-600">Entrez ce code dans le champ ci-dessous</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Numéro de téléphone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))
              }
              placeholder="Ex : 34509008"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Code B-Pay <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, "").slice(0, 4));
                setErr("");
              }}
              placeholder="••••"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-xl font-bold tracking-[0.4em] text-slate-900 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10"
            />
          </div>

          {err && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {err}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
          >
            Annuler
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-green-800 disabled:bg-slate-300"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Vérification..." : "Confirmer le paiement"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MedecinCotisationPage() {
  const [courante,  setCourante]  = useState(null);
  const [history,   setHistory]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(null);   // InitierPaiementResponse
  const [paying,    setPaying]    = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const [error,     setError]     = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [courRes, histRes] = await Promise.all([
        getCotisationCourante(),
        getMyCotisations(),
      ]);
      setCourante(courRes.status === 204 ? null : courRes.data);
      setHistory(histRes.data);
    } catch {
      setError("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleInitier = async () => {
    if (!courante) return;
    setInitLoading(true);
    setError("");
    try {
      const res = await initierPaiement(courante.id);
      setModal(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors de l'initiation du paiement.");
    } finally {
      setInitLoading(false);
    }
  };

  const handleConfirmer = async (code) => {
    if (!modal) return;
    setPaying(true);
    try {
      const res = await confirmerPaiement(modal.cotisationId, code);
      setCourante(res.data);
      setHistory((prev) => prev.map((c) => (c.id === res.data.id ? res.data : c)));
      setModal(null);
    } finally {
      setPaying(false);
    }
  };

  const canPay = courante && courante.statut !== "PAYEE";

  return (
    <MedecinLayout title="Ma cotisation">
      <AnimatePresence>
        {modal && (
          <BankilyModal
            data={modal}
            onConfirm={handleConfirmer}
            onClose={() => setModal(null)}
            loading={paying}
          />
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-6xl space-y-8">

        {/* ── Current year card ── */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {!loading && courante?.statut === "PAYEE" ? (
            <div className="flex items-center gap-2 border-b border-green-100 bg-green-50 px-5 py-3.5">
              <CheckCircle2 size={14} className="text-green-600" />
              <p className="text-sm font-semibold text-green-800">Cotisation {courante.annee} — Payée</p>
            </div>
          ) : !loading && courante?.statut === "EN_RETARD" ? (
            <div className="flex items-center gap-2 border-b border-red-100 bg-red-50 px-5 py-3.5">
              <AlertTriangle size={14} className="text-red-600" />
              <p className="text-sm font-semibold text-red-800">Cotisation {courante.annee} — En retard</p>
            </div>
          ) : !loading && courante ? (
            <div className="flex items-center gap-2 border-b border-amber-100 bg-amber-50 px-5 py-3.5">
              <Clock size={14} className="text-amber-600" />
              <p className="text-sm font-semibold text-amber-800">Cotisation {courante.annee} — En attente</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
              <CreditCard size={14} className="text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">Cotisation annuelle</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={22} className="animate-spin text-teal-600" />
            </div>
          ) : !courante ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <CheckCircle2 size={28} className="text-green-500" />
              <p className="text-sm font-semibold text-slate-700">Aucune cotisation en cours</p>
              <p className="text-xs text-slate-400">Votre cotisation sera créée automatiquement au début de l'exercice.</p>
            </div>
          ) : (
            <div className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-slate-900">{courante.montant} MRU</span>
                    <StatutBadge statut={courante.statut} />
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} /> Exercice {courante.annee}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} /> Échéance : {courante.dateEcheance}
                    </span>
                    {courante.statut !== "PAYEE" && courante.joursRestants != null && (
                      <span className={`flex items-center gap-1.5 font-semibold ${courante.joursRestants <= 14 ? "text-red-600" : "text-amber-600"}`}>
                        <AlertTriangle size={12} />
                        {courante.joursRestants >= 0
                          ? `${courante.joursRestants} jours restants`
                          : `En retard de ${Math.abs(courante.joursRestants)} jours`}
                      </span>
                    )}
                    {courante.statut === "PAYEE" && courante.datePaiement && (
                      <span className="flex items-center gap-1.5 text-green-600">
                        <CheckCircle2 size={12} /> Payée le {courante.datePaiement}
                      </span>
                    )}
                  </div>
                  {courante.referenceBankily && (
                    <p className="text-xs text-slate-400">
                      Réf. Bankily : <span className="font-mono font-semibold text-slate-600">{courante.referenceBankily}</span>
                    </p>
                  )}
                </div>

                {canPay && (
                  <button
                    onClick={handleInitier}
                    disabled={initLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-bold uppercase text-white hover:bg-green-800 disabled:bg-slate-300 transition"
                  >
                    {initLoading ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                    {initLoading ? "Connexion…" : "Payer via Bankily B-pay"}
                  </button>
                )}
              </div>

              {error && (
                <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
                  {error}
                </p>
              )}
            </div>
          )}
        </section>

        {/* ── History ── */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700">Historique des cotisations</h2>
            <button onClick={load} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition">
              <RefreshCw size={12} /> Actualiser
            </button>
          </div>

          {loading ? (
            <div className="h-24 animate-pulse rounded-xl border border-[#E2E8F0] bg-white" />
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E2E8F0] bg-white py-10 text-center">
              <CreditCard size={20} className="mb-2 text-slate-300" />
              <p className="text-sm text-slate-500">Aucune cotisation enregistrée</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-3">Année</th>
                    <th className="px-4 py-3">Montant</th>
                    <th className="px-4 py-3">Échéance</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Date paiement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">{c.annee}</td>
                      <td className="px-4 py-3 text-slate-600">{c.montant} MRU</td>
                      <td className="px-4 py-3 text-slate-500">{c.dateEcheance}</td>
                      <td className="px-4 py-3"><StatutBadge statut={c.statut} /></td>
                      <td className="px-4 py-3 text-slate-500">{c.datePaiement || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Info strip ── */}
        <p className="text-center text-xs text-slate-400">
          La cotisation annuelle est de <strong>5 000 MRU</strong>. Elle est due avant le 31 mars de chaque exercice.
          Le paiement est simulé via le service Bankily B-pay.
        </p>

      </div>
    </MedecinLayout>
  );
}
