import Groq from "groq-sdk";
import dotenv from "dotenv";
import { tavily } from "@tavily/core";
import readline from "node:readline/promises";
import NodeCache from "node-cache";
dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const myCache = new NodeCache({ stdTTL: 60 * 60 * 24 });
//  Tool calling..................................
export async function generate(userMessage, threadId) {
  const baseMessage = [
    {
      role: "system",
      content: `You are Jarves, a smart personal assistant.If you know the answer to a question, answer it directly in plain English.
If the answer requires real-time, local, or up-to-date information, or if you don’t know the answer, use the available tool to find it.
You have access to the following tool:

searchWeb(query: string): Use this to search the internet for current or unknown information.

Decide when to use your own knowledge and when to use the tool.
Do not mention the tool unless needed.

Examples:

Q: What is the capital of France?
A: The capital of France is Paris.

Q: What’s the weather in Mumbai right now?
A: (use the search tool to find the latest weather)

Q: Who is the Prime Minister of India?
A: The current Prime Minister of India is Narendra Modi.

Q: Tell me the latest IT news.
A: (use the search tool to get the latest news)

current date and time: ${new Date().toUTCString()}`,
    },
  ];
  const messages = myCache.get(threadId) ?? baseMessage;

  messages.push({
    role: "user",
    content: userMessage,
  });
  const MAX_RETRIES = 10;
  let count = 0;
  while (true) {
    if (count > MAX_RETRIES) {
      return "I could not find the result, Please try again";
    }
    count++;
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      tools: [
        {
          type: "function",
          function: {
            name: "webSearch",
            description:
              "Search  the latest information and realtime data on the internet",
            parameters: {
              // JSON Schema object
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The search query to perform search on",
                },
              },
              required: ["query"],
            },
          },
        },
      ],
      tool_choice: "auto",
    });

    messages.push(completion.choices[0].message);

    const toolCalls = completion.choices[0].message.tool_calls;

    if (!toolCalls) {
      myCache.set(threadId, messages);
      return completion.choices[0]?.message.content;
    }

    for (const tool of toolCalls) {
      const functionName = tool.function.name;
      const functionParams = tool.function.arguments;
      if (functionName === "webSearch") {
        const toolResults = await webSearch(JSON.parse(functionParams));
        // console.log('Tool Result',toolResults)

        messages.push({
          tool_call_id: tool.id,
          role: "tool",
          name: functionName,
          content: toolResults,
        });
      }
    }
  }
}

export async function webSearch({ query }) {
  console.log("Calling web search.....");

  const response = await tvly.search(query);

  const results = response.results.map((result) => result.content).join("\n\n");

  return results;
}
