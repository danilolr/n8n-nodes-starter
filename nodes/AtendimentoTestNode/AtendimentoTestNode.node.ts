import type {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

var globalSessions: { [key: string]: any } = {};

export class AtendimentoTestNode implements INodeType {


    description: INodeTypeDescription = {
        displayName: 'Atendimento Test',
        name: 'atendimentoTest',
        group: ['transform'],
        version: 1,
        description: 'Atendimento Test',
        defaults: {
            name: 'Atendimento Test',
        },
        inputs: [
            {
                type: NodeConnectionType.Main,
            },
			// {
			// 	type: NodeConnectionType.AiMemory,
			// 	displayName: "memory",
			// },
        ],
        outputs: [
            {
                type: NodeConnectionType.Main,
            },
        ],
        properties: [
            {
                displayName: 'Run sim',
                name: 'runType',
                type: 'options',
                options: [
                    {
                        name: 'Get Service',
                        value: 'getService',
                    },
                    {
                        name: 'Get Conselheiro',
                        value: 'getConselheiro',
                    },
                ],
                default: 'getService',
                description: 'Sim to run',
            },
            {
                displayName: 'Client Reference',
                name: 'refCliente',
                type: 'string',
                default: '',
                placeholder: 'demonstracao',
                description: 'Client reference',

            },
            {
                displayName: 'Channel User ID',
                name: 'channelUserId',
                type: 'string',
                default: '',
                placeholder: '5548988010101',
                description: 'Channel User ID',
            },
            {
                displayName: 'Communication Channel Type',
                name: 'communicationChannelType',
                type: 'options',
                options: [
                    {
                        name: 'Whatsapp',
                        value: 'WHATSAPP',
                    },
                    {
                        name: 'Telegram',
                        value: 'TELEGRAM',
                    },
                ],
                default: 'WHATSAPP',
                description: 'Channel type',
            }
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        // const subNodeData = await this.getInputConnectionData(NodeConnectionType.AiMemory, 1); 
        const runType = this.getNodeParameter('runType', 0, '') as string;
        const refCliente = this.getNodeParameter('refCliente', 0, '') as string;
        const communicationChannelType = this.getNodeParameter('communicationChannelType', 0, '') as string;
        var channelUserId = this.getNodeParameter('channelUserId', 0, '') as string;
        var requestData: any = {};
        const input = this.getInputData(0)[0]
        var debugInfo = {} //hasSubNodeData: subNodeData!=null

        var sessionId = input.json.sessionId
        if (sessionId) {
            const session = globalSessions[sessionId.toString()]
            if (session) {
                requestData = {
                    "type": "onStartMessage",
                    "payload": {
                        "context":
                        {
                            "identifadorUsuarioCanal": channelUserId,
                            "refCliente": refCliente,
                            "tipoCanalComunicacao": communicationChannelType,
                            "uuidConversa": sessionId,
                            "variables": {}
                        },
                        "param": {
                            "type": "TEXT",
                            "texto": input.json.chatInput
                        }
                    }
                }
                globalSessions[sessionId.toString()] = true
            } else {
                requestData = {
                    "type": "onStartConversation",
                    "payload": {
                        "context":
                        {
                            "identifadorUsuarioCanal": channelUserId,
                            "refCliente": refCliente,
                            "tipoCanalComunicacao": communicationChannelType,
                            "uuidConversa": sessionId,
                            "variables": {}
                        },
                        "param": {
                            "type": "TEXT",
                            "texto": input.json.chatInput
                        }
                    }
                }
            }
        } else if (runType === 'getService') {
            requestData = {
                "type": "getService",
                "payload": {}
            }
        } else {
            requestData = { "tipo": "erro" }
        }

        const returnItem: INodeExecutionData = {
            json: {
                referencia: runType,
                requestData: requestData,
                input: input,
                debugInfo: debugInfo
            },
        };

        return [this.helpers.returnJsonArray([returnItem])];
    }
}
