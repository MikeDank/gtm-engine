import { getLlmSettings, checkApiKeyStatus } from "./actions";
import { SettingsForm } from "./settings-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage() {
  const settings = await getLlmSettings();
  const apiKeyStatus = await checkApiKeyStatus();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your LLM provider for AI-powered draft generation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">API Key Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">OpenAI:</span>
              {apiKeyStatus.openai ? (
                <Badge variant="default" className="bg-green-600">
                  Configured
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-600">
                  Not Set
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Anthropic:</span>
              {apiKeyStatus.anthropic ? (
                <Badge variant="default" className="bg-green-600">
                  Configured
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-600">
                  Not Set
                </Badge>
              )}
            </div>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            Set API keys via environment variables in your .env file.
          </p>
        </CardContent>
      </Card>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
