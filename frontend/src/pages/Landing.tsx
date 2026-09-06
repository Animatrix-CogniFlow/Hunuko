import { Link } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  ArrowRight,
  Layers,
  ListChecks,
  Sparkles,
  Mic,
  Network,
  MessagesSquare,
  Quote,
  Globe,
  Send,
  AtSign,
  Moon,
  Sun,
  Brain,
  Users,
  Clock,
  Zap,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { OrchestrationOrb } from "../components/visuals/OrchestrationOrb";
import { AmbientBackground } from "../components/visuals/AmbientBackground";
import { SpotlightCard } from "../components/ui/SpotlightCard";
import { Counter } from "../components/ui/Counter";
import { FadeIn, StaggerGroup, StaggerItem } from "../components/ui/Motion";
import { useTheme } from "../hooks/useTheme";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Visual Learning Lab",
    body: "Cinematic, fullscreen animations that turn abstract concepts into interactive scenes.",
    tone: "from-[#507C7C] to-[#96C4BB]",
  },
  {
    icon: Mic,
    title: "Oral Examination",
    body: "Practice speaking with an AI examiner. Get analysis on your understanding of the concepts and constructive feedback.",
    tone: "from-[#507C7C] to-[#152220]",
  },
  {
    icon: Layers,
    title: "Smart Flashcards",
    body: "Paste notes and instantly get flashcards with a built-in spaced-repetition scheduler that adapts to your recall.",
    tone: "from-[#D4AF37] to-[#886506]",
  },
  {
    icon: ListChecks,
    title: "Graded Quizzes",
    body: "Multiple-choice quizzes generated from your material, graded instantly with explanations and score history.",
    tone: "from-[#D4AF37] to-[#507C7C]",
  },
  {
    icon: MessagesSquare,
    title: "AI Tutor",
    body: "A streaming conversational tutor that adapts to how you learn.",
    tone: "from-[#507C7C] to-[#0D1514]",
  },
  {
    icon: Network,
    title: "Multi-Agent Orchestration",
    body: "Watch autonomous agents collaborate in real time.",
    tone: "from-[#96C4BB] to-[#D4AF37]",
  },
];

const STEPS = [
  { n: "01", title: "Paste your notes", body: "Drop in notes, definitions, or a passage." },
  { n: "02", title: "AI generates material", body: "Animated Videos,Flashcards & quizzes built from your concepts." },
  { n: "03", title: "Review with SRS", body: "Spaced repetition schedules every card for recall." },
  { n: "04", title: "Test & master", body: "Take graded quizzes, interact with live tutors and track your progress." },
];

const TESTIMONIALS = [
  { name: "Dr. Elara Voss", role: "Professor, Neuroscience", body: "Hunuko turns my dense lecture notes into visual stories my students actually remember." },
  { name: "Marcus Lin", role: "Med Student", body: "The oral exam mode is unreal — it's like rehearsing with a calm, brilliant examiner." },
  { name: "Aisha Rahman", role: "Self-learner", body: "Watching the agents collaborate makes learning feel alive. It's the most premium study tool I've used." },
];

const STATS = [
  { icon: Brain, to: 24, suffix: "+", label: "Concepts visualized", decimals: 0, fmt: "24" },
  { icon: Users, to: 5, suffix: "+", label: "Active learners" },
  { icon: Clock, to: 92, suffix: "%", label: "Recall improvement" },
  { icon: Zap, to: 7, suffix: "", label: "Autonomous agents" },
];

const MARQUEE = ["Physics", "Biology", "Calculus", "Chemistry", "Anatomy", "Engineering", "Economics", "Neuroscience", "Organic Chemistry", "History", "Literature", "Mathematics"];

