# VeriPack

AI-powered product label compliance verification. Photograph a package, and VeriPack reads the
label, structures every declaration and reports which required fields are missing, malformed or
non-compliant.

```
image → OpenCV preprocessing → Tesseract OCR → Gemini structuring → rules engine → verdict → history
```

## Stack

| Layer    | Technology                                       |
| -------- | ------------------------------------------------ |
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion       |
| Backend  | FastAPI, Pydantic v2                             |
| Vision   | OpenCV, Tesseract (pytesseract)                  |
| AI       | Gemini (`google-generativeai`)                   |
| Storage  | MongoDB Atlas (Motor), local JSON store fallback |

## Running locally

Prerequisites: Python 3.10+, Node 20.19+ (22 recommended), and the Tesseract binary:

```bash
sudo apt-get install -y tesseract-ocr
```

### Backend

```bash
cd backend
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
cp .env.example .env          # optional — see configuration below
.venv/bin/python -m uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                    # http://localhost:5173, proxies /api and /media to :8000
```

## Configuration

Both external services are optional so the prototype runs with zero credentials:

| Variable         | Unset behaviour                                                      |
| ---------------- | -------------------------------------------------------------------- |
| `GEMINI_API_KEY` | Falls back to a regex label parser (`app/services/heuristics.py`)     |
| `MONGODB_URI`    | Falls back to a local JSON store at `backend/data/scans.json`         |
| `JWT_SECRET`     | Falls back to a per-process secret — tokens are invalidated on restart |

`GET /api/health` reports which backends are active.

## API

All `/api/scans*` endpoints require an `Authorization: Bearer <token>` header and only ever see the
signed-in user's own scans.

| Method   | Path                        | Purpose                                             |
| -------- | --------------------------- | --------------------------------------------------- |
| `POST`   | `/api/auth/signup`          | Create an account → JWT + profile                    |
| `POST`   | `/api/auth/login`           | Exchange credentials for a JWT                       |
| `GET`    | `/api/auth/me`              | Current profile for a bearer token                   |
| `POST`   | `/api/scans`                | Multipart image + category → full scan result        |
| `POST`   | `/api/scans/demo?sample=`   | Render a bundled sample label and run the pipeline   |
| `GET`    | `/api/scans`                | Paginated history, filterable by verdict/category    |
| `GET`    | `/api/scans/{id}`           | Full scan detail                                     |
| `DELETE` | `/api/scans/{id}`           | Remove a scan                                        |
| `GET`    | `/api/rules/categories`     | Categories and their required fields                 |
| `GET`    | `/api/samples`              | Available demo samples                               |
| `GET`    | `/api/health`               | Dependency status                                    |

## Compliance rules

Rule sets are data, not code: each category is a JSON file in
`backend/app/compliance/rules/` declaring its fields, severities, unit constraints and remediation
copy. Adding a category means adding a file. The engine scores a scan by subtracting a
severity-weighted penalty per issue from 100.

## Design notes

- **Region grounding** — each extracted value is matched back to the OCR word boxes it came from, so
  the results page can highlight the exact region of the package it was read from.
- **Hallucination guard** — values are cross-checked against the raw OCR text; anything the model
  produced that is not present verbatim is flagged as `ungrounded` rather than trusted.
- **Per-user isolation** — scans carry a `user_id` and every read, write and delete is filtered by
  the token subject, so a scan belonging to someone else is a 404, not a 403 leak.
- **Readability gate** — captures below a word-count and OCR-confidence floor are rejected with
  retake guidance instead of returning confident nonsense.

## Tests

```bash
cd backend && .venv/bin/python -m pytest tests -q
```

Compliance results are indicative and not legal advice.
