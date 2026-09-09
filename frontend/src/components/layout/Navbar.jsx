import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, ScanLine } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../lib/auth';
import { cn } from '../../lib/format';

const LINKS = [
  { to: '/scan', label: 'Scan' },
  { to: '/history', label: 'History' },
];

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
          {(user ? LINKS : []).map((link) => (
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
          {user ? (
            <>
              <Button to="/history" variant="ghost" size="sm" className="md:hidden">
                History
              </Button>
              <span
                title={user.email}
                className="hidden h-8 w-8 place-items-center rounded-full border border-line-strong bg-elevated text-2xs font-semibold text-ink sm:grid"
              >
                {initials(user.name)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Sign out"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </Button>
              <Button to="/scan" variant="primary" size="sm">
                Scan a package
              </Button>
            </>
          ) : (
            <>
              <Button to="/login" variant="ghost" size="sm">
                Sign in
              </Button>
              <Button to="/signup" variant="primary" size="sm">
                Get started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
