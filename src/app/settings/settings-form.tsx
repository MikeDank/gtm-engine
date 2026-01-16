"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertLlmSettings, type LlmSettings } from "./actions";
import type { LlmProvider } from "@/lib/llm/types";

interface SettingsFormProps {
  initialSettings: LlmSettings;
}

const PROVIDERS: { key: LlmProvider; label: string }[] = [
  { key: "openai", label: "OpenAI" },
  { key: "anthropic", label: "Anthropic" },
];

const DEFAULT_MODELS: Record<LlmProvider, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-sonnet-4-20250514",
};

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [provider, setProvider] = useState<LlmProvider>(
    initialSettings.provider
  );
  const [model, setModel] = useState(initialSettings.model);
  const [temperature, setTemperature] = useState(
    initialSettings.temperature.toString()
  );
  const [maxTokens, setMaxTokens] = useState(
    initialSettings.maxTokens.toString()
  );
  const [dailyCostLimit, setDailyCostLimit] = useState(
    initialSettings.dailyCostLimit.toString()
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function handleProviderChange(newProvider: LlmProvider) {
    setProvider(newProvider);
    setModel(DEFAULT_MODELS[newProvider]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const tempValue = parseFloat(temperature);
      const maxTokensValue = parseInt(maxTokens, 10);
      const dailyCostValue = parseFloat(dailyCostLimit);

      if (isNaN(tempValue) || tempValue < 0 || tempValue > 1) {
        throw new Error("Temperature must be between 0 and 1");
      }
      if (isNaN(maxTokensValue) || maxTokensValue < 1) {
        throw new Error("Max tokens must be at least 1");
      }
      if (isNaN(dailyCostValue) || dailyCostValue < 0) {
        throw new Error("Daily cost limit must be 0 or greater");
      }

      await upsertLlmSettings({
        provider,
        model,
        temperature: tempValue,
        maxTokens: maxTokensValue,
        dailyCostLimit: dailyCostValue,
      });

      setMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>LLM Provider Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Provider</Label>
            <div className="flex gap-2">
              {PROVIDERS.map((p) => (
                <Button
                  key={p.key}
                  type="button"
                  variant={provider === p.key ? "default" : "outline"}
                  onClick={() => handleProviderChange(p.key)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
            <p className="text-muted-foreground text-sm">
              API key is read from{" "}
              {provider === "openai" ? "OPENAI_API_KEY" : "ANTHROPIC_API_KEY"}{" "}
              environment variable.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={DEFAULT_MODELS[provider]}
            />
            <p className="text-muted-foreground text-sm">
              {provider === "openai"
                ? "e.g., gpt-4o, gpt-4o-mini, gpt-3.5-turbo"
                : "e.g., claude-sonnet-4-20250514, claude-3-haiku-20240307"}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (0-1)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxTokens">Max Tokens</Label>
              <Input
                id="maxTokens"
                type="number"
                min="1"
                value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyCostLimit">Daily Cost Limit ($)</Label>
              <Input
                id="dailyCostLimit"
                type="number"
                step="0.01"
                min="0"
                value={dailyCostLimit}
                onChange={(e) => setDailyCostLimit(e.target.value)}
              />
              <p className="text-muted-foreground text-xs">UI only</p>
            </div>
          </div>

          {message && (
            <div
              className={`rounded-md p-3 text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
