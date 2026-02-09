"use client";

import type { DictionaryType } from "@/lib/get-dictionary";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { QuillViewer } from "@/components/base/rich-text/quill";
import type { LocaleType } from "@/types";

interface FooterProps {
  dictionary: DictionaryType;
}

const footerFallback = { line1: "", line2: "" };
const DASHBOARD_FOOTER_UPDATED_EVENT = "dashboard-footer-updated";

export function Footer({ dictionary }: FooterProps) {
  const params = useParams();
  const locale = params.lang as LocaleType;

  const [resolved, setResolved] = useState<{ line1: string; line2: string }>(
    footerFallback
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`/api/dashboard-footer?locale=${locale}`);
        if (!response.ok) {
          if (!cancelled) setResolved(footerFallback);
          return;
        }
        const data = (await response.json()) as {
          settings: { line1: string; line2: string };
        };
        if (!cancelled) setResolved(data.settings ?? footerFallback);
      } catch (_e) {
        if (!cancelled) setResolved(footerFallback);
      }
    }

    load();

    const onUpdated = () => {
      load();
    };
    window.addEventListener(DASHBOARD_FOOTER_UPDATED_EVENT, onUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener(DASHBOARD_FOOTER_UPDATED_EVENT, onUpdated);
    };
  }, [locale]);

  return (
    <footer className="bg-background border-t border-sidebar-border">
      <div className="container flex flex-col items-center justify-between gap-2 p-1 md:flex-row md:px-6">
        <div className="text-xs text-muted-foreground md:text-sm text-center md:text-left">
          <QuillViewer value={resolved.line1 || ""} />
        </div>
        {resolved.line2 && resolved.line2.trim() ? (
          <div className="text-xs text-muted-foreground md:text-sm text-center md:text-right">
            <QuillViewer value={resolved.line2} className="text-right" />
          </div>
        ) : (
          <div className="text-xs text-muted-foreground md:text-sm text-center md:text-right">
            {dictionary.footer.copyright}
          </div>
        )}
      </div>
    </footer>
  );
}
