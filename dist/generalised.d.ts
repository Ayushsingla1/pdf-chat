export declare const addDocuments: (file: any, userId: string) => Promise<{
    summary: import("@langchain/core/messages").AIMessageChunk;
    docId: string;
}>;
export declare const queryFunc: (query: string, userId: string, conversationId: string) => Promise<{
    msg: import("@langchain/core/messages").AIMessageChunk;
}>;
export declare const createConversation: (userId: string) => Promise<string>;
//# sourceMappingURL=generalised.d.ts.map