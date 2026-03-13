import type { Metadata } from "next";
import CompareClient from "./CompareClient";

export const metadata: Metadata = {
  title: "Compare Schools — AU School Finder",
  description:
    "Compare Australian schools side by side. View ICSEA rankings, enrolments, staff ratios and more.",
};

export default function ComparePage() {
  return <CompareClient />;
}
