import { CohereEmbeddings } from "@langchain/cohere";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
export declare const model: ChatGoogleGenerativeAI;
export declare const splitter: RecursiveCharacterTextSplitter;
export declare const embeddings: CohereEmbeddings;
export declare const faissStore: FaissStore;
//# sourceMappingURL=base.d.ts.map