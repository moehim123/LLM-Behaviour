type RunInput = {
  model: string;
  prompt: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
};

type RunOutput = {
  model?: string;
  response: string;
  totalDurationMs?: number;
  loadDurationMs?: number;
};

export async function runOllama(input: RunInput): Promise<RunOutput> {
  const res = await fetch("/ollama/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: input.model,
      prompt: input.prompt,
      system: input.system,
      stream: false,
      options: {
        temperature: input.temperature,
        num_predict: input.maxTokens,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (${res.status})`);
  }

  const data = await res.json();

  return {
    model: data.model,
    response: data.response ?? "",
    totalDurationMs: typeof data.total_duration === "number" ? data.total_duration / 1_000_000 : undefined,
    loadDurationMs: typeof data.load_duration === "number" ? data.load_duration / 1_000_000 : undefined,
  };
}