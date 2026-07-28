import { PrismaClient, LeadStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isApply = args.includes('--apply');

if (!isDryRun && !isApply) {
  console.log('Usage: npx tsx migrate-legacy-leads.ts [--dry-run | --apply]');
  process.exit(1);
}

async function runMigration() {
  console.log(`Starting Lead Migration (${isDryRun ? 'DRY RUN' : 'APPLY'})`);
  const exportPath = path.resolve(__dirname, '../../../legacy-leads-export.json');
  if (!fs.existsSync(exportPath)) {
    console.error(`Export file not found at ${exportPath}. Please run window.exportLegacyLeads() in the browser console first.`);
    process.exit(1);
  }

  const exportData = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
  const leads = exportData.leads || [];
  console.log(`Loaded ${leads.length} leads from export file.`);

  let createdCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const legacy of leads) {
    try {
      const company = legacy.companyName || legacy.projectName || 'Unknown Company';
      const contactPerson = legacy.contactPerson || legacy.siteInchargeName || 'Unknown Contact';
      const email = legacy.email?.toLowerCase().trim();
      let phone = legacy.phone || legacy.siteInchargeMobile;
      if (phone) phone = phone.replace(/[^0-9]/g, '');

      // Duplicate check logic matching LeadsService
      const duplicateWhere: any = {
        companyName: { equals: company, mode: 'insensitive' },
        leadStatus: { notIn: [LeadStatus.LOST, LeadStatus.CANCELLED, LeadStatus.CONVERTED] },
        OR: [],
      };
      if (email) duplicateWhere.OR.push({ email });
      if (phone) duplicateWhere.OR.push({ phone });

      if (duplicateWhere.OR.length === 0) {
        delete duplicateWhere.OR;
      }

      const existing = await prisma.lead.findFirst({ where: duplicateWhere });
      if (existing) {
        console.log(`[SKIP] Duplicate active Lead found for ${company}`);
        skippedCount++;
        continue;
      }

      const mapStatus = (statusStr: string): LeadStatus => {
        if (!statusStr) return LeadStatus.NEW;
        const upper = statusStr.toUpperCase();
        if (upper.includes('NEW')) return LeadStatus.NEW;
        if (upper.includes('QUALIFIED')) return LeadStatus.QUALIFIED;
        if (upper.includes('SAMPLE')) return LeadStatus.SAMPLE_IN_PROGRESS;
        if (upper.includes('QUOTATION')) return LeadStatus.QUOTATION_DRAFT;
        if (upper.includes('LOST')) return LeadStatus.LOST;
        if (upper.includes('CANCEL')) return LeadStatus.CANCELLED;
        if (upper.includes('CONVERTED') || upper.includes('WON')) return LeadStatus.CONVERTED;
        return LeadStatus.NEW;
      };

      if (!isDryRun) {
        await prisma.$transaction(async (tx) => {
          let leadNumberStr = legacy.leadNumber;
          if (!leadNumberStr) {
            const seq = await tx.idSequence.upsert({
              where: { key: 'lead_number' },
              update: { nextValue: { increment: 1 } },
              create: { key: 'lead_number', nextValue: 2 },
            });
            leadNumberStr = `LEAD-${String(seq.nextValue - 1).padStart(5, '0')}`;
          }

          const lead = await tx.lead.create({
            data: {
              leadNumber: leadNumberStr,
              companyName: company,
              contactPerson: contactPerson,
              email: email || null,
              phone: phone || null,
              remarks: legacy.notes || legacy.remarks,
              leadStatus: mapStatus(legacy.status),
              createdById: 'SYSTEM_MIGRATION',
              createdAt: legacy.createdAt ? new Date(legacy.createdAt) : new Date(),
            }
          });

          await tx.legacyMigrationReference.create({
            data: {
              entityType: 'Lead',
              legacyId: String(legacy.id || legacy.leadId || lead.id),
              newId: lead.id,
              migratedAt: new Date(),
            }
          });

          await tx.auditLog.create({
            data: {
              action: 'LEAD_MIGRATED',
              entityType: 'Lead',
              entityId: lead.id,
              actorUserId: 'SYSTEM_MIGRATION',
              remarks: 'Migrated from legacy Zustand/localStorage state',
              after: JSON.parse(JSON.stringify(lead))
            }
          });
        });
      }
      createdCount++;
    } catch (err: any) {
      console.error(`[ERROR] Failed to migrate lead ${legacy.companyName}:`, err.message);
      errorCount++;
    }
  }

  console.log(`\nMigration Summary:`);
  console.log(`Total Processed: ${leads.length}`);
  console.log(`Created: ${createdCount}`);
  console.log(`Skipped (Duplicates): ${skippedCount}`);
  console.log(`Errors: ${errorCount}`);
}

runMigration()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
