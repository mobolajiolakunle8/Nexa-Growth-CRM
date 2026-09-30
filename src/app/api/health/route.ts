import { checkDatabase } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { latencyMs } = await checkDatabase();
    return Response.json({
      ok: true,
      database: "connected",
      latencyMs,
      region: process.env.VERCEL_REGION ?? "local",
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        database: "unreachable",
        error: error instanceof Error ? error.message : "unknown error",
      },
      { status: 500 },
    );
  }
}
