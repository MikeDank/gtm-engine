import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDraftById } from "../actions";
import { DraftEditor } from "./draft-editor";

interface DraftDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DraftDetailPage({
  params,
}: DraftDetailPageProps) {
  const { id } = await params;
  const draft = await getDraftById(id);

  if (!draft) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          href={`/leads/${draft.leadId}`}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Back to Lead
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Edit Draft</h1>
          <Badge variant="outline">{draft.channel}</Badge>
          <Badge variant="secondary">{draft.variantKey}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lead</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{draft.lead.name}</p>
          {draft.lead.company && (
            <p className="text-muted-foreground text-sm">
              {draft.lead.company}
            </p>
          )}
        </CardContent>
      </Card>

      <DraftEditor
        draftId={draft.id}
        channel={draft.channel}
        initialSubject={draft.subject}
        initialContent={draft.content}
      />
    </div>
  );
}
