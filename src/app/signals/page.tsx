import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignalStatusBadge } from "@/components/signal-status-badge";
import { getSignals } from "./actions";
import Link from "next/link";

interface SignalsPageProps {
  searchParams: Promise<{ status?: string }>;
}

const statusFilters = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "converted", label: "Converted" },
  { value: "discarded", label: "Discarded" },
];

export default async function SignalsPage({ searchParams }: SignalsPageProps) {
  const { status = "all" } = await searchParams;
  const signals = await getSignals(status);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Signals</h1>
        <p className="text-muted-foreground">
          Ingest and review public signals from various sources.
        </p>
      </div>

      <Tabs value={status} className="w-full">
        <TabsList>
          {statusFilters.map((filter) => (
            <TabsTrigger key={filter.value} value={filter.value} asChild>
              <Link href={`/signals?status=${filter.value}`}>
                {filter.label}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {signals.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No signals found.</p>
          <p className="text-muted-foreground text-sm">
            {status === "all" ? (
              <>
                Run <code className="bg-muted px-1 py-0.5">pnpm db:seed</code>{" "}
                or ingest from an RSS feed.
              </>
            ) : (
              <>No signals with status &quot;{status}&quot;.</>
            )}
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
