/**
 * Server-side admin credentials and session token.
 * Credentials never leave the server — the login endpoint validates them
 * and returns a short-lived session token the client sends back as
 * x-admin-token on every mutating request.
 */
import crypto from 'crypto'

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@123'

// One token per server lifetime — rotates on restart
const SESSION_TOKEN = crypto.randomUUID()

export function checkCredentials(username, password) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

export function getSessionToken() {
  return SESSION_TOKEN
}

export function validateToken(token) {
  return typeof token === 'string' && token === SESSION_TOKEN
}
