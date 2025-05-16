import type {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow'; 

async function executeProbe(input: any): Promise<any> {
    return input;    
}

export class AtendimentoMensagemTextoNode implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Mensagem Texto',
        name: 'atendimentoMensagemTexto',
        group: ['transform'],
        version: 1,
        description: 'Mensagem Texto',
        defaults: {
            name: 'MensagemTexto',
        },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
        properties: [
            {
                displayName: 'Mensagem',
                name: 'mensagem',
                type: 'string',
                default: '',
                placeholder: 'Texto da mensagem',
                description: 'Criar mensagem de texto',
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const input = this.getInputData()[0].json as any;        
        let response = null;
        if (input.call.type == "probe") {
            response = await executeProbe(input);
        } else {
            const mensagem = this.getNodeParameter('mensagem', 0, '') as string;
            if (input.messages) {
                input.messages.push({
                    type: "TEXTO",
                    texto: mensagem
                });
            }
            response = input;
        }
        const returnItem: INodeExecutionData = {
            json: response,
        };
        return [this.helpers.returnJsonArray([returnItem])];
    }
}

