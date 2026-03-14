import type { Metadata } from "next";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "AU School Finder — Find & Compare Australian Schools | 澳洲择校助手",
  description:
    "Search and compare 9,700+ Australian schools. View ICSEA rankings, enrolments, staff ratios and more. Official ACARA data. 搜索对比澳大利亚学校。",
  openGraph: {
    title: "AU School Finder — Find & Compare Australian Schools",
    description: "Search and compare 9,700+ Australian schools with official ACARA data.",
    type: "website",
    url: "https://schools.rollersoft.com.au",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="emerald">
      <body className="min-h-screen bg-base-100 flex flex-col">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
