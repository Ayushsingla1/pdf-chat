import { Response } from "express";
export declare const addDocuments: (file: any, userId: string) => Promise<{
    summary: import("@langchain/core/messages").MessageContent;
    docId: string;
}>;
export declare const queryFunc: (query: string, userId: string, conversationId: string, res: Response) => Promise<void>;
export declare const createConversation: (userId: string) => Promise<string>;
//# sourceMappingURL=generalised.d.ts.map