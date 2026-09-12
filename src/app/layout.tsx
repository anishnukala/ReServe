import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "ReServe | Smart Food Rescue",
  description: "Match surplus food with nearby community organizations before it becomes waste.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <Navbar />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
