import type { ReactNode } from "react";
import { EmptyState } from "./EmptyState";

/** Temporary screen body until Batch C redesigns Search and Library. */
export function ComingSoon({ title, icon }: { title: string; icon: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1120px] px-9 pb-40 pt-12">
      <p className="t-eyebrow">Sonic</p>
      <h1 className="t-display mt-4">{title}</h1>
      <div className="mt-10">
        <EmptyState
          icon={icon}
          title={`${title} is being redesigned`}
          body="This screen arrives in a later batch of the Ambient Glass redesign."
        />
      </div>
    </div>
  );
}