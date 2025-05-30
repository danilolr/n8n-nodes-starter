import { IExecuteFunctions } from "n8n-workflow";
import { MessageData } from "./ckit_model";

export class CKitMemory {
	
    private memory: Map<string, any> = new Map()
    private static instance: CKitMemory;
    private chatbots: ChatbotInfo[] = []
    private conversations: ConversationInfo[] = []

    public static getInstance(): CKitMemory {
        if (!CKitMemory.instance) {
            CKitMemory.instance = new CKitMemory()
        }
        return CKitMemory.instance
    }

    public set(key: string, value: any): void {
        this.memory.set(key, value)
    }

    public get(key: string): any | undefined {
        return this.memory.get(key)
    }

    public has(key: string): boolean {
        return this.memory.has(key)
    }

    public delete(key: string): boolean {
        return this.memory.delete(key)
    }

    public clear(): void {
        this.memory.clear()
    }

	addChatbot(name: string, version: string) {
		const chatbotInfo = new ChatbotInfo(name, version)
        this.chatbots.push(chatbotInfo)
	}

	getChatbots(): ChatbotInfo[] {
		return this.chatbots
	}

    addConversation(self: IExecuteFunctions, uuid: string, clientRef: string, userId: any, channelType: string, chatbotName: string, urlCallback: string) {
        const workflowId = self.getWorkflow().id 
		self.logger.error("Adding conversation to memory: " + workflowId + ", " + uuid + ", " + clientRef + ", " + userId + ", " + channelType + ", " + chatbotName)
        const conversationInfo = new ConversationInfo(workflowId!, uuid, clientRef, userId, channelType, chatbotName, urlCallback)
        this.conversations.push(conversationInfo)
	}    

    getCurrentConversation(self: IExecuteFunctions): ConversationInfo | undefined {
        const workflowId = self.getWorkflow().id 
        return this.conversations.find(conversation => conversation.workflowId === workflowId)
    }

}

export class ChatbotInfo {

    constructor(public name: string, public version: string) {
    }
}

export class ConversationInfo {
    pendingMessages: MessageData[] = []

    constructor(
        public workflowId: string,
        public uuid: string,
        public clientRef: string,
        public userId: any,
        public channelType: any,
        public chatbotName: string,
        public urlCallback: string
    ) {}

    addTextMessage(msgType: any, text: any) {
        const message = new MessageData(msgType, text)
        this.pendingMessages.push(message)
    }
    
    getPendingMessages(): MessageData[] {
        return this.pendingMessages        
    }

    clearPendingMessages() {
        this.pendingMessages = []
    }    

}
