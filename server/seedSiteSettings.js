/**
 * One-time script: uploads all local site images to Cloudinary and seeds
 * the SiteSettings document with the resulting URLs.
 *
 * Run: node server/seedSiteSettings.js
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { v2 as cloudinary } from 'cloudinary'
import { connectDB } from './db.js'
import { SiteSettings } from './models/SiteSettings.js'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

function uploadFile(filePath, folder = 'nivora/site') {
  return new Promise((resolve, reject) => {
    const buffer = fs.readFileSync(filePath)
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', quality: 'auto', fetch_format: 'auto' },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    )
    stream.end(buffer)
  })
}

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')

const LOCAL_FILES = {
  logo: path.join(ROOT, 'src/assets/images/nivora-logo.png'),
  footerLogo: path.join(ROOT, 'public/nivora-footer-logo.png'),
  serviceCards: [
    path.join(ROOT, 'public/living-room-design.jpg'),
    path.join(ROOT, 'public/modular-kitchen.jpg'),
    path.join(ROOT, 'public/bedroom-interiors.jpg'),
    path.join(ROOT, 'public/dining-entertainment.jpg'),
  ],
  homePortfolio: [
    path.join(ROOT, 'attached_assets/3_(1)_1781792140739.jpg'),
    path.join(ROOT, 'attached_assets/11_1781792153281.png'),
    path.join(ROOT, 'attached_assets/6_(1)_1781792222998.jpg'),
    path.join(ROOT, 'attached_assets/16_1781792239759.jpg'),
    path.join(ROOT, 'attached_assets/2_(2)_1781792402795.jpg'),
    path.join(ROOT, 'attached_assets/3_(2)_1781792428831.jpg'),
  ],
}

const SERVICE_CARD_META = [
  { title: 'Living Room Design', desc: 'Sophisticated and welcoming living spaces designed for comfort, conversation, and everyday luxury.' },
  { title: 'Modular Kitchen', desc: 'Smart, elegant kitchens with seamless storage solutions, premium finishes, and functional layouts.' },
  { title: 'Bedroom Interiors', desc: 'Calm and luxurious retreats crafted with warm textures, custom furniture, and ambient lighting.' },
  { title: 'Dining & Entertainment', desc: 'Stylish dining areas and entertainment spaces designed to bring family and guests together.' },
]

const HOME_PORTFOLIO_META = [
  { id: 'calista-residence', name: 'Royal Living Redefined', location: 'Juhu, Mumbai', category: 'Residential', serviceHref: '/services/residential', desc: 'A warm family home brought to life with marble surfaces, rich walnut joinery and considered lighting that shifts with the day.' },
  { id: 'neelaya-villa', name: 'Modern Elegance', location: 'Lonavala, Pune', category: 'Residential', serviceHref: '/services/residential', desc: 'Double-height living volumes filled with natural light, statement chandelier and bespoke teal upholstery set against cream walls.' },
  { id: 'sparsh-living', name: 'Bungalow Ramakunj', location: 'Baner, Pune', category: 'Residential', serviceHref: '/services/residential', desc: 'A playful yet refined modular kitchen in blush rose gloss, framed by an arched passage into a warmly lit living space.' },
  { id: 'modern-industrial-office', name: 'The Office Neutral Edit', location: 'Lower Parel, Mumbai', category: 'Commercial', serviceHref: '/services/commercial', desc: 'A skyline terrace redesigned as an intimate outdoor retreat — stone floors, teak ceilings and lush greenery under city skies.' },
  { id: 'aurelia-penthouse', name: 'The Quiet Curve', location: 'Worli, Mumbai', category: 'Residential', serviceHref: '/services/residential', desc: 'Elegant classic-contemporary living with a curved sectional, marble coffee table and layered drapery drawing in abundant daylight.' },
  { id: 'urban-serenity', name: 'The Soft Neutral Story', location: 'Koregaon Park, Pune', category: 'Residential', serviceHref: '/services/residential', desc: 'Arched niches in warm ivory, backlit fluted panels and a floating walnut console make this media wall a quiet centrepiece.' },
]

async function main() {
  await connectDB()

  console.log('Uploading logo...')
  const logoUrl = await uploadFile(LOCAL_FILES.logo)
  console.log('  logo:', logoUrl)

  console.log('Uploading footer logo...')
  const footerLogoUrl = await uploadFile(LOCAL_FILES.footerLogo)
  console.log('  footer logo:', footerLogoUrl)

  console.log('Uploading service card images...')
  const serviceCardImgs = []
  for (const [i, filePath] of LOCAL_FILES.serviceCards.entries()) {
    const url = await uploadFile(filePath)
    console.log(`  service[${i}]:`, url)
    serviceCardImgs.push(url)
  }

  console.log('Uploading home portfolio images...')
  const homePortfolioImgs = []
  for (const [i, filePath] of LOCAL_FILES.homePortfolio.entries()) {
    const url = await uploadFile(filePath)
    console.log(`  portfolio[${i}]:`, url)
    homePortfolioImgs.push(url)
  }

  const serviceCards = SERVICE_CARD_META.map((meta, i) => ({
    ...meta,
    img: serviceCardImgs[i],
  }))

  const homePortfolio = HOME_PORTFOLIO_META.map((meta, i) => ({
    ...meta,
    img: homePortfolioImgs[i],
  }))

  await SiteSettings.findOneAndUpdate(
    { _singleton: 'default' },
    { $set: { logoUrl, footerLogoUrl, serviceCards, homePortfolio } },
    { upsert: true, new: true }
  )

  console.log('\n✅ SiteSettings seeded successfully.')
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
