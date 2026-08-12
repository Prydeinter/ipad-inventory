import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Tablet, KeyRound, FileText, Plus, Trash2, LogOut, Copy, Loader2,
  Pencil, X, ExternalLink, CheckCircle2, Repeat, Users, LayoutDashboard,
} from "lucide-react";
import api, { formatApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Brand } from "../components/Brand";

const fmtDate = (iso) => {
  if (!iso) return "-";
  try { return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return iso; }
};

const emptyIpad = { serial_number: "", version: "iPad Gen 10", storage: "256GB", purchase_year: new Date().getFullYear(), color: "", notes: "" };
const inputCls = "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-glow/50";

export default function AdminPanel() {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("ipads");
  const [ipads, setIpads] = useState([]);
  const [codes, setCodes] = useState([]);
  const [paktas, setPaktas] = useState([]);

  const load = useCallback(() => {
    api.get("/admin/ipads").then((r) => setIpads(r.data)).catch(() => {});
    api.get("/admin/codes").then((r) => setCodes(r.data)).catch(() => {});
    api.get("/admin/paktas").then((r) => setPaktas(r.data)).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);

  // ---- iPad form ----
  const [ipadForm, setIpadForm] = useState(emptyIpad);
  const [editingId, setEditingId] = useState(null);
  const [savingIpad, setSavingIpad] = useState(false);

  const submitIpad = async () => {
    if (!ipadForm.serial_number.trim() || !ipadForm.version.trim())
      return toast.error("Serial number & versi wajib diisi");
    setSavingIpad(true);
    try {
      const payload = { ...ipadForm, purchase_year: Number(ipadForm.purchase_year) };
      if (editingId) await api.put(`/admin/ipads/${editingId}`, payload);
      else await api.post("/admin/ipads", payload);
      toast.success(editingId ? "iPad diperbarui" : "iPad ditambahkan");
      setIpadForm(emptyIpad); setEditingId(null); load();
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
    finally { setSavingIpad(false); }
  };

  const editIpad = (ip) => {
    setEditingId(ip.id);
    setIpadForm({ serial_number: ip.serial_number, version: ip.version, storage: ip.storage, purchase_year: ip.purchase_year, color: ip.color || "", notes: ip.notes || "" });
    setTab("ipads"); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const delIpad = async (id) => {
    if (!window.confirm("Hapus iPad ini?")) return;
    try { await api.delete(`/admin/ipads/${id}`); toast.success("iPad dihapus"); load(); }
    catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
  };

  // ---- code gen ----
  const [codeForm, setCodeForm] = useState({ serial_number: "", target_name: "", count: 1 });
  const [genLoading, setGenLoading] = useState(false);

  const genCodes = async () => {
    if (!codeForm.serial_number) return toast.error("Pilih iPad terlebih dahulu");
    setGenLoading(true);
    try {
      const { data } = await api.post("/admin/codes", { ...codeForm, count: Number(codeForm.count) });
      toast.success(`${data.length} kode berhasil dibuat`);
      setCodeForm({ serial_number: "", target_name: "", count: 1 }); load();
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
    finally { setGenLoading(false); }
  };

  const delCode = async (id) => {
    try { await api.delete(`/admin/codes/${id}`); toast.success("Kode dihapus"); load(); }
    catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
  };

  const copyCode = (code) => {
    const msg = `Kode akses pakta iPad AAIIBS Anda: ${code}\nBuka: ${window.location.origin}/pakta`;
    navigator.clipboard.writeText(msg);
    toast.success("Kode & link disalin");
  };

  const doLogout = async () => { await logout(); nav("/"); };

  const stats = [
    { icon: Tablet, label: "Total iPad", value: ipads.length },
    { icon: Users, label: "Terdistribusi", value: ipads.filter((i) => i.current_holder).length },
    { icon: KeyRound, label: "Kode Aktif", value: codes.filter((c) => c.status === "active").length },
    { icon: FileText, label: "Pakta", value: paktas.length },
  ];

  const tabs = [
    { id: "ipads", label: "iPad", icon: Tablet },
    { id: "codes", label: "Kode Akses", icon: KeyRound },
    { id: "paktas", label: "Pakta", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-navy-hero text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Brand variant="white" />
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-cyan-glow border border-cyan-glow/30 rounded-full px-3 py-1">
              <LayoutDashboard className="h-3.5 w-3.5" /> Admin Panel
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-white/60">{user?.email}</span>
            <button data-testid="logout-btn" onClick={doLogout} className="text-sm flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors duration-300">
              <LogOut className="h-4 w-4" /> Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 shadow-card p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-navy/10 flex items-center justify-center"><s.icon className="h-5 w-5 text-navy" /></div>
              <div>
                <div className="text-2xl font-heading font-bold text-navy tabular-nums">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-8 border-b border-slate-200">
          {tabs.map((t) => (
            <button
              key={t.id}
              data-testid={`tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors duration-200 ${
                tab === t.id ? "border-navy text-navy" : "border-transparent text-slate-400 hover:text-navy"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* iPads */}
        {tab === "ipads" && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-card p-6 h-fit" data-testid="ipad-form">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-navy">{editingId ? "Edit iPad" : "Tambah iPad"}</h3>
                {editingId && (
                  <button onClick={() => { setEditingId(null); setIpadForm(emptyIpad); }} className="text-slate-400 hover:text-navy"><X className="h-4 w-4" /></button>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-500">Serial Number</label>
                  <input data-testid="ipad-serial" value={ipadForm.serial_number} onChange={(e) => setIpadForm({ ...ipadForm, serial_number: e.target.value })} className={`${inputCls} font-mono`} placeholder="e.g. DMPGXXXXXXXX" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Versi iPad</label>
                  <input data-testid="ipad-version" value={ipadForm.version} onChange={(e) => setIpadForm({ ...ipadForm, version: e.target.value })} className={inputCls} placeholder="iPad Gen 10" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500">Penyimpanan</label>
                    <select data-testid="ipad-storage" value={ipadForm.storage} onChange={(e) => setIpadForm({ ...ipadForm, storage: e.target.value })} className={inputCls}>
                      {["64GB", "128GB", "256GB", "512GB", "1TB"].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500">Tahun Beli</label>
                    <input data-testid="ipad-year" type="number" value={ipadForm.purchase_year} onChange={(e) => setIpadForm({ ...ipadForm, purchase_year: e.target.value })} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Warna (opsional)</label>
                  <input data-testid="ipad-color" value={ipadForm.color} onChange={(e) => setIpadForm({ ...ipadForm, color: e.target.value })} className={inputCls} placeholder="Silver" />
                </div>
                <button data-testid="save-ipad-btn" onClick={submitIpad} disabled={savingIpad} className="w-full bg-navy text-white font-semibold py-3 rounded-lg hover:bg-navy-light transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-60">
                  {savingIpad ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> {editingId ? "Simpan" : "Tambah iPad"}</>}
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-3">
              {ipads.length === 0 && <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">Belum ada iPad. Tambahkan di sebelah kiri.</div>}
              {ipads.map((ip) => (
                <div key={ip.id} data-testid={`admin-ipad-${ip.serial_number}`} className="bg-white rounded-xl border border-slate-200 shadow-card p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading font-semibold text-navy">{ip.version}</span>
                      <span className="text-xs text-slate-400">{ip.storage} · {ip.purchase_year}</span>
                      {ip.is_lungsuran && <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full flex items-center gap-1"><Repeat className="h-3 w-3" />{ip.holder_count}x</span>}
                    </div>
                    <div className="font-mono text-xs text-slate-500 mt-1">{ip.serial_number}</div>
                    <div className="text-sm text-slate-600 mt-1">
                      {ip.current_holder ? <>Pemegang: <span className="font-medium text-navy">{ip.current_holder}</span> <span className="text-slate-400">({ip.current_holder_unit})</span></> : <span className="text-amber-500">Belum didistribusi</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button data-testid={`edit-ipad-${ip.serial_number}`} onClick={() => editIpad(ip)} className="h-9 w-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"><Pencil className="h-4 w-4" /></button>
                    <button data-testid={`delete-ipad-${ip.serial_number}`} onClick={() => delIpad(ip.id)} className="h-9 w-9 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-400"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Codes */}
        {tab === "codes" && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-card p-6 h-fit" data-testid="code-form">
              <h3 className="font-heading font-semibold text-navy mb-4">Generate Kode Akses</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-500">Pilih iPad (serial)</label>
                  <select data-testid="code-ipad-select" value={codeForm.serial_number} onChange={(e) => setCodeForm({ ...codeForm, serial_number: e.target.value })} className={inputCls}>
                    <option value="">— pilih iPad —</option>
                    {ipads.map((ip) => <option key={ip.id} value={ip.serial_number}>{ip.serial_number} · {ip.version} {ip.storage}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Nama Tujuan (opsional)</label>
                  <input data-testid="code-target" value={codeForm.target_name} onChange={(e) => setCodeForm({ ...codeForm, target_name: e.target.value })} className={inputCls} placeholder="Nama guru penerima" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Jumlah Kode</label>
                  <input data-testid="code-count" type="number" min="1" max="20" value={codeForm.count} onChange={(e) => setCodeForm({ ...codeForm, count: e.target.value })} className={inputCls} />
                  <p className="text-[11px] text-slate-400 mt-1">Buat beberapa kode sekaligus untuk pengisian bersama.</p>
                </div>
                <button data-testid="generate-codes-btn" onClick={genCodes} disabled={genLoading} className="w-full bg-navy text-white font-semibold py-3 rounded-lg hover:bg-navy-light transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-60">
                  {genLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><KeyRound className="h-4 w-4" /> Generate</>}
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-3">
              {codes.length === 0 && <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">Belum ada kode.</div>}
              {codes.map((c) => (
                <div key={c.id} data-testid={`admin-code-${c.code}`} className="bg-white rounded-xl border border-slate-200 shadow-card p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg text-navy tracking-wider">{c.code}</span>
                      {c.status === "used" ? (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />terpakai</span>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">aktif</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 truncate">
                      {c.version} {c.storage} · {c.serial_number}{c.target_name ? ` · untuk ${c.target_name}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {c.status === "used" && c.used_by && (
                      <button data-testid={`view-code-pakta-${c.code}`} onClick={() => nav(`/pakta/${c.used_by}`)} className="h-9 w-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-navy"><ExternalLink className="h-4 w-4" /></button>
                    )}
                    <button data-testid={`copy-code-${c.code}`} onClick={() => copyCode(c.code)} className="h-9 w-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"><Copy className="h-4 w-4" /></button>
                    {c.status === "active" && (
                      <button data-testid={`delete-code-${c.code}`} onClick={() => delCode(c.id)} className="h-9 w-9 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-400"><Trash2 className="h-4 w-4" /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paktas */}
        {tab === "paktas" && (
          <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden" data-testid="pakta-list">
            {paktas.length === 0 ? (
              <div className="p-10 text-center text-slate-400">Belum ada pakta yang diisi.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {paktas.map((p) => (
                  <div key={p.id} data-testid={`admin-pakta-${p.id}`} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors duration-200">
                    <div className="min-w-0">
                      <div className="font-heading font-semibold text-navy">{p.nama} <span className="text-xs font-normal text-slate-400">· {p.jabatan}/{p.unit}</span></div>
                      <div className="text-xs text-slate-500 mt-0.5 font-mono">{p.serial_number} · {p.ipad_version} {p.storage}</div>
                      <div className="text-xs text-slate-400 mt-0.5">Diisi {fmtDate(p.tanggal_pengisian)} · lungsuran ke-{p.sequence}</div>
                    </div>
                    <button data-testid={`view-pakta-${p.id}`} onClick={() => nav(`/pakta/${p.id}`)} className="text-sm font-medium text-navy hover:text-cyan-600 flex items-center gap-1 shrink-0">
                      Lihat <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
