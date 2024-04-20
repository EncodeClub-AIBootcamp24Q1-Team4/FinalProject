import OpenAI from "openai";
import { experimental_buildOpenAssistantPrompt } from 'ai/prompts';
// import fs from "fs";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";

export async function POST(req: Request) {
    const { securityData } = await req.json();

    let options = `Summarize this token security report and explain if this is a scams or rugpulls`;

    // const threadMessages = await openai.beta.threads.messages.create(
    //     `${process.env.OPENAI_API_THREAD}`,
    //     {
    //         role: "user",
    //         content: `${options}`
    //     },
    //   )
    
    //   console.log(threadMessages.id);

    // const file = await openai.files.create({
    //     file: fs.createReadStream("testData.json"),
    //     purpose: "assistants",
    //   });

    const thread = await openai.beta.threads.create({
        messages: [
            {
                "role": "user",
                "content": `${options}`,
                "attachments": [
                    {
                        file_id: '/testData.json',
                        tools: [{type: "code-interpreter"}]
                    }
                ]
            }
        ]
    });

    // const messages = await openai.beta.threads.messages.create(
    //     thread.id,
    //     {
    //         role: "user",
    //         content: `${options}`
    //     },
    // );
    
      const messageResponse = await openai.beta.threads.runs.createAndPoll(
        thread.id,
        {
            assistant_id: `${process.env.OPENAI_API_ASSISTANT}`,
        }
      )
    
      if (messageResponse.status != 'completed')
        throw new Error(`Unexpected run status: ${messageResponse.status}`);
    
      const assistantResponse = await openai.beta.threads.messages.list(`${process.env.OPENAI_API_THREAD}`);
      return new Response(JSON.stringify(
        {prompt: assistantResponse.data[0].content[0].text.value}
      ))
}