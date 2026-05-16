const input = document.querySelector("#input");
const chatContainer = document.querySelector("#chat-container");
const btn = document.querySelector("#ask");

console.log(input);

input?.addEventListener("keyup", handleEnter);
btn?.addEventListener("click", handleAsk);
const threadId = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

const loading = document.createElement('div');
loading.className = 'my-6 animate-pulse';
loading.textContent = 'Thinking...';

async function generate(text) {
  // appned message to ui
  const msg = document.createElement("div");
  msg.className = "bg-neutral-700 p-3 rounded-xl my-6 ml-auto max-w-fit";
  msg.textContent = text;
  chatContainer?.appendChild(msg);
  input.value = "";

  // send it to llm
  chatContainer.appendChild(loading)
  const assistantMessage = await callServer(text);

  //append response to the ui
  const assistanMsgllm = document.createElement("div");
  assistanMsgllm.className = "max-w-fit";
  assistanMsgllm.textContent = assistantMessage;
  loading.remove();
  chatContainer?.appendChild(assistanMsgllm);
}

async function callServer(inputText) {
  const response = await fetch("http://localhost:3000/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({threadId:threadId, message: inputText }),
  });
  if (!response.ok) {
    throw new Error("Error generating response");
  }

  const result = await response.json();
  return result.message;
}

async function handleAsk(e) {
  const text = input?.value.trim();
  if (!text) {
    return;
  }
  await generate(text);
}

async function handleEnter(e) {
  if (e.key === "Enter") {
    const text = input?.value.trim();
    if (!text) {
      return;
    }
    await generate(text);
  }
}
