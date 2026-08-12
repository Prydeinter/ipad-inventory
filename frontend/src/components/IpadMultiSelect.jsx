import { useEffect, useRef, useState } from "react";
import { Search, ChevronDown, Check, X, Tablet } from "lucide-react";

export default function IpadMultiSelect({ ipads, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const boxRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = ipads.filter((ip) => {
    const s = q.trim().toLowerCase();
    return ip.serial_number.toLowerCase().includes(s) || ip.version.toLowerCase().includes(s);
  });

  const toggle = (serial) =>
    onChange(selected.includes(serial) ? selected.filter((x) => x !== serial) : [...selected, serial]);

  const selectAllFiltered = () => {
    const set = new Set([...selected, ...filtered.map((i) => i.serial_number)]);
    onChange([...set]);
  };

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        data-testid="code-ipad-multiselect"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-glow/50"
      >
        <span className={selected.length ? "text-navy font-medium" : "text-slate-400"}>
          {selected.length ? `${selected.length} iPad dipilih` : "— pilih iPad —"}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2" data-testid="selected-ipad-chips">
          {selected.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 bg-navy/10 text-navy text-xs font-mono px-2 py-1 rounded-md">
              {s}
              <button type="button" onClick={() => toggle(s)} className="hover:text-red-500"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute z-30 mt-2 w-full bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden" data-testid="ipad-dropdown">
          <div className="relative border-b border-slate-100">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              autoFocus
              data-testid="ipad-dropdown-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari serial / seri..."
              className="w-full pl-9 pr-3 py-2.5 text-sm focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between px-3 py-2 text-xs border-b border-slate-100 bg-slate-50">
            <button type="button" data-testid="select-all-ipads" onClick={selectAllFiltered} className="text-navy font-medium hover:text-cyan-600">
              Pilih semua ({filtered.length})
            </button>
            {selected.length > 0 && (
              <button type="button" data-testid="clear-ipads" onClick={() => onChange([])} className="text-red-400 hover:text-red-600">
                Bersihkan
              </button>
            )}
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 && <div className="p-4 text-center text-sm text-slate-400">Tidak ada hasil.</div>}
            {filtered.map((ip) => {
              const active = selected.includes(ip.serial_number);
              return (
                <button
                  key={ip.id}
                  type="button"
                  data-testid={`dropdown-ipad-${ip.serial_number}`}
                  onClick={() => toggle(ip.serial_number)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 transition-colors duration-150"
                >
                  <span className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${active ? "bg-navy border-navy" : "border-slate-300"}`}>
                    {active && <Check className="h-3 w-3 text-white" />}
                  </span>
                  <Tablet className="h-4 w-4 text-slate-300 shrink-0" />
                  <span className="min-w-0">
                    <span className="block font-mono text-xs text-navy truncate">{ip.serial_number}</span>
                    <span className="block text-[11px] text-slate-400">{ip.version} · {ip.storage}{ip.current_holder ? ` · ${ip.current_holder}` : ""}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
