import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { toast } from "sonner";
import { KeyRound, ArrowRight, Eraser, Loader2, Tablet, CheckCircle2, ArrowLeft } from "lucide-react";
import api, { formatApiError } from "../lib/api";
import { Brand } from "../components/Brand";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function PaktaEntry() {
  const nav = useNavigate();
  const sigRef = useRef(null);
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nama: "", nik: "", jabatan: "Guru", unit: "SMP", tanggal_peminjaman: todayISO(),
  });

  const validate = async () => {
    if (code.trim().length < 4) return toast.error("Masukkan kode yang valid");
    setLoading(true);
    try {
      const { data } = await api.post("/codes/validate", { code: code.trim().toUpperCase() });
      setInfo(data);
      if (data.target_name) setForm((f) => ({ ...f, nama: data.target_name }));
      setStep(2);
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!form.nama.trim() || !form.nik.trim())
      return toast.error("Nama dan NIK wajib diisi");
    if (sigRef.current.isEmpty())
      return toast.error("Tanda tangan wajib diisi");
    setLoading(true);
    try {
      const signature = sigRef.current.getCanvas().toDataURL("image/png");
      const { data } = await api.post("/pakta/submit", {
        code: info.code, ...form, signature,
      });
      toast.success("Pakta berhasil disimpan!");
      nav(`/pakta/${data.id}`);
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const inputCls =
    "w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-glow/50 bg-white";

  return (
    <div className="min-h-screen grid-bg flex flex-col">
      <div className="absolute inset-0 bg-navy-hero/70" />
      <nav className="relative max-w-5xl w-full mx-auto px-6 py-6 flex items-center justify-between no-print">
        <Brand variant="white" />
        <Link to="/" className="text-sm text-white/70 hover:text-cyan-glow flex items-center gap-1" data-testid="back-home">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
      </nav>

      <div className="relative flex-1 flex items-center justify-center px-6 py-10">
        {step === 1 ? (
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 animate-fade-up" data-testid="token-step">
            <div className="h-14 w-14 rounded-xl bg-cyan-glow/15 flex items-center justify-center mb-5">
              <KeyRound className="h-7 w-7 text-navy" />
            </div>
            <span className="overline text-slate-400">Pakta Integritas iPad</span>
            <h1 className="text-2xl font-heading font-bold text-navy mt-1">Masukkan Kode Akses</h1>
            <p className="text-sm text-slate-500 mt-2">
              Gunakan kode singkat yang diberikan admin untuk membuka formulir pakta Anda.
            </p>
            <input
              data-testid="token-input"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && validate()}
              placeholder="XXXXXX"
              maxLength={8}
              className="mt-6 w-full text-center tracking-[0.4em] font-mono text-2xl font-bold text-navy px-4 py-4 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-cyan-glow uppercase"
            />
            <button
              data-testid="validate-code-btn"
              onClick={validate}
              disabled={loading}
              className="mt-5 w-full bg-navy text-white font-semibold py-3.5 rounded-xl hover:bg-navy-light transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Lanjutkan <ArrowRight className="h-4 w-4" /></>}
            </button>
          </div>
        ) : (
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 animate-fade-up" data-testid="form-step">
            <span className="overline text-slate-400">Pakta Integritas Peminjaman iPad</span>
            <h1 className="text-2xl font-heading font-bold text-navy mt-1">Formulir Pakta</h1>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-navy/10 flex items-center justify-center">
                <Tablet className="h-5 w-5 text-navy" />
              </div>
              <div className="text-sm">
                <div className="font-semibold text-navy">{info.version} · {info.storage}</div>
                <div className="font-mono text-xs text-slate-500">{info.serial_number} · dibeli {info.purchase_year}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-slate-600">Nama Lengkap</label>
                <input data-testid="input-nama" value={form.nama} onChange={set("nama")} className={inputCls} placeholder="Nama sesuai kepegawaian" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">NIK (No. Induk Kepegawaian)</label>
                <input data-testid="input-nik" value={form.nik} onChange={set("nik")} className={inputCls} placeholder="NIK" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Tanggal Peminjaman</label>
                <input data-testid="input-tanggal" type="date" value={form.tanggal_peminjaman} onChange={set("tanggal_peminjaman")} className={inputCls} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Jabatan</label>
                <select data-testid="input-jabatan" value={form.jabatan} onChange={set("jabatan")} className={inputCls}>
                  <option>Guru</option>
                  <option>Karyawan</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Unit</label>
                <select data-testid="input-unit" value={form.unit} onChange={set("unit")} className={inputCls}>
                  <option>SMP</option>
                  <option>SMA</option>
                </select>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-600">Tanda Tangan Digital</label>
                <button
                  data-testid="clear-signature"
                  onClick={() => sigRef.current.clear()}
                  className="text-xs text-slate-400 hover:text-navy flex items-center gap-1"
                >
                  <Eraser className="h-3.5 w-3.5" /> Hapus
                </button>
              </div>
              <div className="mt-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden">
                <SignatureCanvas
                  ref={sigRef}
                  penColor="#0F172A"
                  canvasProps={{ className: "sig-canvas w-full", height: 180, "data-testid": "signature-canvas" }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Tanda tangani menggunakan jari (iPad) atau mouse.</p>
            </div>

            <div className="mt-4 rounded-lg bg-cyan-glow/10 border border-cyan-glow/30 p-3 text-xs text-slate-600 flex gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
              Dengan mengirim, Anda menyetujui peraturan penggunaan iPad AAIIBS. Data bersifat permanen &amp; tidak dapat diubah.
            </div>

            <button
              data-testid="submit-pakta-btn"
              onClick={submit}
              disabled={loading}
              className="mt-5 w-full bg-navy text-white font-semibold py-3.5 rounded-xl hover:bg-navy-light transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Kirim & Tandatangani Pakta"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
