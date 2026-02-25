import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const OLLAMA_URL = "http://127.0.0.1:11434";

app.post("/api/run", async (req, res) => {
  try {
    const { model, prompt, system, temperature, maxTokens } = req.body as {
      model: string;
      prompt: string;
      system?: string;
      temperature?: number;
      maxTokens?: number;
    };

    const r = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        system,
        stream: false,
        options: {
          temperature: temperature ?? 0.7,
          num_predict: maxTokens ?? 256,
        },
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      return res.status(500).json({ error: "ollama_error", details: txt });
    }

    const data = await r.json();

    return res.json({
      response: data.response ?? "",
      model: data.model ?? model,
      totalDurationMs: data.total_duration ? Math.round(data.total_duration / 1_000_000) : undefined,
      evalCount: data.eval_count,
    });
  } catch (e: unknown) {
  const message =
    e instanceof Error ? e.message : String(e);

  return res.status(500).json({
    error: "server_error",
    details: message,
  });
}
});

app.listen(3001, () => {
  console.log("API server running on http://localhost:3001");
});