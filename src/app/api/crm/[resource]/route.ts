import {
  createResource,
  isCrmResource,
  listResource,
} from "@/lib/api-resources";
import { emitEvent, resourceEvent } from "@/lib/integrations";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params;
  if (!isCrmResource(resource)) {
    return Response.json({ error: "Unknown resource" }, { status: 404 });
  }
  const rows = await listResource(resource);
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
  try {
    const body = (await request.json()) as Record<string, unknown>;
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
