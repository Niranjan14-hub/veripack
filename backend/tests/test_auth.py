import pytest
from fastapi.testclient import TestClient

from app import db
from app.config import get_settings
from app.main import create_app

SIGNUP = {"email": "Ada@Example.com", "password": "correct horse battery", "name": "Ada"}


@pytest.fixture
def client(tmp_path, monkeypatch):
    get_settings.cache_clear()
    monkeypatch.setenv("LOCAL_STORE_PATH", str(tmp_path / "scans.json"))
    monkeypatch.setenv("LOCAL_USER_STORE_PATH", str(tmp_path / "users.json"))
    monkeypatch.setenv("MEDIA_PATH", str(tmp_path / "media"))
    monkeypatch.setenv("JWT_SECRET", "test-secret")
    with TestClient(create_app()) as test_client:
        yield test_client
    get_settings.cache_clear()


def signup(client, **overrides):
    return client.post("/api/auth/signup", json={**SIGNUP, **overrides})


def test_signup_returns_token_and_normalises_email(client):
    response = signup(client)
    assert response.status_code == 201
    body = response.json()
    assert body["user"]["email"] == "ada@example.com"
    assert body["token"]
    assert "password" not in body["user"] and "password_hash" not in body["user"]


def test_signup_rejects_duplicate_email_case_insensitively(client):
    signup(client)
    assert signup(client, email="ADA@example.com").status_code == 409


def test_signup_rejects_short_password(client):
    assert signup(client, password="short").status_code == 422


def test_login_succeeds_with_correct_password_and_fails_otherwise(client):
    signup(client)
    ok = client.post("/api/auth/login", json={"email": "ada@example.com", "password": SIGNUP["password"]})
    assert ok.status_code == 200 and ok.json()["token"]

    bad = client.post("/api/auth/login", json={"email": "ada@example.com", "password": "wrong"})
    assert bad.status_code == 401

    unknown = client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "whatever"})
    assert unknown.status_code == 401


def test_me_requires_a_valid_token(client):
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/auth/me", headers={"Authorization": "Bearer nonsense"}).status_code == 401

    token = signup(client).json()["token"]
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200 and me.json()["name"] == "Ada"


def test_scan_endpoints_require_authentication(client):
    assert client.get("/api/scans").status_code == 401
    assert client.get("/api/scans/whatever").status_code == 401
    assert client.delete("/api/scans/whatever").status_code == 401


@pytest.mark.anyio
async def test_scans_are_scoped_to_their_owner(client, tmp_path):
    ada = signup(client).json()
    grace = signup(client, email="grace@example.com", name="Grace").json()

    repository = db.get_repository()
    await repository.insert(
        {
            "id": "scan-1",
            "user_id": ada["user"]["id"],
            "created_at": "2026-01-01T00:00:00",
            "category": "food",
            "category_label": "Packaged Food",
            "verdict": "verified",
            "score": 100,
            "issues": [],
        }
    )

    def auth(session):
        return {"Authorization": f"Bearer {session['token']}"}

    assert client.get("/api/scans", headers=auth(ada)).json()["total"] == 1
    assert client.get("/api/scans", headers=auth(grace)).json()["total"] == 0
    assert client.get("/api/scans/scan-1", headers=auth(ada)).status_code == 200
    assert client.get("/api/scans/scan-1", headers=auth(grace)).status_code == 404
    assert client.delete("/api/scans/scan-1", headers=auth(grace)).status_code == 404
    assert client.delete("/api/scans/scan-1", headers=auth(ada)).status_code == 204


@pytest.fixture
def anyio_backend():
    return "asyncio"
