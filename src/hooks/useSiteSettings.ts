import { useState, useEffect } from 'react'
import { fetchSiteSettings, SiteSettings } from '../lib/api'

let cached: SiteSettings | null = null
const listeners: Array<() => void> = []

function notifyListeners() {
  listeners.forEach(fn => fn())
}

export function invalidateSiteSettings(fresh?: SiteSettings) {
  cached = fresh ?? null
  notifyListeners()
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(cached)
  const [loading, setLoading] = useState(!cached)

  useEffect(() => {
    let cancelled = false

    const reload = () => {
      setLoading(true)
      fetchSiteSettings()
        .then(data => {
          if (!cancelled) {
            cached = data
            setSettings(data)
            setLoading(false)
          }
        })
        .catch(() => {
          if (!cancelled) setLoading(false)
        })
    }

    if (!cached) {
      reload()
    }

    listeners.push(reload)
    return () => {
      cancelled = true
      const idx = listeners.indexOf(reload)
      if (idx !== -1) listeners.splice(idx, 1)
    }
  }, [])

  return { settings, loading }
}
