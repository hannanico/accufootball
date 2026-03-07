import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { auth } from "@/auth";
import SessionProvider from "@/components/SessionProvider";
import TopBar from "@/components/TopBar";
export const dynamic = "force-dynamic";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AccuFootball",
  description: "Predict football matches",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en">
      <body className={geist.className}>
        <SessionProvider session={session}>
          <TopBar />
          <main style={{paddingBottom: "5rem" }}>{children}</main>
          <Navbar />
        </SessionProvider>
      </body>
    </html>
  );
}
