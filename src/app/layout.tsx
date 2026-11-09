import type { Metadata, Viewport } from "next";
import "./globals.css";
import Shell from "@/components/Shell";

export const metadata: Metadata = {
  title: "Haven — Focus & blocking",
  description: "Your personal dashboard for blocking distractions and running focus sessions.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#F5F6FA" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
