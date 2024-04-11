import "dotenv/config";
import { Groq } from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});
async function main() {
    // non-stream
    // const chatCompletion = await getGroqChatCompletion();
    // // Print the completion returned by the LLM.
    // process.stdout.write(chatCompletion.choices[0]?.message?.content || "");

    // stream
    const stream = await getGroqChatStream();
    for await (const chunk of stream) {
        // Print the completion returned by the LLM.
        process.stdout.write(chunk.choices[0]?.delta?.content || "");
    }
}
async function getGroqChatStream() {
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: "Explain the importance of low latency LLMs",
            },
        ],
        model: "mixtral-8x7b-32768",
        stream: true,
    });
}
async function getGroqChatCompletion() {
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: "Explain the importance of low latency LLMs",
            },
        ],
        model: "mixtral-8x7b-32768",
    });
}
export { getGroqChatCompletion, getGroqChatStream, main };
