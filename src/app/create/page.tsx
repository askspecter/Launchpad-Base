import type { Metadata } from "next";
import { LaunchStudio } from "@/components/LaunchStudio";

export const metadata: Metadata = {
  title: "Launch",
  description: "Describe your token in one sentence and deploy it to Pons.",
};

export default function CreatePage() {
  return <LaunchStudio />;
}
