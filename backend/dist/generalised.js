import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import db from "./dbClient.js";
import { model, splitter } from "./base.js";
import { faissStore } from "./base.js";
import { v6 } from "uuid";
export const addDocuments = async (file, userId) => {
    const loader = new PDFLoader(file, {
        splitPages: false
    });
    const docs = await loader.load();
    const docId = v6();
    const chunks = await splitter.splitDocuments(docs);
    const vectorStoreAddition = faissStore.addDocuments(chunks.map((chunk, i) => { return { pageContent: chunk.pageContent, metadata: { userId: userId, docId: docId, chunkId: i, totalChunks: chunks.length } }; }));
    const prompt = "Summarize the following text in 2-3 sentences, capturing only the key ideas:{text}";
    const result = await Promise.all(chunks.map(chunk => new Promise((res) => res(model.invoke(prompt.replace("text", chunk.pageContent))))));
    const promptSummary = `You are given partial summaries of different sections of a document.Your task is to write a clear, concise overall summary of the document in one paragraph.Section summaries: ${result.map((res) => res.content).join('\n\n')}`;
    const summary = await model.invoke(promptSummary);
    await vectorStoreAddition;
    await db.conversation.create({
        data: {
            userId: userId,
            summary: String(summary.content),
            id: docId
        }
    });
    return { summary: summary.content, docId: docId };
};
export const queryFunc = async (query, userId, conversationId, res) => {
    const summaryDetails = await db.conversation.findFirst({
        where: {
            userId: userId,
            id: conversationId
        },
        include: {
            chats: {
                orderBy: {
                    createdAt: "desc"
                },
                take: 6
            }
        }
    });
    const docs = await faissStore.similaritySearch(query, 5, {
        userId: userId,
        docId: conversationId
    });
    const retreivedDocs = docs.map((doc) => doc.pageContent).join('\n\n');
    const pastChats = summaryDetails?.chats.map(chat => `${chat.role} : ${chat.message}`).reverse().join('\n\n');
    const prompt = `
                    You are given:
                    - Document content: ${retreivedDocs}
                    - Summary of conversation so far: ${summaryDetails?.summary}
                    - Recent chats: ${pastChats}

                    Now answer the user's current query: ${query}
                    `;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    const result = await model.stream(prompt);
    const chunks = [];
    for await (const chunk of result) {
        res.write(`data : ${chunk.content}\n\n`);
        chunks.push(chunk);
    }
    res.write(`data : [DONE]\n\n`);
    res.end();
    const response = await db.chats.createMany({
        data: [
            { role: "HUMAN", message: query, conversationId: conversationId },
            { role: "AI", message: String(chunks.join(' ')), conversationId: conversationId }
        ]
    });
    if (Number(summaryDetails?.chats.length) >= 6) {
        const updatePrompt = `
                            Update the conversation summary based on:
                            - Current summary: ${summaryDetails?.summary}
                            - Last 6 chats: ${pastChats}

                            Return the updated summary in 2–3 sentences.
                            `;
        const summ = await model.invoke(prompt);
        await db.conversation.update({
            where: {
                userId: userId,
                id: conversationId
            },
            data: {
                summary: String(summ)
            }
        });
    }
    // return {msg : (result as AIMessage).content};
};
export const createConversation = async (userId) => {
    const user = await db.conversation.create({
        data: {
            userId: userId
        }
    });
    return user.id;
};
//# sourceMappingURL=generalised.js.map