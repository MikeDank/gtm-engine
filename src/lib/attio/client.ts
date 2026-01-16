const ATTIO_API_BASE = "https://api.attio.com/v2";

export interface AttioResult<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface AttioCompany {
  id: string;
}

export interface AttioPerson {
  id: string;
}

export interface AttioNote {
  id: string;
}

function getApiKey(): string {
  const apiKey = process.env.ATTIO_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ATTIO_API_KEY is not configured. Please add it to your .env file."
    );
  }
  return apiKey;
}

async function attioRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = getApiKey();

  const response = await fetch(`${ATTIO_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Attio API error: ${response.status} ${errorText}`);
  }

  return response.json();
}

export async function upsertCompany(params: {
  name: string;
}): Promise<AttioResult<AttioCompany>> {
  try {
    const response = await attioRequest<{
      data: { id: { record_id: string } };
    }>("/objects/companies/records?matching_attribute=name", {
      method: "PUT",
      body: JSON.stringify({
        data: {
          values: {
            name: [{ value: params.name }],
          },
        },
      }),
    });

    return {
      success: true,
      data: { id: response.data.id.record_id },
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function upsertPerson(params: {
  name: string;
  email?: string | null;
  linkedinUrl?: string | null;
  companyName?: string | null;
  title?: string | null;
}): Promise<AttioResult<AttioPerson>> {
  try {
    const values: Record<string, { value: string }[]> = {
      name: [{ value: params.name }],
    };

    if (params.email) {
      values.email_addresses = [{ value: params.email }];
    }

    if (params.linkedinUrl) {
      values.linkedin = [{ value: params.linkedinUrl }];
    }

    if (params.title) {
      values.job_title = [{ value: params.title }];
    }

    const matchingAttribute = params.email
      ? "email_addresses"
      : params.linkedinUrl
        ? "linkedin"
        : "name";

    const response = await attioRequest<{
      data: { id: { record_id: string } };
    }>(`/objects/people/records?matching_attribute=${matchingAttribute}`, {
      method: "PUT",
      body: JSON.stringify({
        data: {
          values,
        },
      }),
    });

    return {
      success: true,
      data: { id: response.data.id.record_id },
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function addNoteToPerson(
  personId: string,
  noteMarkdown: string
): Promise<AttioResult<AttioNote>> {
  try {
    const response = await attioRequest<{ data: { id: { note_id: string } } }>(
      "/notes",
      {
        method: "POST",
        body: JSON.stringify({
          data: {
            parent_object: "people",
            parent_record_id: personId,
            title: `GTM Engine Sync - ${new Date().toISOString().split("T")[0]}`,
            content_markdown: noteMarkdown,
          },
        }),
      }
    );

    return {
      success: true,
      data: { id: response.data.id.note_id },
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
