import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, Bot, ChevronDown } from "lucide-react";

const FAQ = [
  {
    q: "Comment m'inscrire à l'Ordre ?",
    a: "Pour vous inscrire, rendez-vous sur la page Adhésion et complétez le formulaire en ligne. Vous aurez besoin de votre diplôme de médecine, pièce d'identité, photo et justificatif de domicile. Le délai de traitement est d'environ 15 jours ouvrables.",
    tags: ["inscription", "adhesion", "inscrire", "rejoindre"],
  },
  {
    q: "Quels documents sont requis pour l'adhésion ?",
    a: "Les documents requis sont : diplôme de médecine (légalisé), copie de la pièce d'identité nationale, photo d'identité récente, justificatif de domicile, et attestation du lieu d'exercice prévu.",
    tags: ["documents", "dossier", "pièces", "requis"],
  },
  {
    q: "Comment suivre mon dossier d'adhésion ?",
    a: "Vous pouvez suivre votre dossier via la page « Suivi de dossier » en utilisant votre numéro de référence reçu par email. Vous pouvez aussi nous contacter par téléphone au +222 45 25 00 00.",
    tags: ["suivi", "dossier", "statut", "avancement"],
  },
  {
    q: "Comment déposer une réclamation ?",
    a: "Rendez-vous sur la page Réclamation et remplissez le formulaire dédié en 3 étapes. Votre réclamation sera traitée de façon confidentielle. Un numéro de référence vous sera attribué pour en suivre l'avancement.",
    tags: ["réclamation", "plainte", "signalement", "déontologie"],
  },
  {
    q: "Quels sont les délais de traitement ?",
    a: "Les délais varient selon le type de demande : inscription à l'Ordre (15 jours ouvrables), réclamation (30 à 45 jours), réponse aux messages de contact (5 jours ouvrables).",
    tags: ["délai", "durée", "temps", "attente"],
  },
  {
    q: "Comment vérifier qu'un médecin est inscrit ?",
    a: "Consultez l'Annuaire médical public sur notre site. Vous pouvez rechercher par nom, spécialité ou wilaya. Tous les médecins affichés ont une autorisation d'exercer en vigueur.",
    tags: ["annuaire", "vérifier", "médecin", "autorisation"],
  },
  {
    q: "Quelles sont vos heures d'ouverture ?",
    a: "L'ONMM est ouvert du Dimanche au Jeudi de 08h00 à 16h00. Le Vendredi et le Samedi sont des jours de fermeture. Pour les urgences, contactez-nous par email.",
    tags: ["horaires", "ouverture", "fermeture", "heures"],
  },
  {
    q: "Comment contacter l'ONMM ?",
    a: "Par téléphone : +222 45 25 00 00. Par email : contact@ordre-medecins.mr. Par courrier : Siège ONMM, Tevragh Zeina, Nouakchott. Ou via notre formulaire de contact en ligne.",
    tags: ["contact", "téléphone", "email", "adresse"],
  },
];

const SUGGESTIONS = [
  "Comment m'inscrire ?",
  "Suivre mon dossier",
  "Déposer une réclamation",
  "Horaires d'ouverture",
];

function findAnswer(input) {
  const lower = input.toLowerCase().trim();
  if (!lower) return null;
  for (const faq of FAQ) {
    if (faq.tags.some((t) => lower.includes(t))) return faq;
    if (faq.q.toLowerCase().includes(lower)) return faq;
  }
  return null;
}

const DEFAULT_REPLY = "Je n'ai pas trouvé de réponse précise à votre question. Veuillez contacter l'ONMM directement au +222 45 25 00 00 ou via le formulaire de contact.";

export default function FaqChatbot() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Bonjour ! Je suis l'assistant de l'ONMM. Comment puis-je vous aider ?" },
  ]);
  const [input, setInput]   = useState("");
  const [typing, setTyping] = useState(false);
  const endRef              = useRef(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = (text) => {
    const msg = text ?? input;
    if (!msg.trim()) return;
    setInput("");
    setMessages((prev) => [...prev, { from: "user", text: msg }]);
    setTyping(true);
    setTimeout(() => {
      const faq   = findAnswer(msg);
      const reply = faq ? faq.a : DEFAULT_REPLY;
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
      setTyping(false);
    }, 650);
  };

  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg shadow-green-900/25 transition hover:bg-green-700"
        aria-label="Ouvrir le chatbot FAQ"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}><X size={22} /></motion.span>
            : <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}><MessageCircle size={22} /></motion.span>
          }
        </AnimatePresence>
        {!open && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            FAQ
          </span>
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-24 right-6 z-50 flex w-[340px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15"
            style={{ maxHeight: "480px" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 bg-green-600 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Bot size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Assistant ONMM</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" />
                  <p className="text-[10px] text-green-100">En ligne · FAQ automatique</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition">
                <ChevronDown size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ maxHeight: "300px" }}>
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                  {m.from === "bot" && (
                    <div className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <Bot size={12} />
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-xs leading-5 ${
                    m.from === "user"
                      ? "bg-green-600 text-white rounded-br-sm"
                      : "bg-slate-100 text-slate-800 rounded-bl-sm"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <Bot size={12} />
                  </div>
                  <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-slate-100 px-3.5 py-2.5">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Suggestion chips */}
            {messages.length <= 2 && (
              <div className="flex flex-wrap gap-1.5 border-t border-slate-100 px-4 py-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[10px] font-medium text-green-700 transition hover:bg-green-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-slate-100 px-3 py-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-500/10 transition">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Posez votre question…"
                  className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 outline-none"
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim()}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-600 text-white transition hover:bg-green-700 disabled:opacity-40"
                >
                  <Send size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
