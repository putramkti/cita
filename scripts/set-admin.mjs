// scripts/set-admin.mjs — One-time bootstrap: promote owner email to ADMIN.
// Phase 8 helper. Idempotent — safe to re-run.
import { PrismaClient } from "@prisma/client";

const ADMIN_EMAIL = "putramukti26@gmail.com";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: ADMIN_EMAIL },
  });
  if (!user) {
    console.error(`User ${ADMIN_EMAIL} not found in users table.`);
    process.exit(1);
  }

  const before = user.role;
  if (before === "ADMIN") {
    console.log(`✓ Already ADMIN: ${ADMIN_EMAIL} (${user.id})`);
    return;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN" },
  });
  console.log(
    `✓ Promoted: ${ADMIN_EMAIL} (${updated.id}) ${before} → ${updated.role}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
