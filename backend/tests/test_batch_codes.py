"""Batch code generation tests - AAIIBS iPad Lungsuran System."""
import os
import requests
import pytest

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else "https://aaiibs-device-mgmt.preview.emergentagent.com"
API = f"{BASE_URL}/api"
ADMIN_EMAIL = "admin@aaiibs.sch.id"
ADMIN_PASS = "AAIIBS@2026"


@pytest.fixture(scope="module")
def auth():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def _delete_codes(auth, code_ids):
    for cid in code_ids:
        requests.delete(f"{API}/admin/codes/{cid}", headers=auth)


def test_batch_two_serials_count_two(auth):
    # 2 existing serials x count=2 => 4 codes
    payload = {"serial_numbers": ["DMPGX1AAAA01", "F9FZ2BBBB04"], "count": 2, "target_name": "TEST batch"}
    r = requests.post(f"{API}/admin/codes/batch", json=payload, headers=auth)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["ipad_count"] == 2
    assert d["code_count"] == 4
    assert d["not_found"] == []
    assert len(d["created"]) == 4
    serials = {c["serial_number"] for c in d["created"]}
    assert serials == {"DMPGX1AAAA01", "F9FZ2BBBB04"}
    # cleanup
    _delete_codes(auth, [c["id"] for c in d["created"]])


def test_batch_unknown_serial_ignored(auth):
    payload = {"serial_numbers": ["DMPGX1AAAA01", "ZZZ_NOT_EXIST_XYZ"], "count": 1, "target_name": "TEST"}
    r = requests.post(f"{API}/admin/codes/batch", json=payload, headers=auth)
    assert r.status_code == 200, r.text
    d = r.json()
    assert "ZZZ_NOT_EXIST_XYZ" in d["not_found"]
    assert d["ipad_count"] == 1
    assert d["code_count"] == 1
    _delete_codes(auth, [c["id"] for c in d["created"]])


def test_batch_empty_serials(auth):
    r = requests.post(f"{API}/admin/codes/batch", json={"serial_numbers": [], "count": 1}, headers=auth)
    assert r.status_code == 400


def test_batch_requires_auth():
    r = requests.post(f"{API}/admin/codes/batch", json={"serial_numbers": ["DMPGX1AAAA01"], "count": 1})
    assert r.status_code == 401


def test_single_code_endpoint_still_works(auth):
    r = requests.post(f"{API}/admin/codes",
                      json={"serial_number": "DMPGX1AAAA01", "target_name": "TEST single", "count": 1},
                      headers=auth)
    assert r.status_code == 200, r.text
    codes = r.json()
    assert len(codes) == 1
    assert codes[0]["serial_number"] == "DMPGX1AAAA01"
    _delete_codes(auth, [codes[0]["id"]])


def test_final_state_only_one_active_code(auth):
    r = requests.get(f"{API}/admin/codes", headers=auth)
    assert r.status_code == 200
    active = [c for c in r.json() if c["status"] == "active"]
    # Should be exactly the demo WSYQUN
    assert len(active) == 1, f"Expected 1 active code, found {len(active)}: {[c['code'] for c in active]}"
    assert active[0]["code"] == "WSYQUN"
