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
				type: 'string',
				default: '',
				placeholder: 'chatbot1, chatbot2',
				description: 'Chatbot names, separated by commas',
			},
		]
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData()[0];
		const requestDataType = (items.json.requestData as any).type as string;
		const chatbots = this.getNodeParameter('chatbots', 0, '') as string;
		var onWebResponseData: INodeExecutionData[] = []
		var onMessageResponseData: INodeExecutionData[] = []
		var response: any[] = []
		if (requestDataType === 'getService') {
			try {
				response = chatbots.split(',').map((chatbot: string) => {
					return {
						"referencia": chatbot.trim(),
						"versao": "0.0.1",
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
