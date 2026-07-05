import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FadeIn from '../components/FadeIn'
import { ArrowRight } from 'lucide-react'

const locations = ['Ambernath', 'Kalyan', 'Pune', 'Mumbai', 'Other']
const projectTypes = ['1BHK / 2BHK', '3BHK+', 'Villa / Bungalow', 'Office', 'Retail / Commercial']
const budgets = ['₹5L – ₹10L', '₹10L – ₹20L', '₹20L+']

export default function Quote() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', phone: '', location: '', projectType: '', budget: '', requirements: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/thank-you')
  }

  return (
    <div className="bg-[#3b4a35] pt-20 min-h-screen">
      {/* Header */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.12]">
          <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #b8966a 0%, transparent 45%)' }} />
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <FadeIn>
            <p className="text-[#b8966a] text-[10px] tracking-[0.4em] uppercase mb-4">Free Consultation</p>
            <h1 className="font-serif text-5xl md:text-6xl text-[#f5f0e8] font-light leading-tight mb-6">
              Let's Design Your Space<br />
              <em className="text-[#b8966a]">— The Right Way</em>
            </h1>
            <p className="text-[#f5f0e8]/50 font-light leading-relaxed max-w-xl mx-auto">
              Get a Free Layout Consultation (Worth ₹5,000) and understand how your space can be planned better — before you spend a single rupee.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-3xl mx-auto px-6 pb-32">
        <FadeIn>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name */}
            <div>
              <label className="text-[#b8966a] text-[10px] tracking-[0.3em] uppercase block mb-3">Full Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Your full name"
                className="w-full bg-transparent border-b border-[#b8966a]/20 text-[#f5f0e8] placeholder-[#f5f0e8]/20 py-3 text-base font-light focus:outline-none focus:border-[#b8966a] transition-colors duration-300"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-[#b8966a] text-[10px] tracking-[0.3em] uppercase block mb-3">Phone Number *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="+91 00000 00000"
                className="w-full bg-transparent border-b border-[#b8966a]/20 text-[#f5f0e8] placeholder-[#f5f0e8]/20 py-3 text-base font-light focus:outline-none focus:border-[#b8966a] transition-colors duration-300"
              />
            </div>

            {/* Project Location */}
            <div>
              <label className="text-[#b8966a] text-[10px] tracking-[0.3em] uppercase block mb-4">Project Location *</label>
              <div className="flex flex-wrap gap-3">
                {locations.map(l => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => set('location', l)}
                    className={`text-xs tracking-[0.15em] uppercase px-6 py-3 transition-all duration-300 ${
                      form.location === l
                        ? 'bg-[#b8966a] text-[#3b4a35]'
                        : 'border border-[#f5f0e8]/15 text-[#f5f0e8]/40 hover:border-[#b8966a] hover:text-[#b8966a]'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Project Type */}
            <div>
              <label className="text-[#b8966a] text-[10px] tracking-[0.3em] uppercase block mb-4">Project Type *</label>
              <div className="flex flex-wrap gap-3">
                {projectTypes.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set('projectType', t)}
                    className={`text-xs tracking-[0.15em] uppercase px-6 py-3 transition-all duration-300 ${
                      form.projectType === t
                        ? 'bg-[#b8966a] text-[#3b4a35]'
                        : 'border border-[#f5f0e8]/15 text-[#f5f0e8]/40 hover:border-[#b8966a] hover:text-[#b8966a]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="text-[#b8966a] text-[10px] tracking-[0.3em] uppercase block mb-4">Estimated Budget *</label>
              <div className="flex flex-wrap gap-3">
                {budgets.map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => set('budget', b)}
                    className={`text-xs tracking-[0.15em] uppercase px-6 py-3 transition-all duration-300 ${
                      form.budget === b
                        ? 'bg-[#b8966a] text-[#3b4a35]'
                        : 'border border-[#f5f0e8]/15 text-[#f5f0e8]/40 hover:border-[#b8966a] hover:text-[#b8966a]'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <label className="text-[#b8966a] text-[10px] tracking-[0.3em] uppercase block mb-3">Brief Requirements</label>
              <textarea
                rows={4}
                value={form.requirements}
                onChange={e => set('requirements', e.target.value)}
                placeholder="Tell us a little about what you have in mind..."
                className="w-full bg-transparent border-b border-[#b8966a]/20 text-[#f5f0e8] placeholder-[#f5f0e8]/20 py-3 text-base font-light focus:outline-none focus:border-[#b8966a] transition-colors duration-300 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#b8966a] text-[#3b4a35] text-sm tracking-[0.25em] uppercase py-5 hover:bg-[#d4b896] transition-all duration-300 font-medium flex items-center justify-center gap-3 mt-4"
            >
              Claim My Free Layout Design <ArrowRight size={15} />
            </button>

            <p className="text-center text-[#f5f0e8]/25 text-xs font-light tracking-wider">
              We respect your privacy. No spam, just great design.
            </p>
          </form>
        </FadeIn>
      </section>
    </div>
  )
}
