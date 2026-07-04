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

const siteSettingsSchema = new mongoose.Schema({
  // Singleton — always one document
  _singleton: { type: String, default: 'default', unique: true },

  logoUrl: { type: String, default: '' },
  footerLogoUrl: { type: String, default: '' },

  serviceCards: {
    type: [serviceCardSchema],
    default: [],
  },

  homePortfolio: {
    type: [portfolioItemSchema],
    default: [],
  },
}, { timestamps: true })

export const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema)
