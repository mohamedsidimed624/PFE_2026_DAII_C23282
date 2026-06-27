import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb({ items }) {
  return (
    <div className="border-b border-slate-100 bg-white">
      <div className="mx-auto flex max-w-[1240px] items-center gap-1 px-6 py-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <span key={index} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight size={11} className="shrink-0 text-slate-300" />
              )}
              {isLast || !item.to ? (
                <span className="text-[11px] font-medium text-slate-500">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="text-[11px] text-slate-400 transition-colors hover:text-green-600"
                >
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
