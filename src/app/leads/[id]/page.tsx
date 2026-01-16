import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLeadById } from "../actions";
import { getDraftsForLead, getLatestLinkedInDraft } from "@/app/drafts/actions";
import { DraftMessageDialog } from "@/components/draft-message-dialog";
import { getActiveContextDoc } from "@/app/context/actions";
import { scoreLeadWithIcp } from "@/lib/icp-scoring";
import { CopyOutreachPackageButton } from "@/components/copy-outreach-package-button";
import { MarkAsSentButton } from "@/components/mark-as-sent-button";
import { TouchpointsList } from "@/components/touchpoints-list";
import { getTouchpointsForLead } from "@/app/touchpoints/actions";
import { ContactInfoForm } from "@/components/contact-info-form";
import { SyncToAttioButton } from "@/components/sync-to-attio-button";
import { GenerateFollowUpsButton } from "@/components/generate-follow-ups-button";

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

interface DripifyExportData {
  leadName: string;
  company: string | null;
  role: string | null;
  linkedinUrl: string | null;
  angle: string | null;
  icpScore: number;
  variantKey: string;
  hypothesis: string | null;
  message: string;
  sourceUrl: string | null;
}

function exportDripifyCsv(data: DripifyExportData): string {
  const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;
  const header =
    "lead_name,company,role,linkedin_url,angle,icp_score,variant_key,hypothesis,message,source_url";
  const row = [
    escapeCsv(data.leadName),
    escapeCsv(data.company || ""),
    escapeCsv(data.role || ""),
    escapeCsv(data.linkedinUrl || ""),
    escapeCsv(data.angle || ""),
    String(data.icpScore),
    escapeCsv(data.variantKey),
    escapeCsv(data.hypothesis || ""),
    escapeCsv(data.message),
    escapeCsv(data.sourceUrl || ""),
  ].join(",");
  return `${header}\n${row}`;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

  const drafts = await getDraftsForLead(id);
  const latestLinkedInDraft = await getLatestLinkedInDraft(id);
  const icpDoc = await getActiveContextDoc("icp");
  const touchpoints = await getTouchpointsForLead(id);

  const icpScore = scoreLeadWithIcp(
    { name: lead.name, role: lead.role, company: lead.company },
    lead.signal ? { excerpt: lead.signal.excerpt } : null,
    icpDoc?.content || null
  );

  const dripifyCsv = latestLinkedInDraft
    ? exportDripifyCsv({
        leadName: lead.name,
        company: lead.company,
        role: lead.role,
        linkedinUrl: lead.linkedinUrl,
        angle: latestLinkedInDraft.angle,
        icpScore: icpScore.score,
        variantKey: latestLinkedInDraft.variantKey,
        hypothesis: latestLinkedInDraft.hypothesis,
        message: latestLinkedInDraft.content,
        sourceUrl: lead.signal?.source || null,
      })
    : null;

  const outreachPackage = {
    lead: {
      id: lead.id,
      name: lead.name,
      role: lead.role,
      company: lead.company,
      email: lead.email,
      linkedinUrl: lead.linkedinUrl,
    },
    icp: {
      score: icpScore.score,
      reasons: icpScore.reasons,
    },
    signal: lead.signal
      ? {
          id: lead.signal.id,
          angle: lead.signal.angle,
          excerpt: lead.signal.excerpt,
          sourceUrl: lead.signal.source,
          capturedAt: lead.signal.capturedAt.toISOString(),
        }
      : null,
    drafts: drafts.map((d) => ({
      id: d.id,
      channel: d.channel,
      subject: d.subject,
      content: d.content,
      angle: d.angle,
      variantKey: d.variantKey,
      hypothesis: d.hypothesis,
      createdAt: d.createdAt.toISOString(),
    })),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link
            href="/leads"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ← Back to Leads
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{lead.name}</h1>
        </div>
        <div className="flex gap-2">
          <CopyOutreachPackageButton data={outreachPackage} />
          <DraftMessageDialog
            leadId={id}
            hasSignal={!!lead.signal}
            signalAngle={lead.signal?.angle}
          />
        </div>
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
          <CardTitle className="text-base">Contact Info</CardTitle>
        </CardHeader>
        <CardContent>
          <ContactInfoForm
            leadId={lead.id}
            initialEmail={lead.email}
            initialLinkedinUrl={lead.linkedinUrl}
            enrichedAt={lead.enrichedAt}
            enrichmentSource={lead.enrichmentSource}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ICP Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div
              className={`text-2xl font-bold ${
                icpScore.score >= 50
                  ? "text-green-600"
                  : icpScore.score >= 30
                    ? "text-amber-600"
                    : "text-gray-500"
              }`}
            >
              {icpScore.score}/100
            </div>
            <div className="text-muted-foreground text-sm">
              {icpScore.reasons.map((reason, i) => (
                <div key={i}>{reason}</div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Drafts</CardTitle>
          {dripifyCsv ? (
            <ExportDripifyButton csv={dripifyCsv} />
          ) : (
            <p className="text-muted-foreground text-sm">
              No LinkedIn draft to export
            </p>
          )}
        </CardHeader>
        <CardContent>
          {drafts.length === 0 ? (
            <p className="text-muted-foreground">
              No drafts yet. Click &quot;Draft Message&quot; to create one.
            </p>
          ) : (
            <div className="space-y-2">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                >
                  <Link
                    href={`/drafts/${draft.id}`}
                    className="flex flex-1 items-center gap-2"
                  >
                    <Badge variant="outline">{draft.channel}</Badge>
                    <span className="text-sm">{draft.variantKey}</span>
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      {draft.createdAt.toLocaleString()}
                    </span>
                    <MarkAsSentButton draftId={draft.id} leadId={id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Touchpoints</CardTitle>
          <GenerateFollowUpsButton leadId={id} />
        </CardHeader>
        <CardContent>
          <TouchpointsList touchpoints={touchpoints} leadId={id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attio CRM Sync</CardTitle>
        </CardHeader>
        <CardContent>
          <SyncToAttioButton
            leadId={lead.id}
            attioSyncedAt={lead.attioSyncedAt}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ExportDripifyButton({ csv }: { csv: string }) {
  return (
    <form>
      <input type="hidden" name="csv" value={csv} />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "dripify-export.csv";
          a.click();
          URL.revokeObjectURL(url);
        }}
      >
        Export for Dripify
      </Button>
    </form>
  );
}
