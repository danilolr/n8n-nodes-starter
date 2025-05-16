import type {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
import { createClient } from 'redis';

export class TelegramChatNode implements INodeType {

    description: INodeTypeDescription = {
        displayName: 'Telegram Chat',
        name: 'telegramChat',
        group: ['transform'],
        version: 1,
        description: 'Telegram Chat',
        defaults: {
            name: 'TelegramChat',
        },
        credentials: [
            {
                name: 'redis',
                required: true,
            },
        ],
        inputs: [
            {
                type: NodeConnectionType.Main,
            },
        ],
        outputs: [
            {
                type: NodeConnectionType.Main,
            },
        ],
        properties: [
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        this.logger.debug("TelegramChatNode execute");
        const credentials = await this.getCredentials('redis');
        const redisClient = createClient({ url: 'redis://localhost:6379' });
        const returnItem: INodeExecutionData = {
            json: {
                ok: true,
                credentials: credentials
            },
        };
        return [this.helpers.returnJsonArray([returnItem])];
    }
}
