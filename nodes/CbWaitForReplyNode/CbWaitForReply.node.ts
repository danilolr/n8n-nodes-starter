import type {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
import { RedisService } from '../TelegramChatNode/redis.util';

export class CbWaitForReply implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Cb Wait For Reply',
        name: 'cbWaitForReply',
        group: ['transform'],
        version: 1,
        description: 'Wait for a reply to the bot',
        credentials: [
            {
                name: 'redis',
                required: true,
            },
        ],
        defaults: {
            name: 'CbWaitForReply',
        },
        inputs: [{
            type: NodeConnectionType.Main,
            displayName: 'input',
        }, {
            type: NodeConnectionType.Main,
            displayName: 'onWait',
        }],
        outputs: [{
            type: NodeConnectionType.Main,
            displayName: 'out',
        }, {
            type: NodeConnectionType.Main,
            displayName: 'wait',
        }],
        properties: [
            {
                displayName: 'Callback URL',
                name: 'callbackUrl',
                type: 'string',
                default: '{{ $execution.resumeUrl }}',
                placeholder: 'Callback URL',
                description: 'Callback URL to be called when the bot is ready to send a message',
            }
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const inData = this.getInputData(0)
        const waitData = this.getInputData(1)

        var onOut: INodeExecutionData[] = []
        var onWait: INodeExecutionData[] = []

        this.logger.error("CbWaitForReply execute0 " + JSON.stringify(inData) + " " + JSON.stringify(inData.length))
        this.logger.error("CbWaitForReply execute1 " + JSON.stringify(waitData) + " " + JSON.stringify(inData.length))
        const workflowId = this.getWorkflow().id
        const credentials = await this.getCredentials('redis')
        const redisService = new RedisService(credentials)
        redisService.connect()
        if (inData.length == 1) {
            await redisService.updateChatDataByWorkflowId(workflowId, (data: any) => {
                const callbackUrl = this.getNodeParameter('callbackUrl', 0, '') as string
                data.resumeUrl = callbackUrl
                return data
            })
            onWait = [{
                json: inData[0].json,
            }]
        }

        if (waitData.length == 1) {
            var resp = null
            await redisService.updateChatDataByWorkflowId(workflowId, (data: any) => {
                data.resumeUrl = null
                this.logger.error("CbWaitForReply ONWAIT CALLED " + JSON.stringify(data) + " ***********************" )
                resp = data.resumeMessage
                data.resumeMessage = null
                return data
            })
            onOut = [{
                json: {chatInput:resp},
            }]
        }

        await redisService.disconnect()

        return [
            this.helpers.returnJsonArray(onOut),
            this.helpers.returnJsonArray(onWait),
        ]
    }
}
