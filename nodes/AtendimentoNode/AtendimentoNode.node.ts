import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class AtendimentoNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Atendimento Node',
		name: 'atendimentoNode',
		group: ['transform'],
		version: 1,
		description: 'Atendimento Node',
		defaults: {
			name: 'Atendimento Node',
		},
		inputs: [{
			type: NodeConnectionType.Main, 
			displayName: "Input",
		},			
        {
			displayName: "User",
			type: NodeConnectionType.Main,
			maxConnections: 1
		}, {
			displayName: "Advisor",
			type: NodeConnectionType.Main,
			maxConnections: 1
		}],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'My String',
				name: 'myString',
				type: 'string',
				default: '',
				placeholder: 'Placeholder value',
				description: 'The description text',
			},
			{
                displayName: 'Chatbots',
                name: 'chatbots', 
                type: 'multiOptions', 
                default: [], 
                description: 'Conecte nós de chatbots ou selecione ferramentas configuradas que este nó pode utilizar.',
                typeOptions: {
                    loadOptionsMethod: 'getAvailableChatbots',
                },
            }
		],
	};

	methods = {
		loadOptions: {
			async getAvailableChatbots(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				// Aqui você implementaria a lógica para buscar ferramentas disponíveis.
				// Por exemplo, poderia listar outros nós no workflow que são "ferramentas",
				// ou ferramentas pré-definidas.
		
				// console.log('getAvailableTools chamado. Implemente a lógica para carregar ferramentas.');
				// Exemplo de retorno (placeholders):
				const tools: INodePropertyOptions[] = [
					{ name: 'Ferramenta Exemplo A (Configurável)', value: 'toolA_config' },
					{ name: 'Ferramenta Exemplo B (Configurável)', value: 'toolB_config' },
				];
					// Exemplo buscando nós (requer implementação mais robusta):
					// const nodes = this.getNodes();
					// const toolNodes = nodes.filter(node => node.type.includes('ToolNode')); // Adapte o filtro
					// ...toolNodes.map(node => ({ name: node.name || node.type, value: node.id || node.name })) // Adapte conforme necessário
					return tools;
			}		
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let item: INodeExecutionData;
		let myString: string;
		let chatbots: string[];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				myString = this.getNodeParameter('myString', itemIndex, '') as string;
				chatbots = this.getNodeParameter('chatbots', itemIndex, []) as string[];
				item = items[itemIndex];

				item.json.myString = myString;
				item.json.chatbots = chatbots;
			} catch (error) {
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					if (error.context) {
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
