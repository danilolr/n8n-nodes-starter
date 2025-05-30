import type {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow'
import { NodeConnectionType } from 'n8n-workflow'
import { addTextMessage as addTextMessage2, flushInput as flushInput2 } from '../CbMsgFlushNode/flush_utill'

export class CbMsgAddNode implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Cb Message Add',
        name: 'cbMsgAdd',
        group: ['transform'],
        version: 1,
        description: 'Add message to be send by the bot',
		credentials: [
            {
                name: 'redis',
                required: true,
            },
        ],
        defaults: {
            name: 'CbMsgAddNode',
        },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
        properties: [
            {
                displayName: 'Message',
                name: 'message',
                type: 'string',
                default: '',
                placeholder: 'Message text',
                description: 'Message text to be added',
            },
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
        const message = this.getNodeParameter('message', 0, '') as string
        const imediate = this.getNodeParameter('imediate', 0, '') as boolean
        
        this.logger.warn("CbMsgAddNode execute message :" + message + " imediate :" + imediate)

        await addTextMessage2(this, message)

        if (imediate) {
            await flushInput2(this)
        }

        return [this.getInputData(0)]
    }
}
