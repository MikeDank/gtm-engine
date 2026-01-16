import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLeadById } from "../actions";

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          href="/leads"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Back to Leads
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{lead.name}</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Role</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{lead.role || "Not specified"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Company</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{lead.company || "Not specified"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Created</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{lead.createdAt.toLocaleString()}</p>
        </CardContent>
      </Card>

      {lead.signal && (
        <Card>
          <CardHeader>
            <CardTitle>Source Signal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-1 text-sm font-medium">
                Source URL
              </p>
              <a
                href={lead.signal.source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {lead.signal.source}
              </a>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-sm font-medium">
                Excerpt
              </p>
              <p className="whitespace-pre-wrap">{lead.signal.excerpt}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-sm font-medium">
                Captured At
              </p>
              <p>{lead.signal.capturedAt.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
