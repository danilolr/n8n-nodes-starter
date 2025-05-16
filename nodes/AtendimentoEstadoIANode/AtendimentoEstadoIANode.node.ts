import type {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow'; 

export class AtendimentoEstadoIANode implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Estado IA',
        name: 'atendimentoEstadoIANode',
        group: ['transform'],
        version: 1,
        description: 'Estado IA',
        defaults: {
            name: 'Estado IA',
        },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
        properties: [
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const input = this.getInputData()[0].json as any;        
        const returnItem: INodeExecutionData = {
            json: input,
        };
        return [this.helpers.returnJsonArray([returnItem])];
    }
}
