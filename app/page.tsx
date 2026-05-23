'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, Send, CheckCircle, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { NavBar } from './components/NavBar'
import { HeroTelemetry, SolarWindBadge, useNextLaunch } from './components/TelemetryWidgets'
import { EarthGlobeWrapper } from './components/EarthGlobeWrapper'
import { PulsarMap } from './components/PulsarMap'
import { DownlinkGallery, type Photo } from './components/DownlinkGallery'
import { BootSequence } from './components/BootSequence'
import { PhilosophyCrossfade } from './components/PhilosophyCrossfade'
import { ConstellationOverlay } from './components/ConstellationOverlay'
import { ThreeBodySim } from './components/ThreeBodySim'
import { GradientDescentSim } from './components/GradientDescentSim'

// ─── Contact form (mechanics unchanged, labels reframed) ──────────────────────

function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to send message')
      setStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => setStatus('idle'), 5000)
    } catch (error: unknown) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send message. Please try again.')
      setTimeout(() => { setStatus('idle'); setErrorMessage('') }, 5000)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const fieldClass = `w-full px-4 py-3 font-mono-display text-sm border rounded transition-colors duration-150
    focus:outline-none focus:border-[var(--instrument)]`

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block font-mono-display text-xs tracking-widest mb-2" style={{ color: 'var(--ink-dim)' }}>
            OPERATOR ID *
          </label>
          <input
            type="text" id="name" name="name" value={formData.name}
            onChange={handleChange} required disabled={status === 'loading'}
            className={fieldClass}
            style={{ background: 'var(--bg-elevated)', color: 'var(--ink)', borderColor: 'var(--inert)' }}
            placeholder="your name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block font-mono-display text-xs tracking-widest mb-2" style={{ color: 'var(--ink-dim)' }}>
            RETURN FREQUENCY *
          </label>
          <input
            type="email" id="email" name="email" value={formData.email}
            onChange={handleChange} required disabled={status === 'loading'}
            className={fieldClass}
            style={{ background: 'var(--bg-elevated)', color: 'var(--ink)', borderColor: 'var(--inert)' }}
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block font-mono-display text-xs tracking-widest mb-2" style={{ color: 'var(--ink-dim)' }}>
          TRANSMISSION SUBJECT *
        </label>
        <input
          type="text" id="subject" name="subject" value={formData.subject}
          onChange={handleChange} required disabled={status === 'loading'}
          className={fieldClass}
          style={{ background: 'var(--bg-elevated)', color: 'var(--ink)', borderColor: 'var(--inert)' }}
          placeholder="subject"
        />
      </div>

      <div>
        <label htmlFor="message" className="block font-mono-display text-xs tracking-widest mb-2" style={{ color: 'var(--ink-dim)' }}>
          PAYLOAD *
        </label>
        <textarea
          id="message" name="message" value={formData.message}
          onChange={handleChange} required rows={6} disabled={status === 'loading'}
          className={`${fieldClass} resize-none`}
          style={{ background: 'var(--bg-elevated)', color: 'var(--ink)', borderColor: 'var(--inert)' }}
          placeholder="your message..."
        />
      </div>

      {status === 'success' && (
        <div className="flex items-center gap-2 p-4 rounded border text-sm font-mono-display" style={{ color: 'var(--instrument)', borderColor: 'var(--instrument)', background: 'var(--bg-elevated)' }}>
          <CheckCircle size={16} />
          <span>TRANSMISSION RECEIVED — RESPONSE INCOMING.</span>
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 p-4 rounded border text-sm font-mono-display" style={{ color: 'var(--critical)', borderColor: 'var(--critical)', background: 'var(--bg-elevated)' }}>
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        type="submit" disabled={status === 'loading'}
        className="flex items-center justify-center gap-2 w-full py-3 border font-mono-display text-xs tracking-widest transition-colors duration-150 disabled:opacity-50"
        style={{ borderColor: 'var(--instrument)', color: 'var(--instrument)', background: 'transparent' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--instrument)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--bg)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--instrument)' }}
      >
        {status === 'loading' ? (
          <><span className="blink">_</span> TRANSMITTING...</>
        ) : (
          <><Send size={14} /> TRANSMIT</>
        )}
      </button>
    </form>
  )
}

