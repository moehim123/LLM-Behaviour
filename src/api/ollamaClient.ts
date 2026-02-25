type OllamaGenerateResponse = {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  done_reason?: string;

  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
};

export async function generateWithOllama(args: {
  model: string;
  prompt: string;
  temperature: number;
  numPredict: number;
}) {
  const start = performance.now();

  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: args.model,
      prompt: args.prompt,
      stream: false,
      options: {
        temperature: args.temperature,
        num_predict: args.numPredict,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Ollama request failed: ${res.status}`);
  }

  const data = (await res.json()) as OllamaGenerateResponse;

  const end = performance.now();

  return {
    response: data.response,
    model: data.model,
    latencySec: (end - start) / 1000,

    completionTokens: data.eval_count ?? 0,
    promptTokens: data.prompt_eval_count ?? 0,

    temperature: args.temperature,
    tokensRequested: args.numPredict,

    ollamaDurationsNs: {
      total: data.total_duration,
      load: data.load_duration,
      promptEval: data.prompt_eval_duration,
      eval: data.eval_duration,
    },
  };
}