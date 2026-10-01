import { sql } from "drizzle-orm";
import { db } from "@/db";
import {
  activities,
  companies,
  contacts,
  deals,
  tasks,
} from "@/db/schema";

let seedPromise: Promise<void> | null = null;

const COMPANY_ROWS = [
  {
    name: "Northwind Analytics Nigeria",
    industry: "Data & Analytics",
    website: "northwind-analytics.ng",
    phone: "+234 802 411 0142",
    email: "hello@northwind-analytics.ng",
    address: "500 Marina Road, Lagos Island, Lagos",
    employees: "51-200",
    annualRevenue: "6300000000.00",
    owner: "Amara Okafor",
    notes: "Evaluating NexagrowthCRM to replace three disconnected tools.",
  },
  {
    name: "Sahel Logistics Group",
    industry: "Transport & Logistics",
    website: "sahellogistics.ng",
    phone: "+234 809 700 1188",
    email: "sales@sahellogistics.ng",
    address: "12 Ahmadu Bello Way, Wuse II, Abuja",
    employees: "201-1000",
    annualRevenue: "27750000000.00",
    owner: "Chinedu Menon",
    notes: "Needs automation for freight quote follow-ups.",
  },
  {
    name: "Lumen Dental Clinics",
    industry: "Healthcare",
    website: "lumendental.ng",
    phone: "+234 807 946 0821",
    email: "ops@lumendental.ng",
    address: "22 Adeola Odeku Street, Victoria Island, Lagos",
    employees: "11-50",
    annualRevenue: "1470000000.00",
    owner: "Sofia Adeyemi",
    notes: "Wants online booking + SMS reminders in one workspace.",
  },
  {
    name: "Vertex Manufacturing PLC",
    industry: "Industrial",
    website: "vertex-mfg.ng",
    phone: "+234 803 234 6611",
    email: "contact@vertex-mfg.ng",
    address: "Plot 8 Trans-Amadi Industrial Layout, Port Harcourt",
    employees: "1000+",
    annualRevenue: "69000000000.00",
    owner: "Amara Okafor",
    notes: "Long procurement cycle, requires quote approvals.",
  },
  {
    name: "Sunrise Retail Co.",
    industry: "Retail & E-commerce",
    website: "sunriseretail.ng",
    phone: "+234 812 555 7788",
    email: "team@sunriseretail.ng",
    address: "Ikeja City Mall, Alausa, Ikeja, Lagos",
    employees: "51-200",
    annualRevenue: "4650000000.00",
    owner: "Noah Balogun",
    notes: "Interested in the built-in storefront and WhatsApp channel.",
  },
  {
    name: "Fintech Hive Africa",
    industry: "Financial Services",
    website: "fintechhive.africa",
    phone: "+234 806 011 4455",
    email: "partners@fintechhive.africa",
    address: "1 Kingsway Road, Ikoyi, Lagos",
    employees: "201-1000",
    annualRevenue: "18600000000.00",
    owner: "Priya Raman",
    notes: "Compliance-heavy, needs audit trail and BI dashboards.",
  },
];

