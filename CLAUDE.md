# CLAUDE.md — Pet Commerce Project

This file provides guidance for AI assistants (Claude and others) working in this repository.

---

## Project Overview

**Pet Commerce** is an early-stage full-stack web application for pet-related commerce services, including product listings, veterinary hospital search, reservations, customer inquiries, and pet memorials.

- **Backend:** Node.js + Express.js REST API
- **Frontend:** Static HTML/CSS/JavaScript (no framework)
- **Data storage:** In-memory arrays (no database — data is lost on server restart)

---

## Repository Structure

```
/
├── CLAUDE.md               # This file
├── README.md               # Project overview and API docs
├── .gitignore              # Ignores node_modules/, logs/, .env
├── backend/
│   ├── package.json        # Node.js dependencies (express, cors, dotenv)
│   └── server.js           # Express API server (the entire backend)
└── frontend/
    ├── index.html          # Main landing page
    ├── css/
    │   └── styles.css      # Site-wide stylesheet
    └── js/
        └── main.js         # Basic JS utility (logs current date/time)
```

---

## Backend (`backend/server.js`)

### Running the server

```bash
cd backend
npm install
node server.js   # NOT "node index.js" — package.json has a naming discrepancy
```

The server starts on **port 3000** by default (configurable via `PORT` in a `.env` file).

### Known issue: start script mismatch

`package.json` declares `"start": "node index.js"` but the actual entry point is `server.js`. Use `node server.js` directly until this is fixed.

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| GET | `/products` | List all products |
| POST | `/products` | Create a product |
| PUT | `/products/:id` | Update a product |
| DELETE | `/products/:id` | Delete a product |
| GET | `/hospitals` | List all hospitals |
| POST | `/hospitals` | Create a hospital |
| GET | `/hospitals/search?name=` | Search hospitals by name |
| POST | `/reservations` | Create a reservation |
| POST | `/inquiries` | Submit an inquiry |
| GET | `/memorials` | List all memorials |
| POST | `/memorials` | Create a memorial |
| DELETE | `/memorials/:id` | Delete a memorial |

### Data model

All data is stored in plain in-memory arrays at the top of `server.js`. There is no database — every server restart resets all data. When adding new entities, follow the same pattern: declare an array, then wire up route handlers using `app.get/post/put/delete`.

### Middleware

- `cors()` — allows cross-origin requests from any origin
- `express.json()` — parses JSON request bodies

---

## Frontend (`frontend/`)

- `index.html` — static landing page, no dynamic content yet
- `css/styles.css` — orange header (`#ff9900`), 80%-width container, basic responsive nav
- `js/main.js` — minimal placeholder; calls `displayCurrentDateTime()` on load

The frontend does **not** currently make any API calls to the backend. Integration work remains to be done.

---

## Development Conventions

- **No TypeScript** — plain JavaScript throughout
- **No linting or formatting tools** configured (no ESLint, Prettier, etc.)
- **No test framework** — there are currently zero tests
- **No build step** — frontend is served as plain static files
- **No authentication or authorization** on any API routes
- **No input validation** — requests are trusted as-is

When adding new features, keep these conventions consistent with the existing code style until tooling is added.

---

## Known Issues / Tech Debt

1. `package.json` `start` script points to `index.js`, but the file is `server.js`.
2. Frontend has no API integration with the backend.
3. In-memory storage means all data is lost on restart — a database (e.g., SQLite, PostgreSQL) is needed for persistence.
4. README documents a "Funeral Services" endpoint that is not implemented in `server.js`.
5. No error handling middleware or input validation.
6. No tests of any kind.

---

## Git Workflow

- Default development branch: `master`
- Feature/AI work branches follow the pattern: `claude/<description>-<id>`
- Commit messages describe what was added/changed in plain language
- Only one author so far: jinsin412

---

## Environment Variables

Create a `.env` file inside `backend/` (it is gitignored):

```
PORT=3000
```

No other environment variables are currently used.
