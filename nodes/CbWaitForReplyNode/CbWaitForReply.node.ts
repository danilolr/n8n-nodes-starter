import type {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
import { RedisService } from '../TelegramChatNode/redis.util';
import { waitForReply } from '../CbMsgFlushNode/flush_utill';

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
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {        
        const inData = this.getInputData(0)
        const waitData = this.getInputData(1)

        var onOut: INodeExecutionData[] = []
        var onWait: INodeExecutionData[] = []

        this.logger.error("----------------------------------------------------------------------")
        this.logger.error("CbWaitForReply ON START " + JSON.stringify(inData))
        this.logger.error("CbWaitForReply ON WAIT " + JSON.stringify(waitData)) 

        if (inData.length == 1) {
            await waitForReply(this)
            onWait = [{
                json: inData[0].json,
            }]
        }

        if (waitData.length == 1) {
            const workflowId = this.getWorkflow().id
            const credentials = await this.getCredentials('redis')
            const redisService = new RedisService(credentials)
            redisService.connect()
                this.logger.warn("CbWaitForReply ONWAIT PROCESSANDO " + JSON.stringify(waitData) + " ***********************" )
            await redisService.updateChatDataByWorkflowId(workflowId, (data: any) => {
                data.resumeUrl = null
                this.logger.error("CbWaitForReply ONWAIT CALLED " + JSON.stringify(data) + " ***********************" )
                data.resumeMessage = null
                return data
            })
            await redisService.disconnect()
            const body = waitData[0].json.body as any
            onOut = [{
                json: {chatInput:body.texto, tipoMensagem : body.tipoMensagem }
            }]
        }

        return [
            this.helpers.returnJsonArray(onOut),
            this.helpers.returnJsonArray(onWait),
        ]
    }
}