const CONTACT_ROWS = [
  {
    firstName: "Elena",
    lastName: "Vargas",
    email: "elena.vargas@northwind-analytics.ng",
    phone: "+234 802 411 0199",
    position: "VP Revenue Operations",
    companyIndex: 0,
    source: "Webinar",
    stage: "customer",
    owner: "Amara Okafor",
    tags: "champion,enterprise",
  },
  {
    firstName: "Tomiwa",
    lastName: "Balogun",
    email: "tomiwa@sahellogistics.ng",
    phone: "+234 809 700 1122",
    position: "Head of Sales",
    companyIndex: 1,
    source: "Outbound",
    stage: "opportunity",
    owner: "Chinedu Menon",
    tags: "warm",
  },
  {
    firstName: "Grace",
    lastName: "Okoro",
    email: "grace.okoro@lumendental.ng",
    phone: "+234 807 946 0833",
    position: "Clinic Director",
    companyIndex: 2,
    source: "Website",
    stage: "qualified",
    owner: "Sofia Adeyemi",
    tags: "inbound",
  },
  {
    firstName: "Marcus",
    lastName: "Adeleke",
    email: "m.adeleke@vertex-mfg.ng",
    phone: "+234 803 234 6699",
    position: "Procurement Lead",
    companyIndex: 3,
    source: "Trade Show",
    stage: "opportunity",
    owner: "Amara Okafor",
    tags: "enterprise,rfp",
  },
  {
    firstName: "Damilola",
    lastName: "Whitmore",
    email: "dami@sunriseretail.ng",
    phone: "+234 812 555 7700",
    position: "E-commerce Manager",
    companyIndex: 4,
    source: "Live Chat",
    stage: "lead",
    owner: "Noah Balogun",
    tags: "sm",
  },
  {
    firstName: "Kenechukwu",
    lastName: "Nakamura",
    email: "kene@fintechhive.africa",
    phone: "+234 806 011 4499",
    position: "COO",
    companyIndex: 5,
    source: "Referral",
    stage: "customer",
    owner: "Priya Raman",
    tags: "upsell",
  },
  {
    firstName: "Aisha",
    lastName: "Bello",
    email: "aisha.bello@brightpath.edu.ng",
    phone: "+234 813 555 3311",
    position: "Admissions Director",
    companyIndex: null,
    source: "Ads",
    stage: "qualified",
    owner: "Noah Balogun",
    tags: "education",
  },
  {
    firstName: "Lekan",
    lastName: "Ojo",
    email: "lekan@studiofornax.ng",
    phone: "+234 810 445 118",
    position: "Founder",
    companyIndex: null,
    source: "Partner",
    stage: "lead",
    owner: "Sofia Adeyemi",
    tags: "agency",
  },
];

const DEAL_ROWS = [
  {
    title: "Northwind — CRM + BI rollout",
    contactIndex: 0,
    companyIndex: 0,
    amount: "81000000.00",
    stage: "negotiation",
    probability: 75,
    owner: "Amara Okafor",
    source: "Webinar",
    days: 12,
    notes: "Legal review scheduled. Security questionnaire returned.",
  },
  {
    title: "Sahel Logistics — Fleet sales automation",
    contactIndex: 1,
    companyIndex: 1,
    amount: "132000000.00",
    stage: "proposal",
    probability: 55,
    owner: "Chinedu Menon",
    source: "Outbound",
    days: 21,
    notes: "Proposal sent, awaiting steering committee.",
  },
  {
    title: "Lumen Dental — 6 clinics starter",
    contactIndex: 2,
    companyIndex: 2,
    amount: "18900000.00",
    stage: "qualified",
    probability: 40,
    owner: "Sofia Adeyemi",
    source: "Website",
    days: 9,
    notes: "Wants to see online booking demo.",
  },
  {
    title: "Vertex Manufacturing — 480 seats",
    contactIndex: 3,
    companyIndex: 3,
    amount: "324000000.00",
    stage: "qualified",
    probability: 45,
    owner: "Amara Okafor",
    source: "Trade Show",
    days: 34,
    notes: "RFP due end of month, 3 competitors invited.",
  },
  {
    title: "Sunrise Retail — Storefront + WhatsApp",
    contactIndex: 4,
    companyIndex: 4,
    amount: "14400000.00",
    stage: "new",
    probability: 15,
    owner: "Noah Balogun",
    source: "Live Chat",
    days: 4,
    notes: "Trial started yesterday.",
  },
  {
    title: "Fintech Hive — Enterprise expansion",
    contactIndex: 5,
    companyIndex: 5,
    amount: "213000000.00",
    stage: "won",
    probability: 100,
    owner: "Priya Raman",
    source: "Referral",
    days: -6,
    notes: "Signed. Onboarding workshop booked.",
  },
  {
    title: "Brightpath School — Admissions CRM",
    contactIndex: 6,
    companyIndex: null,
    amount: "27600000.00",
    stage: "proposal",
    probability: 50,
    owner: "Noah Balogun",
    source: "Ads",
    days: 17,
    notes: "Comparing with two alternatives.",
  },
  {
    title: "Studio Fornax — Agency starter",
    contactIndex: 7,
    companyIndex: null,
    amount: "7200000.00",
    stage: "won",
    probability: 100,
    owner: "Sofia Adeyemi",
    source: "Partner",
    days: -14,
    notes: "Closed with annual prepay.",
  },
  {
    title: "Halcyon Foods — Legacy migration",
    contactIndex: 4,
    companyIndex: null,
    amount: "46500000.00",
    stage: "lost",
    probability: 0,
    owner: "Chinedu Menon",
    source: "Outbound",
    days: -3,
    notes: "Lost on price, revisit next fiscal year.",
  },
  {
    title: "Orbit Media — Marketing + CRM bundle",
    contactIndex: 6,
    companyIndex: null,
    amount: "33750000.00",
    stage: "new",
    probability: 20,
    owner: "Priya Raman",
    source: "Website",
    days: 2,
    notes: "Inbound form, called once.",
  },
];

