"""F4 PDF generation for iPad loan pakta (Al Azhar IIBS)."""
import base64
import io
from datetime import datetime
from pathlib import Path

from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

ROOT = Path(__file__).parent
LOGO_PATH = ROOT / "assets" / "logo.png"

# F4 / Folio size
PAGE_W = 210 * mm
PAGE_H = 330 * mm
MARGIN = 22 * mm

NAVY = HexColor("#002D62")
SLATE = HexColor("#334155")
LIGHT = HexColor("#94A3B8")

BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli",
         "Agustus", "September", "Oktober", "November", "Desember"]

RULES = [
    "Guru/Karyawan menandatangani Pakta Integritas peminjaman iPad yang bermaterai.",
    "iPad dipergunakan sebagai sarana pembelajaran digital di dalam maupun luar kelas.",
    "Guru/Karyawan memasang aksesoris pelindung (case dan atau pelindung layar) secara mandiri.",
    "Guru/Karyawan menyimpan data kegiatan dalam iCloud sehingga selalu terbackup secara online "
    "sebagai penjagaan apabila iPad dipindah tangankan.",
    "Pertanyaan/keluhan (update, bug, sistem keamanan, dll) hendaknya langsung disampaikan kepada "
    "penanggung jawab Koordinator Digital.",
    "Tidak diperkenankan melakukan pengisian daya dengan pengisi daya yang tidak sesuai standar keamanan.",
    "iPad wajib dikembalikan dalam kondisi dan kelengkapan aksesoris seperti saat awal peminjaman "
    "ketika masa tugas Guru/Karyawan berakhir.",
    "Segala bentuk kerusakan baik disengaja maupun tidak, maka perbaikan menjadi tanggung jawab "
    "Guru/Karyawan masing-masing.",
]


def _fmt_date(iso: str) -> str:
    if not iso:
        return "-"
    try:
        d = datetime.fromisoformat(iso.replace("Z", "+00:00"))
    except Exception:
        return iso
    return f"{d.day} {BULAN[d.month - 1]} {d.year}"


def _wrap(c, text, x, y, max_w, font="Helvetica", size=10.5, leading=15):
    c.setFont(font, size)
    words = text.split()
    line = ""
    for w in words:
        test = (line + " " + w).strip()
        if c.stringWidth(test, font, size) <= max_w:
            line = test
        else:
            c.drawString(x, y, line)
            y -= leading
            line = w
    if line:
        c.drawString(x, y, line)
        y -= leading
    return y


def _header(c):
    top = PAGE_H - MARGIN
    if LOGO_PATH.exists():
        try:
            img = ImageReader(str(LOGO_PATH))
            iw, ih = img.getSize()
            w = 55 * mm
            h = w * ih / iw
            c.drawImage(img, MARGIN, top - h + 4 * mm, width=w, height=h,
                        mask="auto", preserveAspectRatio=True)
        except Exception:
            pass
    c.setStrokeColor(NAVY)
    c.setLineWidth(1.4)
    line_y = top - 20 * mm
    c.line(MARGIN, line_y, PAGE_W - MARGIN, line_y)
    return line_y


