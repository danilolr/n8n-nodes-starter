import type {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow'; 

export class AtendimentoChatbotEstadoNode implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Atendimento Chatbot Estado',
        name: 'atendimentoChatbotEstadoNode',
        group: ['transform'],
        version: 1,
        description: 'Atendimento Chatbot Estado',
        defaults: {
            name: 'Atendimento Chatbot Estado',
        },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
        properties: [
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const input = this.getInputData()[0];
        const returnItem: INodeExecutionData = {
            json: {
                processou: input
            },
        };
        return [this.helpers.returnJsonArray([returnItem])];
    }
}
