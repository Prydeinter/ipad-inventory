"""Backend API tests for AAIIBS iPad Lungsuran System."""
import os
import base64
import uuid
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else "https://aaiibs-device-mgmt.preview.emergentagent.com"
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@aaiibs.sch.id"
ADMIN_PASS = "AAIIBS@2026"

SIG_PNG_B64 = "data:image/png;base64," + base64.b64encode(b"\x89PNG\r\n\x1a\n" + b"0" * 100).decode()


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    assert r.status_code == 200, r.text
    data = r.json()
    assert "access_token" in data and data["user"]["email"] == ADMIN_EMAIL
    return data["access_token"]


@pytest.fixture(scope="session")
def auth(token):
    return {"Authorization": f"Bearer {token}"}


# ---------------- auth
def test_login_wrong_password():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
    assert r.status_code == 401


def test_auth_me(auth):
    r = requests.get(f"{API}/auth/me", headers=auth)
    assert r.status_code == 200
    assert r.json()["email"] == ADMIN_EMAIL


def test_admin_route_requires_auth():
    r = requests.get(f"{API}/admin/ipads")
    assert r.status_code == 401


# ---------------- iPad CRUD
@pytest.fixture(scope="session")
def test_ipad(auth):
    serial = f"TESTSN{uuid.uuid4().hex[:8].upper()}"
    payload = {"serial_number": serial, "version": "iPad Pro 11", "storage": "256GB",
               "purchase_year": 2025, "color": "Silver", "notes": "test"}
    r = requests.post(f"{API}/admin/ipads", json=payload, headers=auth)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["serial_number"] == serial
    assert "id" in data
    yield data
    # cleanup
    requests.delete(f"{API}/admin/ipads/{data['id']}", headers=auth)


def test_list_ipads_contains_test(auth, test_ipad):
    r = requests.get(f"{API}/admin/ipads", headers=auth)
    assert r.status_code == 200
    serials = [x["serial_number"] for x in r.json()]
    assert test_ipad["serial_number"] in serials


def test_duplicate_serial_rejected(auth, test_ipad):
    payload = {"serial_number": test_ipad["serial_number"], "version": "iPad", "storage": "128GB", "purchase_year": 2024}
    r = requests.post(f"{API}/admin/ipads", json=payload, headers=auth)
    assert r.status_code == 400


# ---------------- code generation
@pytest.fixture(scope="session")
def generated_codes(auth, test_ipad):
    r = requests.post(f"{API}/admin/codes",
                      json={"serial_number": test_ipad["serial_number"], "target_name": "Ustadz Test", "count": 3},
                      headers=auth)
    assert r.status_code == 200, r.text
    codes = r.json()
    assert len(codes) == 3
    for c in codes:
        assert c["status"] == "active"
        assert c["serial_number"] == test_ipad["serial_number"]
    return codes


def test_codes_listed(auth, generated_codes):
    r = requests.get(f"{API}/admin/codes", headers=auth)
    assert r.status_code == 200
    all_codes = {c["code"] for c in r.json()}
    for c in generated_codes:
        assert c["code"] in all_codes


# ---------------- teacher flow: validate + submit
def test_validate_invalid_code():
    r = requests.post(f"{API}/codes/validate", json={"code": "NOPE99"})
    assert r.status_code == 404


def test_validate_and_submit_pakta(generated_codes, test_ipad):
    code = generated_codes[0]["code"]
    # validate
    r = requests.post(f"{API}/codes/validate", json={"code": code})
    assert r.status_code == 200
    v = r.json()
    assert v["serial_number"] == test_ipad["serial_number"]
    # submit
    payload = {"code": code, "nama": "Ustadz Uji", "nik": "1234567890",
               "jabatan": "Guru", "unit": "SMP",
               "tanggal_peminjaman": "2026-01-15", "signature": SIG_PNG_B64}
    r = requests.post(f"{API}/pakta/submit", json=payload)
    assert r.status_code == 200, r.text
    pakta_id = r.json()["id"]

    # GET pakta
    r2 = requests.get(f"{API}/pakta/{pakta_id}")
    assert r2.status_code == 200
    p = r2.json()
    assert p["nama"] == "Ustadz Uji"
    assert p["serial_number"] == test_ipad["serial_number"]
    assert p["signature"].startswith("data:image/png")

    # code now used - revalidate should fail with "sudah digunakan"
    r3 = requests.post(f"{API}/codes/validate", json={"code": code})
    assert r3.status_code == 400
    assert "sudah digunakan" in r3.json()["detail"].lower()

    # PDF
    r4 = requests.get(f"{API}/pakta/{pakta_id}/pdf")
    assert r4.status_code == 200
    assert r4.headers["content-type"].startswith("application/pdf")
    assert r4.content[:4] == b"%PDF"


def test_submit_without_signature(generated_codes):
    code = generated_codes[1]["code"]
    payload = {"code": code, "nama": "X", "nik": "1", "jabatan": "G", "unit": "U",
               "tanggal_peminjaman": "2026-01-15", "signature": ""}
    r = requests.post(f"{API}/pakta/submit", json=payload)
    assert r.status_code == 400


# ---------------- lungsuran chain check (seeded serial F9FZ2BBBB04)
def test_lungsuran_trace_seeded():
    r = requests.get(f"{API}/public/trace/F9FZ2BBBB04")
    if r.status_code == 404:
        pytest.skip("Seed data not present for F9FZ2BBBB04")
    assert r.status_code == 200
    data = r.json()
    assert data["ipad"]["serial_number"] == "F9FZ2BBBB04"
    assert len(data["chain"]) >= 2, "expected multiple holders in lungsuran chain"
    seqs = [c.get("sequence") for c in data["chain"]]
    # ordered by created_at asc => sequences should be increasing
    assert seqs == sorted(seqs)


# ---------------- public endpoints
def test_public_stats():
    r = requests.get(f"{API}/public/stats")
    assert r.status_code == 200
    d = r.json()
    for k in ["total_ipads", "total_paktas", "active_holders", "lungsuran_count", "active_codes",
              "by_version", "by_storage", "by_year", "recent"]:
        assert k in d


def test_public_ipads():
    r = requests.get(f"{API}/public/ipads")
    assert r.status_code == 200
    lst = r.json()
    assert isinstance(lst, list)
    if lst:
        assert "serial_number" in lst[0] and "chain" in lst[0]


# ---------------- delete code
def test_delete_active_code(auth, generated_codes):
    code_id = generated_codes[2]["id"]
    r = requests.delete(f"{API}/admin/codes/{code_id}", headers=auth)
    assert r.status_code == 200
