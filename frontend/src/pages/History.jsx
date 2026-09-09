import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ScanSearch } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { ScanCard } from '../components/history/ScanCard';
import { FilterBar } from '../components/history/FilterBar';
import { api } from '../lib/api';
import { pageTransition } from '../lib/motion';

const PAGE_SIZE = 9;

export function History() {
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [verdict, setVerdict] = useState(null);
  const [category, setCategory] = useState(null);

  const load = useCallback(() => {
    api
      .listScans({ page, pageSize: PAGE_SIZE, verdict, category })
      .then(setData)
      .catch((exception) => setError(exception.message));
  }, [page, verdict, category]);

  useEffect(() => {
    api.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(load, [load]);

  const remove = async (id) => {
    setData((current) =>
      current
        ? { ...current, items: current.items.filter((item) => item.id !== id), total: current.total - 1 }
        : current,
    );
    await api.deleteScan(id).catch(() => null);
    load();
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const filtered = Boolean(verdict || category);

  return (
    <motion.div {...pageTransition} className="container-page py-12">
      <PageHeader
        eyebrow="Archive"
        title="Scan history"
        description="Every verification, with its score, verdict and full audit trail."
        action={
          <Button to="/scan" variant="accent" size="md">
            New scan
          </Button>
        }
      />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <FilterBar
          categories={categories}
          verdict={verdict}
          category={category}
          onVerdictChange={(value) => {
            setVerdict(value);
            setPage(1);
          }}
          onCategoryChange={(value) => {
            setCategory(value);
            setPage(1);
          }}
        />
        {data ? (
          <span className="text-xs text-subtle">
            {data.total} scan{data.total === 1 ? '' : 's'}
          </span>
        ) : null}
      </div>

      <div className="mt-6">
        {error ? (
          <EmptyState
            icon={ScanSearch}
            title="Could not load scans"
            description={error}
            action={
              <Button variant="secondary" onClick={load}>
                Retry
              </Button>
            }
          />
        ) : !data ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-60 rounded-2xl" />
            ))}
          </div>
        ) : data.items.length === 0 ? (
          <EmptyState
            icon={ScanSearch}
            title={filtered ? 'No scans match these filters' : 'No scans yet'}
            description={
              filtered
                ? 'Try clearing the filters to see the full archive.'
                : 'Run your first verification and it will appear here with its full report.'
            }
            action={
              filtered ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setVerdict(null);
                    setCategory(null);
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Button to="/scan" variant="accent">
                  Scan a package
                </Button>
              )
            }
          />
        ) : (
          <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {data.items.map((scan, index) => (
                <ScanCard key={scan.id} scan={scan} index={index} onDelete={remove} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {data && totalPages > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((value) => value - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </Button>
          <span className="px-2 text-xs text-muted">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : null}
    </motion.div>
  );
}
