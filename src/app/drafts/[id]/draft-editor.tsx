"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateDraft } from "../actions";

interface DraftEditorProps {
  draftId: string;
  channel: string;
  initialSubject: string | null;
  initialContent: string;
}

export function DraftEditor({
  draftId,
  channel,
  initialSubject,
  initialContent,
}: DraftEditorProps) {
  const [subject, setSubject] = useState(initialSubject || "");
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await updateDraft(draftId, {
        subject: channel === "email" ? subject : null,
        content,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save draft:", error);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCopy() {
    const textToCopy =
      channel === "email" && subject
        ? `Subject: ${subject}\n\n${content}`
        : content;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Message Content</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {channel === "email" && (
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[200px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Message content..."
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : saved ? "Saved!" : "Save"}
          </Button>
          <Button variant="outline" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy to Clipboard"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
