import { getRequestConfig } from "next-intl/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default getRequestConfig(async () => {
  let locale = "en";

  try {
    const session = await auth();
    if (session?.user?.id) {
      const [user] = await db
        .select({ language: users.language })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);
      if (user?.language) locale = user.language;
    }
  } catch {
    // fallback to "en"
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
