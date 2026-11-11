import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "EGVoiceLabs (EGVL) — Your voice. Your sound. Your lab.",
  description:
    "Next-generation AI audio platform combining Text-to-Speech, Instant & Professional Voice Cloning, Voice Designer, AI Music Generation, and Sound Effects in one studio.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col antialiased selection:bg-white selection:text-black">
        <ThemeProvider>
          <AppProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
