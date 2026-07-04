import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useSiteSettings } from '../hooks/useSiteSettings'

const FALLBACK_LOGO = '/nivora-logo.png'

const links = [
  { to: '/', label: 'Home' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/testimonials', label: 'Testimonials' },
  { to: '/contact', label: 'Contact' },
]

const OLIVE = '#132818'
const DEEP_OLIVE = '#132818'
const GOLD = '#C8A46A'
const GOLD_LIGHT = '#D4C0A1'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { settings } = useSiteSettings()

  const logoSrc = settings?.logoUrl || FALLBACK_LOGO

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [location])

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  const handleHomeNav = (e: React.MouseEvent) => {
    e.preventDefault()
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      navigate('/', { state: { _t: Date.now() } })
    } else {
      navigate('/')
    }
  }

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          transition: 'background-color 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease',
          backgroundColor: scrolled ? DEEP_OLIVE : `${OLIVE}E8`,
          borderBottom: `1px solid rgba(212,192,161,${scrolled ? '0.18' : '0.10'})`,
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-20">

          {/* Logo */}
          <a
            href="/"
            className="navbar-logo"
            onClick={handleHomeNav}
            style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', cursor: 'pointer' }}
          >
            <img
              src={logoSrc}
              alt="Nivora Interiors"
              style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
            />
          </a>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-8">
            {links.map(l => (
              <a
                key={l.to}
                href={l.to}
                onClick={l.to === '/' ? handleHomeNav : undefined}
                className="text-xs tracking-[0.2em] uppercase font-light transition-colors duration-300 relative pb-1"
                style={{
                  color: isActive(l.to) ? GOLD : GOLD_LIGHT + 'B3',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                {l.label}
                {isActive(l.to) && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '1.5px',
                      backgroundColor: GOLD,
                      borderRadius: '1px',
                    }}
                  />
                )}
              </a>
            ))}
          </nav>

          {/* Enquire Now */}
          <Link
            to="/quote"
            className="hidden lg:inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase px-6 py-3 transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, #E0C38A 0%, #C8A46A 50%, #A8854F 100%)`,
              color: DEEP_OLIVE,
              fontWeight: 500,
              letterSpacing: '0.18em',
              boxShadow: '0 2px 14px rgba(168,133,79,0.28)',
              border: 'none',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.background = 'linear-gradient(135deg, #EDD09A 0%, #D4B078 50%, #B8904E 100%)'
              el.style.boxShadow = '0 4px 22px rgba(168,133,79,0.45)'
              el.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.background = 'linear-gradient(135deg, #E0C38A 0%, #C8A46A 50%, #A8854F 100%)'
              el.style.boxShadow = '0 2px 14px rgba(168,133,79,0.28)'
              el.style.transform = 'translateY(0)'
            }}
          >
            Enquire Now
          </Link>

          <button
            className="lg:hidden p-2"
            style={{ color: GOLD_LIGHT }}
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 flex flex-col justify-center items-center gap-8 transition-all duration-500 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: DEEP_OLIVE }}
      >
        {links.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className="font-serif text-3xl transition-colors duration-300"
            style={{ color: isActive(l.to) ? GOLD : '#f5f0e8' }}
          >
            {l.label}
          </Link>
        ))}
        <Link
          to="/quote"
          className="mt-4 text-xs tracking-[0.2em] uppercase px-10 py-4 transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #E0C38A 0%, #C8A46A 50%, #A8854F 100%)',
            color: DEEP_OLIVE,
            fontWeight: 500,
          }}
        >
          Enquire Now
        </Link>
      </div>
    </>
  )
}
