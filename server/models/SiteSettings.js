import mongoose from 'mongoose'

const serviceCardSchema = new mongoose.Schema({
  img: { type: String, default: '' },
  title: { type: String, default: '' },
  desc: { type: String, default: '' },
}, { _id: false })

const portfolioItemSchema = new mongoose.Schema({
  id: { type: String, default: '' },
  name: { type: String, default: '' },
  location: { type: String, default: '' },
  category: { type: String, default: '' },
  serviceHref: { type: String, default: '' },
  desc: { type: String, default: '' },
  img: { type: String, default: '' },
}, { _id: false })

const homeHeroSchema = new mongoose.Schema({
  backgroundImage: { type: String, default: '' },
  headline: { type: String, default: '' },
  subheadline: { type: String, default: '' },
  ctaText: { type: String, default: '' },
  ctaLink: { type: String, default: '' },
}, { _id: false })

const servicePageHeroSchema = new mongoose.Schema({
  backgroundImage: { type: String, default: '' },
  headline: { type: String, default: '' },
  subheadline: { type: String, default: '' },
}, { _id: false })

const serviceItemSchema = new mongoose.Schema({
  img: { type: String, default: '' },
  title: { type: String, default: '' },
  desc: { type: String, default: '' },
}, { _id: false })

const siteSettingsSchema = new mongoose.Schema({
  // Singleton — always one document
  _singleton: { type: String, default: 'default', unique: true },

  // ── Header / Footer ──────────────────────────────────────────────────────────
  logoUrl: { type: String, default: '' },
  footerLogoUrl: { type: String, default: '' },

  // ── Home Page ────────────────────────────────────────────────────────────────
  homeHero: { type: homeHeroSchema, default: () => ({}) },
  serviceCards: { type: [serviceCardSchema], default: [] },
  homePortfolio: { type: [portfolioItemSchema], default: [] },

  // ── Service Page ─────────────────────────────────────────────────────────────
  servicePageHero: { type: servicePageHeroSchema, default: () => ({}) },
  servicesList: { type: [serviceItemSchema], default: [] },

}, { timestamps: true })

export const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema)
