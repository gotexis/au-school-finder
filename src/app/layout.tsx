import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AU School Finder — Find & Compare Australian Schools",
  description:
    "Search and compare 9,700+ Australian schools. View ICSEA rankings, enrolments, staff ratios and more. Official ACARA data.",
  openGraph: {
    title: "AU School Finder — Find & Compare Australian Schools",
    description: "Search and compare 9,700+ Australian schools with official ACARA data.",
    type: "website",
    url: "https://schools.rollersoft.com.au",
  },
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/state/NSW", label: "NSW" },
  { href: "/state/VIC", label: "VIC" },
  { href: "/state/QLD", label: "QLD" },
  { href: "/state/WA", label: "WA" },
  { href: "/state/SA", label: "SA" },
  { href: "/state/TAS", label: "TAS" },
  { href: "/state/ACT", label: "ACT" },
  { href: "/state/NT", label: "NT" },
  { href: "/compare", label: "⚖️ Compare" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="emerald">
      <body className="min-h-screen bg-base-100 flex flex-col">
        <header className="sticky top-0 z-50 backdrop-blur-md bg-base-100/90 border-b border-base-200">
          <div className="container mx-auto">
            <div className="navbar px-4">
              <div className="navbar-start">
                <Link href="/" className="btn btn-ghost text-xl font-bold gap-2">
                  <span className="text-2xl">🏫</span>
                  <span className="hidden sm:inline">AU School Finder</span>
                  <span className="sm:hidden">Schools</span>
                </Link>
              </div>
              <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal gap-1 px-1">
                  {navLinks.slice(1).map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="btn btn-ghost btn-sm">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="navbar-end lg:hidden">
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                    </svg>
                    States
                  </div>
                  <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-200 rounded-box z-[1] mt-3 w-40 p-2 shadow-lg">
                    {navLinks.slice(1).map((link) => (
                      <li key={link.href}>
                        <Link href={link.href}>{link.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 flex-1">{children}</main>

        <footer className="bg-base-200 border-t border-base-300">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-2">🏫 AU School Finder</h3>
                <p className="text-sm text-base-content/70">
                  Helping Australian parents find the right school. Compare ICSEA rankings, enrolments, and staff data for 9,700+ schools.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Browse by State</h3>
                <div className="flex flex-wrap gap-2">
                  {navLinks.slice(1).map((link) => (
                    <Link key={link.href} href={link.href} className="link link-hover text-sm">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Data Source</h3>
                <p className="text-sm text-base-content/70">
                  All data sourced from the{" "}
                  <a href="https://www.acara.edu.au/contact-us/acara-data-access" className="link" target="_blank" rel="noopener">
                    ACARA Data Access Program
                  </a>{" "}
                  (2025).
                </p>
              </div>
            </div>
            <div className="divider my-4"></div>
            <p className="text-center text-sm text-base-content/50">
              © {new Date().getFullYear()}{" "}
              <a href="https://rollersoft.com.au" className="link link-hover">Rollersoft</a>
              . Not affiliated with ACARA or the Australian Government.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
