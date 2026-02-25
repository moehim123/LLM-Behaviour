import TagPill from "./TagPill";

type Props = {
  modelName: string;
  temperature: number;
  maxTokens: number;
  latencySeconds: number;
  score?: number;
  prompt: string;
  tags?: string[];
  notesAttached?: boolean;
  onClick?: () => void;
};

export default function RunOverviewCard({
  modelName,
  temperature,
  maxTokens,
  latencySeconds,
  score,
  prompt,
  tags = [],
  notesAttached = false,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex w-full flex-col items-start
        px-3 py-2
        gap-[10px]
        text-left
        font-sans
        bg-ui-sidebarCard
        overflow-hidden
        rounded-[8px]
      "
    >
      <div className="flex w-full items-start justify-between gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[11px] font-medium text-ui-black">
            {modelName}
          </div>

          <div className="mt-0.5 truncate text-[9px] font-normal text-ui-params">
            Temp {temperature} {" | "} Tokens {maxTokens} {" | "} latency{" "}
            {latencySeconds}s
          </div>
        </div>

        <div className="shrink-0 text-right text-[10px] font-normal text-ui-black">
          {typeof score === "number" ? `Score: ${score.toFixed(1)}` : ""}
        </div>
      </div>

      <div className="w-full min-w-0">
        <div className="truncate text-[9px] font-normal text-ui-black">
          {prompt}
        </div>
      </div>

      {(tags.length > 0 || notesAttached) && (
        <div className="flex w-full items-center justify-between gap-2 min-w-0">
          <div
            className="
              flex min-w-0 flex-1 items-center gap-[10px]
              overflow-x-auto overscroll-x-contain
              whitespace-nowrap
              pr-1
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            {tags.map((t) => (
              <TagPill key={t} label={t} />
            ))}
          </div>

          <div className="shrink-0 text-right text-[8px] italic font-light text-ui-black">
            {notesAttached ? "Notes ..." : ""}
          </div>
        </div>
      )}
    </button>
  );
}