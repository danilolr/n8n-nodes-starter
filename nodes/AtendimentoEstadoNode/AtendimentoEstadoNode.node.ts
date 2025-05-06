import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow'; 

export class AtendimentoEstadoNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Atendimento Chatbot Estado',
		name: 'atendimentoChatbotEstado',
		group: ['transform'],
		version: 1,
		description: 'Atendimento Chatbot Estado Node',
		defaults: {
			name: 'Atendimento Chatbot Estado Node',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Referência',
				name: 'referencia',
				type: 'string',
				default: '',
				placeholder: 'Placeholder value',
				description: 'Referência do estado do chatbot',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// This node will now output its configured name, ignoring any input items.
		// This makes it suitable as a configuration provider for the AtendimentoNode's 'chatbots' input.
		const referencia = this.getNodeParameter('referencia', 0, '') as string;

		// It's good practice to ensure a chatbotName is provided.
		// If chatbotName can be empty, this logic might need adjustment based on requirements.
		// For now, we assume chatbotName will be configured.

		const returnItem: INodeExecutionData = {
			json: {
				referencia: referencia,
			},
			// No pairedItem context here as it's generating its own, single item.
		};

		return [this.helpers.returnJsonArray([returnItem])];
	}
}
