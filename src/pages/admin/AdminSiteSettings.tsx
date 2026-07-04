import { useState, useEffect, useRef, ChangeEvent } from 'react'
import {
  fetchSiteSettings, updateSiteSettings, uploadSiteImage,
  SiteSettings, ServiceCard, HomeHero, ServicePageHero, ServiceItem,
} from '../../lib/api'
import { invalidateSiteSettings } from '../../hooks/useSiteSettings'
import { Upload, Loader2, Save, Plus, Trash2 } from 'lucide-react'

export type SettingsSection =
  | 'header'        // Home Page → Header (navbar logo)
  | 'hero'          // Home Page → Hero Section
  | 'expertise'     // Home Page → Our Expertise
  | 'footer'        // Home Page → Footer logo
  | 'services'      // Service Page → Services list

const GOLD = '#7a6245'

// ── Shared sub-components ─────────────────────────────────────────────────────

function ImageUploadField({
  label, hint, currentUrl, onUploaded,
}: { label: string; hint?: string; currentUrl: string; onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const url = await uploadSiteImage(file)
      onUploaded(url)
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setUploading(false)
      if (ref.current) ref.current.value = ''
    }
  }

  const applyUrl = () => {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    onUploaded(trimmed)
    setUrlInput('')
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <label style={labelStyle}>{label}</label>
      {hint && <p style={{ fontSize: 12, color: '#b0a498', margin: '0 0 10px' }}>{hint}</p>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        {currentUrl ? (
          <img src={currentUrl} alt={label} style={{
            height: 64, width: 'auto', maxWidth: 200, objectFit: 'contain',
            borderRadius: 6, border: '1px solid #e2d9ce', background: '#f5f0e8', padding: 6,
          }} />
        ) : (
          <div style={{
            height: 64, width: 140, borderRadius: 6, border: '2px dashed #e2d9ce',
            background: '#faf8f5', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#c0b5a8', fontSize: 11,
          }}>No image</div>
        )}
        <div>
          <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleChange} />
          <button onClick={() => ref.current?.click()} disabled={uploading} style={uploadBtnStyle}>
            {uploading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={13} />}
            {uploading ? 'Uploading…' : currentUrl ? 'Replace Image' : 'Upload Image'}
          </button>
          {currentUrl && <p style={{ fontSize: 11, color: '#c0b5a8', marginTop: 5 }}>Served from Cloudinary CDN</p>}
        </div>
      </div>
      {/* URL paste option */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <span style={{ fontSize: 11, color: '#c0b5a8', whiteSpace: 'nowrap' }}>Or paste URL:</span>
        <input
          type="url"
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          placeholder="https://example.com/image.jpg"
          onKeyDown={e => { if (e.key === 'Enter') applyUrl() }}
          style={{ ...inputStyle, fontSize: 12, padding: '5px 9px', flex: 1, minWidth: 0 }}
        />
        <button
          onClick={applyUrl}
          disabled={!urlInput.trim()}
          style={{
            ...uploadBtnStyle, padding: '5px 12px', fontSize: 11,
            opacity: urlInput.trim() ? 1 : 0.5,
            cursor: urlInput.trim() ? 'pointer' : 'default',
            whiteSpace: 'nowrap',
          }}
        >
          Use URL
        </button>
      </div>
      {error && <p style={{ color: '#b85a4a', fontSize: 12, marginTop: 6 }}>{error}</p>}
    </div>
  )
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
      {children}
    </div>
  )
}

function TextField({
  label, value, onChange, multiline, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {multiline ? (
        <textarea
          style={{ ...inputStyle, height: 72, resize: 'vertical' }}
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
        />
      ) : (
        <input style={inputStyle} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
      )}
    </div>
  )
}

