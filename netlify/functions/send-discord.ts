export default async (req: Request, context: any) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Try multiple ways to access the environment variable
  const webhookUrl =
    process.env.DISCORD_WEBHOOK_URL ||
    (globalThis as any).Netlify?.env?.get("DISCORD_WEBHOOK_URL") ||
    context?.env?.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Webhook URL not configured",
        debug: {
          hasProcess: !!process.env,
          keys: Object.keys(process.env || {}).filter((k) =>
            k.includes("DISCORD")
          ),
        },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    const body = await req.json();

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      const errorText = await response.text();
      console.error("Discord API error:", response.status, errorText);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to send to Discord",
          status: response.status,
          details: errorText,
        }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
