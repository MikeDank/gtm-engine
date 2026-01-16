import { listContextDocs } from "./actions";
import { ContextDocSection } from "./context-doc-section";
import type { ContextDocType } from "./actions";

const docTypes: { type: ContextDocType; title: string; description: string }[] =
  [
    {
      type: "signals",
      title: "Signals Config",
      description: "Define signal sources and parsing rules",
    },
    {
      type: "icp",
      title: "ICP (Ideal Customer Profile)",
      description: "Define scoring criteria for leads",
    },
    {
      type: "tone",
      title: "Tone Guidelines",
      description: "Guide LLM draft generation style",
    },
  ];

export default async function ContextPage() {
  const [signalsDocs, icpDocs, toneDocs] = await Promise.all([
    listContextDocs("signals"),
    listContextDocs("icp"),
    listContextDocs("tone"),
  ]);

  const docsByType = {
    signals: signalsDocs,
    icp: icpDocs,
    tone: toneDocs,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Context Files</h1>
        <p className="text-muted-foreground">
          Upload markdown files to configure signals, ICP scoring, and tone for
          drafts.
        </p>
      </div>

      {docTypes.map((docType) => (
        <ContextDocSection
          key={docType.type}
          type={docType.type}
          title={docType.title}
          description={docType.description}
          docs={docsByType[docType.type]}
        />
      ))}
    </div>
  );
}
