import React from "react";
import { StudioSidebar } from "@/components/sidebar";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex overflow-hidden">
      <StudioSidebar />
      <div className="flex-1 overflow-y-auto bg-[#0A0A0A]">{children}</div>
    </div>
  );
}