// ─── Section heading component ─────────────────────────────────────────────────

function SectionHeading({ title, sub, id }: { title: string; sub: string; id?: string }) {
  return (
    <div className="mb-12" id={id}>
      <h2 className="font-mono-display text-2xl md:text-3xl font-bold tracking-widest mb-1" style={{ color: 'var(--ink)' }}>
        {title}
      </h2>
      <p className="font-mono-display text-xs tracking-widest" style={{ color: 'var(--ink-dim)' }}>
        {sub}
      </p>
      <div className="mt-4 h-px" style={{ background: 'var(--inert)' }} />
    </div>
  )
}

// ─── Social icons (thin-stroke inline SVG) ────────────────────────────────────

function LinkedinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  )
}

// ─── Mission patch SVGs (geometric placeholders per §8.5) ─────────────────────

function PatchCircleHex() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="var(--instrument)" strokeWidth="1.2" aria-hidden="true">
      <polygon points="28,4 50,16 50,40 28,52 6,40 6,16" />
      <circle cx="28" cy="28" r="12" />
    </svg>
  )
}
function PatchGraph() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="var(--instrument)" strokeWidth="1.2" aria-hidden="true">
      <circle cx="28" cy="28" r="24" />
      <circle cx="28" cy="18" r="4" />
      <circle cx="18" cy="34" r="4" />
      <circle cx="38" cy="34" r="4" />
      <line x1="28" y1="22" x2="20" y2="32" />
      <line x1="28" y1="22" x2="36" y2="32" />
      <line x1="20" y1="36" x2="36" y2="36" />
    </svg>
  )
}
function PatchTriangle() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="var(--instrument)" strokeWidth="1.2" aria-hidden="true">
      <circle cx="28" cy="28" r="24" />
      <polygon points="28,12 44,42 12,42" />
    </svg>
  )
}
function PatchDiamond() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="var(--instrument)" strokeWidth="1.2" aria-hidden="true">
      <circle cx="28" cy="28" r="24" />
      <polygon points="28,10 46,28 28,46 10,28" />
    </svg>
  )
}
function PatchSquare() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="var(--instrument)" strokeWidth="1.2" aria-hidden="true">
      <circle cx="28" cy="28" r="24" />
      <rect x="14" y="14" width="28" height="28" />
    </svg>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const MISSIONS = [
  {
    id: 'M-05',
    status: 'ACTIVE' as const,
    title: 'PhD Research — Socio-Technical Legal AI',
    host: 'Monash University',
    sector: 'Kuala Lumpur, MY',
    window: '2026-01 / —',
    notes: [
      'Investigating how Graph Neural Networks, Large Language Models, and neuro-symbolic architectures can enhance legal reasoning while considering socio-technical dimensions and human-centered design principles',
    ],
  },
  {
    id: 'M-04',
    status: 'RECOVERED' as const,
    title: 'Senior Machine Learning Engineer',
    host: 'CVS Health',
    sector: 'Cambridge, MA',
    window: '2024-09 / 2026-01',
    notes: [
      'Delivered real-time recommendations under 200ms with FastAPI microservice integrating geospatial queries and vector embeddings from MongoDB',
      'Reduced model explainability computation by 8x using GPU-enabled DataProc clusters and parallel SHAP processing',
      'Improved feature engineering throughput by 25% using NVTabular, Dask, and NVIDIA GPUs',
      'Orchestrated data ingestion and feature table creation for high-volume healthcare datasets via Airflow and BigQuery',
    ],
  },
  {
    id: 'M-03',
    status: 'RECOVERED' as const,
    title: 'Machine Learning Engineer',
    host: 'Ikigai Labs',
    sector: 'Cambridge, MA',
    window: '2023-11 / 2024-09',
    notes: [
      'Boosted client operations by 15% for 100TB of data by building 6 scalable time-based algorithms with Python and Ray',
      'Improved time series accuracy by 8% with scalable change point detection algorithm',
      'Achieved 99.9% availability deploying on EKS and Anyscale using Helm and Kubernetes',
      'Enhanced predictive accuracy leveraging LLM-powered Generative AI for tabular and time series analysis',
    ],
  },
  {
    id: 'M-02',
    status: 'RECOVERED' as const,
    title: 'Machine Learning Engineer',
    host: 'Squark Inc.',
    sector: 'Boston, MA',
    window: '2023-02 / 2023-11',
    notes: [
      'Reduced model insight computation by 75% using NVIDIA RAPIDS and GPU parallel processing on AWS EC2',
      'Improved load balancing by 30% and decreased downtime by 20% with automated pipeline architecture',
      'Boosted system performance by 23% integrating Couchbase distributed cache',
    ],
  },
  {
    id: 'M-01',
    status: 'RECOVERED' as const,
    title: 'ML Engineer Intern',
    host: 'Empallo Inc. (MIT Startup)',
    sector: 'Cambridge, MA',
    window: '2022-01 / 2022-08',
    notes: [
      'Enhanced heart failure readmission prediction accuracy by 18% using RNNs on 1.6M+ clinical records',
      'Increased platform data capacity by 2x through data partitioning using AWS Glue, S3, and Python',
      'Semi-Finalist, MIT $100K Entrepreneurship Competition (Top 10 out of 83 teams)',
    ],
  },
]

