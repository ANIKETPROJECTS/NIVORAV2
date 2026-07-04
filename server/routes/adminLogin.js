import { Router } from 'express'
import { checkCredentials, getSessionToken } from '../adminAuth.js'

const router = Router()

// POST /api/admin/login
// Body: { username, password }
// Returns: { token } on success, 401 on failure
router.post('/login', (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required.' })
  }
  if (!checkCredentials(username, password)) {
    return res.status(401).json({ error: 'Invalid username or password.' })
  }
  res.json({ token: getSessionToken() })
})

export default router
