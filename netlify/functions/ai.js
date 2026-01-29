export async function handler(event) {
  try {
    const { text, tone } = JSON.parse(event.body);

    const toneMap = {
      casual: "Relaxed, conversational, natural",
      formal: "Professional, structured, polished",
      dark: "Introspective, restrained, psychological",
      friendly: "Warm, supportive, human"
    };

    const prompt = `
You are an AI text refiner.

Rewrite the following text without changing its meaning.
Tone: ${toneMap[tone]}

Text:
"${text}"
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        output:
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "No response generated"
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "AI request failed" })
    };
  }
}
