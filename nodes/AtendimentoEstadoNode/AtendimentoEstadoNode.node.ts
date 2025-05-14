import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow'; 

export class AtendimentoEstadoNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Atendimento Estado',
		name: 'atendimentoChatbotEstado',
		group: ['transform'],
		version: 1,
		description: 'Atendimento Estado Node',
		defaults: {
			name: 'Atendimento Estado Node',
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
		const referencia = this.getNodeParameter('referencia', 0, '') as string;
		const returnItem: INodeExecutionData = {
			json: {
				referencia: referencia,
			},
		};
		return [this.helpers.returnJsonArray([returnItem])];
	}
}
