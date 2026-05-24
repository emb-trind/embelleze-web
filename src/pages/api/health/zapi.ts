import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const healthToken = process.env.HEALTH_TOKEN || import.meta.env.HEALTH_TOKEN;

  if (!healthToken || request.headers.get("X-Health-Token") !== healthToken) {
    return new Response(JSON.stringify({ status: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const instanceId = process.env.ZAPI_INSTANCE_ID || import.meta.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN || import.meta.env.ZAPI_TOKEN;
  const dbUrl = process.env.DATABASE_URL || import.meta.env.DATABASE_URL;

  const envOk = !!(instanceId && token && dbUrl);

  return new Response(
    JSON.stringify({
      status: envOk ? "ok" : "degraded",
    }),
    {
      status: envOk ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    }
  );
};
