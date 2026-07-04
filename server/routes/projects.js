import { Router } from 'express'
import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'
import { Project } from '../models/Project.js'

const router = Router()

// Multer – store upload in memory, then stream to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 30 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'))
    }
    cb(null, true)
  },
})

// Helper: upload a buffer to Cloudinary and return the secure URL
function uploadToCloudinary(buffer, folder = 'nivora/projects') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', quality: 'auto', fetch_format: 'auto' },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    )
    stream.end(buffer)
  })
}

// ── Simple admin token guard for mutating endpoints ───────────────────────────
function requireAdmin(req, res, next) {
  const adminToken = process.env.ADMIN_TOKEN
  // If no ADMIN_TOKEN is set, only allow from localhost
  if (!adminToken) {
    const ip = req.ip || req.connection?.remoteAddress || ''
    if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') return next()
    return res.status(403).json({ error: 'Admin access required. Set ADMIN_TOKEN env variable.' })
  }
  const provided = req.headers['x-admin-token']
  if (provided !== adminToken) {
    return res.status(403).json({ error: 'Forbidden: invalid admin token' })
  }
  next()
}

// ── IMPORTANT: static routes MUST come before /:id to avoid shadowing ─────────

// ── GET /api/projects ─────────────────────────────────────────────────────────
router.get('/', async (_req, res) => {
  try {
    const projects = await Project.find(
      {},
      'id name location category year badge concept coverImage'
    ).sort({ createdAt: -1 })
    res.json(projects)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

// ── POST /api/projects/upload-image (static — must be before /:id) ────────────
router.post('/upload-image', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const url = await uploadToCloudinary(req.file.buffer)
    res.json({ url })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Image upload failed' })
  }
})

// ── POST /api/projects/upload-images (static — must be before /:id) ──────────
router.post('/upload-images', requireAdmin, upload.array('images', 30), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ error: 'No files uploaded' })
    // Upload in batches of 5 to avoid memory pressure
    const urls = []
    const batch = 5
    for (let i = 0; i < req.files.length; i += batch) {
      const chunk = req.files.slice(i, i + batch)
      const chunkUrls = await Promise.all(chunk.map(f => uploadToCloudinary(f.buffer)))
      urls.push(...chunkUrls)
    }
    res.json({ urls })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Image upload failed' })
  }
})

// ── POST /api/projects (create — must be before /:id) ────────────────────────
router.post('/', requireAdmin, async (req, res) => {
  try {
    const project = new Project(req.body)
    await project.save()
    res.status(201).json(project)
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
})

// ── GET /api/projects/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findOne({ id: req.params.id })
    if (!project) return res.status(404).json({ error: 'Project not found' })
    res.json(project)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch project' })
  }
})

// ── PUT /api/projects/:id ─────────────────────────────────────────────────────
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    )
    if (!project) return res.status(404).json({ error: 'Project not found' })
    res.json(project)
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
})

// ── DELETE /api/projects/:id ──────────────────────────────────────────────────
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ id: req.params.id })
    if (!project) return res.status(404).json({ error: 'Project not found' })
    res.json({ message: 'Deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete project' })
  }
})

export default router
