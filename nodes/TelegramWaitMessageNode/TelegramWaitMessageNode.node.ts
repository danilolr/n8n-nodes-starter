/// <reference lib="dom" />

import type {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

export class TelegramWaitMessageNode implements INodeType {

    description: INodeTypeDescription = {
        displayName: 'Telegram Wait Message',
        name: 'telegramWaitMessage',
        group: ['transform'],
        version: 1,
        description: 'Wait Message',
        defaults: {
            name: 'Wait Message',
        },
        credentials: [
            {
                name: 'redis',
                required: true,
            },
        ],
		inputs: [{
			type: NodeConnectionType.Main
		},{
			type: NodeConnectionType.Main,
			displayName: 'callbackStart',
		}, ],
        outputs: [
            {
                type: NodeConnectionType.Main,
                displayName: 'onMessage',
            },
            {
                type: NodeConnectionType.Main,
                displayName: 'onStart',
            },
        ],
        properties: [
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        return [this.getInputData(0)];
    }
}
