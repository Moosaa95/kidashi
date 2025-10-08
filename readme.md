# Kidashi Platform

Kidashi is a financial inclusion platform tailored for women-led communities. The backend is a Django REST API that powers onboarding, trust-circle management, asset financing, and notification workflows. The frontend is a React (Vite + TypeScript) admin console that consumes the API, while Celery workers orchestrate asynchronous jobs such as scheduled notifications and integrations with external banking partners.

## Table of Contents
- [Architecture](#architecture)
- [Key Directories](#key-directories)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Docker Workflow](#docker-workflow)
- [Developer Tooling](#developer-tooling)
- [Running Checks](#running-checks)
- [API Documentation](#api-documentation)
- [Background Workers](#background-workers)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Architecture
- **API**: Django 5 + Django REST Framework served from `manage.py`, with modular apps for `security`, `vendor`, `woman`, `trust_circle`, `asset`, `notification`, and `service`.
- **Async processing**: Celery + Redis handle OTP delivery, scheduled jobs, external service calls, and audit trails.
- **Data**: PostgreSQL is the primary database; Cloudinary can be configured for media storage.
- **Frontend**: `frontend/kidashi_ui` is a Vite-powered React 19 dashboard styled with Tailwind CSS and driven by Redux Toolkit query slices.
- **Docs**: `drf-spectacular` generates OpenAPI schemas with Swagger and Redoc UIs when `DEBUG=True`.

## Key Directories
```
.
├── config/                 # Django project configuration and settings
├── modules/                # Domain apps (asset, vendor, woman, trust_circle, security, etc.)
├── common/                 # Shared utilities, mixins, and helpers
├── frontend/kidashi_ui/    # React admin application (Vite)
├── docker/                 # Dockerfiles and entrypoints for web, worker, scheduler, nginx
├── envs/                   # Environment variable files (not committed in production)
├── requirements.txt        # Python dependencies
├── pyproject.toml          # Formatting tool configuration (black, djlint)
└── setup_env.sh            # Helper for provisioning .env files inside CI/CD
```

## Prerequisites
- Python 3.12+
- Node.js 20+ and npm (or pnpm/yarn if you prefer)
- PostgreSQL 14+ (local or remote)
- Redis 6+ (for Celery queues)
- Git, make (optional), and a modern shell

## Getting Started

### Backend Setup
1. Create and activate a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
2. Install Python dependencies:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
3. Create `envs/.env` (copy from an existing template if available) and set the required variables:
   ```bash
   SECRET_KEY=change-me
   DEBUG=True
   MODE=DEV

   DB_NAME=kidashi
   PGUSER=postgres
   PGPASSWORD=postgres
   PGHOST=127.0.0.1
   PGPORT=5432

   CELERY_BROKER_URL=redis://127.0.0.1:6379/0
   CELERY_RESULT_BACKEND=redis://127.0.0.1:6379/0

   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=

   CBA_BASE_URL=http://localhost:8009
   ```
   > Keep production secrets out of version control; use a separate `.env.production` file or environment variables in your deployment target.
4. Apply database migrations and create a superuser:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```
5. Start the Django server:
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

### Frontend Setup
1. Install dependencies:
   ```bash
   cd frontend/kidashi_ui
   npm install
   ```
2. Configure environment variables (copy `.env.development` to `.env.local` or update `VITE_API_URL`):
   ```bash
   VITE_API_URL=http://127.0.0.1:8000/api/v1/
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev -- --host
   ```
   The dashboard is now available at `http://localhost:5173` and proxies API requests to Django.
4. Build for production when needed:
   ```bash
   npm run build
   ```

### Docker Workflow
> Docker Compose recipes are provided for local development and deployment under `docker-compose.*.yml`.

- Local development (hot reload, local Postgres/Redis):
  ```bash
  docker compose -f docker-compose.local.dev.yml up --build
  ```
- Production-like stack (gunicorn, nginx, certbot companion):
  ```bash
  docker compose -f docker-compose.dev.yml up --build -d
  ```
- The containers expect `envs/.env` to exist; adjust volumes and secrets according to your environment.

## Developer Tooling
- **Pre-commit hooks**: install locally to enforce linting and formatting.
  ```bash
  pre-commit install
  ```
- **Formatting**: `black` (Python) and `djlint` (templates) run via pre-commit.
- **Type checking**: Type hints are partial; consider integrating `mypy` if static analysis becomes necessary.
- **Frontend linting**: `npm run lint` uses the ESLint config defined in `package.json`.

## Running Checks
- Full lint suite before committing:
  ```bash
  pre-commit run --all-files
  ```
- Django test suite (unit tests live under `modules/**/tests/`):
  ```bash
  python manage.py test
  ```
- Optional: run a targeted test module, e.g.:
  ```bash
  python manage.py test modules.service.tests.test_models
  ```
- Frontend quality gates:
  ```bash
  npm run lint
  npm run build
  ```

## API Documentation
- Swagger UI: `http://localhost:8000/api/docs/swagger`
- ReDoc: `http://localhost:8000/api/docs/redoc`
- JSON schema: `http://localhost:8000/api/docs/schema/`

The documentation routes are only available while `DEBUG=True`.

## Background Workers
- Celery worker (handles async tasks such as OTP delivery and asset workflow processing):
  ```bash
  celery -A config worker -l info
  ```
- Celery beat (schedules recurring jobs using `django_celery_beat`):
  ```bash
  celery -A config beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
  ```
Ensure Redis is reachable at the URL configured in your environment variables before starting the workers.

## Troubleshooting
- **Database connection errors**: verify `DB_NAME`, `PGUSER`, `PGPASSWORD`, `PGHOST`, and `PGPORT`, then confirm PostgreSQL is reachable.
- **Redis connection refused**: make sure the Redis service is running and matches `CELERY_BROKER_URL`/`CELERY_RESULT_BACKEND`.
- **Static assets missing in production**: run `python manage.py collectstatic` before deploying behind nginx.
- **403 CSRF errors**: update `CSRF_TRUSTED_ORIGINS` in `envs/.env` with the public domain serving Django.
- **Swagger 404**: documentation routes are disabled when `DEBUG=False`; toggle debug or generate the schema using `manage.py spectacular --file schema.yaml`.

## Contributing
- Read `CONTRIBUTING.md` for branching strategy, review expectations, and local verification steps.
- Install pre-commit hooks (`pre-commit install`) to match the automated checks run in CI.
