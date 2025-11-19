// pages/api/openai-usage-month.js
export default async function handler(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;

  try {
    // YYYY-MM-DD for first and last day of month
    const year = 2025;
    const month = 11; // November
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    let totalTokens = 0;

    // Loop over each day
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD

      const response = await fetch(
        `https://api.openai.com/v1/usage?date=${dateStr}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      const data = await response.json();
      if (response.status !== 200) {
        return res.status(response.status).json({ error: data });
      }

      totalTokens += data.total_usage || 0;
    }

    res.status(200).json({ totalTokens });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
