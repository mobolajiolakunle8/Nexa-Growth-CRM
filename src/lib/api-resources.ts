import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  activities,
  companies,
  contacts,
  deals,
  tasks,
} from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { PIPELINE_STAGES, stageMeta } from "@/lib/crm";

export const CRM_RESOURCES = [
  "deals",
  "contacts",
  "companies",
  "tasks",
  "activities",
] as const;

export type CrmResource = (typeof CRM_RESOURCES)[number];

export function isCrmResource(value: string): value is CrmResource {
  return (CRM_RESOURCES as readonly string[]).includes(value);
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;
}

function asOptionalString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function asNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asOptionalId(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function asDate(value: unknown) {
  const raw = asOptionalString(value);
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

export async function listResource(resource: CrmResource) {
  await ensureSeed();
  switch (resource) {
    case "deals":
      return db.select().from(deals).orderBy(deals.position, deals.id);
    case "contacts":
      return db.select().from(contacts).orderBy(contacts.id);
    case "companies":
      return db.select().from(companies).orderBy(companies.id);
    case "tasks":
      return db.select().from(tasks).orderBy(tasks.id);
    case "activities":
      return db.select().from(activities).orderBy(activities.id);
  }
}

export async function createResource(resource: CrmResource, body: Record<string, unknown>) {
  switch (resource) {
    case "deals": {
      const stage = asString(body.stage, "new");
      const [created] = await db
        .insert(deals)
        .values({
          title: asString(body.title, "Untitled deal"),
          amount: String(asNumber(body.amount)),
          currency: asString(body.currency, "NGN"),
          stage,
          probability:
            body.probability === undefined
              ? stageMeta(stage).probability
              : asNumber(body.probability, 20),
          contactId: asOptionalId(body.contactId),
          companyId: asOptionalId(body.companyId),
          owner: asString(body.owner, "Unassigned"),
          source: asString(body.source, "Website"),
          expectedCloseDate: asDate(body.expectedCloseDate),
          notes: asOptionalString(body.notes),
          position: asNumber(body.position),
        })
        .returning();
      return created;
    }
    case "contacts": {
      const [created] = await db
        .insert(contacts)
        .values({
          firstName: asString(body.firstName, "New"),
          lastName: asString(body.lastName, "Contact"),
          email: asOptionalString(body.email),
          phone: asOptionalString(body.phone),
          position: asOptionalString(body.position),
          companyId: asOptionalId(body.companyId),
          source: asString(body.source, "Website"),
          stage: asString(body.stage, "lead"),
          owner: asString(body.owner, "Unassigned"),
          tags: asString(body.tags, ""),
        })
        .returning();
      return created;
    }
    case "companies": {
      const [created] = await db
        .insert(companies)
        .values({
          name: asString(body.name, "New company"),
          industry: asString(body.industry, "Other"),
          website: asOptionalString(body.website),
          phone: asOptionalString(body.phone),
          email: asOptionalString(body.email),
          address: asOptionalString(body.address),
          employees: asString(body.employees, "11-50"),
          annualRevenue: String(asNumber(body.annualRevenue)),
          owner: asString(body.owner, "Unassigned"),
          notes: asOptionalString(body.notes),
        })
        .returning();
      return created;
    }
    case "tasks": {
      const [created] = await db
        .insert(tasks)
        .values({
          title: asString(body.title, "New task"),
          description: asOptionalString(body.description),
          status: asString(body.status, "todo"),
          priority: asString(body.priority, "medium"),
          assignee: asString(body.assignee, "Unassigned"),
          dealId: asOptionalId(body.dealId),
          contactId: asOptionalId(body.contactId),
          dueDate: asDate(body.dueDate),
        })
        .returning();
      return created;
    }
    case "activities": {
      const [created] = await db
        .insert(activities)
        .values({
          type: asString(body.type, "note"),
          subject: asString(body.subject, "Timeline update"),
          body: asOptionalString(body.body),
          dealId: asOptionalId(body.dealId),
          contactId: asOptionalId(body.contactId),
          owner: asString(body.owner, "You"),
          outcome: asString(body.outcome, "neutral"),
        })
        .returning();
      return created;
    }
  }
}

export async function updateResource(
  resource: CrmResource,
  id: number,
  body: Record<string, unknown>,
) {
  switch (resource) {
    case "deals": {
      const patch: Record<string, unknown> = { updatedAt: new Date() };
      if (body.title !== undefined) patch.title = asString(body.title, "Untitled deal");
      if (body.amount !== undefined) patch.amount = String(asNumber(body.amount));
      if (body.stage !== undefined) {
        const stage = asString(body.stage, "new");
        patch.stage = stage;
        if (!PIPELINE_STAGES.some((item) => item.key === stage)) {
          patch.stage = "new";
        }
        if (body.probability === undefined) {
          patch.probability = stageMeta(String(patch.stage)).probability;
        }
      }
      if (body.probability !== undefined) patch.probability = asNumber(body.probability, 20);
      if (body.contactId !== undefined) patch.contactId = asOptionalId(body.contactId);
      if (body.companyId !== undefined) patch.companyId = asOptionalId(body.companyId);
      if (body.owner !== undefined) patch.owner = asString(body.owner, "Unassigned");
      if (body.source !== undefined) patch.source = asString(body.source, "Website");
      if (body.expectedCloseDate !== undefined) {
        patch.expectedCloseDate = asDate(body.expectedCloseDate);
      }
      if (body.notes !== undefined) patch.notes = asOptionalString(body.notes);
      if (body.position !== undefined) patch.position = asNumber(body.position);
      const [updated] = await db
        .update(deals)
        .set(patch)
        .where(eq(deals.id, id))
        .returning();
      return updated;
    }
    case "contacts": {
      const patch: Record<string, unknown> = { lastTouchedAt: new Date() };
      if (body.firstName !== undefined) patch.firstName = asString(body.firstName, "New");
      if (body.lastName !== undefined) patch.lastName = asString(body.lastName, "");
      if (body.email !== undefined) patch.email = asOptionalString(body.email);
      if (body.phone !== undefined) patch.phone = asOptionalString(body.phone);
      if (body.position !== undefined) patch.position = asOptionalString(body.position);
      if (body.companyId !== undefined) patch.companyId = asOptionalId(body.companyId);
      if (body.source !== undefined) patch.source = asString(body.source, "Website");
      if (body.stage !== undefined) patch.stage = asString(body.stage, "lead");
      if (body.owner !== undefined) patch.owner = asString(body.owner, "Unassigned");
      if (body.tags !== undefined) patch.tags = asString(body.tags, "");
      const [updated] = await db
        .update(contacts)
        .set(patch)
        .where(eq(contacts.id, id))
        .returning();
      return updated;
    }
    case "companies": {
      const patch: Record<string, unknown> = {};
      if (body.name !== undefined) patch.name = asString(body.name, "New company");
      if (body.industry !== undefined) patch.industry = asString(body.industry, "Other");
      if (body.website !== undefined) patch.website = asOptionalString(body.website);
      if (body.phone !== undefined) patch.phone = asOptionalString(body.phone);
      if (body.email !== undefined) patch.email = asOptionalString(body.email);
      if (body.address !== undefined) patch.address = asOptionalString(body.address);
      if (body.employees !== undefined) patch.employees = asString(body.employees, "11-50");
      if (body.annualRevenue !== undefined) {
        patch.annualRevenue = String(asNumber(body.annualRevenue));
      }
      if (body.owner !== undefined) patch.owner = asString(body.owner, "Unassigned");
      if (body.notes !== undefined) patch.notes = asOptionalString(body.notes);
      const [updated] = await db
        .update(companies)
        .set(patch)
        .where(eq(companies.id, id))
        .returning();
      return updated;
    }
    case "tasks": {
      const patch: Record<string, unknown> = {};
      if (body.title !== undefined) patch.title = asString(body.title, "New task");
      if (body.description !== undefined) {
        patch.description = asOptionalString(body.description);
      }
      if (body.status !== undefined) patch.status = asString(body.status, "todo");
      if (body.priority !== undefined) patch.priority = asString(body.priority, "medium");
      if (body.assignee !== undefined) patch.assignee = asString(body.assignee, "Unassigned");
      if (body.dueDate !== undefined) patch.dueDate = asDate(body.dueDate);
      const [updated] = await db
        .update(tasks)
        .set(patch)
        .where(eq(tasks.id, id))
        .returning();
      return updated;
    }
    case "activities": {
      const patch: Record<string, unknown> = {};
      if (body.type !== undefined) patch.type = asString(body.type, "note");
      if (body.subject !== undefined) {
        patch.subject = asString(body.subject, "Timeline update");
      }
      if (body.body !== undefined) patch.body = asOptionalString(body.body);
      if (body.outcome !== undefined) patch.outcome = asString(body.outcome, "neutral");
      const [updated] = await db
        .update(activities)
        .set(patch)
        .where(eq(activities.id, id))
        .returning();
      return updated;
    }
  }
}

export async function deleteResource(resource: CrmResource, id: number) {
  switch (resource) {
    case "deals":
      await db.delete(deals).where(eq(deals.id, id));
      return;
    case "contacts":
      await db.delete(contacts).where(eq(contacts.id, id));
      return;
    case "companies":
      await db.delete(companies).where(eq(companies.id, id));
      return;
    case "tasks":
      await db.delete(tasks).where(eq(tasks.id, id));
      return;
    case "activities":
      await db.delete(activities).where(eq(activities.id, id));
      return;
  }
}