function SaveBar({ saving, onSave, success, error, onClearError }: {
  saving: boolean; onSave: () => void; success: string; error: string; onClearError: () => void
}) {
  return (
    <div style={{ paddingTop: 8, paddingBottom: 48 }}>
      {success && <div style={successStyle}>{success}</div>}
      {error && (
        <div style={errorStyle}>
          {error}
          <button onClick={onClearError} style={{ background: 'none', border: 'none', color: '#b85a4a', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
      )}
      <button onClick={onSave} disabled={saving} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: GOLD, color: '#fff', border: 'none', borderRadius: 4,
        padding: '10px 28px', fontSize: 13, letterSpacing: '0.08em',
        cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600,
        textTransform: 'uppercase', opacity: saving ? 0.7 : 1,
        marginTop: success || error ? 12 : 0,
      }}>
        {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  )
}

// ── Section Panels ────────────────────────────────────────────────────────────

function HeaderPanel({ settings, onChange }: { settings: SiteSettings; onChange: (s: SiteSettings) => void }) {
  const size = settings.logoSize ?? 38
  return (
    <div>
      <p style={descStyle}>The logo shown in the top navigation bar across the entire website.</p>
      <ImageUploadField
        label="Navbar Logo"
        hint="Works best as a wide PNG with transparent background."
        currentUrl={settings.logoUrl}
        onUploaded={url => onChange({ ...settings, logoUrl: url })}
      />
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Logo Size (height in px)</label>
        <p style={{ fontSize: 12, color: '#b0a498', margin: '0 0 8px' }}>
          Current: <strong>{size}px</strong> height. Drag or type to resize.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="range" min={20} max={100} step={1} value={size}
            onChange={e => onChange({ ...settings, logoSize: Number(e.target.value) })}
            style={{ flex: 1, accentColor: GOLD }}
          />
          <input
            type="number" min={20} max={100} value={size}
            onChange={e => onChange({ ...settings, logoSize: Number(e.target.value) })}
            style={{ ...inputStyle, width: 72, textAlign: 'center' }}
          />
        </div>
      </div>
    </div>
  )
}

function FooterPanel({ settings, onChange }: { settings: SiteSettings; onChange: (s: SiteSettings) => void }) {
  const size = settings.footerLogoSize ?? 200
  return (
    <div>
      <p style={descStyle}>The logo shown in the footer. A version with a light/transparent background works best on the dark footer.</p>
      <ImageUploadField
        label="Footer Logo"
        hint="Works best as a wide PNG with transparent or dark background."
        currentUrl={settings.footerLogoUrl}
        onUploaded={url => onChange({ ...settings, footerLogoUrl: url })}
      />
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Logo Size (width in px)</label>
        <p style={{ fontSize: 12, color: '#b0a498', margin: '0 0 8px' }}>
          Current: <strong>{size}px</strong> wide. Drag or type to resize.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="range" min={80} max={400} step={4} value={size}
            onChange={e => onChange({ ...settings, footerLogoSize: Number(e.target.value) })}
            style={{ flex: 1, accentColor: GOLD }}
          />
          <input
            type="number" min={80} max={400} value={size}
            onChange={e => onChange({ ...settings, footerLogoSize: Number(e.target.value) })}
            style={{ ...inputStyle, width: 72, textAlign: 'center' }}
          />
        </div>
      </div>
    </div>
  )
}

function HeroPanel({ settings, onChange }: { settings: SiteSettings; onChange: (s: SiteSettings) => void }) {
  const hero: HomeHero = settings.homeHero ?? { backgroundImage: '', headline: '', subheadline: '', ctaText: '', ctaLink: '' }
  const update = (patch: Partial<HomeHero>) => onChange({ ...settings, homeHero: { ...hero, ...patch } })

  return (
    <div>
      <p style={descStyle}>The full-screen hero shown at the top of the home page — background image, headline, subheadline, and call-to-action button.</p>
      <ImageUploadField
        label="Background Image"
        hint="Full-width image behind the hero text. Use a high-resolution landscape photo."
        currentUrl={hero.backgroundImage}
        onUploaded={url => update({ backgroundImage: url })}
      />
      <div style={{ marginBottom: 12 }}>
        <TextField
          label="Headline"
          value={hero.headline}
          placeholder="e.g. Thoughtful Spaces, Timeless Design"
          onChange={v => update({ headline: v })}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <TextField
          label="Subheadline"
          value={hero.subheadline}
          placeholder="e.g. Interior design that transforms the way you live."
          onChange={v => update({ subheadline: v })}
          multiline
        />
      </div>
      <FieldRow>
        <TextField label="CTA Button Text" value={hero.ctaText} placeholder="e.g. Explore Our Work" onChange={v => update({ ctaText: v })} />
        <TextField label="CTA Button Link" value={hero.ctaLink} placeholder="e.g. /portfolio" onChange={v => update({ ctaLink: v })} />
      </FieldRow>
    </div>
  )
}

function ExpertisePanel({ settings, onChange }: { settings: SiteSettings; onChange: (s: SiteSettings) => void }) {
  const update = (i: number, card: ServiceCard) => {
    const cards = [...settings.serviceCards]
    cards[i] = card
    onChange({ ...settings, serviceCards: cards })
  }

  return (
    <div>
      <p style={descStyle}>
        The cards in the <strong>"Spaces Designed for Every Lifestyle"</strong> section on the homepage. Each card has an image, title, and description.
      </p>
      {settings.serviceCards.map((card, i) => (
        <div key={i} style={cardBoxStyle}>
          <p style={cardIndexStyle}>Card {i + 1}</p>
          <ImageUploadField label="Image" currentUrl={card.img} onUploaded={url => update(i, { ...card, img: url })} />
          <TextField label="Title" value={card.title} onChange={v => update(i, { ...card, title: v })} />
          <div style={{ marginTop: 10 }}>
            <TextField label="Description" value={card.desc} onChange={v => update(i, { ...card, desc: v })} multiline />
          </div>
        </div>
      ))}
    </div>
  )
}



function ServicesPanel({ settings, onChange }: { settings: SiteSettings; onChange: (s: SiteSettings) => void }) {
  const items: ServiceItem[] = settings.servicesList ?? []

  const update = (i: number, item: ServiceItem) => {
    const list = [...items]
    list[i] = item
    onChange({ ...settings, servicesList: list })
  }

  const addItem = () => {
    onChange({ ...settings, servicesList: [...items, { img: '', title: '', desc: '' }] })
  }

  const removeItem = (i: number) => {
    const list = items.filter((_, idx) => idx !== i)
    onChange({ ...settings, servicesList: list })
  }

  return (
    <div>
      <p style={descStyle}>The individual services listed on the Services page. Each service has an image, title, and description.</p>

      {items.map((item, i) => (
        <div key={i} style={{ ...cardBoxStyle, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ ...cardIndexStyle, margin: 0 }}>Service {i + 1}</p>
            <button
              onClick={() => removeItem(i)}
              style={{ background: 'none', border: '1px solid #e2d9ce', color: '#b85a4a', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
            >
              <Trash2 size={12} /> Remove
            </button>
          </div>
          <ImageUploadField label="Image" currentUrl={item.img} onUploaded={url => update(i, { ...item, img: url })} />
          <div style={{ marginBottom: 10 }}>
            <TextField label="Title" value={item.title} placeholder="e.g. Residential Design" onChange={v => update(i, { ...item, title: v })} />
          </div>
          <TextField label="Description" value={item.desc} placeholder="e.g. Full-service interior design for homes and apartments." onChange={v => update(i, { ...item, desc: v })} multiline />
        </div>
      ))}

      <button onClick={addItem} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'none', border: `1px dashed ${GOLD}`, color: GOLD,
        borderRadius: 6, padding: '10px 20px', fontSize: 13, cursor: 'pointer',
        letterSpacing: '0.04em', marginBottom: 24,
      }}>
        <Plus size={14} /> Add Service
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  section: SettingsSection
}

const EMPTY_SETTINGS: SiteSettings = {
  logoUrl: '', logoSize: 38,
  footerLogoUrl: '', footerLogoSize: 200,
  homeHero: { backgroundImage: '', headline: '', subheadline: '', ctaText: '', ctaLink: '' },
  serviceCards: [],
  homePortfolio: [],
  servicePageHero: { backgroundImage: '', headline: '', subheadline: '' },
  servicesList: [],
}

export default function AdminSiteSettings({ section }: Props) {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    fetchSiteSettings()
      .then(data => {
        setSettings({ ...EMPTY_SETTINGS, ...data })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { setSuccess(''); setError('') }, [section])

  const save = async () => {
    if (!settings) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const updated = await updateSiteSettings(settings)
      const merged = { ...EMPTY_SETTINGS, ...updated }
      invalidateSiteSettings(merged)
      setSettings(merged)
      setSuccess('Changes saved successfully.')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '80px 0', color: '#b0a498' }}>
        <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} /> Loading…
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!settings) {
    return <div style={{ padding: '40px 0', color: '#b85a4a' }}>Failed to load settings. Please refresh.</div>
  }

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {section === 'header'    && <HeaderPanel    settings={settings} onChange={setSettings} />}
      {section === 'hero'      && <HeroPanel      settings={settings} onChange={setSettings} />}
      {section === 'expertise' && <ExpertisePanel settings={settings} onChange={setSettings} />}
      {section === 'footer'    && <FooterPanel    settings={settings} onChange={setSettings} />}
      {section === 'services'  && <ServicesPanel  settings={settings} onChange={setSettings} />}

      <SaveBar saving={saving} onSave={save} success={success} error={error} onClearError={() => setError('')} />
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase',
  color: '#9a8e82', fontWeight: 600, marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 11px', border: '1px solid #ddd7ce', borderRadius: 4,
  fontSize: 13, color: '#2a2218', fontFamily: 'inherit', outline: 'none',
  background: '#faf8f5', transition: 'border-color 0.2s',
}

const uploadBtnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  background: 'none', border: '1px solid #c8bfb2', color: GOLD,
  borderRadius: 4, padding: '8px 14px', fontSize: 12, cursor: 'pointer',
  letterSpacing: '0.04em', transition: 'all 0.2s', fontFamily: 'inherit',
}

const descStyle: React.CSSProperties = {
  fontSize: 13, color: '#9a8e82', marginBottom: 24, lineHeight: 1.6,
}

const cardBoxStyle: React.CSSProperties = {
  border: '1px solid #e2d9ce', borderRadius: 8, padding: '20px 24px',
  marginBottom: 16, background: '#fff',
}

const cardIndexStyle: React.CSSProperties = {
  margin: '0 0 16px', fontSize: 11, fontWeight: 700, color: '#c0b5a8',
  letterSpacing: '0.18em', textTransform: 'uppercase',
}

const successStyle: React.CSSProperties = {
  marginBottom: 12, background: '#f0f7f0', border: '1px solid #b5d9b5',
  color: '#3a7a3a', borderRadius: 4, padding: '10px 16px', fontSize: 13,
}

const errorStyle: React.CSSProperties = {
  marginBottom: 12, background: '#fdf0ee', border: '1px solid #e8b5ad',
  color: '#b85a4a', borderRadius: 4, padding: '10px 16px', fontSize: 13,
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
}
