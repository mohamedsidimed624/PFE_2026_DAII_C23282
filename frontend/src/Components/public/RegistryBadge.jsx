import { ShieldCheck } from "lucide-react";

function RegistryBadge({ number }) {
  if (!number) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded border border-green-200 bg-green-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#16A34A]">
      <ShieldCheck size={10} aria-hidden="true" />
      {number}
    </span>
  );
}

export default RegistryBadge;
