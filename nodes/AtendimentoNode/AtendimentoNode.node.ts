import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

export class AtendimentoNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Atendimento Node',
		name: 'atendimentoNode',
		group: ['transform'],
		version: 1,
		description: 'Atendimento Node', // Node's main description
		defaults: {
			name: 'Atendimento Node',
		},
		inputs: [
			{
				type: NodeConnectionType.Main,
				displayName: "Input",
			},
		],
		outputs: [
			{
				type: NodeConnectionType.Main,
				displayName: "onWebResponse",
			},
			{
				type: NodeConnectionType.Main,
				displayName: "onMessage",
			},
		],
		properties: [
			{
				displayName: 'Chatbots',
				name: 'chatbots',
				type: 'fixedCollection',
typeOptions: {
    multipleValues: true,
    sortable: true,
},
				default: { chatbot: [] },
				placeholder: 'Add Chatbot',
				description: 'Add chatbots and their versions',
				options: [
					{
						name: 'chatbot',
						displayName: 'Chatbot',
						values: [
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
					},
				],
			},
		]
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData()[0];
		const requestDataType = (items.json.requestData as any).type as string;
		const chatbotsConfig = this.getNodeParameter('chatbots', 0, { chatbot: [] }) as { chatbot: Array<{ name: string; version: string }> };       
		var onWebResponseData: INodeExecutionData[] = []
		var onMessageResponseData: INodeExecutionData[] = []
		var response: any[] = []
		if (requestDataType === 'getService') {
			try {
				response = (chatbotsConfig.chatbot || []).map(chatbotEntry => {
                    return {
                        "referencia": chatbotEntry.name.trim(),
                        "versao": chatbotEntry.version.trim(),
                        "tipo": "CHATBOT"
                    }
                })
			} catch (error) {
			}
			onWebResponseData = [{
				json: {
					"ok": true,
					"response": response
				}
				,
			}];
		} else if (requestDataType === 'onStartConversation') {
			onMessageResponseData = [{
				json: {
					"ok": true,
					"response": (items.json.requestData as any).payload
				}
				,
			}];
		} else if (requestDataType === 'onMessage') {
			onMessageResponseData = [{
				json: {
					"ok": true,
					"response": (items.json.requestData as any).payload
				}
				,
			}];
		}
		return [
			this.helpers.returnJsonArray(onWebResponseData),
			this.helpers.returnJsonArray(onMessageResponseData),
		];
	}

}
