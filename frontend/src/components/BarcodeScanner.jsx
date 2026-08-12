import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, ScanLine, Loader2 } from "lucide-react";

export default function BarcodeScanner({ onDetect, onClose }) {
  const scannerRef = useRef(null);
  const [err, setErr] = useState("");
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    let mounted = true;
    const scanner = new Html5Qrcode("barcode-reader", { verbose: false });
    scannerRef.current = scanner;

    const stop = async () => {
      try { if (scanner.isScanning) await scanner.stop(); } catch (e) {}
      try { scanner.clear(); } catch (e) {}
    };

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 12, qrbox: { width: 280, height: 170 }, aspectRatio: 1.4 },
        (decoded) => {
          if (!mounted) return;
          onDetect(decoded.trim());
          stop();
        },
        () => {}
      )
      .then(() => mounted && setStarting(false))
      .catch(() => mounted && setErr("Tidak dapat mengakses kamera. Aktifkan izin kamera pada browser Anda."));

    return () => {
      mounted = false;
      stop();
    };
  }, [onDetect]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" data-testid="barcode-scanner-modal">
      <div className="absolute inset-0 bg-navy-hero/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-navy font-heading font-semibold">
            <ScanLine className="h-5 w-5 text-cyan-600" /> Scan Barcode Serial
          </div>
          <button data-testid="scanner-close" onClick={onClose} className="text-slate-400 hover:text-navy">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">
          <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-[7/5]">
            <div id="barcode-reader" className="w-full h-full [&_video]:object-cover" />
            {starting && !err && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm">Membuka kamera...</span>
              </div>
            )}
            {!starting && !err && (
              <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[40%] border-2 border-cyan-glow rounded-lg" style={{ boxShadow: "0 0 0 100vmax rgba(10,25,47,0.35)" }} />
            )}
          </div>
          {err ? (
            <p className="mt-4 text-sm text-red-500" data-testid="scanner-error">{err}</p>
          ) : (
            <p className="mt-4 text-sm text-slate-500 text-center">
              Arahkan kamera ke barcode serial number pada box iPad.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