def build_pakta_pdf(p: dict) -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(PAGE_W, PAGE_H))

    # ---------------- PAGE 1 ----------------
    line_y = _header(c)
    y = line_y - 14 * mm

    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 15)
    c.drawCentredString(PAGE_W / 2, y, "PAKTA INTEGRITAS PEMINJAMAN iPad")
    y -= 7 * mm
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(PAGE_W / 2, y, "GURU / KARYAWAN")
    y -= 6 * mm
    c.setFillColor(SLATE)
    c.setFont("Helvetica", 10.5)
    c.drawCentredString(PAGE_W / 2, y, "Al Azhar International Islamic Boarding School")

    y -= 16 * mm
    c.setFillColor(SLATE)
    c.setFont("Helvetica-Oblique", 11)
    c.drawCentredString(PAGE_W / 2, y, "Bismillahirrahmanirrahim")

    y -= 14 * mm
    c.setFillColor(HexColor("#0F172A"))
    c.setFont("Helvetica", 11)
    c.drawString(MARGIN, y, "Saya yang bertanda tangan di bawah ini,")

    y -= 12 * mm
    fields = [
        ("Nama", p.get("nama", "")),
        ("NIK", p.get("nik", "")),
        ("Jabatan / Unit", f"{p.get('jabatan','')} / {p.get('unit','')}"),
        ("Versi iPad", p.get("ipad_version", "")),
        ("Penyimpanan", p.get("storage", "")),
        ("Serial Number", p.get("serial_number", "")),
        ("Tanggal Peminjaman", _fmt_date(p.get("tanggal_peminjaman", ""))),
    ]
    label_x = MARGIN + 4 * mm
    colon_x = MARGIN + 52 * mm
    val_x = colon_x + 4 * mm
    for label, val in fields:
        c.setFont("Helvetica", 11)
        c.setFillColor(SLATE)
        c.drawString(label_x, y, label)
        c.drawString(colon_x, y, ":")
        c.setFillColor(HexColor("#0F172A"))
        c.setFont("Helvetica-Bold", 11)
        c.drawString(val_x, y, str(val))
        y -= 9 * mm

    y -= 6 * mm
    statement = ("Menyatakan peminjaman iPad sebagai hak guna pembelajaran berbasis digital. "
                 "Bertanggung jawab atas pemakaian, penggunaan, dan keamanan dari iPad yang "
                 "diamanahkan sekolah serta sanggup mentaati peraturan yang tertera pada halaman "
                 "kedua dari surat pernyataan ini.")
    c.setFillColor(HexColor("#0F172A"))
    y = _wrap(c, statement, MARGIN, y, PAGE_W - 2 * MARGIN, size=11, leading=16)

    c.setFillColor(LIGHT)
    c.setFont("Helvetica", 8)
    c.drawCentredString(PAGE_W / 2, MARGIN - 6 * mm,
                        "Halaman 1 dari 2  \u2022  Dokumen digital terverifikasi AAIIBS")
    c.showPage()

    # ---------------- PAGE 2 ----------------
    line_y = _header(c)
    y = line_y - 14 * mm
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 13)
    c.drawCentredString(PAGE_W / 2, y, "PERATURAN PENGGUNAAN iPad GURU / KARYAWAN")
    y -= 6 * mm
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(PAGE_W / 2, y, "AL AZHAR IIBS")

    y -= 12 * mm
    c.setFillColor(SLATE)
    intro = ("Peraturan umum terkait tata cara pemanfaatan iPad Guru/Karyawan SMP-SMA Islam "
             "Al Azhar International Islamic Boarding School.")
    y = _wrap(c, intro, MARGIN, y, PAGE_W - 2 * MARGIN, size=10.5, leading=15)

    y -= 4 * mm
    c.setFillColor(HexColor("#0F172A"))
    num_x = MARGIN
    text_x = MARGIN + 8 * mm
    for i, rule in enumerate(RULES, start=1):
        c.setFont("Helvetica-Bold", 10.5)
        c.drawString(num_x, y, f"{i}.")
        y = _wrap(c, rule, text_x, y, PAGE_W - MARGIN - text_x, size=10.5, leading=14)
        y -= 3 * mm

    # signature block
    sig_top = max(y - 6 * mm, 78 * mm)
    right_x = PAGE_W - MARGIN - 62 * mm
    c.setFillColor(HexColor("#0F172A"))
    c.setFont("Helvetica", 11)
    c.drawString(right_x, sig_top, f"Karanganyar, {_fmt_date(p.get('tanggal_pengisian',''))}")

    sig_data = p.get("signature", "")
    sig_y = sig_top - 32 * mm
    if sig_data and "," in sig_data:
        try:
            raw = base64.b64decode(sig_data.split(",", 1)[1])
            img = ImageReader(io.BytesIO(raw))
            c.drawImage(img, right_x, sig_y, width=52 * mm, height=26 * mm,
                        mask="auto", preserveAspectRatio=True)
        except Exception:
            pass

    c.setStrokeColor(SLATE)
    c.setLineWidth(0.8)
    c.line(right_x, sig_y - 2 * mm, right_x + 58 * mm, sig_y - 2 * mm)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(right_x, sig_y - 9 * mm, p.get("nama", ""))
    c.setFillColor(SLATE)
    c.setFont("Helvetica", 9.5)
    c.drawString(right_x, sig_y - 15 * mm, f"NIK. {p.get('nik','')}")

    c.setFillColor(LIGHT)
    c.setFont("Helvetica", 8)
    c.drawCentredString(PAGE_W / 2, MARGIN - 6 * mm,
                        "Halaman 2 dari 2  \u2022  Dokumen digital terverifikasi AAIIBS")
    c.showPage()
    c.save()
    buf.seek(0)
    return buf.read()
