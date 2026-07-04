import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { v2 as cloudinary } from 'cloudinary'
import { connectDB } from './db.js'
import projectRoutes from './routes/projects.js'
import adminLoginRoute from './routes/adminLogin.js'
import siteSettingsRoute from './routes/siteSettings.js'

const app = express()
const PORT = process.env.API_PORT || 3001

// ── Cloudinary config ─────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/admin', adminLoginRoute)
app.use('/api/projects', projectRoutes)
app.use('/api/site-settings', siteSettingsRoute)

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// ── Start ─────────────────────────────────────────────────────────────────────
connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] API running on http://0.0.0.0:${PORT}`)
    })
  })
  .catch(err => {
    console.error('[Server] Failed to start:', err)
    process.exit(1)
  })
