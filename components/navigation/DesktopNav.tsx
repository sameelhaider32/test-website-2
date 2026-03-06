"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { navItems } from "@/data/navigation";
import type { NavItem } from "@/types";

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

/** Arrow icon used on highlight links. */
function ArrowRight() {
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
      className="transition-transform group-hover/hl:translate-x-0.5"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Dropdown transition tokens                                         */
/* ------------------------------------------------------------------ */

const panelTransition = {
  type: "tween" as const,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
  duration: 0.18,
};

const indicatorTransition = {
  type: "tween" as const,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
  duration: 0.2,
};

/** Delay (ms) before closing a dropdown when mouse leaves the zone. */
const CLOSE_DELAY = 120;

/* ------------------------------------------------------------------ */
/*  Full-width mega-menu panel for items with `groups`.                 */
/* ------------------------------------------------------------------ */

function MegaMenuPanel({ item }: { item: NavItem }) {
  return (
    <div className="rounded-xl border border-oat/80 bg-white p-6 shadow-card">
      <div className="flex gap-10">
        {item.groups?.map((group) => (
          <div key={group.title} className="min-w-[160px]">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone">
              {group.title}
            </p>
            <ul className="space-y-2">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="block text-sm text-ink/80 transition-colors hover:text-cocoa"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {item.highlights?.length ? (
          <div className="flex min-w-[140px] flex-col justify-end border-l border-oat/60 pl-8">
            {item.highlights.map((hl) => (
              <Link
                key={hl.label}
                href={hl.href}
                className="group/hl mb-2 flex items-center gap-1.5 text-sm font-medium text-cocoa transition-colors hover:text-ink"
              >
                {hl.label}
                <ArrowRight />
              </Link>
            ))}

            <Link
              href={item.href}
              className="mt-3 text-xs font-medium text-stone transition-colors hover:text-ink"
            >
              View all →
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Simple dropdown for items with flat `children`.                    */
/* ------------------------------------------------------------------ */

function SimpleDropdown({ item }: { item: NavItem }) {
  return (
    <div className="w-56 rounded-xl border border-oat/80 bg-white p-4 shadow-card">
      <ul className="space-y-2">
        {item.children?.map((child) => (
          <li key={child.label}>
            <Link
              href={child.href}
              className="block text-sm text-ink/80 transition-colors hover:text-cocoa"
            >
              {child.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function DesktopNav() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Cancel any pending close. */
  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  /** Schedule dropdown close after a short delay. */
  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setOpenIndex(null);
      setHoveredIndex(null);
    }, CLOSE_DELAY);
  }, [cancelClose]);

  /** Open immediately (cancel any pending close). */
  const openItem = useCallback(
    (index: number) => {
      cancelClose();
      setHoveredIndex(index);
      const item = navItems[index];
      const hasDropdown = Boolean(item.groups?.length || item.children?.length);
      setOpenIndex(hasDropdown ? index : null);
    },
    [cancelClose],
  );

  /** Handle ESC to close. */
  useEffect(() => {
    if (openIndex === null) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenIndex(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [openIndex]);

  /** Cleanup timer on unmount. */
  useEffect(() => () => cancelClose(), [cancelClose]);

  return (
    <nav aria-label="Main navigation" className="relative hidden lg:block">
      <ul
        className="flex items-center gap-7 text-[13px]"
        onMouseLeave={scheduleClose}
      >
        {navItems.map((item, index) => {
          const hasMega = Boolean(item.groups?.length);
          const hasSimple = Boolean(item.children?.length);
          const hasDropdown = hasMega || hasSimple;
          const isOpen = openIndex === index;

          return (
            <li
              key={item.label}
              className={hasMega ? "static" : "relative"}
              onMouseEnter={() => openItem(index)}
              onFocus={() => openItem(index)}
              onBlur={(e) => {
                const li = e.currentTarget;
                /* Close when focus leaves this entire <li> subtree */
                requestAnimationFrame(() => {
                  if (!li.contains(document.activeElement)) {
                    setOpenIndex((prev) => (prev === index ? null : prev));
                  }
                });
              }}
            >
              {/* Relative wrapper keeps the indicator anchored to the link */}
              <div className="relative">
                <Link
                  href={item.href}
                  className="relative inline-flex py-1 font-medium tracking-wide text-ink transition-colors hover:text-cocoa"
                  aria-haspopup={hasDropdown ? "menu" : undefined}
                  aria-expanded={hasDropdown ? isOpen : undefined}
                >
                  {item.label}
                </Link>

                {/* Shared sliding hover indicator */}
                {hoveredIndex === index && (
                  <motion.div
                    layoutId={prefersReducedMotion ? undefined : "nav-indicator"}
                    className="absolute -bottom-0.5 left-0 right-0 h-[1.5px] bg-cocoa"
                    transition={indicatorTransition}
                  />
                )}
              </div>

              {/* Dropdown panel — React-controlled open/close */}
              {hasDropdown && (
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                      transition={panelTransition}
                      className={`z-30 pt-3 ${
                        hasMega
                          ? "fixed left-0 right-0 top-[var(--nav-mega-top)]"
                          : "absolute top-full left-1/2 -translate-x-1/2"
                      }`}
                      role="menu"
                      onMouseEnter={cancelClose}
                      onMouseLeave={scheduleClose}
                    >
                      {hasMega ? (
                      <div className="mx-auto w-full max-w-2xl px-6">
                        <MegaMenuPanel item={item} />
                      </div>
                    ) : (
                      <SimpleDropdown item={item} />
                    )}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
