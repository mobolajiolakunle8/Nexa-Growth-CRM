import {
  deleteResource,
  isCrmResource,
  updateResource,
} from "@/lib/api-resources";
import { readRequestSession } from "@/lib/auth/session";
import { emitEvent, resourceEvent } from "@/lib/integrations";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ resource: string; id: string }> },
) {
  const session = await readRequestSession(request);
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const { resource, id } = await params;
  const recordId = Number(id);
  if (!isCrmResource(resource) || !Number.isFinite(recordId)) {
    return Response.json({ error: "Unknown record" }, { status: 404 });
  }
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const updated = await updateResource(
      resource,
      recordId,
      body,
      session.workspaceId,
    );
    if (!updated) {
      return Response.json({ error: "Record not found" }, { status: 404 });
    }
    if (resource === "deals" && body.stage !== undefined) {
      await emitEvent("deal.stage_changed", updated);
    } else {
      await emitEvent(resourceEvent(resource, "updated"), updated);
    }
    return Response.json({ data: updated });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to update" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ resource: string; id: string }> },
) {
  const session = await readRequestSession(request);
  if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
  const { resource, id } = await params;
  const recordId = Number(id);
  if (!isCrmResource(resource) || !Number.isFinite(recordId)) {
    return Response.json({ error: "Unknown record" }, { status: 404 });
  }
  await deleteResource(resource, recordId, session.workspaceId);
  return Response.json({ ok: true });
}
