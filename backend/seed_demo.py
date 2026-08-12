import requests, base64

BASE = "http://localhost:8001/api"
s = requests.Session()

tok = s.post(f"{BASE}/auth/login", json={"email": "admin@aaiibs.sch.id", "password": "AAIIBS@2026"}).json()["access_token"]
H = {"Authorization": f"Bearer {tok}"}

# a simple signature-like png data url (small black stroke)
from reportlab.pdfgen import canvas as C  # noqa
import io
# build tiny png via PIL if available else fallback 1x1
try:
    from PIL import Image, ImageDraw
    im = Image.new("RGBA", (300, 120), (255, 255, 255, 0))
    d = ImageDraw.Draw(im)
    d.line([(20, 90), (60, 30), (110, 95), (160, 40), (220, 85), (270, 45)], fill=(15, 23, 42, 255), width=4)
    buf = io.BytesIO(); im.save(buf, "PNG")
    sig = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()
except Exception:
    sig = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

ipads = [
    {"serial_number": "DMPGX1AAAA01", "version": "iPad Gen 10", "storage": "256GB", "purchase_year": 2026, "color": "Silver"},
    {"serial_number": "DMPGX1AAAA02", "version": "iPad Gen 10", "storage": "256GB", "purchase_year": 2026, "color": "Blue"},
    {"serial_number": "F9FZ2BBBB03", "version": "iPad Gen 7", "storage": "32GB", "purchase_year": 2021, "color": "Space Gray"},
    {"serial_number": "F9FZ2BBBB04", "version": "iPad Gen 8", "storage": "128GB", "purchase_year": 2022, "color": "Silver"},
    {"serial_number": "GHKL3CCCC05", "version": "iPad Gen 9", "storage": "64GB", "purchase_year": 2023, "color": "Silver"},
]
for ip in ipads:
    r = s.post(f"{BASE}/admin/ipads", json=ip, headers=H)
    print("ipad", ip["serial_number"], r.status_code)

def submit(serial, target, nama, nik, jab, unit, tgl):
    code = s.post(f"{BASE}/admin/codes", json={"serial_number": serial, "target_name": target, "count": 1}, headers=H).json()[0]["code"]
    r = s.post(f"{BASE}/pakta/submit", json={
        "code": code, "nama": nama, "nik": nik, "jabatan": jab, "unit": unit,
        "tanggal_peminjaman": tgl, "signature": sig})
    print("pakta", nama, r.status_code, r.json())

# New iPad Gen 10 -> senior teachers
submit("DMPGX1AAAA01", "Ustadz Ahmad Fauzi", "Ustadz Ahmad Fauzi, S.Pd.", "1980051001", "Guru", "SMA", "2026-01-10")
submit("DMPGX1AAAA02", "Ustadzah Siti Aminah", "Ustadzah Siti Aminah, M.Pd.", "1982030502", "Guru", "SMP", "2026-01-10")

# Lungsuran chain on Gen 8: senior used it 2022, lungsur to new teacher 2024, lungsur again 2026
submit("F9FZ2BBBB04", "Ustadz Budi Santoso", "Ustadz Budi Santoso, S.Kom.", "1985071203", "Guru", "SMA", "2022-07-15")
submit("F9FZ2BBBB04", "Ustadzah Rina Wijaya", "Ustadzah Rina Wijaya, S.Pd.", "1990091504", "Guru", "SMP", "2024-08-01")

# Gen 9 lungsuran
submit("GHKL3CCCC05", "Bapak Joko Susilo", "Bapak Joko Susilo", "1988041005", "Karyawan", "SMA", "2023-02-20")

# leave DMPGX (none), F9FZ2BBBB03 undistributed + generate a couple active codes
s.post(f"{BASE}/admin/codes", json={"serial_number": "F9FZ2BBBB03", "target_name": "Guru Baru 2026", "count": 2}, headers=H)
print("done")
