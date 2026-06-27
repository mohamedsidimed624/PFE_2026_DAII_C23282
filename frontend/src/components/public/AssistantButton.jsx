import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function AssistantButton() {
  const navigate = useNavigate();
  return (
    <motion.button
      onClick={() => navigate("/assistant")}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, duration: 0.3 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-green-600 pl-4 pr-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/30 transition hover:bg-green-700"
      aria-label="Ouvrir l'assistant ONMM"
    >
      <MessageCircle size={18} />
      Assistant
      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500">
        <span className="h-2 w-2 animate-ping rounded-full bg-red-400" />
      </span>
    </motion.button>
  );
}
