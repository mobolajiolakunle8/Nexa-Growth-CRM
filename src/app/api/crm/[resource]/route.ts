import {
  createResource,
  isCrmResource,
  listResource,
} from "@/lib/api-resources";
import { readRequestSession } from "@/lib/auth/session";
import { emitEvent, resourceEvent } from "@/lib/integrations";

export const dynamic = "force-dynamic";

async function sessionOr401(request: Request) {
  const session = await readRequestSession(request);
  if (!session) {
    return { session: null, response: Response.json({ error: "Sign in required." }, { status: 401 }) };
  }
  return { session, response: null };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params;
  if (!isCrmResource(resource)) {
    return Response.json({ error: "Unknown resource" }, { status: 404 });
  }
  const { session, response } = await sessionOr401(request);
  if (!session) return response;
  const rows = await listResource(resource, session.workspaceId);
  return Response.json({ data: rows });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params;
  if (!isCrmResource(resource)) {
    return Response.json({ error: "Unknown resource" }, { status: 404 });
  }
  const { session, response } = await sessionOr401(request);
  if (!session) return response;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    body.workspaceId = session.workspaceId;
    const created = await createResource(resource, body);
    await emitEvent(resourceEvent(resource, "created"), created);
    return Response.json({ data: created }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create" },
      { status: 400 },
    );
  }
}
