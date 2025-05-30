import type {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

export class AtendimentoChatbotDemoEchoNode implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Atendimento Chatbot Echo',
        name: 'atendimentoChatbotDemoEchoNode',
        group: ['transform'],
        version: 1,
        description: 'Atendimento Chatbot Demo Echo',
        defaults: {
            name: 'Atendimento Chatbot Demo Echo',
        },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
        properties: [
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const input = this.getInputData()[0] as any
        const texto = input.json.response.param.mensagem.trim()
        var response
        if (texto.toUpperCase().indexOf("ENCERRAR") != -1) {
            response = {
                ok: true,
                encerra: true,
                mensagem: [
                    {
                        tipo: "TEXTO",
                        texto: "Echo : " + texto,
                    },
                    {
                        tipo: "TEXTO",
                        texto: "Conversa encerrada",
                    }
                ]
            }
        } else if (texto.toUpperCase().indexOf("ATENDENTE") != -1) {
            response = {
                ok: true,
                transferencia: {},
                mensagem: [
                    {
                        tipo: "TEXTO",
                        texto: "Echo : " + texto,
                    },
                    {
                        tipo: "TEXTO",
                        texto: "Transferindo para atendente",
                    }
                ]
            }
        } else {
            response = {
                ok: true,
                mensagem: [
                    {
                        tipo: "TEXTO",
                        texto: "Echo bot : " + texto + " - v0.0.2",
                    }
                ]
            }
        }
        const returnItem: INodeExecutionData = {
            json: {
                ok: true,
                response: response
            },
        };
        return [this.helpers.returnJsonArray([returnItem])];
    }
}
