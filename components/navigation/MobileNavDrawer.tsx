"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { navItems } from "@/data/navigation";
import type { NavItem } from "@/types";

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

const iconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

function HamburgerIcon() {
  return (
    <svg {...iconProps}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 text-stone/60"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg {...iconProps} width={18} height={18}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg {...iconProps} width={18} height={18}>
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared link class — 44 px min tap target                          */
/* ------------------------------------------------------------------ */

const tapLink =
  "flex min-h-[44px] items-center rounded-lg px-2 -mx-2 text-[15px] text-ink/85 transition-colors active:bg-sand/60";

const tapLinkPrimary =
  "flex min-h-[44px] items-center rounded-lg px-2 -mx-2 text-[15px] font-medium text-ink transition-colors active:bg-sand/60";

/* ------------------------------------------------------------------ */
/*  Section renderers                                                  */
/* ------------------------------------------------------------------ */

function Divider() {
  return <div className="my-3 h-px bg-oat/60" aria-hidden="true" />;
}

/** Renders a nav item that has `groups` (mega-menu data). */
function GroupedSection({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  return (
    <div>
      {/* Section heading link */}
      <Link
        href={item.href}
        className={`${tapLinkPrimary} justify-between`}
        onClick={onNavigate}
      >
        {item.label}
        <ChevronRight />
      </Link>

      {/* Category groups */}
      <div className="mt-1 space-y-4 pl-1">
        {item.groups?.map((group) => (
          <div key={group.title}>
            <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-stone">
              {group.title}
            </p>
            <ul>
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={tapLink} onClick={onNavigate}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Highlight links */}
      {item.highlights?.length ? (
        <div className="mt-2 space-y-0 pl-1">
          {item.highlights.map((hl) => (
            <Link
              key={hl.label}
              href={hl.href}
              className="flex min-h-[44px] items-center gap-1.5 rounded-lg px-2 -mx-1 text-[15px] font-medium text-cocoa transition-colors active:bg-sand/60"
              onClick={onNavigate}
            >
              {hl.label}
              <span className="text-cocoa/50" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Renders a nav item that has flat `children`. */
function FlatSection({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  return (
    <div>
      <Link
        href={item.href}
        className={`${tapLinkPrimary} justify-between`}
        onClick={onNavigate}
      >
        {item.label}
        <ChevronRight />
      </Link>
      <ul className="pl-1">
        {item.children?.map((child) => (
          <li key={child.label}>
            <Link href={child.href} className={tapLink} onClick={onNavigate}>
              {child.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Focus trap helper                                                  */
/* ------------------------------------------------------------------ */

const focusableSelector =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function MobileNavDrawer() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const close = useCallback(() => setOpen(false), []);

  /* Body scroll lock, focus trap, ESC handler */
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const returnTarget = triggerRef.current;
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => closeButtonRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      returnTarget?.focus();
    };
  }, [open, close]);

  const panelTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "tween" as const, ease: [0.32, 0.72, 0, 1] as [number, number, number, number], duration: 0.3 };

  const scrimTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.25 };

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-sand"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-nav-drawer-panel"
      >
        <HamburgerIcon />
      </button>

      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0 z-50 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-nav-drawer-title"
          >
            {/* Scrim */}
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={scrimTransition}
              className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
              onClick={close}
              aria-label="Close drawer overlay"
            />

            {/* Panel */}
            <motion.div
              ref={panelRef}
              id="mobile-nav-drawer-panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={panelTransition}
              className="relative flex h-[100dvh] w-[300px] max-w-[85vw] flex-col bg-white shadow-card"
            >
              {/* Header */}
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-oat/60 px-5">
                <p
                  id="mobile-nav-drawer-title"
                  className="text-sm font-semibold uppercase tracking-[0.1em] text-ink"
                >
                  Menu
                </p>
                <button
                  ref={closeButtonRef}
                  type="button"
                  className="-mr-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-stone transition-colors hover:bg-sand hover:text-ink"
                  onClick={close}
                  aria-label="Close menu"
                >
                  <CloseIcon />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 pb-[env(safe-area-inset-bottom,20px)]">
                <nav aria-label="Mobile navigation">
                  {navItems.map((item, i) => {
                    const hasMega = Boolean(item.groups?.length);
                    const hasFlat = Boolean(item.children?.length);

                    return (
                      <div key={item.label}>
                        {i > 0 && (hasMega || hasFlat) && <Divider />}

                        {hasMega ? (
                          <GroupedSection item={item} onNavigate={close} />
                        ) : hasFlat ? (
                          <FlatSection item={item} onNavigate={close} />
                        ) : (
                          <Link
                            href={item.href}
                            className={tapLinkPrimary}
                            onClick={close}
                          >
                            {item.label}
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </nav>

                <Divider />
                <div className="flex items-center gap-2">
                  <Link
                    href="/search"
                    className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-oat/80 text-sm text-stone transition-colors active:bg-sand/60"
                    onClick={close}
                  >
                    <SearchIcon />
                    Search
                  </Link>
                  <Link
                    href="/contact"
                    className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-oat/80 text-sm text-stone transition-colors active:bg-sand/60"
                    onClick={close}
                  >
                    <UserIcon />
                    Contact
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
