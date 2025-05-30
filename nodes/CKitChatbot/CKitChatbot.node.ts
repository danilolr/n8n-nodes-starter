import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow'
import { CKitMemory } from '../CKit/ckit_memory';

export class CKitChatbot implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CKitChatbot',
		name: 'cKitChatbot',
		group: ['transform'],
		version: 1,
		description: 'CKitChatbot',
		defaults: {
			name: 'CKitChatbot',
		},
		inputs: [
			{
				type: NodeConnectionType.Main,
			},
		],
		outputs: [
			{
				type: NodeConnectionType.Main,
				displayName: "onMessage",
			},
		],
		properties: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name of the chatbot',
			},
			{
				displayName: 'Version',
				name: 'version',
				type: 'string',
				default: '0.0.1',
				description: 'Version of the chatbot (e.g., 0.0.1)',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		var onResponse: INodeExecutionData[] = []
		const input = this.getInputData()[0].json as any
        const chatbotName = this.getNodeParameter('name', 0, '') as string
        const version = this.getNodeParameter('version', 0, '') as string
		this.logger.info(`CKitChatbot executed with name: ${chatbotName}, version: ${version}, params: ${JSON.stringify(input)}`);
		if (input.msgType=="executeChatbot") {
			if (input.chatbotName==chatbotName) {
				onResponse = [{
					json: {
						"message": input.message,
					}
				}]	
			}
		} 
		if (input.msgType=="queryChatbot") {
			this.logger.info(`CKitChatbot QUERY_CHATBOT`);
			CKitMemory.getInstance().addChatbot(chatbotName, version)
		}
		return [onResponse]
	}

}