import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { auth } from "@/auth";
import SessionProvider from "@/components/SessionProvider";
import TopBar from "@/components/TopBar";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export const dynamic = "force-dynamic";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AccuFootball",
  description: "Predict football matches",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const messages = await getMessages();

  return (
    <html lang="en">
      <body className={geist.className}>
        <NextIntlClientProvider messages={messages}>
          <SessionProvider session={session}>
            <TopBar />
            <main style={{ paddingBottom: "5rem" }}>{children}</main>
            <Navbar />
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
