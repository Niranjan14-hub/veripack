import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScanLine } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/format';

const LINKS = [
  { to: '/scan', label: 'Scan' },
  { to: '/history', label: 'History' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-colors duration-300',
        scrolled ? 'border-b border-line bg-canvas/80 backdrop-blur-xl' : 'border-b border-transparent',
      )}
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="group flex items-center gap-2.5 focus-ring rounded-lg">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent shadow-glow">
            <ScanLine className="h-4 w-4 text-white" strokeWidth={2.4} />
          </span>
          <span className="text-[0.95rem] font-semibold tracking-tight">VeriPack</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'relative rounded-lg px-3 py-1.5 text-sm transition-colors focus-ring',
                  isActive ? 'text-ink' : 'text-muted hover:text-ink',
                )
              }
            >
              {pathname === link.to ? (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-lg bg-white/[0.06]"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              ) : null}
              <span className="relative">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button to="/history" variant="ghost" size="sm" className="md:hidden">
            History
          </Button>
          <Button to="/scan" variant="primary" size="sm">
            Scan a package
          </Button>
        </div>
      </div>
    </header>
  );
}
