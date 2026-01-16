import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SystemStatus } from "@/components/system-status";

const gettingStarted = [
  {
    title: "1. Add Signals",
    description:
      "Import public signals from posts, blogs, events, or GitHub activity.",
  },
  {
    title: "2. Qualify Leads",
    description: "Score and qualify leads based on evidence—no hallucinations.",
  },
  {
    title: "3. Draft Outreach",
    description:
      "Generate personalized, non-creepy outreach drafts for review.",
  },
  {
    title: "4. Export to CRM",
    description: "Sync approved leads and outreach to Attio or your CRM.",
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">GTM Engine</h1>
        <p className="text-muted-foreground">Signal → Lead → Outreach → CRM</p>
        <SystemStatus />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {gettingStarted.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
