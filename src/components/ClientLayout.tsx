"use client";
import Link from "next/link";
import { I18nProvider, useI18n, LanguageSwitcher } from "@/lib/i18n";

const stateLinks = [
  { href: "/state/NSW", label: "NSW" },
  { href: "/state/VIC", label: "VIC" },
  { href: "/state/QLD", label: "QLD" },
  { href: "/state/WA", label: "WA" },
  { href: "/state/SA", label: "SA" },
  { href: "/state/TAS", label: "TAS" },
  { href: "/state/ACT", label: "ACT" },
  { href: "/state/NT", label: "NT" },
];

function NavContent() {
  const { t } = useI18n();

  const navLinks = [
    ...stateLinks,
    { href: "/compare", label: t("nav.compare") },
    { href: "/rankings", label: t("nav.rankings") },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-base-100/90 border-b border-base-200">
        <div className="container mx-auto">
          <div className="navbar px-4">
            <div className="navbar-start">
              <Link href="/" className="btn btn-ghost text-xl font-bold gap-2">
                <span className="text-2xl">🏫</span>
                <span className="hidden sm:inline">{t("site.name")}</span>
                <span className="sm:hidden">{t("site.short")}</span>
              </Link>
            </div>
            <div className="navbar-center hidden lg:flex">
              <ul className="menu menu-horizontal gap-1 px-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="btn btn-ghost btn-sm">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="navbar-end flex gap-2">
              <LanguageSwitcher />
              <div className="lg:hidden">
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                    </svg>
                    {t("nav.states")}
                  </div>
                  <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-200 rounded-box z-[1] mt-3 w-40 p-2 shadow-lg">
                    {navLinks.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href}>{link.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

function FooterContent() {
  const { t } = useI18n();

  const navLinks = [
    ...stateLinks,
    { href: "/compare", label: t("nav.compare") },
    { href: "/rankings", label: t("nav.rankings") },
  ];

  return (
    <footer className="bg-base-200 border-t border-base-300">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-2">🏫 {t("site.name")}</h3>
            <p className="text-sm text-base-content/70">{t("footer.desc")}</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">{t("footer.browseByState")}</h3>
            <div className="flex flex-wrap gap-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="link link-hover text-sm">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">{t("footer.dataSource")}</h3>
            <p className="text-sm text-base-content/70">
              {t("footer.dataSourceDesc")}{" "}
              <a href="https://www.acara.edu.au/contact-us/acara-data-access" className="link" target="_blank" rel="noopener">
                {t("footer.acara")}
              </a>{" "}
              (2025).
            </p>
            <h3 className="font-bold text-lg mb-2 mt-4">{t("footer.languages")}</h3>
            <p className="text-sm text-base-content/70">{t("footer.langDesc")}</p>
          </div>
        </div>
        <div className="divider my-4"></div>
        <p className="text-center text-sm text-base-content/50">
          © {new Date().getFullYear()}{" "}
          <a href="https://rollersoft.com.au" className="link link-hover">Rollersoft</a>
          . {t("footer.copyright")}
        </p>
      </div>
    </footer>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <NavContent />
      <main className="container mx-auto px-4 py-8 flex-1">{children}</main>
      <FooterContent />
    </I18nProvider>
  );
}
