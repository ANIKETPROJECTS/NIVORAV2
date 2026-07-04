# Nivora Interiors

An interior design portfolio/showcase app with a React + Vite frontend and an Express API backend.

## Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router v6
- **Backend**: Express 5 (Node.js), Mongoose (MongoDB), Cloudinary (image storage), Multer (file upload)

## Running on Replit

Two workflows must both be running:

| Workflow | Command | Port |
|---|---|---|
| Start application | `npm run dev` | 5000 |
| Start API server | `npm run server` | 3001 |

The Vite dev server proxies `/api/*` requests to the Express API on port 3001.

## Required secrets

| Secret | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

## Seeding data

```bash
npm run seed
```

## Project structure

```
src/           React frontend (pages, components, hooks)
server/        Express API (routes, models, db connection)
public/        Static assets
attached_assets/  Local image assets referenced by the frontend
```
