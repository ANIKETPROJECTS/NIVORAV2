import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Instagram, MapPin, Mail, Phone } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { useSiteSettings } from '../hooks/useSiteSettings'

const FALLBACK_FOOTER_LOGO = '/nivora-footer-logo.png'

function useTransparentLogo(src: string) {
  const [logoSrc, setLogoSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!src) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2]
        if (Math.abs(r - g) < 28 && Math.abs(g - b) < 28 && r > 170 && g > 160 && b > 150) {
          data[i + 3] = 0
        }
      }
      ctx.putImageData(imageData, 0, 0)
      setLogoSrc(canvas.toDataURL('image/png'))
    }
    img.onerror = () => setLogoSrc(src) // fallback: show as-is
    img.src = src
  }, [src])

  return logoSrc
}

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/testimonials', label: 'Testimonials' },
  { to: '/contact', label: 'Contact' },
]

const serviceLinks = [
  { to: '/services/residential', label: 'Residential Interiors' },
  { to: '/services/commercial', label: 'Commercial Interiors' },
  { to: '/services/hospitality', label: 'Hospitality Interiors' },
  { to: '/services/architecture', label: 'Architecture & Space Planning' },
  { to: '/services/visualization', label: '2D & 3D Visualization' },
  { to: '/services/renovation', label: 'Renovation & Makeovers' },
]

function FooterLink({ to, label }: { to: string; label: string }) {
  return (
    <li style={{ listStyle: 'none' }}>
      <Link
        to={to}
        style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: 13,
          fontWeight: 300,
          color: '#f5f2ed',
          textDecoration: 'none',
          letterSpacing: '0.04em',
          display: 'inline-block',
          position: 'relative',
          paddingBottom: 2,
          transition: 'color 0.3s ease',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.color = '#a18661'
          const bar = el.querySelector('.link-bar') as HTMLElement | null
          if (bar) bar.style.width = '100%'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.color = '#f5f2ed'
          const bar = el.querySelector('.link-bar') as HTMLElement | null
          if (bar) bar.style.width = '0%'
        }}
      >
        {label}
        <span
          className="link-bar"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: 1,
            width: '0%',
            background: '#a18661',
            transition: 'width 0.3s ease',
            display: 'block',
          }}
        />
      </Link>
    </li>
  )
}

