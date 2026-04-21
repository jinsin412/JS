import { Mail, X, Code, Link, ArrowUpRight, Menu } from 'lucide-react'

// ─── Content ──────────────────────────────────────────────────────────────────

const PERSON = {
  logoName: 'E. VANCE',
  fullName: 'ELISE VANCE',
  title: 'Ph.D. Candidate',
  field: 'Computational Intelligence',
  institution: 'Graduate Institute of Intelligent Systems',
  heroAccent: 'Research portfolio',
  aboutAccent: 'Scientist',
}

const NAV_ITEMS = ['HOME', 'ABOUT', 'RESEARCH', 'PUBLICATIONS', 'CONTACT']

const SOCIAL_LINKS = [
  { Icon: Mail, href: 'mailto:e.vance@gris.edu', label: 'Email' },
  { Icon: X, href: '#', label: 'X / Twitter' },
  { Icon: Code, href: '#', label: 'GitHub' },
  { Icon: Link, href: '#', label: 'LinkedIn' },
]

const HERO_LINES = ['MODELING INTELLIGENCE', 'ACROSS COMPLEX', 'ADAPTIVE SYSTEMS']

const ABOUT_STATEMENT = [
  'PH.D. CANDIDATE IN COMPUTATIONAL INTELLIGENCE.',
  'RESEARCHING THE INTERSECTION OF MACHINE LEARNING,',
  'CAUSAL INFERENCE, AND EMERGENT COMPLEX SYSTEMS.',
]

const ABOUT_KEYWORDS = [
  'MACHINE LEARNING / CAUSAL INFERENCE / COMPLEX SYSTEMS',
  'INTERPRETABLE AI / NEURO-SYMBOLIC REASONING / EMERGENCE',
  'STATISTICAL LEARNING / GRAPH NETWORKS / ADAPTIVE DYNAMICS',
]

const FEATURED_CARDS = [
  {
    video:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_053923_22c0a6a5-313c-474c-85ff-3b50d25e944a.mp4',
    title: 'CAUSAL MACHINE LEARNING',
    subtitle: 'Robustness beyond correlation',
    overlayLabel: 'RESEARCH FOCUS',
    overlayValue: 'CAUSAL ML',
  },
  {
    video:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_054411_511c1b7a-fb2f-42ef-bf6c-32c0b1a06e79.mp4',
    title: 'COMPLEX ADAPTIVE SYSTEMS',
    subtitle: 'Emergence, dynamics, resilience',
    overlayLabel: 'SELECTED AREA',
    overlayValue: 'SYSTEMS THEORY',
  },
  {
    video:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_055427_ac7035b5-9f3b-4289-86fc-941b2432317d.mp4',
    title: 'HUMAN-AI ALIGNMENT',
    subtitle: 'Interpretability & trust by design',
    overlayLabel: 'METHOD',
    overlayValue: 'INTERPRETABLE AI',
  },
]

const CTA_ACCENT = "Let's connect"
const CTA_LINES = ['READ THE WORK.', 'FOLLOW THE RESEARCH.', 'CONNECT AND EXPLORE.']

// ─── Videos ───────────────────────────────────────────────────────────────────

const VIDEOS = {
  hero: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_045634_e1c98c76-1265-4f5c-882a-4276f2080894.mp4',
  about:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_151551_992053d1-3d3e-4b8c-abac-45f22158f411.mp4',
  cta: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_055729_72d66327-b59e-4ae9-bb70-de6ccb5ecdb0.mp4',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SocialIconButton({
  Icon,
  href,
  label,
}: {
  Icon: React.FC<{ size?: number; strokeWidth?: number }>
  href: string
  label: string
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="liquid-glass w-9 h-9 rounded-full flex items-center justify-center text-cream/70 hover:text-neon transition-colors duration-200 flex-shrink-0"
    >
      <Icon size={15} strokeWidth={1.5} />
    </a>
  )
}

function VideoBackground({ src }: { src: string }) {
  return (
    <video
      src={src}
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover"
    />
  )
}

