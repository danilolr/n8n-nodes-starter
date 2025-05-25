import type {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow'
import { NodeConnectionType } from 'n8n-workflow'
import { flushInput } from './flush_utill'

export class CbMsgFlushNode implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Cb Message Flush',
        name: 'cbMsgFlushNode',
        group: ['transform'],
        version: 1,
        description: 'Send pending messages to the bot',
        credentials: [
            {
                name: 'redis',
                required: true,
            },
        ],
        defaults: {
            name: 'CbMsgFlush',
        },
        inputs: [{
            type: NodeConnectionType.Main,
        }],
        outputs: [{
            type: NodeConnectionType.Main,
        }],
        properties: [
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const inData = this.getInputData(0)
        
        this.logger.error("CbMsgFlushNode execute0 " + JSON.stringify(inData) + " " + JSON.stringify(inData.length))

        await flushInput(this)

        return [this.getInputData(0)]
    }
}

