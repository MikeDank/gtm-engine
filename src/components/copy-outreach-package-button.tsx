"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface OutreachPackage {
  lead: {
    id: string;
    name: string;
    role: string | null;
    company: string | null;
  };
  icp: {
    score: number;
    reasons: string[];
  };
  signal: {
    id: string;
    angle: string | null;
    excerpt: string;
    sourceUrl: string;
    capturedAt: string;
  } | null;
  drafts: Array<{
    id: string;
    channel: string;
    subject: string | null;
    content: string;
    angle: string | null;
    variantKey: string;
    hypothesis: string | null;
    createdAt: string;
  }>;
}

interface CopyOutreachPackageButtonProps {
  data: OutreachPackage;
}

export function CopyOutreachPackageButton({
  data,
}: CopyOutreachPackageButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const json = JSON.stringify(data, null, 2);
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? "Copied!" : "Copy Outreach Package"}
    </Button>
  );
}
