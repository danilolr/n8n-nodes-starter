import type {
    IExecuteFunctions,
    INodeExecutionData,
    INodeTypeDescription,
} from 'n8n-workflow'
import { Node } from 'n8n-workflow'
import { NodeConnectionType } from 'n8n-workflow'

export class TelegramWaitMessageNode extends Node {

    description: INodeTypeDescription = {
        displayName: 'Telegram Wait Message',
        name: 'telegramWaitMessage',
        group: ['transform'],
        version: 1,
        description: 'Wait Message',
        defaults: {
            name: 'Wait Message',
        },
		inputs: [{
			type: NodeConnectionType.Main
		} ],
        outputs: [
            {
                type: NodeConnectionType.Main,
            },
        ],
        properties: [
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const WAIT_INDEFINITELY = new Date('3000-01-01T00:00:00.000Z');
		await this.putExecutionToWait(WAIT_INDEFINITELY);
		return [this.getInputData()];
    }
}
