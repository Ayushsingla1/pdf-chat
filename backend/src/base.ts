import { CohereEmbeddings } from "@langchain/cohere";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { configDotenv } from "dotenv";

configDotenv();

export const model = new ChatGoogleGenerativeAI({
    model : "gemini-2.0-flash",
    temperature : 0.3
})

export const splitter = new RecursiveCharacterTextSplitter({
    chunkOverlap : 200,
    chunkSize : 2000
})


export const embeddings = new CohereEmbeddings({
    model: "embed-english-v3.0"
});

export const faissStore = new FaissStore(embeddings,{});
