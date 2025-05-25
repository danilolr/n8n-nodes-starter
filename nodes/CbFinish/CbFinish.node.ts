import type {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow'
import { NodeConnectionType } from 'n8n-workflow'
import { RedisService } from '../TelegramChatNode/redis.util'
import { flushInput } from '../CbMsgFlushNode/flush_utill';

export class CbFinish implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Cb Finish',
        name: 'cbFinish',
        group: ['transform'],
        version: 1,
        description: 'Finish',
		credentials: [
            {
                name: 'redis',
                required: true,
            },
        ],
        defaults: {
            name: 'CbFinishNode',
        },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
        properties: [
            {
                displayName: 'Send imediately',
                name: 'imediate',
                type: 'boolean',
                default: true,
                description: 'Send message immediately',
            }
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const imediate = this.getNodeParameter('imediate', 0, '') as boolean
        
		const workflowId = this.getWorkflow().id

        this.logger.warn("CbFinishNode execute workflowId :" + workflowId)        
        const credentials = await this.getCredentials('redis')
        const redisService = new RedisService(credentials)
        redisService.connect()

        await redisService.updateChatDataByWorkflowId(workflowId, (data: any) => {
            this.logger.warn("CbFinishNode received OUT redisData :" + data)
            return data
        })

        await redisService.disconnect()

        if (imediate) {
            await flushInput(this)
        }

        return [this.getInputData(0)]
    }
}
