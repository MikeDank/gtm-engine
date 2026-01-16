import { getLlmSettings } from "./actions";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const settings = await getLlmSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your LLM provider for AI-powered draft generation.
        </p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
