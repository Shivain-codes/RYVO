'use client';

import { useEffect, useRef, useState } from 'react';
import { Wordmark, Arrow } from './Wordmark';

export function Navigation() {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !header.current?.contains(event.target)) setOpen(false);
    };
    const desktop = window.matchMedia('(min-width: 768px)');
    const closeAtDesktop = () => { if (desktop.matches) setOpen(false); };
    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('pointerdown', closeOutside);
    desktop.addEventListener('change', closeAtDesktop);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('pointerdown', closeOutside);
      desktop.removeEventListener('change', closeAtDesktop);
    };
  }, [open]);

  return (
    <header className="site-header" ref={header} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <div className="header-inner shell">
        <Wordmark />
        <span className="header-note">RUN IN RHYTHM · 2026</span>
        <button ref={menuButton} type="button" className="menu-toggle" aria-expanded={open}
          aria-controls="primary-navigation" onClick={() => setOpen(!open)}>
          {open ? 'Close' : 'Menu'}<span aria-hidden="true">{open ? '−' : '+'}</span>
        </button>
        <nav id="primary-navigation" aria-label="Main navigation" className={`main-nav${open ? ' is-open' : ''}`}>
          <a href="#product" onClick={() => setOpen(false)}>Product</a>
          <a href="#how-it-works" onClick={() => setOpen(false)}>How it works</a>
          <a href="#demo" onClick={() => setOpen(false)}>Demo</a>
          <a className="nav-cta" href="/run/new" onClick={() => setOpen(false)}>Start simulation <Arrow diagonal /></a>
        </nav>
      </div>
    </header>
  );
}
