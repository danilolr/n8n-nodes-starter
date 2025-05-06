import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

export class AtendimentoChatbotNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Atendimento Chatbot Node',
		name: 'atendimentoChatbotNode',
		group: ['transform'],
		version: 1,
		description: 'Atendimento Chatbot Node',
		defaults: {
			name: 'Atendimento Chatbot Node',
		},
		inputs: [
			{
				type: NodeConnectionType.Main,
				displayName: "Entrypoint",
			},
			{
				type: NodeConnectionType.Main,
				displayName: "Start state",
			}
		],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Name',
				name: 'chatbotName',
				type: 'string',
				default: '',
				placeholder: 'Placeholder value',
				description: 'Chatbot name',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// This node will now output its configured name, ignoring any input items.
		// This makes it suitable as a configuration provider for the AtendimentoNode's 'chatbots' input.
		const chatbotName = this.getNodeParameter('chatbotName', 0, '') as string;

		const returnItem: INodeExecutionData = {
			json: {
				chatbotName: chatbotName,
			},
		};

		return [this.helpers.returnJsonArray([returnItem])];
	}
}
