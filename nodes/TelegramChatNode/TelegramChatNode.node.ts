/// <reference lib="dom" />

import type {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
import { RedisService } from './redis.util';

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
        const input = this.getInputData(0)[0] as any

        const credentials = await this.getCredentials('redis');

        const redisUrl = `redis://${credentials.user}:${credentials.password}@${credentials.host}:${credentials.port}`;
        const redisService = new RedisService(redisUrl);
        redisService.connect();

        console.log("Conectado ao Redis:", redisUrl);

        const key = 'pending_webhook_' + input.json.message.chat.id 

        const value = await redisService.getValue(key);

        redisService.disconnect();
        if (value) {
            const callbackInfo = JSON.parse(value);
            await fetch(callbackInfo.url);
            await redisService.deleteKey(key);
            return [];
        } else {
            return [this.getInputData(0)];
        }
    }
}
