import express from "express";
import { generate } from "./chatbot.js";
const app = express();
const port = 3000;
app.use(express.json());

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  const result = await generate(message);
  res.json({ message: result });
});

app.listen(port, () => {
  console.log(`Server running on  ${port}`);
});
