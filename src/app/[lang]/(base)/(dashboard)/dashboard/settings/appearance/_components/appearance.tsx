"use client";

import { useState } from "react";

import type { LayoutType, RadiusType, ThemeType } from "@/types";

import { useDictionary } from "@/contexts/dictionary-context";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { isApiError } from "@/lib/api/errors";
import { fetchJson } from "@/lib/api/fetch-json";
import { themes, radii } from "@/configs/themes";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/base/ui/card";
import { Button } from "@/components/base/ui/button";
import { AlignStartHorizontal, AlignStartVertical } from "lucide-react";

type AppearanceState = {
  theme: ThemeType;
  radius: RadiusType;
  layout: LayoutType;
};

async function persistAppearance(payload: AppearanceState): Promise<void> {
  await fetchJson<{ ok: true }>("/api/settings-appearance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function Appearance() {
  const dictionary = useDictionary();
  const { toast } = useToast();
  const { settings, updateSettings } = useSettings();
  const [state, setState] = useState<AppearanceState>(() => ({
    theme: settings.theme,
    radius: settings.radius,
    layout: settings.layout,
  }));
  const [saving, setSaving] = useState(false);

  const applyPreview = (next: AppearanceState) => {
    setState(next);
    updateSettings({ ...settings, ...next });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await persistAppearance(state);
      toast({
        description:
          dictionary.settings.appearance.form.updated ??
          "Appearance settings updated.",
        variant: "success",
      });
      window.dispatchEvent(new Event("appearance-updated"));
    } catch (error) {
      console.error("Error saving appearance:", error);
      const msg =
        isApiError(error) &&
        (error.body as { error?: unknown } | null)?.error?.toString?.();
      toast({
        description: msg || dictionary.settings.appearance.form.saveFailed,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dictionary.settings.appearance.form.title}</CardTitle>
        <CardDescription>
          {dictionary.settings.appearance.form.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {dictionary.settings.appearance.form.color}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(themes).map(([name, value]) => {
              const isActive = state.theme === name;
              const hsl =
                settings.mode === "dark"
                  ? value.activeColor.dark
                  : value.activeColor.light;
              return (
                <Button
                  key={name}
                  variant="outline"
                  className={`min-h-9 ${isActive ? "ring-2 ring-offset-2 ring-muted-foreground" : ""}`}
                  style={
                    {
                      backgroundColor: `hsl(${hsl})`,
                      color: `hsl(${value.activeColor.foreground})`,
                      borderColor: `hsl(${hsl})`,
                    } as React.CSSProperties
                  }
                  onClick={() =>
                    applyPreview({ ...state, theme: name as ThemeType })
                  }
                >
                  {value.label}
                </Button>
              );
            })}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {dictionary.settings.appearance.form.radius}
          </p>
          <div className="flex gap-2">
            {radii.map((r) => (
              <Button
                key={r}
                variant={state.radius === r ? "secondary" : "outline"}
                onClick={() => applyPreview({ ...state, radius: r })}
              >
                {r}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {dictionary.settings.appearance.form.layout}
          </p>
          <div className="flex gap-2">
            <Button
              variant={state.layout === "horizontal" ? "secondary" : "outline"}
              onClick={() => applyPreview({ ...state, layout: "horizontal" })}
            >
              <AlignStartHorizontal className="h-4 w-4 me-2" />
              {dictionary.settings.appearance.form.horizontal}
            </Button>
            <Button
              variant={state.layout === "vertical" ? "secondary" : "outline"}
              onClick={() => applyPreview({ ...state, layout: "vertical" })}
            >
              <AlignStartVertical className="h-4 w-4 me-2" />
              {dictionary.settings.appearance.form.vertical}
            </Button>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} variant="default" disabled={saving}>
            {dictionary.settings.appearance.form.saveChanges}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
