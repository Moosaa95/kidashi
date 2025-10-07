# Contributing to Kidashi

Thank you for your interest in improving Kidashi! This document explains how to get the project running locally, the conventions we follow, and the steps to propose a change. Please read everything before opening a pull request so we can iterate quickly together.

## Table of Contents
- [Project Setup](#project-setup)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Docker](#docker)
- [Workflow](#workflow)
  - [Branching](#branching)
  - [Commits](#commits)
  - [Pull Requests](#pull-requests)
- [Code Quality](#code-quality)
  - [Python](#python)
  - [JavaScript/TypeScript](#javascripttypescript)
  - [Before Pushing](#before-pushing)
- [Testing](#testing)
- [Reporting Issues](#reporting-issues)
- [Community Guidelines](#community-guidelines)

## Project Setup

### Backend
1. Create a virtual environment and install dependencies:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
2. Copy or create `envs/.env` with the required environment variables. See `readme.md` for the full list.
3. Apply migrations and start the server:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

### Frontend
1. Install dependencies:
   ```bash
   cd frontend/kidashi_ui
   npm install
   ```
2. Ensure `VITE_API_URL` is set in `.env.development` (or `.env.local`).
3. Run the dev server:
   ```bash
   npm run dev -- --host
   ```

### Docker
If you prefer containerized workflows, use the provided compose files:
```bash
docker compose -f docker-compose.local.dev.yml up --build
```
Make sure `envs/.env` exists before starting the stack.

## Workflow

### Branching
- Work from a dedicated feature branch. Use descriptive names, e.g. `feature/vendor-onboarding`, `bugfix/otp-expiry`, or `docs/readme-refresh`.
- Keep your branch up to date with the mainline branch (e.g. `main` or `develop`). Rebase locally if possible to maintain a linear history.

### Commits
- Commit early and often; keep commits focused and small.
- Follow the present-tense style (e.g. `Add vendor risk checks`).
- Reference issue numbers when applicable (e.g. `Fix loan status race condition (#123)`).

### Pull Requests
- Ensure your branch is rebased on the latest mainline changes before opening a PR.
- Provide context: describe the problem, your solution, and any open questions.
- Include screenshots or videos for UI changes.
- Reference related issues or specifications.
- Wait for at least one review before merging unless you have explicit approval to self-merge.

## Code Quality

### Python
- Formatting: run `black` via pre-commit (configured at 200-character line width).
- Imports: prefer absolute imports within the `modules` namespace; avoid wildcard imports.
- Django: keep models, serializers, and API endpoints self-contained with docstrings or comments when behaviour is not obvious.

### JavaScript/TypeScript
- Use the project ESLint config (`npm run lint`).
- Favour functional React components and hooks already defined in the codebase.
- Keep Redux slices focused on a single domain; colocate API slices under `frontend/kidashi_ui/src/states/api`.

### Before Pushing
Run the full suite of automated checks:
```bash
pre-commit run --all-files
python manage.py test
cd frontend/kidashi_ui && npm run lint && npm run build && cd -
```
Fix any failures before submitting.

## Testing
- Add unit tests alongside your modules (`modules/**/tests/`).
- For complex flows (e.g. asset financing lifecycle), describe the manual testing performed in the PR.
- Keep fixtures lightweight; prefer factories when available.

## Reporting Issues
- Use the issue tracker to report bugs or request features.
- Provide reproducible steps, expected vs. actual behaviour, screenshots/logs, and environment details.
- Label issues appropriately (`bug`, `enhancement`, `question`, etc.).

## Community Guidelines
- Be respectful and inclusive. We value constructive feedback and collaborative problem-solving.
- Document decisions and rationale, especially when introducing new dependencies or altering architecture.
- When in doubt, ask! We're happy to help new contributors get started.

Thank you for helping make Kidashi better.
