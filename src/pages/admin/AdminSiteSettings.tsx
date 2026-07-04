import { useState, useEffect, useRef, ChangeEvent } from 'react'
import { fetchSiteSettings, updateSiteSettings, uploadSiteImage, SiteSettings, ServiceCard, HomePortfolioItem } from '../../lib/api'
import { invalidateSiteSettings } from '../../hooks/useSiteSettings'
import { Upload, Loader2, Save } from 'lucide-react'

const GOLD = '#7a6245'

function ImageUploadField({
  label,
  currentUrl,
  onUploaded,
}: {
  label: string
  currentUrl: string
  onUploaded: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
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

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {currentUrl && (
          <img
            src={currentUrl}
            alt={label}
            style={{ height: 56, width: 'auto', maxWidth: 160, objectFit: 'contain', borderRadius: 4, border: '1px solid #e2d9ce', background: '#f5f0e8', padding: 4 }}
          />
        )}
        <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleChange} />
        <button
          onClick={() => ref.current?.click()}
          disabled={uploading}
          style={uploadBtnStyle}
        >
          {uploading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={14} />}
          {uploading ? 'Uploading…' : 'Replace Image'}
        </button>
      </div>
      {error && <p style={{ color: '#b85a4a', fontSize: 12, marginTop: 4 }}>{error}</p>}
    </div>
  )
}

function ServiceCardEditor({
  card,
  index,
  onChange,
}: {
  card: ServiceCard
  index: number
  onChange: (updated: ServiceCard) => void
}) {
  return (
    <div style={{ border: '1px solid #e2d9ce', borderRadius: 6, padding: '16px 20px', marginBottom: 12, background: '#fff' }}>
      <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: '#9a8e82', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Card {index + 1}
      </p>
      <ImageUploadField
        label="Image"
        currentUrl={card.img}
        onUploaded={url => onChange({ ...card, img: url })}
      />
      <div style={{ marginBottom: 10 }}>
        <label style={labelStyle}>Title</label>
        <input
          style={inputStyle}
          value={card.title}
          onChange={e => onChange({ ...card, title: e.target.value })}
        />
      </div>
      <div>
        <label style={labelStyle}>Description</label>
        <textarea
          style={{ ...inputStyle, height: 60, resize: 'vertical' }}
          value={card.desc}
          onChange={e => onChange({ ...card, desc: e.target.value })}
        />
      </div>
    </div>
  )
}