const TASK_ROWS = [
  {
    title: "Send security questionnaire to Northwind legal",
    status: "in_progress",
    priority: "high",
    assignee: "Amara Okafor",
    dealIndex: 0,
    contactIndex: 0,
    dueOffset: 1,
    description: "Attach SOC2 summary and DPA draft.",
  },
  {
    title: "Follow up with Sahel steering committee",
    status: "todo",
    priority: "high",
    assignee: "Chinedu Menon",
    dealIndex: 1,
    contactIndex: 1,
    dueOffset: 2,
    description: "Confirm pilot scope for 3 regional hubs.",
  },
  {
    title: "Prepare online booking demo for Lumen",
    status: "todo",
    priority: "medium",
    assignee: "Sofia Adeyemi",
    dealIndex: 2,
    contactIndex: 2,
    dueOffset: 3,
    description: "Show SMS reminder automation recipe.",
  },
  {
    title: "Collect RFP appendices from Vertex",
    status: "in_progress",
    priority: "high",
    assignee: "Amara Okafor",
    dealIndex: 3,
    contactIndex: 3,
    dueOffset: 5,
    description: "Need signed NDA before sharing pricing grid.",
  },
  {
    title: "Onboarding kickoff with Fintech Hive",
    status: "todo",
    priority: "medium",
    assignee: "Priya Raman",
    dealIndex: 5,
    contactIndex: 5,
    dueOffset: 4,
    description: "Invite IT, RevOps and compliance owners.",
  },
  {
    title: "Log discovery call notes for Orbit Media",
    status: "todo",
    priority: "low",
    assignee: "Priya Raman",
    dealIndex: 9,
    contactIndex: 6,
    dueOffset: 1,
    description: "Budget confirmed, timeline Q3.",
  },
  {
    title: "Quarterly pipeline review deck",
    status: "todo",
    priority: "medium",
    assignee: "Amara Okafor",
    dealIndex: null,
    contactIndex: null,
    dueOffset: 7,
    description: "Include win/loss reasons and forecast accuracy.",
  },
  {
    title: "Clean duplicate contacts in import file",
    status: "completed",
    priority: "low",
    assignee: "Noah Balogun",
    dealIndex: null,
    contactIndex: 4,
    dueOffset: -2,
    description: "Merged 42 duplicates from the CSV import.",
  },
];

