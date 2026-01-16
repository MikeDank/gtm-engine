export interface SendEmailInput {
  to: string;
  from: string;
  subject: string;
  html?: string;
  text?: string;
}

export interface SendEmailResult {
  id: string;
  status: "sent" | "error";
  error?: string;
}

export async function sendEmail(
  input: SendEmailInput
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return {
      id: "",
      status: "error",
      error: "RESEND_API_KEY is not configured. Add it to your .env file.",
    };
  }

  if (!input.to) {
    return {
      id: "",
      status: "error",
      error: "Recipient email address is required.",
    };
  }

  if (!input.from) {
    return {
      id: "",
      status: "error",
      error: "Sender email address is required.",
    };
  }

  if (!input.subject) {
    return {
      id: "",
      status: "error",
      error: "Email subject is required.",
    };
  }

  if (!input.html && !input.text) {
    return {
      id: "",
      status: "error",
      error: "Email content (html or text) is required.",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: input.from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        id: "",
        status: "error",
        error: data.message || `Resend API error: ${response.status}`,
      };
    }

    return {
      id: data.id,
      status: "sent",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      id: "",
      status: "error",
      error: `Failed to send email: ${message}`,
    };
  }
}
