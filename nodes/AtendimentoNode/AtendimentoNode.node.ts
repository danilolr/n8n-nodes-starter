import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeParameters,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow'
import { processMessages } from './process.message'

const configuredOutputs = (parameters: INodeParameters) => {
	var outputs = [
		{
			type: NodeConnectionType.Main,
			displayName: "onWebResponse",
		},
		{
			type: NodeConnectionType.Main,
			displayName: "onError",
		},
	]
	if (parameters.chatbots) {
		(parameters.chatbots as any).chatbot.forEach((chatbot: any) => {
			outputs.push({
				type: NodeConnectionType.Main,
				displayName: chatbot.outputName == null ? `onMessage ${chatbot.name}` : chatbot.outputName,
			});
		});
	}
	return outputs
}

export class AtendimentoNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Atendimento',
		name: 'atendimentoNode',
		group: ['transform'],
		version: 1,
		description: 'Atendimento Node',
		defaults: {
			name: 'Atendimento',
		},
		credentials: [
			{
				name: 'redis',
				required: true,
			},
		],
		inputs: [
			{
				type: NodeConnectionType.Main,
				displayName: "Input",
			},
		],
		outputs: `={{(${configuredOutputs})($parameter)}}`,
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
							{
								displayName: 'Output Name',
								name: 'outputName',
								type: 'string',
								default: 'on',
								description: 'Output name for the chatbot',
							},
						],
					},
				],
			},
		]
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData()[0];
		const requestData = ((items.json.requestData != null) ? items.json.requestData : items.json.body) as { type: string; payload: any };
		this.logger.error("REQUEST DATA : " + JSON.stringify(requestData));
		const requestDataType = requestData.type as string;
		const chatbotsConfig = this.getNodeParameter('chatbots', 0, { chatbot: [] }) as { chatbot: Array<{ name: string; version: string }> };
		var onWebResponseData: INodeExecutionData[] = []
		var onError: INodeExecutionData[] = []
		var onMessageResponseData: INodeExecutionData[][] = []
		chatbotsConfig.chatbot.forEach((chatbotEntry: { name: string; version: string }) => {
			onMessageResponseData.push([])
		})

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
			}]
		} else if (requestDataType === 'onStartConversation' || requestDataType === 'onMessage') {
			await processMessages(this, requestData, chatbotsConfig, onMessageResponseData)
			onWebResponseData = [{
				json: {
					"ok": true,
					"response":
					{
						"ok": true,
						"mensagem": []
					}
				}
			}];
		}
		return [
			this.helpers.returnJsonArray(onWebResponseData),
			this.helpers.returnJsonArray(onError),
			...onMessageResponseData
		]
	}

}