const ACTIVITY_ROWS = [
  {
    type: "call",
    subject: "Discovery call with Elena Vargas",
    body: "Walked through BI dashboards. Wants forecast accuracy above 90%.",
    dealIndex: 0,
    contactIndex: 0,
    owner: "Amara Okafor",
    outcome: "positive",
    hoursAgo: 3,
  },
  {
    type: "email",
    subject: "Proposal v2 sent to Sahel Logistics",
    body: "Included phased rollout and migration support package.",
    dealIndex: 1,
    contactIndex: 1,
    owner: "Chinedu Menon",
    outcome: "neutral",
    hoursAgo: 9,
  },
  {
    type: "meeting",
    subject: "Security review with Vertex IT",
    body: "Asked about SSO, role based access and data residency.",
    dealIndex: 3,
    contactIndex: 3,
    owner: "Amara Okafor",
    outcome: "positive",
    hoursAgo: 26,
  },
  {
    type: "note",
    subject: "Lumen wants WhatsApp reminders",
    body: "Add WhatsApp integration to the pilot scope.",
    dealIndex: 2,
    contactIndex: 2,
    owner: "Sofia Adeyemi",
    outcome: "neutral",
    hoursAgo: 30,
  },
  {
    type: "call",
    subject: "Closing call with Fintech Hive",
    body: "Signature received, 3-year term with annual billing.",
    dealIndex: 5,
    contactIndex: 5,
    owner: "Priya Raman",
    outcome: "won",
    hoursAgo: 48,
  },
  {
    type: "email",
    subject: "Trial reminder to Sunrise Retail",
    body: "Sent 4-step quick start guide.",
    dealIndex: 4,
    contactIndex: 4,
    owner: "Noah Balogun",
    outcome: "neutral",
    hoursAgo: 52,
  },
  {
    type: "call",
    subject: "Loss review: Halcyon Foods",
    body: "Price objection, budget frozen until next fiscal year.",
    dealIndex: 8,
    contactIndex: null,
    owner: "Chinedu Menon",
    outcome: "negative",
    hoursAgo: 70,
  },
  {
    type: "meeting",
    subject: "Agency starter onboarding — Studio Fornax",
    body: "Trained the team on tasks and invoicing.",
    dealIndex: 7,
    contactIndex: 7,
    owner: "Sofia Adeyemi",
    outcome: "won",
    hoursAgo: 96,
  },
];

async function tableCount(table: "deals") {
  const result = await db.execute<{ count: string }>(
    sql`select count(*)::text as count from ${sql.raw(table)}`,
  );
  return Number(result.rows[0]?.count ?? "0");
}

async function runSeed() {
  // New workspaces start empty. Demo financial records are not loaded.
  return;
  if ((await tableCount("deals")) > 0) return;

  const insertedCompanies = await db
    .insert(companies)
    .values(COMPANY_ROWS)
    .returning();

  const insertedContacts = await db
    .insert(contacts)
    .values(
      CONTACT_ROWS.map((row) => ({
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        phone: row.phone,
        position: row.position,
        companyId: row.companyIndex === null ? null : insertedCompanies[row.companyIndex].id,
        source: row.source,
        stage: row.stage,
        owner: row.owner,
        tags: row.tags,
      })),
    )
    .returning();

  const insertedDeals = await db
    .insert(deals)
    .values(
      DEAL_ROWS.map((row, index) => ({
        title: row.title,
        contactId: insertedContacts[row.contactIndex].id,
        companyId: row.companyIndex === null ? null : insertedCompanies[row.companyIndex].id,
        amount: row.amount,
        currency: "NGN",
        stage: row.stage,
        probability: row.probability,
        owner: row.owner,
        source: row.source,
        expectedCloseDate: new Date(
          Date.now() + row.days * 24 * 60 * 60 * 1000,
        )
          .toISOString()
          .slice(0, 10),
        notes: row.notes,
        position: index,
      })),
    )
    .returning();

  await db.insert(tasks).values(
    TASK_ROWS.map((row) => ({
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      assignee: row.assignee,
      dealId: row.dealIndex === null ? null : insertedDeals[row.dealIndex].id,
      contactId:
        row.contactIndex === null ? null : insertedContacts[row.contactIndex].id,
      dueDate: new Date(Date.now() + row.dueOffset * 86400000)
        .toISOString()
        .slice(0, 10),
    })),
  );

  await db.insert(activities).values(
    ACTIVITY_ROWS.map((row) => ({
      type: row.type,
      subject: row.subject,
      body: row.body,
      dealId: row.dealIndex === null ? null : insertedDeals[row.dealIndex].id,
      contactId:
        row.contactIndex === null ? null : insertedContacts[row.contactIndex].id,
      owner: row.owner,
      outcome: row.outcome,
      occurredAt: new Date(Date.now() - row.hoursAgo * 3600000),
    })),
  );
}

export function ensureSeed() {
  if (!seedPromise) {
    seedPromise = runSeed().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}
