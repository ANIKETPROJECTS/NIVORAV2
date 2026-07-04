import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import IntroOverlay from './components/IntroOverlay'
import ConsultationPopup from './components/ConsultationPopup'
import Home from './pages/Home'
import Portfolio from './pages/Portfolio'
import Services from './pages/Services'
import About from './pages/About'
import Testimonials from './pages/Testimonials'
import Contact from './pages/Contact'
import Quote from './pages/Quote'
import ThankYou from './pages/ThankYou'
import ProjectDetail from './pages/ProjectDetail'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import ProtectedAdminRoute from './pages/admin/ProtectedAdminRoute'

// Computed once at module load: was this a fresh page load or reload?
// "navigate" = fresh load (URL bar / bookmark / new tab)
// "reload"   = hard refresh (F5 / Ctrl+R)
// Both should show the splash. Only in-app SPA navigation skips it.
const isPageLoad = (() => {
  try {
    const entries = performance.getEntriesByType('navigation')
    if (entries.length > 0) {
      const type = (entries[0] as PerformanceNavigationTiming).type
      return type === 'navigate' || type === 'reload'
    }
  } catch {}
  return true // safe fallback for browsers that don't support the API
})()

// In-memory flag: has the splash already played in this page-load session?
// Module-level so it survives React re-renders but resets on every true page load.
let hasShownSplash = false

// ─────────────────────────────────────────────────────────────────────────────

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}

function AppInner() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  // Should the splash show right now on home?
  const splashEligible = () => isPageLoad && !hasShownSplash

  const [homeKey, setHomeKey] = useState(0)
  const [splashDone, setSplashDone] = useState(!isHome || !splashEligible())
  const [showSplash, setShowSplash] = useState(isHome && splashEligible())

  useEffect(() => {
    if (location.pathname === '/') {
      if (splashEligible()) {
        setShowSplash(true)
        setSplashDone(false)
        setHomeKey(k => k + 1)
      } else {
        setShowSplash(false)
        setSplashDone(true)
      }
    } else {
      setShowSplash(false)
      setSplashDone(true)
    }
  }, [location.key])

  const handleSplashComplete = () => {
    hasShownSplash = true   // mark as shown in this page-load session
    setSplashDone(true)
    setShowSplash(false)
  }

  return (
    <>
      {showSplash && (
        <IntroOverlay key={homeKey} onExitComplete={handleSplashComplete} />
      )}
      <ConsultationPopup />
      <motion.div
        animate={{ x: showSplash ? '100%' : 0 }}
        transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
        style={{ overflowX: 'hidden', minHeight: '100vh' }}
      >
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout><Home splashDone={splashDone} /></Layout>} />
          <Route path="/portfolio" element={<Layout><Portfolio /></Layout>} />
          <Route path="/portfolio/:id" element={<Layout><ProjectDetail /></Layout>} />
          <Route path="/services" element={<Layout><Services /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/testimonials" element={<Layout><Testimonials /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/quote" element={<Layout><Quote /></Layout>} />
          <Route path="/thank-you" element={<Layout><ThankYou /></Layout>} />
        </Routes>
      </motion.div>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Admin routes (no Navbar/Footer/splash) ── */}
        <Route path="/adminpannel" element={<AdminLogin />} />
        <Route
          path="/adminpannel/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
        {/* ── Public site ── */}
        <Route path="/*" element={<AppInner />} />
      </Routes>
    </BrowserRouter>
  )
}
