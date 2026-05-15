const input = document.querySelector('#input');
const chatContainer = document.querySelector('#chat-container');
const btn = document.querySelector('#ask');

console.log(input);

input?.addEventListener('keyup', handleEnter);
btn?.addEventListener('click', handleAsk);

function generate (text){
// appned message to ui
const msg = document.createElement('div');
msg.className ='bg-neutral-700 p-3 rounded-xl my-6 ml-auto max-w-fit';
msg.textContent= text;
chatContainer?.appendChild(msg);
input.value ='';
// send it to llm
//append response to the ui
}

function handleAsk(e){
const text = input?.value.trim();
        if(!text){
            return;
        }
        generate(text);
}

function handleEnter(e) {
    if (e.key === "Enter") {
        const text = input?.value.trim();
        if(!text){
            return;
        }
        generate(text)
    }
}