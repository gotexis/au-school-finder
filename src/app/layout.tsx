import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AU School Finder — Find & Compare Australian Schools",
  description:
    "Search and compare 9,700+ Australian schools. View ICSEA rankings, enrolments, staff ratios and more. Data from ACARA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="emerald">
      <body className="min-h-screen bg-base-100">
        <div className="navbar bg-primary text-primary-content shadow-lg">
          <div className="container mx-auto">
            <a href="/" className="btn btn-ghost text-xl">
              🏫 AU School Finder
            </a>
          </div>
        </div>
        <main className="container mx-auto px-4 py-8">{children}</main>
        <footer className="footer footer-center p-4 bg-base-300 text-base-content mt-8">
          <p>
            Data sourced from{" "}
            <a
              href="https://www.acara.edu.au/contact-us/acara-data-access"
              className="link"
              target="_blank"
              rel="noopener"
            >
              ACARA Data Access Program
            </a>{" "}
            (2025). Part of the{" "}
            <a href="https://rollersoft.com.au" className="link">
              Rollersoft
            </a>{" "}
            network.
          </p>
        </footer>
      </body>
    </html>
  );
}
