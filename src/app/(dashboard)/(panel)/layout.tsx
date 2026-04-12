import type { ReactNode } from "react";

interface PanelLayoutProps {
  children: ReactNode;
}

export default function PanelLayout({ children }: PanelLayoutProps) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[34px] border border-obsidian-700 bg-[radial-gradient(circle_at_top_left,rgba(235,190,69,0.09),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(216,221,232,0.07),transparent_32%),linear-gradient(180deg,rgba(14,15,17,0.97),rgba(8,8,9,1))] p-6 shadow-card md:p-8 md:pt-6">
      {children}
    </div>
  );
}