// ─── Section 1: Hero ──────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative min-h-screen rounded-b-[2.5rem] overflow-hidden">
      {/* Video */}
      <VideoBackground src={VIDEOS.hero} />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg/60 via-bg/30 to-bg/85 pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 max-w-portfolio mx-auto px-5 md:px-8 pt-6 flex items-center justify-between gap-4">
        {/* Logo */}
        <span className="font-grotesk text-cream text-lg tracking-widest flex-shrink-0">
          {PERSON.logoName}
        </span>

        {/* Center nav — hidden on mobile */}
        <div className="hidden md:flex liquid-glass rounded-full px-2 py-1.5 gap-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="font-grotesk text-cream/70 hover:text-cream text-xs tracking-widest px-3 py-1.5 rounded-full hover:bg-white/5 transition-all duration-200"
            >
              {item}
            </a>
          ))}
        </div>

        {/* Social icons — right (desktop) */}
        <div className="hidden md:flex items-center gap-2">
          {SOCIAL_LINKS.map((s) => (
            <SocialIconButton key={s.label} {...s} />
          ))}
        </div>

        {/* Mobile menu toggle */}
        <button
          aria-label="Open menu"
          className="md:hidden liquid-glass w-9 h-9 rounded-full flex items-center justify-center text-cream/70 hover:text-cream transition-colors"
        >
          <Menu size={16} strokeWidth={1.5} />
        </button>
      </nav>

      {/* Hero content */}
      <div id="home" className="relative z-10 max-w-portfolio mx-auto px-5 md:px-8 flex flex-col items-center justify-center min-h-[82vh] pb-16 text-center">
        {/* Accent cursive */}
        <span className="font-condiment text-neon text-3xl md:text-4xl mb-6 opacity-90 block">
          {PERSON.heroAccent}
        </span>

        {/* Main heading */}
        <h1 className="font-grotesk text-cream leading-none tracking-tight">
          {HERO_LINES.map((line, i) => (
            <span
              key={i}
              className="block text-[clamp(3.5rem,10vw,9rem)]"
              style={{ lineHeight: 0.92 }}
            >
              {line}
            </span>
          ))}
        </h1>

        {/* Mobile social icons — below heading */}
        <div className="flex md:hidden items-center gap-3 mt-10">
          {SOCIAL_LINKS.map((s) => (
            <SocialIconButton key={s.label} {...s} />
          ))}
        </div>
      </div>

      {/* Subtle bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-bg to-transparent pointer-events-none" />
    </section>
  )
}

// ─── Section 2: About ─────────────────────────────────────────────────────────

function AboutSection() {
  return (
    <section id="about" className="relative min-h-screen overflow-hidden">
      {/* Video */}
      <VideoBackground src={VIDEOS.about} />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg/75 via-bg/50 to-bg/80 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-portfolio mx-auto px-5 md:px-8 py-24 md:py-32 flex flex-col justify-between min-h-screen">
        {/* Top row */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 md:gap-16">
          {/* Top-left heading */}
          <div className="flex-1">
            <p className="font-condiment text-neon text-3xl md:text-4xl mb-3 opacity-90">
              {PERSON.aboutAccent}
            </p>
            <h2 className="font-grotesk text-cream text-[clamp(2.8rem,7vw,7rem)] leading-none tracking-tight">
              HELLO!<br />
              I'M {PERSON.fullName.split(' ')[0]}.
            </h2>
          </div>

          {/* Top-right statement */}
          <div className="flex-1 md:max-w-sm md:pt-4">
            <div className="font-mono text-cream/60 text-xs md:text-sm leading-relaxed tracking-wider space-y-2">
              {ABOUT_STATEMENT.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <div className="mt-6 font-mono text-cream/40 text-[10px] tracking-widest uppercase">
              {PERSON.institution}
            </div>
          </div>
        </div>

        {/* Bottom decorative keyword clusters */}
        <div className="mt-16 md:mt-0 space-y-3 overflow-hidden">
          {ABOUT_KEYWORDS.map((cluster, i) => (
            <p
              key={i}
              className="font-grotesk text-cream/[0.07] text-[clamp(1rem,3.5vw,2.8rem)] leading-none tracking-widest whitespace-nowrap select-none"
              style={{ transform: i % 2 === 1 ? 'translateX(2%)' : 'translateX(-1%)' }}
            >
              {cluster}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Section 3: Featured Work Grid ───────────────────────────────────────────

function ResearchCard({
  video,
  title,
  subtitle,
  overlayLabel,
  overlayValue,
}: (typeof FEATURED_CARDS)[0]) {
  return (
    <div className="liquid-glass rounded-2xl overflow-hidden group cursor-pointer">
      {/* Square video */}
      <div className="relative aspect-square overflow-hidden">
        <video
          src={video}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* subtle top-left tag */}
        <div className="absolute top-3 left-3">
          <span className="font-mono text-[10px] text-cream/50 tracking-widest uppercase liquid-glass px-2 py-1 rounded-full">
            {subtitle}
          </span>
        </div>
      </div>

      {/* Bottom overlay bar */}
      <div className="liquid-glass flex items-center justify-between px-4 py-3 gap-3">
        <div>
          <p className="font-mono text-cream/40 text-[9px] tracking-widest uppercase mb-0.5">
            {overlayLabel}
          </p>
          <p className="font-grotesk text-cream text-sm tracking-widest uppercase">
            {overlayValue}
          </p>
        </div>
        <button
          aria-label={`Explore ${title}`}
          className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center bg-[#5B2FDE]/40 hover:bg-[#5B2FDE]/70 text-cream transition-colors duration-200"
        >
          <ArrowUpRight size={15} strokeWidth={2} />
        </button>
      </div>

      {/* Card title — shown on hover */}
      <div className="px-4 pb-4 pt-2">
        <p className="font-grotesk text-cream/80 text-base tracking-wider leading-tight">
          {title}
        </p>
      </div>
    </div>
  )
}

function FeaturedSection() {
  return (
    <section id="research" className="bg-bg py-20 md:py-28">
      <div className="max-w-portfolio mx-auto px-5 md:px-8">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          {/* Left heading */}
          <div>
            <h2 className="font-grotesk text-cream text-[clamp(2.4rem,5.5vw,5.5rem)] leading-none tracking-tight">
              SELECTED
            </h2>
            <h2 className="font-grotesk leading-none tracking-tight text-[clamp(2.4rem,5.5vw,5.5rem)]">
              <span className="font-condiment text-neon text-[clamp(2.8rem,6.5vw,6.5rem)] leading-none">
                Research
              </span>
            </h2>
          </div>

          {/* Right CTA button */}
          <div className="md:pb-2">
            <a
              href="#"
              className="inline-flex flex-col items-start group"
            >
              <span className="font-grotesk text-cream text-lg md:text-xl tracking-widest uppercase group-hover:text-neon transition-colors duration-200">
                VIEW FULL CV
              </span>
              <span className="block h-[2px] w-full bg-neon mt-1 transition-all duration-300 group-hover:w-[80%]" />
            </a>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {FEATURED_CARDS.map((card) => (
            <ResearchCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Section 4: Final CTA ─────────────────────────────────────────────────────

function CTASection() {
  return (
    <section id="contact" className="relative overflow-hidden">
      {/* Native-aspect video — no object-cover */}
      <video
        src={VIDEOS.cta}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-auto block"
      />

      {/* Full overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg/70 via-transparent to-bg/90 pointer-events-none" />

      {/* Text overlay — centered */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-5 md:px-8 text-center">
        <span className="font-condiment text-neon text-3xl md:text-4xl mb-6 opacity-90 block">
          {CTA_ACCENT}
        </span>
        <h2 className="font-grotesk text-cream leading-none tracking-tight">
          {CTA_LINES.map((line, i) => (
            <span
              key={i}
              className="block text-[clamp(2rem,5.5vw,6rem)]"
              style={{ lineHeight: 0.95 }}
            >
              {line}
            </span>
          ))}
        </h2>
      </div>

      {/* Bottom-left icon stack */}
      <div className="absolute bottom-6 left-5 md:left-8 flex flex-col gap-2">
        {SOCIAL_LINKS.map((s) => (
          <a
            key={s.label}
            href={s.href}
            aria-label={s.label}
            className="liquid-glass w-10 h-10 rounded-full flex items-center justify-center text-cream/60 hover:text-neon transition-colors duration-200"
          >
            <s.Icon size={16} strokeWidth={1.5} />
          </a>
        ))}
      </div>
    </section>
  )
}

// ─── Texture overlay ─────────────────────────────────────────────────────────

function TextureOverlay() {
  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none"
      style={{
        backgroundImage: 'url(/texture.svg)',
        backgroundSize: 'cover',
        mixBlendMode: 'lighten',
        opacity: 0.6,
      }}
    />
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div className="bg-bg min-h-screen overflow-x-hidden">
      <TextureOverlay />
      <HeroSection />
      <AboutSection />
      <FeaturedSection />
      <CTASection />
    </div>
  )
}
