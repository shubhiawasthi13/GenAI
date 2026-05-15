import Groq from "groq-sdk";
import dotenv from "dotenv";
import { tavily } from "@tavily/core";
import readline from "node:readline/promises";
dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

//  Tool calling..................................
export async function generate(userMessage) {
  const messages = [
    {
      role: "system",
      content:
        "You are Jarves, a smart personal assistant. Respond to the user question and use tools if needed to answer the query",
    },
  ];

  messages.push({
    role: "user",
    content: userMessage,
  });

  while (true) {
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