const SYSTEMS = [
  {
    name: 'COMPUTE / INFERENCE',
    tagline: 'Models and reasoning',
    items: ['TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'SHAP', 'NVTabular', 'Ray', 'LLMs', 'RNNs'],
  },
  {
    name: 'PROPULSION',
    tagline: 'Languages and frameworks',
    items: ['Python', 'SQL', 'R', 'JavaScript', 'Java', 'FastAPI', 'Airflow', 'Spring Boot'],
  },
  {
    name: 'GROUND INFRASTRUCTURE',
    tagline: 'Deployment and orchestration',
    items: ['AWS', 'GCP', 'Anyscale', 'Docker', 'Kubernetes', 'Helm', 'Grafana', 'Git'],
  },
  {
    name: 'SENSOR ARRAY',
    tagline: 'Data ingest and storage',
    items: ['BigQuery', 'MongoDB', 'PostgreSQL', 'MySQL', 'S3', 'DynamoDB', 'Pandas', 'Dask'],
  },
]

const PAYLOADS = [
  {
    id: 'PAYLOAD-01',
    patch: <PatchGraph key="p1" />,
    title: 'Real-Time Healthcare Recommendations',
    status: 'RECOVERED' as const,
    description: 'Built FastAPI microservice delivering sub-200ms recommendations using geospatial queries, vector embeddings, and GPU-accelerated feature engineering for CVS Health\'s provider matching system.',
    telemetry: '200ms response time, 25% throughput improvement',
    subsystems: ['FastAPI', 'MongoDB', 'GPU Computing', 'Vector Embeddings', 'BigQuery'],
  },
  {
    id: 'PAYLOAD-02',
    patch: <PatchTriangle key="p2" />,
    title: 'Scalable Time Series Platform',
    status: 'RECOVERED' as const,
    description: 'Developed 6 production-grade algorithms handling 100TB+ data with 15% operational improvement, featuring advanced change point detection, anomaly detection, and forecasting capabilities.',
    telemetry: '100TB data processed, 99.9% uptime',
    subsystems: ['Python', 'Ray', 'Kubernetes', 'AWS', 'Anyscale'],
  },
  {
    id: 'PAYLOAD-03',
    patch: <PatchCircleHex key="p3" />,
    title: 'Heart Failure Prediction System',
    status: 'RECOVERED' as const,
    description: 'Enhanced readmission prediction accuracy by 18% using custom RNN architecture with novel feature engineering on 1.6M+ clinical records. Semi-finalist in MIT $100K Entrepreneurship Competition.',
    telemetry: '1.6M+ records, 18% accuracy improvement',
    subsystems: ['RNN', 'Healthcare AI', 'AWS', 'Deep Learning', 'Feature Engineering'],
  },
  {
    id: 'PAYLOAD-04',
    patch: <PatchDiamond key="p4" />,
    title: 'GPU-Accelerated ML Pipeline',
    status: 'RECOVERED' as const,
    description: 'Reduced model computation time by 75% using NVIDIA RAPIDS for parallel processing, enabling real-time insights for enterprise SaaS platform serving millions of users.',
    telemetry: '75% computation reduction',
    subsystems: ['NVIDIA RAPIDS', 'GPU Computing', 'AWS EC2', 'Performance Optimization'],
  },
  {
    id: 'PAYLOAD-05',
    patch: <PatchSquare key="p5" />,
    title: 'DAESO Hackathon 2022 — Director',
    status: 'ARCHIVED' as const,
    description: 'Led as Hackathon Director at Northeastern University, attracting 60+ participants across 17 teams. Organized industry seminars and created engaging ML/data science challenges for graduate students.',
    telemetry: '60+ participants, 17 teams',
    subsystems: ['Leadership', 'Event Management', 'Community Building', 'Education'],
  },
]

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function Portfolio() {
  const [mounted, setMounted] = useState(false)
  const [bootDone, setBootDone] = useState(false)
  const [voyagerMET, setVoyagerMET] = useState('')
  const [photos, setPhotos] = useState<Photo[]>([])
  const nextLaunch = useNextLaunch()

  // Voyager 1 launch: 1977-09-05 12:56:00 UTC
  const VOYAGER_LAUNCH = new Date('1977-09-05T12:56:00Z').getTime()

  useEffect(() => {
    setMounted(true)

    // Boot sequence: play once per session
    const booted = sessionStorage.getItem('sd01-booted')
    if (booted) setBootDone(true)

    // Console easter egg (§8.2)
    const ascii = `
       /\\
      /  \\
     / SD \\      SD-01
    /------\\     siddhantdube1.github.io
   /        \\
  /          \\   Try: signal()
 /____________\\
`
    console.log('%c' + ascii, 'color:#38bdf8;font-family:monospace;font-size:11px')
    ;(window as Window & { signal?: () => string }).signal = () =>
      'In the long arc of cosmic time, hello. — SD'

    const tick = () => {
      const now = Date.now()
      const diff = now - VOYAGER_LAUNCH
      const totalSeconds = Math.floor(diff / 1000)
      const s  = totalSeconds % 60
      const m  = Math.floor(totalSeconds / 60) % 60
      const h  = Math.floor(totalSeconds / 3600) % 24
      const d  = Math.floor(totalSeconds / 86400) % 365
      const y  = Math.floor(totalSeconds / (86400 * 365.25))
      setVoyagerMET(`${y}y ${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetch('/api/photography')
      .then(r => r.json())
      .then(data => setPhotos(data as Photo[]))
      .catch(() => {})
  }, [])

  if (!mounted) return null

  const handleBootDone = () => {
    sessionStorage.setItem('sd01-booted', '1')
    setBootDone(true)
  }

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      {/* Boot sequence — once per session */}
      {!bootDone && <BootSequence onDone={handleBootDone} />}

      {/* Philosophy crossfades — scroll-triggered, pointer-events: none */}
      <PhilosophyCrossfade />

      {/* Constellation overlay — hairline scroll connector between section h2s */}
      <ConstellationOverlay />

      {/* Nav */}
      <NavBar />

      {/* ── GROUND STATION ────────────────────────────────────────────────────── */}
      <section id="ground" className="relative min-h-screen pt-14 flex flex-col" aria-label="Ground Station">
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-12 grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-8 items-center relative z-10">

          {/* Left — identity block */}
          <div className="font-mono-display text-xs tracking-widest space-y-1 md:self-start md:pt-8">
            <p style={{ color: 'var(--ink-dim)' }}>OPERATOR</p>
            <p className="text-lg font-bold tracking-wider" style={{ color: 'var(--ink)' }}>SIDDHANT DUBE</p>
            <div className="mt-3 space-y-1 text-xs" style={{ color: 'var(--ink-dim)' }}>
              <p><span style={{ color: 'var(--ink)' }}>CALLSIGN</span>  SD-01</p>
              <p><span style={{ color: 'var(--ink)' }}>STATUS </span>  <span style={{ color: 'var(--instrument)' }}>ACTIVE</span></p>
              <p><span style={{ color: 'var(--ink)' }}>SECTOR </span>  KUALA LUMPUR, MY</p>
            </div>
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--inert)' }}>
              <Image
                src="/Profile.jpg"
                alt="Siddhant Dube"
                width={80} height={80}
                className="rounded-sm"
                style={{ filter: 'grayscale(20%)' }}
                priority
              />
            </div>
          </div>

          {/* Center — 3D Earth with live ISS marker */}
          <EarthGlobeWrapper />

          {/* Right — live telemetry stack */}
          <div className="md:self-start md:pt-8">
            <HeroTelemetry voyagerMET={voyagerMET} />
          </div>
        </div>

        {/* Bottom ticker */}
        <div
          className="border-t py-2 px-4 font-mono-display text-xs overflow-hidden"
          style={{ borderColor: 'var(--inert)', background: 'var(--bg-elevated)', color: 'var(--ink-dim)' }}
        >
          <BottomTicker voyagerMET={voyagerMET} nextLaunch={nextLaunch} />
        </div>
      </section>

      {/* ── MANIFEST ──────────────────────────────────────────────────────────── */}
      <section id="manifest" className="py-24 px-4 relative z-10" aria-label="Manifest">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title="MANIFEST" sub="// IF FOUND DRIFTING, READ FIRST" />

          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            {/* Left — Voyager pulsar map */}
            <div className="flex flex-col items-center gap-4">
              <PulsarMap />
              <p className="font-serif-inscription italic text-sm text-center max-w-xs" style={{ color: 'var(--ink-dim)' }}>
                &ldquo;If you find this drifting, here&apos;s where I am.&rdquo; — SD
              </p>
            </div>

            {/* Right — bio + training logs */}
            <div className="space-y-8">
              <div>
                <p className="font-mono-display text-xs tracking-widest mb-3" style={{ color: 'var(--instrument)' }}>CARGO MANIFEST — entry SD-01</p>
                <div className="space-y-4 leading-relaxed" style={{ color: 'var(--ink)' }}>
                  <p>
                    I&apos;m a PhD researcher in socio-technical AI, exploring how Graph Neural Networks,
                    Large Language Models, and neuro-symbolic architectures can transform legal reasoning
                    and decision-making while considering their broader societal impacts and human-centered design.
                  </p>
                  <p>
                    Before this, I spent ~4.5 years building production ML systems — most recently as a
                    Senior ML Engineer at CVS Health, before that at Ikigai Labs, Squark, and an
                    MIT-backed startup called Empallo. M.S. from Northeastern, B.Eng. from Monash.
                  </p>
                  <p>
                    Off-mission: mathematics, programming as problem-solving, philosophy, and a
                    long-standing addiction to landscape photography.
                  </p>
                </div>
              </div>

              {/* Training logs */}
              <div className="border-t pt-6 space-y-6" style={{ borderColor: 'var(--inert)' }}>
                <p className="font-mono-display text-xs tracking-widest" style={{ color: 'var(--ink-dim)' }}>TRAINING LOGS</p>

                <div className="font-mono-display text-xs space-y-1">
                  <p className="font-bold" style={{ color: 'var(--instrument)' }}>TRAINING LOG / 02</p>
                  <p><span style={{ color: 'var(--ink-dim)' }}>INSTITUTION  </span>Northeastern University, Boston MA</p>
                  <p><span style={{ color: 'var(--ink-dim)' }}>PROGRAM      </span>M.S. Data Analytics Engineering</p>
                  <p><span style={{ color: 'var(--ink-dim)' }}>PERIOD       </span>2021 — 2022</p>
                  <p><span style={{ color: 'var(--ink-dim)' }}>NOTES        </span>GPA 3.76 / 4.00</p>
                </div>

                <div className="font-mono-display text-xs space-y-1">
                  <p className="font-bold" style={{ color: 'var(--instrument)' }}>TRAINING LOG / 01</p>
                  <p><span style={{ color: 'var(--ink-dim)' }}>INSTITUTION  </span>Monash University, Kuala Lumpur MY</p>
                  <p><span style={{ color: 'var(--ink-dim)' }}>PROGRAM      </span>B.Eng. Software Engineering (First Class Honours)</p>
                  <p><span style={{ color: 'var(--ink-dim)' }}>PERIOD       </span>2017 — 2020</p>
                </div>
              </div>

              {/* Inscription */}
              <div className="pt-4 border-t" style={{ borderColor: 'var(--inert)' }}>
                <p className="font-serif-inscription italic" style={{ color: 'var(--ink-dim)', fontSize: '1rem' }}>
                  &ldquo;It from bit.&rdquo; — Wheeler
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MISSION LOG ───────────────────────────────────────────────────────── */}
      <section id="log" className="py-24 px-4 relative z-10" style={{ background: 'var(--bg-elevated)' }} aria-label="Mission Log">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-12">
            <div>
              <h2 className="font-mono-display text-2xl md:text-3xl font-bold tracking-widest mb-1" style={{ color: 'var(--ink)' }}>MISSION LOG</h2>
              <p className="font-mono-display text-xs tracking-widest" style={{ color: 'var(--ink-dim)' }}>// FIVE LOGGED MISSIONS — MOST RECENT FIRST</p>
              <div className="mt-4 h-px" style={{ background: 'var(--inert)' }} />
            </div>
            <div className="pb-1"><SolarWindBadge /></div>
          </div>

          <div className="space-y-6">
            {MISSIONS.map(mission => (
              <div
                key={mission.id}
                className="rounded border p-6"
                style={{ borderColor: 'var(--inert)', background: 'var(--bg)' }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                  <div className="font-mono-display text-xs flex gap-6">
                    <span><span style={{ color: 'var(--ink-dim)' }}>MISSION  </span><span className="font-bold" style={{ color: 'var(--ink)' }}>{mission.id}</span></span>
                    <span>
                      <span style={{ color: 'var(--ink-dim)' }}>STATUS  </span>
                      <span
                        className="font-bold"
                        style={{ color: mission.status === 'ACTIVE' ? 'var(--instrument)' : 'var(--ink-dim)' }}
                      >
                        {mission.status}
                      </span>
                    </span>
                  </div>
                  <span className="font-mono-display text-xs" style={{ color: 'var(--ink-dim)' }}>{mission.window}</span>
                </div>

                <div className="h-px mb-4" style={{ background: 'var(--inert)' }} />

                <div className="font-mono-display text-xs space-y-1 mb-4">
                  <p><span style={{ color: 'var(--ink-dim)' }}>TITLE   </span><span style={{ color: 'var(--ink)' }}>{mission.title}</span></p>
                  <p><span style={{ color: 'var(--ink-dim)' }}>HOST    </span><span style={{ color: 'var(--ink)' }}>{mission.host}</span></p>
                  <p><span style={{ color: 'var(--ink-dim)' }}>SECTOR  </span><span style={{ color: 'var(--ink)' }}>{mission.sector}</span></p>
                </div>

                <div className="mt-4">
                  <p className="font-mono-display text-xs mb-3" style={{ color: 'var(--ink-dim)' }}>PAYLOAD NOTES</p>
                  <ul className="space-y-2">
                    {mission.notes.map((note, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>
                        <span className="flex-shrink-0 font-mono-display" style={{ color: 'var(--instrument)' }}>▸</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Negative-space flourish: unlabelled, no frame, right-aligned. */}
      <div className="max-w-7xl mx-auto px-4 flex justify-end" aria-hidden="true">
        <div style={{ width: 'clamp(100px, 12vw, 140px)', aspectRatio: '1' }}>
          <ThreeBodySim />
        </div>
      </div>

      {/* ── ONBOARD SYSTEMS ───────────────────────────────────────────────────── */}
      <section id="systems" className="py-24 px-4 relative z-10" aria-label="Onboard Systems">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title="ONBOARD SYSTEMS" sub="// FOUR SUBSYSTEMS, ALL NOMINAL" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SYSTEMS.map(sys => (
              <div
                key={sys.name}
                className="rounded border p-5"
                style={{ borderColor: 'var(--inert)', background: 'var(--bg-elevated)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-mono-display text-xs font-bold tracking-widest" style={{ color: 'var(--ink)' }}>
                    {sys.name}
                  </p>
                  <span className="flex items-center gap-1 font-mono-display text-[10px]" style={{ color: 'var(--instrument)' }}>
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'var(--instrument)' }} />
                    NOMINAL
                  </span>
                </div>
                <p className="font-mono-display text-[10px] mb-4" style={{ color: 'var(--ink-dim)' }}>{sys.tagline}</p>
                <div className="flex flex-wrap gap-2">
                  {sys.items.map(item => (
                    <span
                      key={item}
                      className="font-mono-display text-[10px] px-2 py-1 rounded border hover-brighten cursor-default transition-colors duration-150"
                      style={{ borderColor: 'var(--inert)', color: 'var(--ink-dim)' }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Negative-space flourish: unlabelled, no frame, left-aligned to mirror 3-body. */}
      <div className="max-w-7xl mx-auto px-4 flex justify-start" aria-hidden="true">
        <div style={{ width: 'clamp(100px, 12vw, 140px)', aspectRatio: '1' }}>
          <GradientDescentSim />
        </div>
      </div>

      {/* ── ACTIVE PAYLOADS ───────────────────────────────────────────────────── */}
      <section id="payloads" className="py-24 px-4 relative z-10" style={{ background: 'var(--bg-elevated)' }} aria-label="Active Payloads">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title="ACTIVE PAYLOADS" sub="// FIVE PROBES, VARIED TRAJECTORIES" />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PAYLOADS.map(payload => (
              <div
                key={payload.id}
                className="rounded border p-5 flex flex-col"
                style={{ borderColor: 'var(--inert)', background: 'var(--bg)' }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div aria-hidden="true">{payload.patch}</div>
                  <div>
                    <p className="font-mono-display text-[10px] tracking-widest" style={{ color: 'var(--ink-dim)' }}>{payload.id}</p>
                    <p className="font-bold text-sm leading-snug mt-0.5" style={{ color: 'var(--ink)' }}>{payload.title}</p>
                    <p
                      className="font-mono-display text-[10px] tracking-widest mt-1"
                      style={{ color: payload.status === 'ARCHIVED' ? 'var(--ink-dim)' : 'var(--instrument)' }}
                    >
                      STATUS  {payload.status}
                    </p>
                  </div>
                </div>

                <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--ink-dim)' }}>
                  {payload.description}
                </p>

                <div className="mt-4 pt-4 border-t space-y-3" style={{ borderColor: 'var(--inert)' }}>
                  <div>
                    <p className="font-mono-display text-[10px] tracking-widest mb-1" style={{ color: 'var(--ink-dim)' }}>TELEMETRY</p>
                    <p className="font-mono-display text-xs" style={{ color: 'var(--warning)' }}>{payload.telemetry}</p>
                  </div>
                  <div>
                    <p className="font-mono-display text-[10px] tracking-widest mb-2" style={{ color: 'var(--ink-dim)' }}>SUBSYSTEMS</p>
                    <div className="flex flex-wrap gap-1.5">
                      {payload.subsystems.map(s => (
                        <span
                          key={s}
                          className="font-mono-display text-[10px] px-2 py-0.5 rounded border"
                          style={{ borderColor: 'var(--inert)', color: 'var(--ink-dim)' }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOWNLINK (Photography) ────────────────────────────────────────────── */}
      <section id="downlink" className="py-24 px-4 relative z-10" aria-label="Downlink">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title="DOWNLINK" sub="// IMAGERY RECEIVED FROM SURFACE" />
          <DownlinkGallery photos={photos} />
        </div>
      </section>

      {/* ── OPEN CHANNEL (Contact) ────────────────────────────────────────────── */}
      <section id="channel" className="py-24 px-4 relative z-10" style={{ background: 'var(--bg-elevated)' }} aria-label="Open Channel">
        <div className="max-w-3xl mx-auto">
          <SectionHeading title="OPEN CHANNEL" sub="// TRANSMISSION OUTBOUND" />

          {/* Carrier signal indicator */}
          <div className="flex items-center gap-2 mb-8 font-mono-display text-xs" style={{ color: 'var(--ink-dim)' }}>
            <CarrierSignal />
            <span>CARRIER SIGNAL ACTIVE — CHANNEL OPEN</span>
          </div>

          <ContactForm />

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px" style={{ background: 'var(--inert)' }} />
            <span className="font-mono-display text-xs" style={{ color: 'var(--ink-dim)' }}>DIRECT FREQUENCIES</span>
            <div className="flex-1 h-px" style={{ background: 'var(--inert)' }} />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { href: 'mailto:siddhantdube1@gmail.com', icon: <Mail size={16} />, label: 'EMAIL' },
              { href: 'https://linkedin.com/in/siddhantdube', icon: <LinkedinIcon />, label: 'LINKEDIN', external: true },
              { href: 'https://github.com/siddhantdube1', icon: <GithubIcon />, label: 'GITHUB', external: true },
              { href: 'tel:+601159402122', icon: <Phone size={16} />, label: 'VOICE' },
            ].map(({ href, icon, label, external }) => (
              <a
                key={label}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="flex items-center justify-center gap-2 py-3 border font-mono-display text-xs tracking-widest transition-colors duration-150"
                style={{ borderColor: 'var(--inert)', color: 'var(--ink-dim)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--instrument)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--instrument)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--inert)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink-dim)' }}
              >
                {icon}
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer
        className="border-t py-8 px-4 text-center font-mono-display text-xs"
        style={{ borderColor: 'var(--inert)', color: 'var(--ink-dim)', background: 'var(--bg)' }}
      >
        <p>SD-01 · siddhantdube1.github.io</p>
        <p className="mt-1">© 2026 Siddhant Dube — all rights reserved.</p>
      </footer>
    </div>
  )
}

// ─── Bottom ticker ────────────────────────────────────────────────────────────

interface LaunchData { name: string; net: string; pad?: string; provider?: string }

function BottomTicker({ voyagerMET, nextLaunch }: { voyagerMET: string; nextLaunch: LaunchData | null }) {
  const [mode, setMode] = useState(0)

  const launchLine = nextLaunch?.net
    ? `NEXT LAUNCH — ${nextLaunch.name} · NET ${new Date(nextLaunch.net).toUTCString().slice(0, 22)} UTC`
    : 'NEXT LAUNCH — ACQUIRING SIGNAL'

  const lines = [
    `V1 · MISSION ELAPSED TIME — ${voyagerMET || '—'}`,
    launchLine,
    `GROUND STATION · SD-01 · SECTOR KUALA LUMPUR, MY · STATUS ACTIVE`,
  ]

  useEffect(() => {
    const id = setInterval(() => setMode(m => (m + 1) % lines.length), 8000)
    return () => clearInterval(id)
  }, [lines.length])

  return (
    <p className="tracking-widest truncate" style={{ color: 'var(--ink-dim)' }}>
      ▸ {lines[mode]}
    </p>
  )
}

// ─── Carrier signal indicator ─────────────────────────────────────────────────

function CarrierSignal() {
  return (
    <span className="relative flex h-2 w-2">
      <span
        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
        style={{ background: 'var(--instrument)' }}
      />
      <span
        className="relative inline-flex rounded-full h-2 w-2"
        style={{ background: 'var(--instrument)' }}
      />
    </span>
  )
}
