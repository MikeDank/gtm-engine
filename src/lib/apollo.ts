export interface ApolloPersonResult {
  email: string | null;
  linkedinUrl: string | null;
}

export interface ApolloEnrichmentResult {
  success: boolean;
  data: ApolloPersonResult | null;
  error: string | null;
}

function parseNameParts(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export async function enrichWithApollo(
  company: string | null,
  name: string | null,
  role: string | null
): Promise<ApolloEnrichmentResult> {
  const apiKey = process.env.APOLLO_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      data: null,
      error:
        "APOLLO_API_KEY is not configured. Please add it to your .env file or enter contact info manually.",
    };
  }

  if (!company) {
    return {
      success: false,
      data: null,
      error: "Company name is required for Apollo enrichment.",
    };
  }

  try {
    const body: Record<string, string> = {
      organization_name: company,
    };

    if (name) {
      const { firstName, lastName } = parseNameParts(name);
      body.first_name = firstName;
      if (lastName) {
        body.last_name = lastName;
      }
    } else if (role) {
      body.title = role;
    }

    const response = await fetch("https://api.apollo.io/v1/people/match", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        data: null,
        error: `Apollo API error: ${response.status} ${errorText}`,
      };
    }

    const result = await response.json();
    const person = result.person;

    if (!person) {
      return {
        success: false,
        data: null,
        error:
          "No matching person found in Apollo. Try entering contact info manually.",
      };
    }

    return {
      success: true,
      data: {
        email: person.email || null,
        linkedinUrl: person.linkedin_url || null,
      },
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: `Apollo enrichment failed: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
}
