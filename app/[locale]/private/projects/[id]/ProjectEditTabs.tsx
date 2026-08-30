"use client";

import { useState, type ReactNode } from "react";

export type ProjectTab = {
  key: string;
  label: string;
  content: ReactNode;
};

export function ProjectEditTabs({ tabs }: { tabs: ProjectTab[] }) {
  const [active, setActive] = useState(tabs[0]?.key);

  return (
    <div className="flex w-full flex-col gap-8">
      <nav aria-label="Project sections" className="flex flex-wrap gap-1 border-b border-line">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            aria-current={active === tab.key ? "page" : undefined}
            className={`-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              active === tab.key
                ? "border-accent text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {tabs.map((tab) => (
        <div
          key={tab.key}
          hidden={active !== tab.key}
          className="flex flex-col gap-8 [&>*+*]:border-t [&>*+*]:border-line [&>*+*]:pt-8"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
