import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignalStatusBadge } from "@/components/signal-status-badge";
import { getSignalById } from "../actions";
import { SignalActions } from "./signal-actions";

interface SignalDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SignalDetailPage({
  params,
}: SignalDetailPageProps) {
  const { id } = await params;
  const signal = await getSignalById(id);

  if (!signal) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/signals"
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              ← Back to Signals
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Signal Detail</h1>
        </div>
        <SignalStatusBadge status={signal.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Excerpt</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{signal.excerpt}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Source</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={signal.source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {signal.source}
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Captured</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{signal.capturedAt.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <SignalActions signalId={signal.id} currentStatus={signal.status} />
    </div>
  );
}
