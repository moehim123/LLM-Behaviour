import { useMemo, useState } from "react";
import Ellipse from "../assets/Ellipse.svg";
import Ellipsis from "../assets/ellipsis-horizontal.svg";
import ScoreSlider from "./ScoreSlider";
import Notes from "./Notes";
import AddTagButton from "./AddTagButton";
import QuantifiableTag from "./QuantifiableTag";

type RunStatus = "complete" | "error" | "pending";

type Tag = {
  id: string;
  label: string;
  weight?: number;
};

type Props = {
  runNumber: number;
  status: RunStatus;

  modelName: string;
  latencySec?: number;
  temperature?: number;
  tokens?: number;

  prompt: string;
  response: string;

  score: number;
  onScoreChange?: (next: number) => void;

  tags: Tag[];
  onTagsChange?: (next: Tag[]) => void;

  notes?: string;
  onNotesSave?: (value: string) => void;

  onReuseParams?: () => void;
  onDeleteRun?: () => void;

  containerClassName?: string;
};

function formatHeaderMeta(modelName: string, latencySec?: number, temperature?: number, tokens?: number) {
  const parts: string[] = [];
  parts.push(`Model . ${modelName}`);
  if (latencySec !== undefined) parts.push(`Latency . ${latencySec.toFixed(1)}s`);
  if (temperature !== undefined) parts.push(`Temp . ${temperature}`);
  if (tokens !== undefined) parts.push(`Tokens . ${tokens}`);
  return parts.join("  |  ");
}

export default function RunCard({
  runNumber,
  status,
  modelName,
  latencySec,
  temperature,
  tokens,
  prompt,
  response,
  score,
  onScoreChange,
  tags,
  onTagsChange,
  notes = "",
  onNotesSave,
  onReuseParams,
  onDeleteRun,
  containerClassName = "w-full max-w-[760px]",
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const statusLabel = useMemo(() => {
    if (status === "complete") return "Complete";
    if (status === "error") return "Error";
    return "Pending";
  }, [status]);

  const meta = useMemo(
    () => formatHeaderMeta(modelName, latencySec, temperature, tokens),
    [modelName, latencySec, temperature, tokens]
  );

  function updateTag(tagId: string, nextSelected: boolean, nextValue: number) {
    const next = tags.map((t) => {
      if (t.id !== tagId) return t;
      if (!nextSelected) return { ...t, weight: -1 };
      return { ...t, weight: nextValue };
    });
    onTagsChange?.(next);
  }

  function handleAddTag(label: string) {
    const trimmed = label.trim();
    if (!trimmed) return;

    const already = tags.some((t) => t.label.toLowerCase() === trimmed.toLowerCase());
    if (already) return;

    const next: Tag[] = [...tags, { id: crypto.randomUUID(), label: trimmed, weight: 0 }];
    onTagsChange?.(next);
  }

  return (
    <div className={["font-sans", containerClassName].join(" ")}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <img src={Ellipse} alt="" aria-hidden="true" className="h-6 w-6" />
          <div className="text-[11px] font-medium text-ui-black">Run {runNumber}</div>
          <div className="text-[11px] italic font-normal text-ui-black">{statusLabel}</div>
        </div>

        <div className="text-[11px] font-normal text-ui-grey">{meta}</div>
      </div>

      <div className="w-full rounded-[12px] bg-ui-runBg p-4">
        <div className="relative mb-3">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="absolute right-0 top-0 inline-flex h-8 w-8 items-center justify-center"
            aria-label="Run actions"
          >
            <img src={Ellipsis} alt="" aria-hidden="true" className="h-5 w-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-[999] w-max rounded-[8px] bg-white shadow-[0_0_15px_0_rgba(135,135,135,0.15)]">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onReuseParams?.();
                }}
                className="flex h-[26px] w-full items-center px-[10px] text-[11px] font-normal text-ui-black hover:bg-ui-backgroundGrey"
              >
                Reuse params
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDeleteRun?.();
                }}
                className="flex h-[26px] w-full items-center px-[10px] text-[11px] font-normal text-ui-black hover:bg-ui-backgroundGrey"
              >
                Delete run
              </button>
            </div>
          )}
        </div>

        <div className="mb-3 flex w-fit items-center rounded-[8px] bg-ui-quotedBg px-[10px] py-[10px]">
          <div className="text-[11px] italic font-normal text-ui-black">“{prompt}”</div>
        </div>

        <div className="mb-6 w-full rounded-[8px] bg-white px-[10px] py-[10px]">
          <div className="text-[11px] font-normal text-ui-black">{response}</div>
        </div>

        <div className="mb-3 text-[11px] font-normal text-ui-black">Score</div>

        <div className="mb-8 flex items-center gap-4">
          <div className="shrink-0">
            <ScoreSlider value={score} onChange={(v) => onScoreChange?.(v)} min={0} max={9} step={0.1} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden whitespace-nowrap pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="inline-flex items-center gap-2">
                  {tags.map((t) => (
                    <QuantifiableTag
                      key={t.id}
                      label={t.label}
                      selected={(t.weight ?? -1) >= 0}
                      value={Math.max(0, t.weight ?? 0)}
                      onChange={(next) => updateTag(t.id, next.selected, next.value)}
                    />
                  ))}
                </div>
              </div>

              <div className="shrink-0">
                <AddTagButton onAddTag={handleAddTag} />
              </div>
            </div>
          </div>
        </div>

        <Notes initialValue={notes} onSave={onNotesSave} />
      </div>
    </div>
  );
}