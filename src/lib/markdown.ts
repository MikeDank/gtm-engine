export interface ParsedMarkdown {
  frontmatter: Record<string, unknown> | null;
  content: string;
}

export function parseMarkdownWithFrontmatter(markdown: string): ParsedMarkdown {
  const trimmed = markdown.trim();

  if (!trimmed.startsWith("---")) {
    return { frontmatter: null, content: trimmed };
  }

  const endIndex = trimmed.indexOf("---", 3);
  if (endIndex === -1) {
    return { frontmatter: null, content: trimmed };
  }

  const yamlBlock = trimmed.slice(3, endIndex).trim();
  const content = trimmed.slice(endIndex + 3).trim();

  try {
    const frontmatter = parseSimpleYaml(yamlBlock);
    return { frontmatter, content };
  } catch {
    return { frontmatter: null, content: trimmed };
  }
}

function parseSimpleYaml(yaml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = yaml.split("\n");

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) continue;

    const colonIndex = trimmedLine.indexOf(":");
    if (colonIndex === -1) continue;

    const key = trimmedLine.slice(0, colonIndex).trim();
    let value: unknown = trimmedLine.slice(colonIndex + 1).trim();

    if (value === "true") value = true;
    else if (value === "false") value = false;
    else if (/^-?\d+$/.test(value as string))
      value = parseInt(value as string, 10);
    else if (/^-?\d+\.\d+$/.test(value as string))
      value = parseFloat(value as string);
    else if (
      ((value as string).startsWith('"') && (value as string).endsWith('"')) ||
      ((value as string).startsWith("'") && (value as string).endsWith("'"))
    ) {
      value = (value as string).slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

export function extractIcpConfig(
  markdown: string
): { keywords?: string[]; urgencyTerms?: string[] } | null {
  const { frontmatter } = parseMarkdownWithFrontmatter(markdown);
  if (!frontmatter) return null;

  const config: { keywords?: string[]; urgencyTerms?: string[] } = {};

  if (typeof frontmatter.keywords === "string") {
    config.keywords = frontmatter.keywords
      .split(",")
      .map((k) => k.trim().toLowerCase());
  }

  if (typeof frontmatter.urgencyTerms === "string") {
    config.urgencyTerms = frontmatter.urgencyTerms
      .split(",")
      .map((k) => k.trim().toLowerCase());
  }

  return Object.keys(config).length > 0 ? config : null;
}
