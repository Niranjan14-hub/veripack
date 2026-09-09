import { motion } from 'framer-motion';
import {
  ArrowRight,
  Boxes,
  Crosshair,
  FileSearch,
  Gauge,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { HeroPreview } from '../components/landing/HeroPreview';
import { fadeUp, pageTransition, stagger } from '../lib/motion';

const STEPS = [
  {
    icon: Upload,
    title: 'Upload the package photo',
    body: 'Drop in a photo of the label. OpenCV deskews, denoises and thresholds it for reliable reading.',
  },
  {
    icon: FileSearch,
    title: 'Extract and structure',
    body: 'Tesseract lifts the raw text, then Gemini maps it into typed label fields with strict schema validation.',
  },
  {
    icon: ShieldCheck,
    title: 'Verify against the rules',
    body: 'A data-driven compliance engine checks every required field and returns a verdict with fixes.',
  },
];

const FEATURES = [
  {
    icon: Crosshair,
    title: 'Region grounding',
    body: 'Every extracted field maps back to the pixels it came from — hover a row to highlight it on the pack.',
  },
  {
    icon: Gauge,
    title: 'Compliance score',
    body: 'Weighted by severity, so a missing allergen statement never reads the same as a missing storage note.',
  },
  {
    icon: Boxes,
    title: 'Rule sets as data',
    body: 'Food, cosmetics and supplements ship as JSON. Add a category without touching the engine.',
  },
  {
    icon: Sparkles,
    title: 'Hallucination guardrails',
    body: 'Values are cross-checked against the raw OCR text, so invented fields are flagged, not trusted.',
  },
  {
    icon: ScanLine,
    title: 'Readability gate',
    body: 'Low-confidence captures are rejected with retake guidance instead of returning confident nonsense.',
  },
  {
    icon: FileSearch,
    title: 'Full audit trail',
    body: 'Raw OCR text, per-stage timings and the structured result are stored with every scan.',
  },
];

const STATS = [
  { value: '3', label: 'Rule categories' },
  { value: '28', label: 'Label checks' },
  { value: '<5s', label: 'Typical scan' },
  { value: '100%', label: 'Auditable output' },
];

export function Landing() {
  return (
    <motion.div {...pageTransition}>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-backdrop radial-fade" />
        <div className="pointer-events-none absolute left-1/2 top-[-14rem] h-[28rem] w-[52rem] -translate-x-1/2 rounded-full bg-accent/20 blur-[140px]" />

        <div className="container-page relative pt-20 sm:pt-28">
          <motion.div
            variants={stagger(0.09)}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div variants={fadeUp} className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-white/[0.03] px-3 py-1 text-2xs text-muted backdrop-blur">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-soft opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-soft" />
                </span>
                OCR · Gemini · rules engine, in one pass
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl"
            >
              <span className="text-gradient">Label compliance,</span>
              <br />
              <span className="text-gradient">verified in seconds.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted">
              Photograph a package. VeriPack reads the label, structures every declaration and tells
              you exactly which required fields are missing, malformed or non-compliant — before it
              reaches a shelf.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button to="/scan" size="lg" variant="accent">
                Scan a package
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button to="/history" size="lg" variant="secondary">
                View scan history
              </Button>
            </motion.div>
          </motion.div>

          <HeroPreview />
        </div>
      </section>

      <section className="container-page mt-24">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-surface px-6 py-7 text-center">
              <p className="text-2xl font-semibold tracking-tight text-ink">{stat.value}</p>
              <p className="mt-1 text-2xs uppercase tracking-[0.14em] text-subtle">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page mt-28">
        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.p
            variants={fadeUp}
            className="text-2xs font-medium uppercase tracking-[0.18em] text-accent-soft"
          >
            How it works
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="mt-3 max-w-lg text-3xl font-semibold tracking-tight text-ink"
          >
            One photo in. An auditable verdict out.
          </motion.h2>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.title}
                variants={fadeUp}
                className="group relative overflow-hidden rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-line-strong"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-elevated text-accent-soft">
                    <step.icon className="h-[18px] w-[18px]" strokeWidth={2} />
                  </span>
                  <span className="font-mono text-2xs text-subtle">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-sm font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="container-page mt-28">
        <motion.div
          variants={stagger(0.06)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.p
            variants={fadeUp}
            className="text-2xs font-medium uppercase tracking-[0.18em] text-accent-soft"
          >
            Built for trust
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-ink"
          >
            Every answer traceable to the pixels it came from.
          </motion.h2>

          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                className="bg-surface p-6 transition-colors hover:bg-elevated"
              >
                <feature.icon className="h-[18px] w-[18px] text-accent-soft" strokeWidth={2} />
                <h3 className="mt-4 text-sm font-semibold text-ink">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{feature.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="container-page mt-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl border border-line bg-surface px-8 py-14 text-center"
        >
          <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-60" />
          <div className="pointer-events-none absolute left-1/2 top-full h-64 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-[100px]" />
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight text-ink">
              Check your first label now.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted">
              No account, no setup. Upload a package photo or run one of the bundled sample labels.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button to="/scan" size="lg" variant="accent">
                Start a scan
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
}
