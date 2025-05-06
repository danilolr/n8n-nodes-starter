import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow'; 

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
		inputs: [NodeConnectionType.Main],
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
		const items = this.getInputData();

		let item: INodeExecutionData;
		let chatbotName: string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			// const chatbotName = this.getNodeParameter('name', 0, '') as string;

			// // Cria o objeto de dados de saída.
			// // É crucial que a propriedade 'name' esteja presente no objeto 'json',
			// // pois o nó 'atendimento' dependerá dela.
			// const returnItem: INodeExecutionData = {
			// 	json: {
			// 		name: chatbotName,
			// 	},
			// };
	
			// // Retorna os dados formatados corretamente usando o helper do n8n.
			// // O array externo representa a saída 'main', e o interno contém o único item de dados.
			// return [this.helpers.returnJsonArray([returnItem])];			
			try {
				chatbotName = this.getNodeParameter('chatbotName', itemIndex, '') as string;
				item = items[itemIndex];

				item.json.chatbotName = chatbotName;


			} catch (error) {
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					// Adding `itemIndex` allows other workflows to handle this error
					if (error.context) {
						// If the error thrown already contains the context property,
						// only append the itemIndex
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [items];
	}
}
