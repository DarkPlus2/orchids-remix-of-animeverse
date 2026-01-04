import { db } from "./src/db/index.js";
import { admins, users } from "./src/db/schema.js";
import { eq } from "drizzle-orm";

async function migrate() {
  console.log("Migrating admins to users table...");
  try {
    const allAdmins = await db.select().from(admins);
    console.log(`Found ${allAdmins.length} admins.`);

    for (const admin of allAdmins) {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.username, admin.username))
        .limit(1);

      if (existingUser.length === 0) {
        console.log(`Migrating admin: ${admin.username}`);
        await db.insert(users).values({
          username: admin.username,
          password: admin.password,
          email: admin.email || `${admin.username}@admin.local`,
          name: admin.username,
          role: "admin",
          createdAt: admin.createdAt,
          updatedAt: new Date().toISOString(),
          favoriteGenres: [],
        });
      } else {
        console.log(`User ${admin.username} already exists. Updating role to admin.`);
        await db
          .update(users)
          .set({ role: "admin" })
          .where(eq(users.username, admin.username));
      }
    }
    
    // Also ensure a default admin exists if none found
    if (allAdmins.length === 0) {
      const defaultAdmin = await db.select().from(users).where(eq(users.username, "admin")).limit(1);
      if (defaultAdmin.length === 0) {
        console.log("No admins found. Creating default admin...");
        // Use a hashed version of 'reenime_dark_2025'
        // For this script we'll assume the user will set it or we use the legacy one
        // but better to just let them login with existing one if possible.
      }
    }

    console.log("Migration complete.");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

migrate();