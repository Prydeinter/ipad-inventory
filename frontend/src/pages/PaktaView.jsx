import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, ArrowLeft, ShieldCheck, Tablet, CheckCircle2, Loader2 } from "lucide-react";
import api, { API } from "../lib/api";
import { Brand } from "../components/Brand";

const fmtDate = (iso) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
};

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-navy text-right">{value}</span>
    </div>
  );
}

export default function PaktaView() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    api.get(`/pakta/${id}`).then((r) => setP(r.data)).catch(() => setErr(true));
  }, [id]);

  if (err)
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Pakta tidak ditemukan.
      </div>
    );
  if (!p)
    return (
      <div className="min-h-screen flex items-center justify-center text-navy">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );

  const pdfUrl = `${API}/pakta/${id}/pdf`;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="grid-bg relative">
        <div className="absolute inset-0 bg-navy-hero/80" />
        <div className="relative max-w-3xl mx-auto px-6 py-6 flex items-center justify-between no-print">
          <Brand variant="white" />
          <Link to="/" className="text-sm text-white/70 hover:text-cyan-glow flex items-center gap-1" data-testid="pakta-back">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
        </div>
        <div className="relative max-w-3xl mx-auto px-6 pb-16 pt-4">
          <span className="overline text-cyan-glow flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Pakta Tersimpan &amp; Terkunci
          </span>
          <h1 className="text-3xl font-heading font-bold text-white mt-2">{p.nama}</h1>
          <p className="text-white/60 mt-1">{p.jabatan} / {p.unit}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-10 relative pb-20">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8" data-testid="pakta-detail">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-navy/10 flex items-center justify-center">
                <Tablet className="h-5 w-5 text-navy" />
              </div>
              <div>
                <div className="font-heading font-semibold text-navy">{p.ipad_version} · {p.storage}</div>
                <div className="font-mono text-xs text-slate-500">{p.serial_number}</div>
              </div>
            </div>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              data-testid="download-pdf-btn"
              className="inline-flex items-center justify-center gap-2 bg-navy text-white font-semibold px-5 py-3 rounded-xl hover:bg-navy-light transition-colors duration-300 no-print"
            >
              <Download className="h-4 w-4" /> Unduh / Cetak PDF (F4)
            </a>
          </div>

          <Row label="Nama" value={p.nama} />
          <Row label="NIK" value={p.nik} />
          <Row label="Jabatan / Unit" value={`${p.jabatan} / ${p.unit}`} />
          <Row label="Versi iPad" value={p.ipad_version} />
          <Row label="Penyimpanan" value={p.storage} />
          <Row label="Serial Number" value={p.serial_number} />
          <Row label="Tanggal Peminjaman" value={fmtDate(p.tanggal_peminjaman)} />
          <Row label="Diisi pada" value={`Karanganyar, ${fmtDate(p.tanggal_pengisian)}`} />

          <div className="mt-6">
            <span className="overline text-slate-400">Tanda Tangan</span>
            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4 inline-block">
              <img src={p.signature} alt="Tanda tangan" className="h-24 object-contain" data-testid="pakta-signature" />
              <div className="mt-1 font-heading font-semibold text-navy border-t border-slate-300 pt-1">{p.nama_terang}</div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-cyan-600" />
            Dokumen ini bersifat read-only dan telah diverifikasi secara digital oleh sistem AAIIBS.
          </div>
        </div>
      </div>
    </div>
  );
}
