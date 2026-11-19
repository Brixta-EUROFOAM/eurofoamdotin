"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useConsent } from "@/components/store/ConsentProvider";
import { rememberAcquisition } from "@/lib/acquisition-client";
export default function AcquisitionTracker() {
  const path = usePathname();
  const { marketing } = useConsent();
  useEffect(() => { rememberAcquisition(marketing); }, [path, marketing]);
  return null;
}
