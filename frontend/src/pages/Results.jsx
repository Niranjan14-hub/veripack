import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileWarning, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { VerdictHero } from '../components/results/VerdictHero';
import { ImagePanel } from '../components/results/ImagePanel';
import { FieldTable } from '../components/results/FieldTable';
import { IssueList } from '../components/results/IssueList';
import { RawTextPanel } from '../components/results/RawTextPanel';
import { api } from '../lib/api';
import { pageTransition } from '../lib/motion';

export function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [scan, setScan] = useState(state?.scan ?? null);
  const [error, setError] = useState(null);
  const [activeField, setActiveField] = useState(null);

  useEffect(() => {
    if (scan?.id === id) return;
    setScan(null);
    api.getScan(id).then(setScan).catch((exception) => setError(exception.message));
  }, [id]);

  const remove = async () => {
    await api.deleteScan(id).catch(() => null);
    navigate('/history');
  };

  if (error) {
    return (
      <motion.div {...pageTransition} className="container-page py-20">
        <EmptyState
          icon={FileWarning}
          title="Scan not found"
          description={error}
          action={
            <Button to="/history" variant="secondary">
              Back to history
            </Button>
          }
        />
      </motion.div>
    );
  }

  if (!scan) {
    return (
      <div className="container-page space-y-6 py-12">
        <Skeleton className="h-48 rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div {...pageTransition} className="container-page py-12">
      <Link
        to="/history"
        className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-ink focus-ring rounded"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All scans
      </Link>

      <div className="mt-5 space-y-6">
        <VerdictHero
          scan={scan}
          action={
            <>
              <Button to="/scan" variant="secondary" size="sm">
                <RotateCcw className="h-3.5 w-3.5" />
                New scan
              </Button>
              <Button variant="danger" size="sm" onClick={remove}>
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </>
          }
        />

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div className="space-y-6 lg:sticky lg:top-24">
            <ImagePanel scan={scan} activeField={activeField} />
            <RawTextPanel scan={scan} />
          </div>
          <div className="space-y-6">
            <IssueList issues={scan.issues} onHover={setActiveField} />
            <FieldTable
              fields={scan.fields}
              activeField={activeField}
              onHover={setActiveField}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
