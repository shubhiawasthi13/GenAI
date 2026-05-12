import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function getGroqChatCompletion() {
  return groq.chat.completions.create({
    // Configuration of LLM....................
    temperature:1,
    // top_p:0.2,
    // stop:'ga', //stoping case
    // max_completion_tokens:'1000',
    // frequency_penalty:1,
    // presence_penalty:1,
    response_format:{'type':'json_object'}, //Structured output
    messages: [
      // {
      //   role: "system", // give persona
      //   content:
      //     "You are Jarves, a smart review grader. Your task is to analyse given review and return the sentiment. Classify the review as positive, neutral or negative. Output must be a single word.",
      // },
      // {
      //   role: "user",
      //   content: `Review: These headphones arrived quickly and look great, but the left earcup stopped working after a week.
      //   Sentiment:
      //   `,
      // },

      // Structured output using prompt............
      {
        role: "system",
        content:
          `You are Jarves, a smart review grader. Your task is to analyse given review and return the sentiment. Classify the review as positive, neutral or negative.You must result in valid JSON structure.
          example:{"sentiment:"Negative"}
          `,
      },
      {
        role: "user",
        content: `Review: These headphones arrived quickly and look great, but the left earcup stopped working after a week.
        Sentiment:
        `,
      },
      //..............................................
    ],
    model: "llama-3.3-70b-versatile",
  });
}
export async function main() {
  const chatCompletion = await getGroqChatCompletion();
  // Print the completion returned by the LLM.
  //  console.log(chatCompletion.choices[0]?.message?.content || "");
  console.log(JSON.parse(chatCompletion.choices[0]?.message?.content || ""));
}

main();
