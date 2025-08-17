import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { configDotenv } from "dotenv";
import { CohereEmbeddings } from "@langchain/cohere";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
configDotenv();
const loader = new PDFLoader("./base.pdf", {
    splitPages: false
});
const embeddings = new CohereEmbeddings({
    model: "embed-english-v3.0"
});
let count = 1;
const faissStore = new FaissStore(embeddings, {});
const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0.3
});
const main = async () => {
    const docs = await loader.load();
    const splitter = new RecursiveCharacterTextSplitter({
        chunkOverlap: 200,
        chunkSize: 1000
    });
    const chunks = await splitter.splitDocuments(docs);
    const arr = [];
    for (let i = 0; i < chunks.length; i++) {
        arr.push(String(count++));
    }
    await faissStore.addDocuments(chunks, { ids: arr });
    const query = "how is t-test used here ? ";
    const resp = await faissStore.similaritySearch(query);
    console.log(resp);
    const contentArr = resp.map((val) => val.pageContent);
    const content = contentArr.join('\n\n');
    const result = await model.invoke(`The userquery is ${query} and the context we have from the pdf given by the user is : ${content}`);
    console.log(result);
};
main();
//# sourceMappingURL=index.js.map