export default function Footer() {
  const { settings } = useSiteSettings()
  const rawLogoSrc = settings?.footerLogoUrl || FALLBACK_FOOTER_LOGO
  const logoSrc = useTransparentLogo(rawLogoSrc)
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  const colVariant = (x: number, delay: number) => ({
    hidden: { opacity: 0, x, y: x === 0 ? 20 : 0 },
    visible: {
      opacity: 1, x: 0, y: 0,
      transition: {
        duration: x !== 0 ? 0.7 : 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  })

  return (
    <footer
      ref={ref}
      style={{ backgroundColor: '#21291a', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <style>{`
        @keyframes wa-pulse {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0;   }
        }
        .wa-pulse-ring {
          position: absolute;
          inset: 0;
          border-radius: 50px;
          background: rgba(37, 211, 102, 0.4);
          animation: wa-pulse 1.8s ease-out infinite;
          pointer-events: none;
        }

        /* ── Mobile footer: 2-column link grid ── */
        @media (max-width: 768px) {
          .footer-main-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .footer-brand-col {
            grid-column: 1 / -1 !important;
            border-right: none !important;
            padding-right: 0 !important;
            align-items: center !important;
            padding-bottom: 28px !important;
          }
          .footer-nav-col {
            grid-column: 1 !important;
            grid-row: 2 !important;
            border-right: none !important;
            padding-left: 0 !important;
            padding-right: 8px !important;
            padding-bottom: 0 !important;
          }
          .footer-services-col {
            grid-column: 2 !important;
            grid-row: 2 / 4 !important;
            border-right: none !important;
            padding-left: 16px !important;
            padding-right: 0 !important;
            padding-bottom: 24px !important;
            border-left: 1px solid rgba(255,255,255,0.06);
          }
          .footer-findus-col {
            grid-column: 1 !important;
            grid-row: 3 !important;
            padding-left: 0 !important;
            padding-right: 8px !important;
            padding-bottom: 0 !important;
            padding-top: 28px;
          }
          .footer-bottom-bar {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center;
            gap: 4px !important;
          }
        }
      `}</style>

      <div
        className="max-w-7xl mx-auto px-6 lg:px-12"
        style={{ paddingTop: 56, paddingBottom: 28 }}
      >
        <div className="footer-main-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">

          {/* Column 1 — Brand */}
          <motion.div
            variants={colVariant(-20, 0)}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="footer-brand-col pr-10 pb-12 lg:pb-0"
            style={{
              borderRight: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            {/* Logo */}
            <a
              href="/"
              style={{
                display: 'block',
                marginBottom: 24,
                textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt="Nivora Interiors"
                  style={{
                    display: 'block',
                    width: 200,
                    height: 'auto',
                    objectFit: 'contain',
                    opacity: 0.95,
                    transition: 'filter 0.3s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.filter = 'brightness(1.25)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.filter = 'brightness(1)' }}
                />
              ) : (
                <div style={{ width: 200, height: 80 }} />
              )}
            </a>

            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: 'rgba(245,242,237,0.45)',
              fontSize: 13,
              lineHeight: 1.8,
              fontWeight: 300,
              marginBottom: 24,
              maxWidth: 210,
            }}>
              Thoughtful spaces designed<br />for refined living.
            </p>

            {/* WhatsApp button with pulse ring */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <span className="wa-pulse-ring" />
              <a
                href="https://wa.me/917276687805"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 50,
                  backgroundColor: '#25D366',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 300,
                  fontFamily: "'Jost', sans-serif",
                  textDecoration: 'none',
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat with us
              </a>
            </div>
          </motion.div>

          {/* Column 2 — Navigate */}
          <motion.div
            variants={colVariant(0, 0.1)}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="footer-nav-col px-10 pb-12 lg:pb-0"
            style={{ borderRight: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h4 style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 10,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#a18661',
              marginBottom: 24,
              fontWeight: 400,
            }}>Navigate</h4>
            <ul style={{ padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {navLinks.map(l => <FooterLink key={l.to} to={l.to} label={l.label} />)}
            </ul>
          </motion.div>

          {/* Column 3 — What We Do */}
          <motion.div
            variants={colVariant(0, 0.2)}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="footer-services-col px-10 pb-12 lg:pb-0"
            style={{ borderRight: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h4 style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 10,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#a18661',
              marginBottom: 24,
              fontWeight: 400,
            }}>What We Do</h4>
            <ul style={{ padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {serviceLinks.map(l => <FooterLink key={l.to} to={l.to} label={l.label} />)}
            </ul>
          </motion.div>

          {/* Column 4 — Find Us */}
          <motion.div
            variants={colVariant(20, 0.3)}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="footer-findus-col pl-10 pb-12 lg:pb-0"
          >
            <h4 style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 10,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#a18661',
              marginBottom: 24,
              fontWeight: 400,
            }}>Find Us</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                <MapPin size={16} color="#a18661" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 13,
                  fontWeight: 300,
                  color: 'rgba(245,242,237,0.5)',
                  lineHeight: 1.7,
                  margin: 0,
                }}>
                  Ambernath,<br />Maharashtra 421505
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a
                  href="mailto:hello@nivorainteriors.com"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 13,
                    fontWeight: 300,
                    color: '#a18661',
                    textDecoration: 'none',
                    transition: 'opacity 0.25s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.75' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                >
                  <Mail size={16} color="#a18661" style={{ flexShrink: 0 }} />
                  hello@nivorainteriors.com
                </a>
                <a
                  href="tel:+917276687805"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 13,
                    fontWeight: 300,
                    color: 'rgba(245,242,237,0.5)',
                    textDecoration: 'none',
                    transition: 'color 0.25s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#a18661' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(245,242,237,0.5)' }}
                >
                  <Phone size={16} color="#a18661" style={{ flexShrink: 0 }} />
                  +91 72766 87805
                </a>
              </div>

              {/* Instagram */}
              <a
                href="https://instagram.com/NivoraInteriors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                style={{
                  color: 'rgba(245,242,237,0.6)',
                  display: 'inline-block',
                  marginTop: 4,
                  opacity: 0.7,
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.opacity = '1'
                  el.style.transform = 'rotate(15deg) scale(1.1)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.opacity = '0.7'
                  el.style.transform = 'rotate(0deg) scale(1)'
                }}
              >
                <Instagram size={18} />
              </a>
            </div>
          </motion.div>

        </div>

        {/* Gold divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          style={{
            height: 1,
            background: 'rgba(161,134,97,0.3)',
            margin: '48px 0 0',
            transformOrigin: 'left center',
          }}
        />

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
          className="footer-bottom-bar"
          style={{
            paddingTop: 20,
            paddingBottom: 8,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <p style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: 12,
            fontWeight: 300,
            color: '#6d5a41',
            margin: 0,
          }}>
            © 2025 Nivora Interiors. All rights reserved.
          </p>
          <p style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: 12,
            fontWeight: 300,
            color: '#6d5a41',
            margin: 0,
          }}>
            Designed with intention.
          </p>
        </motion.div>

      </div>
    </footer>
  )
}
