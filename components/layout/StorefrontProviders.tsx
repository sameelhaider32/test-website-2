"use client";

import { ReactNode } from "react";
import { LayoutGroup } from "motion/react";

import { CartProvider } from "@/components/cart/CartProvider";

export function StorefrontProviders({ children }: { children: ReactNode }) {
  return (
    <LayoutGroup>
      <CartProvider>{children}</CartProvider>
    </LayoutGroup>
  );
}
