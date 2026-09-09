import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { pageTransition } from '../lib/motion';

export function NotFound() {
  return (
    <motion.div {...pageTransition} className="container-page py-24">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="The page you are looking for does not exist."
        action={
          <Button to="/" variant="secondary">
            Back to home
          </Button>
        }
      />
    </motion.div>
  );
}
