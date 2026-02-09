"use client";

import { useDictionary } from "@/contexts/dictionary-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/base/ui/card";
import SettingsGeneralForm from "./settings-general-form";

export function General() {
  const dictionary = useDictionary();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dictionary.settings.general.title}</CardTitle>
        <CardDescription>
          {dictionary.settings.general.metaData.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SettingsGeneralForm />
      </CardContent>
    </Card>
  );
}
