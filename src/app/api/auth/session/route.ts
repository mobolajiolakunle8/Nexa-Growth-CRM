import { readRequestSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await readRequestSession(request);
  if (!session) {
    return Response.json({ data: null }, { status: 401 });
  }
  return Response.json({ data: session });
}
