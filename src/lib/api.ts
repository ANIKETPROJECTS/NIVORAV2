// Thin API client — all calls go to /api (proxied to the Express server by Vite in dev,
// and to the same origin in production if you server-side render or use a reverse proxy).

export interface Project {
  id: string
  name: string
  location: string
  category: 'residential' | 'commercial' | 'architecture'
  year: string
  badge: string

  // Concept section
  conceptLabel: string
  concept: string
  description: string

  // Design intent section
  designIntentLabel: string
  designIntent: string

  // Materials
  materials: string[]

  // Images
  coverImage: string
  images: string[]
}

export interface ServiceCard {
  img: string
  title: string
  desc: string
}

export interface HomePortfolioItem {
  id: string
  name: string
  location: string
  category: string
  serviceHref: string
  desc: string
  img: string
}

export interface HomeHero {
  backgroundImage: string
  headline: string
  subheadline: string
  ctaText: string
  ctaLink: string
}

export interface ServicePageHero {
  backgroundImage: string
  headline: string
  subheadline: string
}

export interface ServiceItem {
  img: string
  title: string
  desc: string
}

export interface SiteSettings {
  logoUrl: string
  logoSize: number
  footerLogoUrl: string
  footerLogoSize: number
  homeHero: HomeHero
  serviceCards: ServiceCard[]
  homePortfolio: HomePortfolioItem[]
  servicePageHero: ServicePageHero
  servicesList: ServiceItem[]
}

const BASE = '/api'

// ── Admin session token (stored after login) ──────────────────────────────────
const ADMIN_TOKEN_KEY = 'nivora_admin_token'

export function getAdminToken(): string | null {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY)
}
export function setAdminToken(token: string) {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token)
  sessionStorage.setItem('nivora_admin', 'true')
}
export function clearAdminToken() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY)
  sessionStorage.removeItem('nivora_admin')
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

async function adminRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAdminToken() || ''
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-admin-token': token,
    ...(options?.headers as Record<string, string> | undefined),
  }
  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (res.status === 403) {
    // Token was rejected — server likely restarted and issued a new token.
    // Clear the stale token and redirect to login so the user can re-authenticate.
    clearAdminToken()
    window.location.href = '/adminpannel'
    throw new Error('Session expired. Please log in again.')
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

// ── Admin login ───────────────────────────────────────────────────────────────
export async function adminLogin(username: string, password: string): Promise<void> {
  const res = await fetch(`${BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Login failed')
  }
  const data = await res.json()
  setAdminToken(data.token)
}

// ── Portfolio grid ────────────────────────────────────────────────────────────
export function fetchProjects(): Promise<Pick<Project, 'id' | 'name' | 'location' | 'category' | 'year' | 'badge' | 'concept' | 'coverImage'>[]> {
  return request('/projects')
}

// ── Project detail ────────────────────────────────────────────────────────────
export function fetchProject(id: string): Promise<Project> {
  return request(`/projects/${id}`)
}

// ── Admin helpers ─────────────────────────────────────────────────────────────
export function createProject(data: Partial<Project>): Promise<Project> {
  return adminRequest('/projects', { method: 'POST', body: JSON.stringify(data) })
}

export function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  return adminRequest(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteProject(id: string): Promise<{ message: string }> {
  return adminRequest(`/projects/${id}`, { method: 'DELETE' })
}

/**
 * Upload one or more image files to Cloudinary via the backend (projects folder).
 * Returns an array of secure Cloudinary URLs.
 */
export async function uploadImages(files: File[]): Promise<string[]> {
  const token = getAdminToken() || ''
  const form = new FormData()
  files.forEach(f => form.append('images', f))
  const res = await fetch(`${BASE}/projects/upload-images`, {
    method: 'POST',
    headers: { 'x-admin-token': token },
    body: form,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Upload failed')
  }
  const data = await res.json()
  return data.urls as string[]
}

/**
 * Upload a single image to the site/branding folder in Cloudinary.
 * Returns the secure URL.
 */
export async function uploadSiteImage(file: File): Promise<string> {
  const token = getAdminToken() || ''
  const form = new FormData()
  form.append('image', file)
  const res = await fetch(`${BASE}/site-settings/upload-image`, {
    method: 'POST',
    headers: { 'x-admin-token': token },
    body: form,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Upload failed')
  }
  const data = await res.json()
  return data.url as string
}

// ── Site Settings ─────────────────────────────────────────────────────────────
export function fetchSiteSettings(): Promise<SiteSettings> {
  return request('/site-settings')
}

export function updateSiteSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
  return adminRequest('/site-settings', { method: 'PUT', body: JSON.stringify(data) })
}
