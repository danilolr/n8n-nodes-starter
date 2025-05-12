import type {
	IExecuteFunctions,
	INodeExecutionData,
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
		description: 'Atendimento Node', // Node's main description
		defaults: {
			name: 'Atendimento Node',
		},
		inputs: [
			{ // Index 0 - Main Input
				type: NodeConnectionType.Main,
				displayName: "Input",
			},
			{ // Index 1 - User Input
				displayName: "User",
				type: NodeConnectionType.AiAgent,
				maxConnections: 1,
			},
			{ // Index 2 - Advisor Input
				displayName: "Advisor",
				type: NodeConnectionType.Main,
				maxConnections: 1,
			},
			{ // Index 3 - Chatbots Input
				displayName: 'Chatbots',
				type: NodeConnectionType.Main,
				maxConnections: 10,
				required: false,
			},
			{
				type: NodeConnectionType.AiLanguageModel,
				displayName: "Model",			
			},

		], // End of inputs array, comma before next property
		outputs: [NodeConnectionType.Main], // End of outputs array, comma before next property
		properties: [
			{
				displayName: 'name',
				name: 'name',
				type: 'string',
				default: '',
				placeholder: 'Placeholder value',
				description: 'The name for this flow', // Property's description
			}
		] // End of properties array, no comma as it's the last property in the description object
	}; // End of description object assignment

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData(0); // Assuming the primary data comes from the first input slot (index 0)

		var model: any = null;

		for (let i = 0; i < 10; i++) {
			try {
				model = await this.getInputConnectionData(NodeConnectionType.Main, i);
				model = {
					ok: true,
					model: model
				}
			} catch (error) {
				this.logger.debug('Error getting input connection data: ' + error + ' for index ' + i);
			}			
		}

		this.logger.debug('ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ');
		this.logger.debug('items 1', this.getInputData(1));

		// Get data from the 'Chatbots' input (index 3)
		// const chatbotConfigs = this.getInputData(3);

		let item: INodeExecutionData;
		// let name: string;

		const allReturnItems: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {			
			try {
				// name = this.getNodeParameter('name', itemIndex, '') as string;
				item = items[itemIndex];
				item.json.teste = "CEFIP";
				item.json.model = model ? "NULO" : JSON.stringify(model);
				this.logger.debug('itemIndex ' + itemIndex + ":" + item);

				if (item.json.tipoChamada === "getService") {
					item.json.response = [{ tipo: "abc" }, { tipo: "def" }];
				}
				if (item.json.tipoChamada === "onMessage") {
					item.json.response = [{ text: "Em que posso ajudar" }];
				}

				// Process chatbot configurations
				// const connectedChatbotData: Array<Record<string, any>> = []; // Changed from string[] to Array<Record<string, any>>
				// if (chatbotConfigs) { // Ensure chatbotConfigs is not undefined
				// 	for (const chatbotItem of chatbotConfigs) { // Iterate directly over items
				// 		if (chatbotItem.json) { // Check if json payload exists
				// 			// Push the entire json object from the chatbot node's output
				// 			connectedChatbotData.push(chatbotItem.json);
				// 		}
				// 	}
				// }
				// item.json.connectedChatbots = connectedChatbotData; // Assign the array of objects
				allReturnItems.push(item);

			} catch (error) {
				if (this.continueOnFail()) {
					allReturnItems.push({ json: (items[itemIndex]?.json || {}), error, pairedItem: itemIndex });
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
		return [allReturnItems];
	}

}
