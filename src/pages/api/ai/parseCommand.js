import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: "Command required" });
  }

  try {
    const prompt = `
Convert this natural language booking command into a JSON object:
Command: "${command}"

When extracting participants:
- NEVER replace fictional names with real identities.
- NEVER guess secret identities (e.g., Batman → Bruce Wayne, SpiderMan → Peter Parker).
- Output the exact text the user wrote.


Return only JSON with fields:
{
  "organizer": "Name",
  "participants": ["full name", ...],
  "dates": ["YYYY-MM-DD", ...],
  "start": "HH:MM",
  "end": "HH:MM",
  "purpose": "string"
}
Only output valid JSON. No explanations.
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // or "gpt-4o" or "gpt-4.1"
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const text = response.choices[0].message.content.trim();
    const parsed = JSON.parse(text);

    console.log("5555", response);
    console.log("6666", text);
    console.log("7777", parsed);

    res.json({ success: true, parsed });
  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({
      error: "AI parsing failed",
      details: err.message,
    });
  }
}