function PortfolioItemEditor({
  item,
  index,
  onChange,
}: {
  item: HomePortfolioItem
  index: number
  onChange: (updated: HomePortfolioItem) => void
}) {
  return (
    <div style={{ border: '1px solid #e2d9ce', borderRadius: 6, padding: '16px 20px', marginBottom: 12, background: '#fff' }}>
      <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: '#9a8e82', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Item {index + 1} — {item.name || '(unnamed)'}
      </p>
      <ImageUploadField
        label="Image"
        currentUrl={item.img}
        onUploaded={url => onChange({ ...item, img: url })}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div>
          <label style={labelStyle}>Name</label>
          <input style={inputStyle} value={item.name} onChange={e => onChange({ ...item, name: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Location</label>
          <input style={inputStyle} value={item.location} onChange={e => onChange({ ...item, location: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Category</label>
          <input style={inputStyle} value={item.category} onChange={e => onChange({ ...item, category: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Service Link</label>
          <input style={inputStyle} value={item.serviceHref} onChange={e => onChange({ ...item, serviceHref: e.target.value })} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Description</label>
        <textarea
          style={{ ...inputStyle, height: 60, resize: 'vertical' }}
          value={item.desc}
          onChange={e => onChange({ ...item, desc: e.target.value })}
        />
      </div>
    </div>
  )
}

export default function AdminSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSiteSettings()
      .then(data => {
        // Normalise: ensure arrays are present so .map() doesn't crash
        setSettings({
          ...data,
          serviceCards: data.serviceCards ?? [],
          homePortfolio: data.homePortfolio ?? [],
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const save = async () => {
    if (!settings) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const updated = await updateSiteSettings(settings)
      invalidateSiteSettings(updated)
      setSettings(updated)
      setSuccess('Site settings saved successfully.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, color: '#b0a498' }}>
      <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', marginRight: 10 }} /> Loading…
    </div>
  }

  if (!settings) {
    return <div style={{ padding: 40, color: '#b85a4a' }}>Failed to load site settings.</div>
  }

  return (
    <div>
      {success && <div style={successStyle}>{success}</div>}
      {error && <div style={errorStyle}>{error} <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#b85a4a', cursor: 'pointer', fontSize: 18 }}>×</button></div>}

      {/* ── Logo ── */}
      <Section title="Logo">
        <ImageUploadField
          label="Navbar Logo"
          currentUrl={settings.logoUrl}
          onUploaded={url => setSettings(s => s ? { ...s, logoUrl: url } : s)}
        />
        <ImageUploadField
          label="Footer Logo"
          currentUrl={settings.footerLogoUrl}
          onUploaded={url => setSettings(s => s ? { ...s, footerLogoUrl: url } : s)}
        />
      </Section>

      {/* ── Service Cards ── */}
      <Section title="Our Expertise — Service Cards">
        <p style={{ fontSize: 13, color: '#9a8e82', marginBottom: 16 }}>
          These are the 4 cards shown in the "Spaces Designed for Every Lifestyle" section on the homepage.
        </p>
        {settings.serviceCards.map((card, i) => (
          <ServiceCardEditor
            key={i}
            card={card}
            index={i}
            onChange={updated => {
              const cards = [...settings.serviceCards]
              cards[i] = updated
              setSettings(s => s ? { ...s, serviceCards: cards } : s)
            }}
          />
        ))}
      </Section>

      {/* ── Home Portfolio ── */}
      <Section title="Homepage Portfolio Showcase">
        <p style={{ fontSize: 13, color: '#9a8e82', marginBottom: 16 }}>
          The 6 featured projects shown on the homepage (not from the portfolio database — these are curated homepage highlights).
        </p>
        {settings.homePortfolio.map((item, i) => (
          <PortfolioItemEditor
            key={i}
            item={item}
            index={i}
            onChange={updated => {
              const items = [...settings.homePortfolio]
              items[i] = updated
              setSettings(s => s ? { ...s, homePortfolio: items } : s)
            }}
          />
        ))}
      </Section>

      {/* Save button */}
      <div style={{ padding: '0 0 40px' }}>
        <button
          onClick={save}
          disabled={saving}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: GOLD, color: '#fff', border: 'none', borderRadius: 4,
            padding: '10px 24px', fontSize: 13, letterSpacing: '0.08em',
            cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600,
            textTransform: 'uppercase', opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
          {saving ? 'Saving…' : 'Save All Changes'}
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{
        fontSize: 13, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase',
        color: '#7a6245', marginBottom: 16, paddingBottom: 8,
        borderBottom: '1px solid #e2d9ce',
      }}>{title}</h2>
      {children}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
  color: '#9a8e82', fontWeight: 600, marginBottom: 5,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', border: '1px solid #ddd7ce', borderRadius: 4,
  fontSize: 13, color: '#2a2218', fontFamily: 'inherit', outline: 'none',
  background: '#faf8f5',
}

const uploadBtnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  background: 'none', border: '1px solid #ddd7ce', color: '#7a6245',
  borderRadius: 4, padding: '7px 12px', fontSize: 12, cursor: 'pointer',
  letterSpacing: '0.05em', transition: 'all 0.2s',
}

const successStyle: React.CSSProperties = {
  marginBottom: 16, background: '#f0f7f0', border: '1px solid #b5d9b5',
  color: '#3a7a3a', borderRadius: 4, padding: '10px 16px', fontSize: 13,
}

const errorStyle: React.CSSProperties = {
  marginBottom: 16, background: '#fdf0ee', border: '1px solid #e8b5ad',
  color: '#b85a4a', borderRadius: 4, padding: '10px 16px', fontSize: 13,
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
}
