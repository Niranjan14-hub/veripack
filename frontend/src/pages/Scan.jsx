import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Lightbulb, Play, Sparkles } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { CategorySelect } from '../components/scan/CategorySelect';
import { ImageDropzone } from '../components/scan/ImageDropzone';
import { PipelineProgress, STAGES } from '../components/scan/PipelineProgress';
import { api } from '../lib/api';
import { fadeUp, pageTransition } from '../lib/motion';

const TIPS = [
  'Fill the frame with the label and keep it flat.',
  'Even, indirect light — avoid flash glare on foil or gloss.',
  'Capture the panel with ingredients and net quantity together.',
];

export function Scan() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [samples, setSamples] = useState([]);
  const [category, setCategory] = useState('food');
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    api
      .categories()
      .then((data) => {
        setCategories(data);
        if (data.length && !data.some((item) => item.key === category)) setCategory(data[0].key);
      })
      .catch(() => setError('Could not reach the VeriPack API. Is the backend running?'));
    api.samples().then(setSamples).catch(() => setSamples([]));
    return () => clearInterval(timer.current);
  }, []);

  const startStageTicker = () => {
    setStageIndex(0);
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      setStageIndex((index) => Math.min(index + 1, STAGES.length - 1));
    }, 900);
  };

  const finish = (scan) => {
    clearInterval(timer.current);
    setStageIndex(STAGES.length);
    setTimeout(() => navigate(`/results/${scan.id}`, { state: { scan } }), 450);
  };

  const fail = (message) => {
    clearInterval(timer.current);
    setBusy(false);
    setStageIndex(0);
    setError(message);
  };

  const runScan = async () => {
    if (!file) return;
    setError(null);
    setBusy(true);
    startStageTicker();
    try {
      finish(await api.createScan(file, category));
    } catch (exception) {
      fail(exception.message);
    }
  };

  const runSample = async (sampleKey) => {
    setError(null);
    setBusy(true);
    startStageTicker();
    try {
      finish(await api.createDemoScan(sampleKey));
    } catch (exception) {
      fail(exception.message);
    }
  };

  return (
    <motion.div {...pageTransition} className="container-page py-12">
      <PageHeader
        eyebrow="New scan"
        title="Scan a package"
        description="Upload a photo of the packaging and pick the product category. VeriPack reads the label and checks it against that category's required declarations."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
          <div>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-ink">1 · Product category</h2>
              <span className="text-2xs text-subtle">Determines the rule set applied</span>
            </div>
            <CategorySelect
              categories={categories}
              value={category}
              onChange={setCategory}
              disabled={busy}
            />
          </div>

          <div>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-ink">2 · Package image</h2>
              <span className="text-2xs text-subtle">Front or back panel</span>
            </div>
            <ImageDropzone file={file} onSelect={setFile} onError={setError} disabled={busy} />
          </div>

          <AnimatePresence>
            {error ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-start gap-3 rounded-xl border border-bad/35 bg-bad-dim px-4 py-3"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
                <p className="text-sm text-ink/90">{error}</p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="flex items-center gap-3">
            <Button variant="accent" size="lg" onClick={runScan} disabled={!file || busy}>
              <Sparkles className="h-4 w-4" />
              {busy ? 'Verifying…' : 'Verify label'}
            </Button>
            {file && !busy ? (
              <span className="text-xs text-subtle">Runs OCR, AI structuring and rule checks</span>
            ) : null}
          </div>
        </motion.div>

        <motion.aside
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="space-y-4 lg:sticky lg:top-24 lg:self-start"
        >
          <AnimatePresence mode="wait">
            {busy ? (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <PipelineProgress activeIndex={stageIndex} />
              </motion.div>
            ) : (
              <motion.div
                key="samples"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-2xl border border-line bg-surface p-5"
              >
                <h3 className="text-sm font-semibold text-ink">No package to hand?</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  Run a bundled sample label through the real pipeline — same OCR, same rules.
                </p>
                <div className="mt-4 space-y-2">
                  {samples.map((sample) => (
                    <button
                      key={sample.key}
                      type="button"
                      onClick={() => runSample(sample.key)}
                      className="flex w-full items-center gap-3 rounded-xl border border-line bg-elevated px-3 py-2.5 text-left transition-colors hover:border-line-strong hover:bg-white/[0.06] focus-ring"
                    >
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent-dim text-accent-soft">
                        <Play className="h-3 w-3 fill-current" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-medium text-ink">
                          {sample.title.replace('Sample: ', '')}
                        </span>
                        <span className="block text-2xs capitalize text-subtle">
                          {sample.category}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-warn" />
              <h3 className="text-sm font-semibold text-ink">Capture tips</h3>
            </div>
            <ul className="mt-3 space-y-2.5">
              {TIPS.map((tip) => (
                <li key={tip} className="flex gap-2.5 text-xs leading-relaxed text-muted">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent-soft" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </motion.aside>
      </div>
    </motion.div>
  );
}
