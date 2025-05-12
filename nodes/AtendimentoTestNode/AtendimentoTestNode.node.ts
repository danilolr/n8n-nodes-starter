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
            }
        ],
        outputs: [NodeConnectionType.Main],
        properties: [
            {
                displayName: 'Run sim',
                name: 'runType',
                type: 'string',
                default: '',
                placeholder: 'getService',
                description: 'Sim to run',

            }
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const runType = this.getNodeParameter('runType', 0, '') as string;
        var requestData: any = {};
        const input = this.getInputData(0)[0]
        var debugInfo = {}

        var sessionId = input.json.sessionId
        if (sessionId) {
            const session = globalSessions[sessionId.toString()]
            if (session) {
                requestData = {
                    "type": "onStartMessage",
                    "payload": {
                        "type": "TEXT",
                        "texto": input.json.chatInput
                    }
                }
                globalSessions[sessionId.toString()] = true
            } else {
                requestData = {
                    "type": "onStartConversation",
                    "payload": {
                        "type": "TEXT",
                        "texto": input.json.chatInput
                    }
                }
            }
        } else if (runType === 'getService') {
            requestData = {
                "type": "getService",
                "payload": {}
            }
        } else if (runType === 'onStartConversation') {
            requestData = {
                "type": "onStartConversation",
                "payload": {
                    "type": "TEXT",
                    "texto": "Bom dia onStartConversation"
                }
            }
        } else if (runType === 'onMessage') {
            requestData = {
                "type": "onMessage",
                "payload": {
                    "type": "TEXT",
                    "texto": "Bom dia onMessage"
                }
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
