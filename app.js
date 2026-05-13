import Groq from "groq-sdk";
import dotenv from "dotenv";
import {tavily} from "@tavily/core";
dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

// export async function getGroqChatCompletion() {
//   return groq.chat.completions.create({
//     // Configuration of LLM....................
//     temperature:1,
//     // top_p:0.2,
//     // stop:'ga', //stoping case
//     // max_completion_tokens:'1000',
//     // frequency_penalty:1,
//     // presence_penalty:1,
//     response_format:{'type':'json_object'}, //Structured output
//     messages: [
//       // {
//       //   role: "system", // give persona
//       //   content:
//       //     "You are Jarves, a smart review grader. Your task is to analyse given review and return the sentiment. Classify the review as positive, neutral or negative. Output must be a single word.",
//       // },
//       // {
//       //   role: "user",
//       //   content: `Review: These headphones arrived quickly and look great, but the left earcup stopped working after a week.
//       //   Sentiment:
//       //   `,
//       // },

//       // Structured output using prompt............
//       {
//         role: "system",
//         content:
//           `You are Jarves, a smart review grader. Your task is to analyse given review and return the sentiment. Classify the review as positive, neutral or negative.You must result in valid JSON structure.
//           example:{"sentiment:"Negative"}
//           `,
//       },
//       {
//         role: "user",
//         content: `Review: These headphones arrived quickly and look great, but the left earcup stopped working after a week.
//         Sentiment:
//         `,
//       },
//       //..............................................
//     ],
//     model: "llama-3.3-70b-versatile",
//   });
// }
// export async function main() {
//   const chatCompletion = await getGroqChatCompletion();
//   // Print the completion returned by the LLM.
//   //  console.log(chatCompletion.choices[0]?.message?.content || "");
//   console.log(JSON.parse(chatCompletion.choices[0]?.message?.content || ""));
// }

// main();

//  Tool calling..................................
export async function getGroqChatCompletion() {
  return groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages:  [
      {
        role: "system",
        content:
          "You are Jarves, a smart personal assistant. Respond to the user question and use tools if needed to answer the query",
      },
      {
        role: "user",
        content: `What is current weather in mumbai?`,
      },
    ],
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
}
export async function main() {
  const chatCompletion = await getGroqChatCompletion();
  const toolCalls = chatCompletion.choices[0].message.tool_calls;
  if(!toolCalls){
    console.log(`Assistant: ${chatCompletion.choices[0]?.message}`)
    return;
  }

for(const tool of toolCalls){
  console.log('tool: ' ,tool)
  const functionName = tool.function.name
  const functionParams = tool.function.arguments
  if(functionName === 'webSearch'){
  const toolResults = await webSearch(JSON.parse(functionParams))
  console.log('Tool Result',toolResults)
  }
}
  // console.log(JSON.stringify(chatCompletion.choices[0]?.message));
}

main();

export async function webSearch({ query }) {
  console.log('Calling web search.....')
  const response = await tvly.search(query);
  console.log('Response', response.results.map(result => result.content).join('\n\n'))
}
