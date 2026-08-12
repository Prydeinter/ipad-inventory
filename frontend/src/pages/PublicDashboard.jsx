import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Tablet, Users, Repeat, KeyRound, ArrowRight, Search, ShieldCheck,
  Layers, CalendarClock, ChevronRight, X,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  PieChart, Pie, CartesianGrid,
} from "recharts";
import api from "../lib/api";
import { Brand } from "../components/Brand";

const CHART = ["#002D62", "#00B8D4", "#8B5CF6", "#F59E0B", "#10B981", "#1E3A8A"];

const fmtDate = (iso) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch {
    return iso;
  }
};

function Stat({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 flex flex-col gap-3 transition-transform duration-300 hover:-translate-y-1">
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-3xl font-heading font-bold text-navy tabular-nums">{value}</div>
        <div className="text-sm text-slate-500 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function TraceTimeline({ chain }) {
  if (!chain?.length)
    return <p className="text-sm text-slate-400">Belum ada riwayat pemakaian.</p>;
  return (
    <div className="relative pl-6">
      <div className="absolute left-[7px] top-1 bottom-1 w-px bg-slate-200" />
      {chain.map((c, i) => {
        const isCurrent = i === chain.length - 1;
        return (
          <div key={c.id} className="relative mb-6 last:mb-0" data-testid={`trace-step-${i}`}>
            <span
              className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 ${
                isCurrent ? "bg-cyan-glow border-cyan-glow" : "bg-white border-slate-300"
              }`}
              style={isCurrent ? { boxShadow: "0 0 0 4px rgba(0,229,255,0.25)" } : {}}
            />
            <div className="flex items-center gap-2">
              <span className="overline text-slate-400">
                {isCurrent ? "Pemegang Saat Ini" : `Lungsuran ke-${i + 1}`}
              </span>
              {i > 0 && (
                <span className="text-[10px] font-semibold text-violet-500 bg-violet-50 px-2 py-0.5 rounded-full">
                  <Repeat className="inline h-3 w-3 mr-0.5" />lungsuran
                </span>
              )}
            </div>
            <div className="font-heading font-semibold text-navy mt-0.5">{c.nama}</div>
            <div className="text-sm text-slate-500">{c.jabatan} / {c.unit}</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <CalendarClock className="h-3 w-3" /> Peminjaman {fmtDate(c.tanggal_peminjaman)}
            </div>
            <Link
              to={`/pakta/${c.id}`}
              className="text-xs text-navy font-medium hover:text-cyan-glow inline-flex items-center gap-1 mt-1"
              data-testid={`trace-view-pakta-${i}`}
            >
              Lihat dokumen pakta <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        );
      })}
    </div>
  );
}

export default function PublicDashboard() {
  const [stats, setStats] = useState(null);
  const [ipads, setIpads] = useState([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get("/public/stats").then((r) => setStats(r.data)).catch(() => {});
    api.get("/public/ipads").then((r) => setIpads(r.data)).catch(() => {});
  }, []);

  const filtered = ipads.filter((ip) => {
    const s = q.toLowerCase();
    return (
      ip.serial_number.toLowerCase().includes(s) ||
      ip.version.toLowerCase().includes(s) ||
      (ip.current_holder || "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero */}
      <header className="grid-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-hero/40 to-navy-hero/90" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <nav className="flex items-center justify-between py-6 no-print">
            <Brand variant="white" />
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/pakta"
                data-testid="nav-isi-pakta"
                className="text-sm font-medium text-white/90 hover:text-cyan-glow px-4 py-2 rounded-lg transition-colors duration-300"
              >
                Isi Pakta
              </Link>
              <Link
                to="/admin/login"
                data-testid="nav-admin"
                className="text-sm font-semibold text-navy bg-cyan-glow hover:bg-white px-4 py-2 rounded-lg transition-colors duration-300"
              >
                Admin
              </Link>
            </div>
          </nav>

          <div className="py-16 lg:py-24 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="overline text-cyan-glow flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Sistem Distribusi Lungsuran iPad
              </span>
              <h1 className="mt-4 text-4xl sm:text-5xl font-heading font-bold text-white tracking-tight leading-[1.05]">
                Manajemen &amp; Pelacakan iPad<br />
                <span className="text-cyan-glow">Al Azhar IIBS</span>
              </h1>
              <p className="mt-5 text-white/70 text-base sm:text-lg max-w-xl">
                Transparansi penuh distribusi perangkat: dari tahun perolehan, pemegang aktif,
                hingga jejak lungsuran antar guru. Terbuka untuk dilihat, terkunci dari perubahan.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 no-print">
                <Link
                  to="/pakta"
                  data-testid="hero-isi-pakta"
                  className="inline-flex items-center gap-2 bg-cyan-glow text-navy font-semibold px-6 py-3 rounded-xl hover:bg-white transition-colors duration-300"
                >
                  <KeyRound className="h-4 w-4" /> Isi Pakta dengan Kode
                </Link>
                <a
                  href="#dashboard"
                  className="inline-flex items-center gap-2 text-white border border-white/30 font-medium px-6 py-3 rounded-xl hover:bg-white/10 transition-colors duration-300"
                >
                  Lihat Dashboard <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <main id="dashboard" className="max-w-7xl mx-auto px-6 lg:px-10 -mt-10 relative pb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Tablet, label: "Total iPad", value: stats?.total_ipads ?? "–", accent: "bg-navy/10 text-navy" },
            { icon: Users, label: "Pemegang Aktif", value: stats?.active_holders ?? "–", accent: "bg-cyan-glow/15 text-cyan-600" },
            { icon: Repeat, label: "Rantai Lungsuran", value: stats?.lungsuran_count ?? "–", accent: "bg-violet-100 text-violet-600" },
            { icon: KeyRound, label: "Kode Aktif", value: stats?.active_codes ?? "–", accent: "bg-amber-100 text-amber-600" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Stat {...s} />
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="overline text-slate-400">Distribusi</span>
                <h3 className="font-heading font-semibold text-navy text-lg">iPad per Tahun Perolehan</h3>
              </div>
              <Layers className="h-5 w-5 text-slate-300" />
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats?.by_year || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "rgba(0,45,98,0.04)" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#002D62" barSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-card p-6">
            <span className="overline text-slate-400">Kapasitas</span>
            <h3 className="font-heading font-semibold text-navy text-lg mb-2">Per Penyimpanan</h3>
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={stats?.by_storage || []} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={3}>
                  {(stats?.by_storage || []).map((_, i) => (
                    <Cell key={i} fill={CHART[i % CHART.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {(stats?.by_storage || []).map((s, i) => (
                <span key={s.name} className="text-xs text-slate-500 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: CHART[i % CHART.length] }} />
                  {s.name} ({s.value})
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* iPad registry + trace */}
        <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
            <div>
              <span className="overline text-slate-400">Registry &amp; Trace</span>
              <h3 className="font-heading font-semibold text-navy text-lg">Daftar iPad &amp; Jejak Lungsuran</h3>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                data-testid="ipad-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari serial / seri / nama..."
                className="pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-cyan-glow/50"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400">Belum ada data iPad.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-slate-100">
              {filtered.map((ip) => (
                <button
                  key={ip.id}
                  data-testid={`ipad-card-${ip.serial_number}`}
                  onClick={() => setSelected(ip)}
                  className="text-left bg-white p-5 hover:bg-slate-50 transition-colors duration-200 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-lg bg-navy/5 flex items-center justify-center">
                        <Tablet className="h-4 w-4 text-navy" />
                      </div>
                      <div>
                        <div className="font-heading font-semibold text-navy leading-tight">{ip.version}</div>
                        <div className="text-xs text-slate-400">{ip.storage} · {ip.purchase_year}</div>
                      </div>
                    </div>
                    {ip.is_lungsuran && (
                      <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 px-2 py-1 rounded-full flex items-center gap-1">
                        <Repeat className="h-3 w-3" />{ip.holder_count}x
                      </span>
                    )}
                  </div>
                  <div className="mt-3 font-mono text-xs text-slate-500 bg-slate-50 rounded px-2 py-1 inline-block">
                    {ip.serial_number}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <div className="overline text-slate-400">Pemegang</div>
                      <div className="text-sm font-medium text-slate-700">
                        {ip.current_holder || <span className="text-amber-500">Belum didistribusi</span>}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-cyan-glow group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-navy-hero text-white/50 text-sm py-8 no-print">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Brand variant="white" />
          <span>© {new Date().getFullYear()} Al Azhar International Islamic Boarding School</span>
        </div>
      </footer>

      {/* Trace drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end no-print" data-testid="trace-drawer">
          <div className="absolute inset-0 bg-navy-hero/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <motion.div
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl"
          >
            <div className="p-6 border-b border-slate-100 flex items-start justify-between sticky top-0 bg-white">
              <div>
                <span className="overline text-slate-400">Jejak Lungsuran</span>
                <h3 className="font-heading font-bold text-navy text-xl">{selected.version}</h3>
                <div className="font-mono text-xs text-slate-500 mt-1">{selected.serial_number}</div>
                <div className="text-xs text-slate-400">{selected.storage} · dibeli {selected.purchase_year}</div>
              </div>
              <button data-testid="trace-close" onClick={() => setSelected(null)} className="text-slate-400 hover:text-navy">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <TraceTimeline chain={selected.chain} />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
