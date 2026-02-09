"use client";

import { useEffect, useMemo, useRef } from "react";

type QuillValue = {
  ops: Array<{ insert?: unknown; attributes?: Record<string, unknown> }>;
};

type QuillLike = {
  setContents: (delta: QuillValue) => void;
  setText: (text: string) => void;
  getContents: () => QuillValue;
  on: (event: "text-change", cb: () => void) => void;
  clipboard: { dangerouslyPasteHTML: (html: string) => void };
};

function applyValueToQuill(quill: QuillLike, value: string) {
  const v = (value ?? "").toString();
  const delta = parseMaybeDelta(v);
  if (delta) {
    quill.setContents(delta);
    return;
  }
  if (isProbablyHtml(v)) {
    quill.clipboard.dangerouslyPasteHTML(v);
    return;
  }
  quill.setText(v);
}

function parseMaybeDelta(value: string): QuillValue | null {
  const v = value.trim();
  if (!v) return null;
  if (!v.startsWith("{") && !v.startsWith("[")) return null;
  try {
    const parsed = JSON.parse(v) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "ops" in (parsed as Record<string, unknown>)
    ) {
      const rec = parsed as Record<string, unknown>;
      const ops = rec.ops;
      if (Array.isArray(ops)) {
        return parsed as QuillValue;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function isProbablyHtml(value: string): boolean {
  const v = value.trim();
  return v.includes("<") && v.includes(">");
}

function isEmptyValue(value: string): boolean {
  const delta = parseMaybeDelta(value);
  if (delta) {
    const text = delta.ops
      .map((op) => (typeof op.insert === "string" ? op.insert : ""))
      .join("")
      .replace(/\n/g, "")
      .trim();
    return text.length === 0;
  }
  const asText = value
    .replace(/<[^>]+>/g, "")
    .replace(/\n/g, "")
    .trim();
  return asText.length === 0;
}

type QuillEditorProps = {
  label?: string;
  value: string;
  onChange: (nextDeltaJson: string) => void;
  placeholder?: string;
  minHeightClassName?: string;
};

export function QuillEditor({
  label,
  value,
  onChange,
  placeholder,
  minHeightClassName = "min-h-24",
}: QuillEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<QuillLike | null>(null);
  const lastValueRef = useRef<string>("");
  const onChangeRef = useRef(onChange);
  const latestValueRef = useRef<string>("");
  const placeholderRef = useRef<string | undefined>(placeholder);

  const normalizedValue = useMemo(() => value ?? "", [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    latestValueRef.current = normalizedValue;
  }, [normalizedValue]);

  useEffect(() => {
    placeholderRef.current = placeholder;
  }, [placeholder]);

  useEffect(() => {
    let destroyed = false;

    async function init() {
      if (!containerRef.current || quillRef.current) return;
      const { default: QuillCtor } = await import("quill");
      if (destroyed) return;

      const quill = new QuillCtor(containerRef.current, {
        theme: "snow",
        placeholder: placeholderRef.current,
        modules: {
          toolbar: [
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"],
            ["clean"],
          ],
        },
      }) as unknown as QuillLike;

      quillRef.current = quill;

      applyValueToQuill(quill, latestValueRef.current);
      lastValueRef.current = latestValueRef.current;

      quill.on("text-change", () => {
        const next = JSON.stringify(quill.getContents());
        lastValueRef.current = next;
        onChangeRef.current(next);
      });
    }

    init();
    return () => {
      destroyed = true;
    };
  }, []);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;
    if (normalizedValue === lastValueRef.current) return;

    applyValueToQuill(quill, normalizedValue);
    lastValueRef.current = normalizedValue;
  }, [normalizedValue]);

  return (
    <div className="space-y-2">
      {label ? <div className="text-sm font-medium">{label}</div> : null}
      <div
        className={[
          "rounded-md border bg-background overflow-visible",
          minHeightClassName,
          "[&_.ql-toolbar.ql-snow]:!border-0 [&_.ql-container.ql-snow]:!border-0",
          "[&_.ql-toolbar.ql-snow]:!border-b [&_.ql-toolbar.ql-snow]:!border-border",
          "[&_.ql-toolbar]:rounded-t-md [&_.ql-container]:rounded-b-md",
          "[&_.ql-toolbar_button]:!border-0 [&_.ql-toolbar_button]:!shadow-none",
          "[&_.ql-toolbar_.ql-picker-label]:!border-0 [&_.ql-toolbar_.ql-picker-label]:!shadow-none",
          "[&_.ql-toolbar_.ql-picker-options]:!border-0 [&_.ql-toolbar_.ql-picker-options]:!shadow-none",
          "[&_.ql-toolbar]:bg-background [&_.ql-container]:bg-transparent [&_.ql-editor]:bg-transparent",
          "[&_.ql-toolbar]:p-2 [&_.ql-toolbar_.ql-formats]:me-2",
          "[&_.ql-editor]:text-sm [&_.ql-editor]:px-3 [&_.ql-editor]:py-2",
          "[&_.ql-editor_a]:underline [&_.ql-editor_a]:underline-offset-4",
          "[&_.ql-tooltip]:!z-50 [&_.ql-tooltip]:!shadow-lg [&_.ql-tooltip]:!border [&_.ql-tooltip]:!border-border",
          "[&_.ql-tooltip]:!bg-background [&_.ql-tooltip]:!text-foreground",
        ].join(" ")}
      >
        <div ref={containerRef} />
      </div>
    </div>
  );
}

type QuillViewerProps = {
  value: string;
  className?: string;
};

export function QuillViewer({ value, className }: QuillViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<QuillLike | null>(null);
  const latestValueRef = useRef<string>(value ?? "");

  const empty = useMemo(() => isEmptyValue(value ?? ""), [value]);

  useEffect(() => {
    latestValueRef.current = value ?? "";
  }, [value]);

  useEffect(() => {
    let destroyed = false;

    async function init() {
      if (empty) return;
      if (!containerRef.current || quillRef.current) return;
      const { default: QuillCtor } = await import("quill");
      if (destroyed) return;

      const quill = new QuillCtor(containerRef.current, {
        theme: "bubble",
        readOnly: true,
        modules: { toolbar: false },
      }) as unknown as QuillLike;
      quillRef.current = quill;

      applyValueToQuill(quill, latestValueRef.current);
    }

    init();
    return () => {
      destroyed = true;
    };
  }, [empty]);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;
    applyValueToQuill(quill, value ?? "");
  }, [value]);

  if (empty) return null;

  return (
    <div
      className={[
        "[&_.ql-editor]:p-0 [&_.ql-editor]:leading-snug [&_.ql-editor]:text-inherit",
        "[&_.ql-editor_a]:underline [&_.ql-editor_a]:underline-offset-4",
        className ?? "",
      ].join(" ")}
    >
      <div ref={containerRef} />
    </div>
  );
}
