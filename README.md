# MaCoKi APMS Frontend — v1

## Included
- Responsive React + TypeScript + Vite frontend
- Dashboard, patient directory, visit register, follow-up schedule, reports, settings
- Register patient and create visit forms
- Search, status updates, dark mode, mobile navigation
- Browser-local demo persistence
- API integration boundary prepared for the existing Django REST backend

## Run in GitHub Codespaces
From the repository root, copy the contents of this folder into the existing frontend root (or use `src/` and config files to replace the current frontend files after backing up). Then run:

```bash
npm install
npm run dev -- --host 0.0.0.0
```

For a production build:
```bash
npm run build
```

## Important
This is a frontend development preview. It currently uses `localStorage` for demo records. Do not enter real patient data. Before clinical deployment, connect it to the Django API, enforce server-side authentication/permissions, and implement audit logs, secure storage, backups, and appropriate privacy safeguards.
