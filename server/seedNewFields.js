/**
 * Seeds homeHero, servicePageHero, and servicesList into the SiteSettings
 * document using the existing hardcoded content as the initial values.
 *
 * Safe to run multiple times — only fills fields that are currently empty.
 * Run: node server/seedNewFields.js
 */
import 'dotenv/config'
import { connectDB } from './db.js'
import { SiteSettings } from './models/SiteSettings.js'

async function main() {
  await connectDB()

  const doc = await SiteSettings.findOne({ _singleton: 'default' })

  const patch = {}

  // ── Home Hero ─────────────────────────────────────────────────────────────
  if (!doc?.homeHero?.headline) {
    patch.homeHero = {
      backgroundImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&q=85',
      headline: 'Thoughtfully Designed Interiors That Feel Effortless',
      subheadline: 'We design homes and workspaces that are beautiful, functional, and built for everyday living.',
      ctaText: 'Book Free Consultation',
      ctaLink: '/quote',
    }
    console.log('✔ homeHero seeded')
  } else {
    console.log('– homeHero already set, skipping')
  }

  // ── Service Page Hero ─────────────────────────────────────────────────────
  if (!doc?.servicePageHero?.headline) {
    patch.servicePageHero = {
      backgroundImage: '',
      headline: 'Our Services',
      subheadline: 'Complete interior design and architecture services — from first conversation to final reveal.',
    }
    console.log('✔ servicePageHero seeded')
  } else {
    console.log('– servicePageHero already set, skipping')
  }

  // ── Services List ─────────────────────────────────────────────────────────
  if (!doc?.servicesList?.length) {
    patch.servicesList = [
      {
        img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80',
        title: 'Residential Interiors',
        desc: 'Designing elegant homes and living spaces that blend comfort, functionality, and timeless beauty.',
      },
      {
        img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80',
        title: 'Commercial Interiors',
        desc: 'Creating productive offices, clinics, retail stores, and professional workspaces.',
      },
      {
        img: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=900&q=80',
        title: 'Hospitality Interiors',
        desc: 'Crafting memorable guest experiences through hotels, cafés, restaurants, and hospitality environments.',
      },
      {
        img: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=900&q=80',
        title: 'Architecture & Space Planning',
        desc: 'Planning layouts, elevations, facades, and architectural concepts for optimized spaces.',
      },
    ]
    console.log('✔ servicesList seeded (4 items)')
  } else {
    console.log(`– servicesList already has ${doc.servicesList.length} item(s), skipping`)
  }

  if (Object.keys(patch).length) {
    await SiteSettings.findOneAndUpdate(
      { _singleton: 'default' },
      { $set: patch },
      { upsert: true, new: true }
    )
    console.log('\n✅ SiteSettings updated successfully.')
  } else {
    console.log('\n✅ Nothing to update — all fields already populated.')
  }

  process.exit(0)
}

main().catch(err => { console.error(err); process.exit(1) })
