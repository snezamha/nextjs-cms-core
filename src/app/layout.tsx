import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Vazirmatn } from "next/font/google";

import "./globals.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

import type { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const vazir = Vazirmatn({ subsets: ["arabic"], variable: "--font-vazir" });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html
        suppressHydrationWarning
        className={cn(inter.variable, vazir.variable)}
      >
        <body
          className={cn(
            "bg-background text-foreground antialiased overscroll-none"
          )}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
