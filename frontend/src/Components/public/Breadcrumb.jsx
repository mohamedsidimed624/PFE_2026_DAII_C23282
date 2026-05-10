import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb({ items }) {
  return (
    <div className="bg-white border-b border-slate-100 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <span key={index} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight size={12} className="text-slate-300 shrink-0" />}
              {isLast || !item.to ? (
                <span className="text-xs font-medium text-slate-600">{item.label}</span>
              ) : (
                <Link to={item.to} className="text-xs text-slate-400 hover:text-green-600 transition-colors">
                  {item.label}
                </Link>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
