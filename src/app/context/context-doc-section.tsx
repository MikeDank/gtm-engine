"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  createContextDoc,
  setActiveContextDoc,
  type ContextDoc,
  type ContextDocType,
} from "./actions";

interface ContextDocSectionProps {
  type: ContextDocType;
  title: string;
  description: string;
  docs: ContextDoc[];
}

export function ContextDocSection({
  type,
  title,
  description,
  docs,
}: ContextDocSectionProps) {
  const [content, setContent] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const activeDoc = docs.find((d) => d.isActive);
  const historyDocs = docs.filter((d) => !d.isActive);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await createContextDoc({
        type,
        title: docTitle.trim() || undefined,
        content: content.trim(),
      });
      setContent("");
      setDocTitle("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetActive = async (id: string) => {
    await setActiveContextDoc(id);
  };

  const getPreviewLines = (text: string, maxLines = 30) => {
    const lines = text.split("\n").slice(0, maxLines);
    return (
      lines.join("\n") + (text.split("\n").length > maxLines ? "\n..." : "")
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeDoc && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-600">
                Active
              </Badge>
              {activeDoc.title && (
                <span className="text-sm font-medium">{activeDoc.title}</span>
              )}
              <span className="text-muted-foreground text-xs">
                {activeDoc.createdAt.toLocaleDateString()}
              </span>
            </div>
            <pre className="bg-muted max-h-64 overflow-auto rounded-md p-3 text-xs">
              {getPreviewLines(activeDoc.content)}
            </pre>
          </div>
        )}

        {!activeDoc && (
          <p className="text-muted-foreground text-sm italic">
            No active {type} document. Upload one below.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor={`${type}-title`}>Title (optional)</Label>
            <Input
              id={`${type}-title`}
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder={`e.g., ${type} v2`}
            />
          </div>
          <div>
            <Label htmlFor={`${type}-content`}>Markdown Content</Label>
            <Textarea
              id={`${type}-content`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Paste your ${type}.md content here...`}
              rows={8}
              className="font-mono text-sm"
            />
          </div>
          <Button type="submit" disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? "Uploading..." : "Upload & Set Active"}
          </Button>
        </form>

        {historyDocs.length > 0 && (
          <div className="border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "Hide" : "Show"} History ({historyDocs.length})
            </Button>
            {showHistory && (
              <div className="mt-3 space-y-2">
                {historyDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-muted/50 flex items-center justify-between rounded-md p-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{doc.title || "Untitled"}</span>
                      <span className="text-muted-foreground text-xs">
                        {doc.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetActive(doc.id)}
                    >
                      Set Active
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
