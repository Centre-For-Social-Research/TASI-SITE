import { GoogleGenerativeAI } from "@google/generative-ai";
import { tasiKnowledge } from "@/data/tasi-knowledge";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "Invalid messages format" }, { status: 400 });
    }

    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set.");
      return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }

    // TODO: Add rate limiting before production

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: `You are the official AI assistant for TASI 2026 conference in New Delhi.
Answer questions ONLY based on the TASI 2026 information provided below.
If the answer is not in the provided information, respond with:
'I don't have that detail yet. Please reach out to us at [contact email].'
Never make up facts, dates, names, or figures.
Keep answers concise, friendly, and professional.
Always refer to the event as TASI 2026.

Here is the TASI 2026 information:
${tasiKnowledge}`,
    });

    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;

    const chatSession = model.startChat({
      history,
    });

    const result = await chatSession.sendMessage(lastMessage);
    const reply = result.response.text();

    return Response.json({ reply });
  } catch (error) {
    console.error("Error in chat API:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
