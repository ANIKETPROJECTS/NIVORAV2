import { useState, useRef, ChangeEvent } from 'react'
import { Project, uploadImages } from '../../lib/api'
import { X, Plus, Upload, Loader2, GripVertical } from 'lucide-react'

type FormData = Omit<Project, 'badge'>

interface Props {
  initial?: Partial<FormData>
  onSave: (data: Partial<FormData>) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
}

const DEFAULT: Partial<FormData> = {
  id: '',
  name: '',
  location: '',
  category: 'residential',
  year: new Date().getFullYear().toString(),
  conceptLabel: 'The Concept',
  concept: '',
  description: '',
  designIntentLabel: 'Design Intent',
  designIntent: '',
  materials: [],
  coverImage: '',
  images: [],
}

export default function AdminProjectForm({ initial, onSave, onCancel, isEdit }: Props) {
  const [form, setForm] = useState<Partial<FormData>>({ ...DEFAULT, ...initial })
  const [materialInput, setMaterialInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Image upload state
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const coverRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const set = (key: keyof FormData, value: unknown) =>
    setForm(f => ({ ...f, [key]: value }))

  const slugify = (str: string) =>
    str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleNameChange = (val: string) => {
    set('name', val)
    if (!isEdit) set('id', slugify(val))
  }

  const addMaterial = () => {
    const m = materialInput.trim()
    if (!m) return
    set('materials', [...(form.materials || []), m])
    setMaterialInput('')
  }

  const removeMaterial = (i: number) =>
    set('materials', (form.materials || []).filter((_, idx) => idx !== i))

  const handleCoverUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploadingCover(true)
    try {
      const urls = await uploadImages([files[0]])
      set('coverImage', urls[0])
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setUploadingCover(false)
      if (coverRef.current) coverRef.current.value = ''
    }
  }

  const handleGalleryUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploadingGallery(true)
    try {
      const urls = await uploadImages(files)
      set('images', [...(form.images || []), ...urls])
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setUploadingGallery(false)
      if (galleryRef.current) galleryRef.current.value = ''
    }
  }

  const removeImage = (i: number) =>
    set('images', (form.images || []).filter((_, idx) => idx !== i))

  const moveImage = (from: number, to: number) => {
    const imgs = [...(form.images || [])]
    const [item] = imgs.splice(from, 1)
    imgs.splice(to, 0, item)
    set('images', imgs)
  }

  const setCoverFromGallery = (url: string) => set('coverImage', url)

  const handleSubmit = async () => {
    setError('')
    if (!form.name?.trim()) return setError('Project name is required.')
    if (!form.id?.trim()) return setError('Project ID / slug is required.')
    if (!form.category) return setError('Category is required.')
    setSaving(true)
    try {
      await onSave(form)
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="apf-overlay">
      <div className="apf-panel">
        {/* Header */}
        <div className="apf-header">
          <h2 className="apf-title">{isEdit ? 'Edit Project' : 'Add New Project'}</h2>
          <button className="apf-close" onClick={onCancel}><X size={20} /></button>
        </div>

        <div className="apf-body">
          {error && <div className="apf-error">{error}</div>}

          {/* ── Basic Info ── */}
          <section className="apf-section">
            <h3 className="apf-section-title">Basic Information</h3>
            <div className="apf-grid-2">
              <div className="apf-field">
                <label>Project Name <span className="req">*</span></label>
                <input value={form.name || ''} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Serenity Villa" />
              </div>
              <div className="apf-field">
                <label>Slug / ID <span className="req">*</span></label>
                <input
                  value={form.id || ''}
                  onChange={e => set('id', slugify(e.target.value))}
                  placeholder="e.g. serenity-villa-mumbai"
                  readOnly={isEdit}
                  style={isEdit ? { opacity: 0.5 } : {}}
                />
              </div>
              <div className="apf-field">
                <label>Location</label>
                <input value={form.location || ''} onChange={e => set('location', e.target.value)} placeholder="e.g. Juhu, Mumbai" />
              </div>
              <div className="apf-field">
                <label>Year</label>
                <input value={form.year || ''} onChange={e => set('year', e.target.value)} placeholder="e.g. 2024" />
              </div>
              <div className="apf-field">
                <label>Category <span className="req">*</span></label>
                <select value={form.category || 'residential'} onChange={e => set('category', e.target.value)}>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="architecture">Architecture</option>
                </select>
              </div>
            </div>
          </section>

          {/* ── Concept ── */}
          <section className="apf-section">
            <h3 className="apf-section-title">Concept Section</h3>
            <div className="apf-grid-2">
              <div className="apf-field">
                <label>Concept Label</label>
                <input value={form.conceptLabel || ''} onChange={e => set('conceptLabel', e.target.value)} placeholder="The Concept" />
              </div>
              <div className="apf-field">
                <label>Concept Tagline</label>
                <input value={form.concept || ''} onChange={e => set('concept', e.target.value)} placeholder="e.g. Calm monumentality with organic textures" />
              </div>
            </div>
            <div className="apf-field apf-field-full">
              <label>Description</label>
              <textarea rows={4} value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Long-form description of the project…" />
            </div>
          </section>

          {/* ── Design Intent ── */}
          <section className="apf-section">
            <h3 className="apf-section-title">Design Intent</h3>
            <div className="apf-grid-2">
              <div className="apf-field">
                <label>Design Intent Label</label>
                <input value={form.designIntentLabel || ''} onChange={e => set('designIntentLabel', e.target.value)} placeholder="Design Intent" />
              </div>
            </div>
            <div className="apf-field apf-field-full">
              <label>Design Intent Quote</label>
              <textarea rows={3} value={form.designIntent || ''} onChange={e => set('designIntent', e.target.value)} placeholder="e.g. To create a home that breathes — where every surface tells a quiet story." />
            </div>
          </section>

          {/* ── Materials ── */}
          <section className="apf-section">
            <h3 className="apf-section-title">Materials</h3>
            <div className="apf-materials-input">
              <input
                value={materialInput}
                onChange={e => setMaterialInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMaterial() } }}
                placeholder="e.g. Lime-washed oak — press Enter or click Add"
              />
              <button type="button" className="apf-add-btn" onClick={addMaterial}><Plus size={16} /> Add</button>
            </div>
            {(form.materials || []).length > 0 && (
              <div className="apf-tags">
                {(form.materials || []).map((m, i) => (
                  <span key={i} className="apf-tag">
                    {m}
                    <button onClick={() => removeMaterial(i)}><X size={12} /></button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* ── Cover Image ── */}
          <section className="apf-section">
            <h3 className="apf-section-title">Cover Image</h3>
            <p className="apf-hint">The thumbnail shown on portfolio cards and the hero background.</p>
            {form.coverImage ? (
              <div className="apf-cover-preview">
                <img src={form.coverImage} alt="Cover" />
                <button className="apf-cover-remove" onClick={() => set('coverImage', '')}>
                  <X size={14} /> Remove
                </button>
              </div>
            ) : (
              <div className="apf-upload-zone" onClick={() => coverRef.current?.click()}>
                {uploadingCover
                  ? <><Loader2 size={24} className="apf-spin" /> Uploading…</>
                  : <><Upload size={24} /> Click to upload cover image</>}
              </div>
            )}
            <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} />
            {/* Allow picking from gallery too */}
            {(form.images || []).length > 0 && !form.coverImage && (
              <p className="apf-hint" style={{ marginTop: 8 }}>Or pick from gallery images below.</p>
            )}
          </section>

          {/* ── Gallery Images ── */}
          <section className="apf-section">
            <h3 className="apf-section-title">Gallery Images</h3>
            <p className="apf-hint">First image is used as the hero on the project detail page. Drag order by clicking ↑ ↓. Click any image to set it as the cover.</p>

            <div className="apf-upload-zone" onClick={() => galleryRef.current?.click()}>
              {uploadingGallery
                ? <><Loader2 size={24} className="apf-spin" /> Uploading…</>
                : <><Upload size={24} /> Click to upload gallery images (multiple allowed)</>}
            </div>
            <input ref={galleryRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleGalleryUpload} />

            {(form.images || []).length > 0 && (
              <div className="apf-gallery-grid">
                {(form.images || []).map((url, i) => (
                  <div key={i} className="apf-gallery-item">
                    <img src={url} alt={`Image ${i + 1}`} />
                    <div className="apf-gallery-overlay">
                      <button onClick={() => setCoverFromGallery(url)} title="Set as cover" className="apf-gal-btn">Cover</button>
                      <button onClick={() => removeImage(i)} title="Remove" className="apf-gal-btn apf-gal-btn-del"><X size={12} /></button>
                    </div>
                    <div className="apf-gallery-order">
                      {i > 0 && <button onClick={() => moveImage(i, i - 1)} className="apf-ord-btn">↑</button>}
                      {i < (form.images || []).length - 1 && <button onClick={() => moveImage(i, i + 1)} className="apf-ord-btn">↓</button>}
                    </div>
                    <span className="apf-gallery-num">{i === 0 ? 'Hero' : `#${i + 1}`}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="apf-footer">
          <button className="apf-btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="apf-btn-save" onClick={handleSubmit} disabled={saving}>
            {saving ? <><Loader2 size={15} className="apf-spin" /> Saving…</> : isEdit ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </div>

      <style>{`
        .apf-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.75);
          display: flex; align-items: flex-start; justify-content: center;
          overflow-y: auto; padding: 32px 16px;
        }
        .apf-panel {
          background: #161a14;
          border: 1px solid #2a2f26;
          border-radius: 6px;
          width: 100%; max-width: 820px;
          display: flex; flex-direction: column;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6);
        }
        .apf-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 24px 32px;
          border-bottom: 1px solid #2a2f26;
        }
        .apf-title { margin: 0; font-size: 20px; color: #c9b89a; font-weight: normal; letter-spacing: 0.05em; }
        .apf-close {
          background: none; border: none; color: #5a6354; cursor: pointer; padding: 4px;
          border-radius: 3px; transition: color 0.2s;
          display: flex; align-items: center;
        }
        .apf-close:hover { color: #c9b89a; }
        .apf-body { padding: 24px 32px; display: flex; flex-direction: column; gap: 0; overflow-y: auto; }
        .apf-section { margin-bottom: 32px; }
        .apf-section-title {
          font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase;
          color: #7a8a72; font-family: Arial, sans-serif; margin: 0 0 16px 0;
          padding-bottom: 8px; border-bottom: 1px solid #1e241b;
        }
        .apf-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        @media (max-width: 600px) { .apf-grid-2 { grid-template-columns: 1fr; } }
        .apf-field { display: flex; flex-direction: column; gap: 6px; }
        .apf-field-full { width: 100%; }
        .apf-field label {
          font-size: 11px; letter-spacing: 0.15em; color: #7a8a72;
          font-family: Arial, sans-serif; text-transform: uppercase;
        }
        .req { color: #c07a6a; }
        .apf-field input, .apf-field select, .apf-field textarea {
          background: #1e241b; border: 1px solid #2a3026;
          border-radius: 3px; color: #d4c9b0; font-size: 14px;
          padding: 10px 12px; outline: none; font-family: Arial, sans-serif;
          transition: border-color 0.2s; resize: vertical;
        }
        .apf-field input:focus, .apf-field select:focus, .apf-field textarea:focus { border-color: #c9b89a; }
        .apf-field input::placeholder, .apf-field textarea::placeholder { color: #3a4036; }
        .apf-field select option { background: #1e241b; }
        .apf-hint { font-size: 12px; color: #5a6354; font-family: Arial, sans-serif; margin: 0 0 12px 0; }
        .apf-error {
          background: #2a1515; border: 1px solid #5a2020; border-radius: 3px;
          color: #c07a6a; font-size: 13px; font-family: Arial, sans-serif;
          padding: 10px 14px; margin-bottom: 16px;
        }
        .apf-materials-input { display: flex; gap: 8px; }
        .apf-materials-input input {
          flex: 1; background: #1e241b; border: 1px solid #2a3026;
          border-radius: 3px; color: #d4c9b0; font-size: 14px;
          padding: 10px 12px; outline: none; font-family: Arial, sans-serif;
          transition: border-color 0.2s;
        }
        .apf-materials-input input:focus { border-color: #c9b89a; }
        .apf-add-btn {
          display: flex; align-items: center; gap: 6px;
          background: #2a3026; border: 1px solid #3a4036;
          color: #c9b89a; border-radius: 3px; padding: 0 16px;
          font-size: 13px; font-family: Arial, sans-serif; cursor: pointer;
          white-space: nowrap; transition: background 0.2s;
        }
        .apf-add-btn:hover { background: #333d2e; }
        .apf-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
        .apf-tag {
          display: flex; align-items: center; gap: 6px;
          background: #2a3026; border: 1px solid #3a4036;
          color: #c9b89a; border-radius: 20px;
          padding: 4px 12px 4px 14px; font-size: 13px;
          font-family: Arial, sans-serif;
        }
        .apf-tag button {
          background: none; border: none; color: #7a8a72;
          cursor: pointer; padding: 0; display: flex; align-items: center;
          transition: color 0.2s;
        }
        .apf-tag button:hover { color: #c07a6a; }
        .apf-upload-zone {
          border: 2px dashed #2a3026; border-radius: 4px;
          padding: 32px; text-align: center;
          color: #5a6354; font-family: Arial, sans-serif; font-size: 14px;
          cursor: pointer; transition: border-color 0.2s, color 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .apf-upload-zone:hover { border-color: #c9b89a; color: #c9b89a; }
        .apf-spin { animation: spin 1s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .apf-cover-preview { position: relative; display: inline-block; margin-top: 0; }
        .apf-cover-preview img {
          width: 100%; max-width: 320px; border-radius: 4px;
          border: 1px solid #2a2f26; display: block; object-fit: cover; height: 180px;
        }
        .apf-cover-remove {
          position: absolute; top: 8px; right: 8px;
          background: rgba(0,0,0,0.7); border: none; color: #c07a6a;
          border-radius: 3px; padding: 4px 10px; font-size: 12px;
          cursor: pointer; display: flex; align-items: center; gap: 4px;
          font-family: Arial, sans-serif;
        }
        .apf-gallery-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px; margin-top: 16px;
        }
        .apf-gallery-item {
          position: relative; border-radius: 4px; overflow: hidden;
          border: 1px solid #2a2f26; aspect-ratio: 4/3;
        }
        .apf-gallery-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .apf-gallery-overlay {
          position: absolute; inset: 0; background: rgba(0,0,0,0.6);
          display: flex; align-items: center; justify-content: center; gap: 8px;
          opacity: 0; transition: opacity 0.2s;
        }
        .apf-gallery-item:hover .apf-gallery-overlay { opacity: 1; }
        .apf-gal-btn {
          background: rgba(201,184,154,0.9); color: #0e110d;
          border: none; border-radius: 3px; padding: 4px 10px;
          font-size: 11px; font-family: Arial, sans-serif; cursor: pointer;
          font-weight: 600; transition: background 0.2s;
          display: flex; align-items: center; gap: 4px;
        }
        .apf-gal-btn:hover { background: #d4c9b0; }
        .apf-gal-btn-del { background: rgba(192,122,106,0.9); color: #fff; }
        .apf-gal-btn-del:hover { background: rgba(192,122,106,1); }
        .apf-gallery-order {
          position: absolute; bottom: 4px; left: 4px; display: flex; gap: 4px;
        }
        .apf-ord-btn {
          background: rgba(0,0,0,0.6); color: #c9b89a;
          border: none; border-radius: 2px; padding: 2px 6px;
          font-size: 12px; cursor: pointer; transition: background 0.2s;
        }
        .apf-ord-btn:hover { background: rgba(0,0,0,0.9); }
        .apf-gallery-num {
          position: absolute; top: 6px; left: 6px;
          background: rgba(0,0,0,0.65); color: #c9b89a;
          font-size: 10px; font-family: Arial, sans-serif;
          padding: 2px 7px; border-radius: 10px; letter-spacing: 0.05em;
        }
        .apf-footer {
          display: flex; justify-content: flex-end; gap: 12px;
          padding: 20px 32px; border-top: 1px solid #2a2f26;
        }
        .apf-btn-ghost {
          background: none; border: 1px solid #2a3026; color: #7a8a72;
          border-radius: 3px; padding: 10px 24px; font-size: 13px;
          font-family: Arial, sans-serif; cursor: pointer; transition: all 0.2s;
        }
        .apf-btn-ghost:hover { border-color: #7a8a72; color: #c9b89a; }
        .apf-btn-save {
          background: #c9b89a; color: #0e110d; border: none;
          border-radius: 3px; padding: 10px 28px; font-size: 13px;
          letter-spacing: 0.1em; font-family: Arial, sans-serif; cursor: pointer;
          font-weight: 600; transition: background 0.2s; text-transform: uppercase;
          display: flex; align-items: center; gap: 8px;
        }
        .apf-btn-save:hover:not(:disabled) { background: #d4c9b0; }
        .apf-btn-save:disabled { opacity: 0.5; cursor: default; }
      `}</style>
    </div>
  )
}
