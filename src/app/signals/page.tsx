import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SignalStatusBadge } from "@/components/signal-status-badge";
import { getSignals } from "./actions";

export default async function SignalsPage() {
  const signals = await getSignals();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Signals</h1>
        <p className="text-muted-foreground">
          Ingest and review public signals from various sources.
        </p>
      </div>

      {signals.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No signals yet.</p>
          <p className="text-muted-foreground text-sm">
            Run <code className="bg-muted px-1 py-0.5">pnpm db:seed</code> or
            ingest from an RSS feed.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Excerpt</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Captured</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signals.map((signal) => (
                <TableRow key={signal.id}>
                  <TableCell className="max-w-md truncate font-medium">
                    {signal.excerpt.slice(0, 80)}...
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate text-sm">
                    {signal.source}
                  </TableCell>
                  <TableCell>
                    <SignalStatusBadge status={signal.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {signal.capturedAt.toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
