---
name: SiteSettings pattern
description: How site-wide image settings (logo, service cards, home portfolio) are stored, served, and managed.
---

# SiteSettings Pattern

## Rule
All site images that admins need to change (logo, service card images, curated homepage items) go through a singleton `SiteSettings` MongoDB document, not static files or bundled assets.

**Why:** Allows logo/image changes without redeployment; images served from Cloudinary CDN for speed.

**How to apply:**
- Backend: `server/models/SiteSettings.js` — singleton keyed on `_singleton: 'default'`
- Routes: `server/routes/siteSettings.js` — GET `/api/site-settings` (public), PUT (admin), POST `/upload-image` (admin)
- Frontend: `src/hooks/useSiteSettings.ts` — module-level cache + listener invalidation; `invalidateSiteSettings(updatedDoc)` accepts fresh doc to avoid extra refetch
- Admin UI: `src/pages/admin/AdminSiteSettings.tsx` — rendered as a tab inside `AdminDashboard`; normalize fetched arrays to `[]` before mapping

## Seed script
`server/seedSiteSettings.js` — uploads local files to Cloudinary then writes URLs into SiteSettings.
Large images (>10MB) must be compressed first: `magick input.jpg -resize 2000x2000> -quality 82 output.jpg`

## Known dead code removed
- `portfolioProjects` array and 6 `@assets` imports in `Home.tsx` — were defined but never rendered
- `const featured = projects.slice(0, 6)` in `Home.tsx` — same situation

## homePortfolio
Admin-editable but not rendered on Home page (no section exists for it). Data and Cloudinary URLs are ready if a featured section is added later.