export default function Landing() {
  const { theme, toggleTheme } = useTheme();

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F5F8F7] text-[#0B1311] dark:bg-[#070B0A] dark:text-[#F8FAFA] selection:bg-[#507C7C]/40 transition-colors duration-300">
      {/* Scroll progress */}
      <motion.div
        className="fixed left-0 top-0 z-50 h-0.5 w-full origin-left bg-gradient-to-r from-[#507C7C] via-[#96C4BB] to-[#D4AF37]"
        style={{ scaleX: progress }}
      />

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-[#96C4BB]/25 bg-[#F5F8F7]/85 backdrop-blur-xl dark:border-[#96C4BB]/15 dark:bg-[#070B0A]/85 transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/assets/logo.jpg"
              alt="Hunuko Logo"
              className="h-8 w-auto object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-display text-xl font-bold tracking-tight text-[#0B1311] dark:text-[#F8FAFA]">
              Hunu<span className="text-[#D4AF37]">ko</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#2D3E3A] dark:text-[#B2C9C5] md:flex">
            <a
              href="#features"
              className="transition-all hover:text-[#507C7C] dark:hover:text-[#96C4BB] dark:hover:drop-shadow-[0_0_8px_rgba(150,196,187,0.5)]"
            >
              Features
            </a>
            <a
              href="#how"
              className="transition-all hover:text-[#507C7C] dark:hover:text-[#96C4BB] dark:hover:drop-shadow-[0_0_8px_rgba(150,196,187,0.5)]"
            >
              How it works
            </a>
            <a
              href="#voices"
              className="transition-all hover:text-[#507C7C] dark:hover:text-[#96C4BB] dark:hover:drop-shadow-[0_0_8px_rgba(150,196,187,0.5)]"
            >
              Voices
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-lg p-2 text-[#2D3E3A] dark:text-[#B2C9C5] transition-colors hover:bg-silver-200 dark:hover:bg-[#111A18] hover:text-[#0B1311] dark:hover:text-[#F8FAFA] border border-silver-300/40 dark:border-[#96C4BB]/20"
            >
              {theme === "dark" ? <Sun className="h-5 w-5 text-[#D4AF37]" /> : <Moon className="h-5 w-5 text-[#507C7C]" />}
            </button>
            <Link to="/signin" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link to="/signup">
              <Button
                size="sm"
                className="bg-[#D4AF37] text-[#070B0A] hover:bg-[#e0be4d] font-bold shadow-[0_0_20px_rgba(212,175,55,0.25)]"
              >
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section — Static, stable layout without jumpy parallax transforms */}
      <section className="relative">
        <AmbientBackground variant="hero" />
        <div className="absolute inset-0 cf-grid-bg opacity-30" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">
          {/* Left Column: Hero Copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Badge tone="flow" className="mb-5 shadow-[0_0_15px_rgba(80,124,124,0.2)]">
                  <motion.span
                    className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]"
                    animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                  Ready to make learning fun?
                </Badge>
              </motion.div>

              <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-[#0B1311] dark:text-[#F8FAFA] sm:text-5xl lg:text-6xl">
                Turn static notes into{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-[#D4AF37] via-[#507C7C] to-[#D4AF37] dark:from-[#D4AF37] dark:via-[#96C4BB] dark:to-[#D4AF37] bg-[length:200%_auto] bg-clip-text text-transparent [animation:cf-shimmer-text_4s_linear_infinite]">
                    animated, cinematic content.
                  </span>
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-lg text-[#2D3E3A] dark:text-[#B2C9C5] leading-relaxed">
                Hunuko is an interactive, automated learning companion —
                tutors, visual labs, oral exams, and several agents in one
                platform to make you the next Einstein.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/signup">
                  <Button
                    size="lg"
                    className="bg-[#D4AF37] text-[#070B0A] hover:bg-[#e0be4d] font-bold shadow-[0_0_25px_rgba(212,175,55,0.3)]"
                  >
                    Start learning <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/signin">
                  <Button
                    size="lg"
                    variant="outline"
                  >
                    Explore the demo
                  </Button>
                </Link>
              </div>

              <p className="mt-4 text-xs text-[#2D3E3A]/80 dark:text-[#B2C9C5]/80 font-medium">
                No stressful setup required — just paste your notes and start learning.
              </p>
            </motion.div>
          </div>

          {/* Right Column: Mascot Showcase Card inside Glassmorphic Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative flex justify-center lg:justify-end"
          >
            {/* Ambient Radial Lighting Behind Mascot Card */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[#507C7C]/25 via-transparent to-[#D4AF37]/15 blur-2xl -z-10" />

            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#96C4BB]/35 bg-white/90 dark:bg-[#0E1715]/90 p-6 sm:p-7 shadow-[0_0_30px_rgba(80,124,124,0.22)] backdrop-blur-xl">
              {/* Header inside Mascot Showcase Card */}
              <div className="flex items-center justify-between border-b border-[#96C4BB]/25 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.8)] animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1D4A46] dark:text-[#96C4BB]">
                    Animatrix Core Engine
                  </span>
                </div>
                <span className="rounded-full bg-[#507C7C]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#1D4A46] dark:text-[#96C4BB] border border-[#96C4BB]/30">
                  Visual AI
                </span>
              </div>

              {/* Central Mascot Visual with Radial Aura & Soft Float Motion */}
              <div className="relative flex items-center justify-center py-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-52 w-52 rounded-full bg-[#507C7C]/20 blur-2xl" />
                  <div className="absolute h-36 w-36 rounded-full bg-[#D4AF37]/15 blur-xl" />
                </div>

                <motion.img
                  src="/assets/mascot.jpg"
                  alt="Hunuko AI Mascot"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 h-64 w-auto max-w-full rounded-2xl object-contain drop-shadow-[0_16px_30px_rgba(0,0,0,0.4)] dark:drop-shadow-[0_16px_30px_rgba(0,0,0,0.7)]"
                />
              </div>

              {/* Showcase Card Status Footer */}
              <div className="mt-4 rounded-2xl border border-[#96C4BB]/25 bg-silver-100/90 dark:bg-[#131F1C]/95 p-3.5 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[#0B1311] dark:text-[#B2C9C5] font-medium">
                    <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                    <span>Multi-Agent Intelligence Active</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-[#1D4A46] dark:text-[#96C4BB] bg-[#507C7C]/15 px-2 py-0.5 rounded-full border border-[#96C4BB]/20">
                    Ready
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Marquee */}
        <div className="relative border-y border-[#96C4BB]/25 bg-white/60 dark:border-[#96C4BB]/15 dark:bg-[#0D1514]/60 py-4 backdrop-blur-md">
          <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <motion.div
              className="flex shrink-0 items-center gap-10 pr-10"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
            >
              {[...MARQUEE, ...MARQUEE].map((m, i) => (
                <span key={i} className="flex items-center gap-3 text-sm font-semibold text-[#2D3E3A] dark:text-[#B2C9C5]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" /> {m}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <StaggerGroup className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STATS.map((s) => (
              <StaggerItem key={s.label}>
                <SpotlightCard className="p-6 text-center" tilt={false}>
                  <s.icon className="mx-auto mb-3 h-6 w-6 text-[#D4AF37]" />
                  <p className="font-display text-3xl font-semibold tracking-tight text-[#0B1311] dark:text-[#F8FAFA]">
                    {s.fmt ? s.fmt : <Counter to={s.to} suffix={s.suffix} decimals={s.decimals ?? 0} />}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#2D3E3A] dark:text-[#B2C9C5]">{s.label}</p>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Transformation strip */}
      <section className="relative border-y border-[#96C4BB]/25 bg-[#E8F0EE]/40 dark:border-[#96C4BB]/15 dark:bg-[#0D1514]/40 py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <FadeIn className="mb-10 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-[#0B1311] dark:text-[#F8FAFA]">
              From notes to an animated ecosystem
            </h2>
            <p className="mt-2 text-[#2D3E3A] dark:text-[#B2C9C5]">A visualized experience.</p>
          </FadeIn>
          <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <StaggerItem key={s.n}>
                <motion.div whileHover={{ y: -6 }}>
                  <SpotlightCard className="h-full p-6">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-2xl font-bold text-[#D4AF37]">{s.n}</span>
                      {i < STEPS.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-[#507C7C]/60 dark:text-[#96C4BB]/60" />
                      )}
                    </div>
                    <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-[#0B1311] dark:text-[#F8FAFA]">{s.title}</h3>
                    <p className="mt-1.5 text-sm text-[#2D3E3A] dark:text-[#B2C9C5] leading-relaxed">{s.body}</p>
                  </SpotlightCard>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-20 lg:py-28">
        <AmbientBackground particles={false} />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <FadeIn className="mb-12 max-w-2xl">
            <Badge tone="flow" className="mb-4">One interactive environment</Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-[#0B1311] dark:text-[#F8FAFA] sm:text-4xl">
              The setup you need to learn, all in one place
            </h2>
            <p className="mt-3 text-[#2D3E3A] dark:text-[#B2C9C5] leading-relaxed">
              With Hunuko, academic torture is not an option. Just paste your notes, watch them come alive, and interact with them in the ways you learn best.
            </p>
          </FadeIn>
          <StaggerGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <StaggerItem key={f.title}>
                <motion.div whileHover={{ y: -4, borderColor: "rgba(150,196,187,0.6)" }} className="h-full">
                  <SpotlightCard className="h-full p-6">
                    <motion.div
                      whileHover={{ rotate: -8, scale: 1.08 }}
                      className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.tone} text-white shadow-[0_4px_16px_rgba(80,124,124,0.3)]`}
                    >
                      <f.icon className="h-5 w-5 text-[#F1F5F4]" />
                    </motion.div>
                    <h3 className="font-display text-lg font-semibold tracking-tight text-[#0B1311] dark:text-[#F8FAFA]">{f.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#2D3E3A] dark:text-[#B2C9C5]">{f.body}</p>
                  </SpotlightCard>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative overflow-hidden border-y border-[#96C4BB]/25 bg-[#EAEFEF] py-24 dark:border-[#96C4BB]/15 dark:bg-[#070B0A] transition-colors">
        <AmbientBackground variant="hero" particles={false} />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2">
          <FadeIn>
            <Badge tone="flow" className="mb-4">Cinematic by design</Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl text-[#0B1311] dark:text-[#F8FAFA]">
              Watch intelligence work
            </h2>
            <p className="mt-3 max-w-md text-[#2D3E3A] dark:text-[#B2C9C5] leading-relaxed">
              Animated visuals, Live Tutor, Oral Examiner, Editor and Feedback agents hand
              off tasks in real time.
            </p>
            <Link to="/signup" className="mt-7 inline-block">
              <Button
                size="lg"
                className="bg-[#D4AF37] text-[#070B0A] hover:bg-[#e0be4d] font-bold shadow-[0_0_25px_rgba(212,175,55,0.3)]"
              >
                Experience it <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </FadeIn>

          <FadeIn delay={0.15} className="flex justify-center">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative flex items-center justify-center"
            >
              <div className="absolute inset-0 rounded-full bg-[#507C7C]/20 blur-3xl" />
              <OrchestrationOrb className="max-w-sm" />
            </motion.div>
          </FadeIn>
        </div>
      </section>

      {/* Testimonials */}
      <section id="voices" className="relative py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <FadeIn className="mb-12 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-[#0B1311] dark:text-[#F8FAFA] sm:text-4xl">
              Voices from the flow
            </h2>
          </FadeIn>
          <StaggerGroup className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <StaggerItem key={t.name}>
                <motion.div whileHover={{ y: -6 }}>
                  <SpotlightCard className="h-full p-6">
                    <Quote className="h-6 w-6 text-[#507C7C] dark:text-[#96C4BB]" />
                    <p className="mt-4 text-sm leading-relaxed text-[#2D3E3A] dark:text-[#B2C9C5]">"{t.body}"</p>
                    <div className="mt-5 flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#886506] text-xs font-bold text-[#070B0A]">
                        {t.name.slice(0, 1)}
                      </span>
                      <div>
                        <p className="font-semibold text-[#0B1311] dark:text-[#F8FAFA]">{t.name}</p>
                        <p className="text-xs text-[#2D3E3A]/70 dark:text-[#B2C9C5]/70">{t.role}</p>
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-5 pb-24 sm:px-8">
        <FadeIn className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl border border-[#96C4BB]/35 bg-gradient-to-br from-[#111A18] via-[#0D1514] to-[#152220] p-10 text-center text-white sm:p-16 shadow-[0_0_40px_rgba(80,124,124,0.2)]">
            <AmbientBackground variant="stage" />
            <div className="absolute inset-0 cf-grid-bg opacity-20" />
            <div className="relative">
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl text-[#F8FAFA]">
                Ready to make learning fun?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-[#B2C9C5]">
                Join Hunuko and turn everything you study into an animated experience.
              </p>
              <Link to="/signup" className="mt-8 inline-block">
                <Button
                  size="lg"
                  className="bg-[#D4AF37] text-[#070B0A] hover:bg-[#e0be4d] font-bold shadow-[0_0_25px_rgba(212,175,55,0.3)]"
                >
                  Get started free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#96C4BB]/25 bg-[#EAEFEF] dark:border-[#96C4BB]/15 dark:bg-[#070B0A] py-12 transition-colors">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 sm:px-8 md:flex-row">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/assets/logo.jpg"
              alt="Hunuko Logo"
              className="h-7 w-auto object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-display text-lg font-bold tracking-tight text-[#0B1311] dark:text-[#F8FAFA]">
              Hunu<span className="text-[#D4AF37]">ko</span>
            </span>
          </Link>
          <p className="text-sm font-medium text-[#2D3E3A] dark:text-[#B2C9C5]">© 2026 Hunuko. Visual intelligence for learning.</p>
          <div className="flex gap-4 text-[#2D3E3A] dark:text-[#B2C9C5]">
            <a
              href="#"
              aria-label="Updates"
              className="transition-colors hover:text-[#507C7C] dark:hover:text-[#96C4BB]"
            >
              <Send className="h-5 w-5" />
            </a>
            <a
              href="#"
              aria-label="Website"
              className="transition-colors hover:text-[#507C7C] dark:hover:text-[#96C4BB]"
            >
              <Globe className="h-5 w-5" />
            </a>
            <a
              href="#"
              aria-label="Contact"
              className="transition-colors hover:text-[#507C7C] dark:hover:text-[#96C4BB]"
            >
              <AtSign className="h-5 w-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
