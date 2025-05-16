/// <reference lib="dom" />

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
        const input = this.getInputData(0)[0] as any

        const credentials = await this.getCredentials('redis');

        const redisUrl = `redis://${credentials.user}:${credentials.password}@${credentials.host}:${credentials.port}`;
        const redisClient = createClient({ url: redisUrl });
        redisClient.on('error', (err: any) => this.logger.error('Redis Client Error', err));

        await redisClient.connect();

        // const setValue = async (key: string, value: string): Promise<void> => {
        //   await redisClient.set(key, value);
        // };

                const deleteKey = async (key: string): Promise<void> => {
          await redisClient.del(key);
        };

        const getValue = async (key: string): Promise<string | null> => {
          return redisClient.get(key);
        };

        const key = 'pending_webhook_' + input.json.message.chat.id 

        const value = await getValue(key);

        if (value) {
            const callbackInfo = JSON.parse(value);
            await fetch(callbackInfo.url);
            await deleteKey(key);
            return [];
        } else {
            const returnItem: INodeExecutionData = {
                json: {
                    ok: true,
                    credentials: credentials,
                    key : key,
                    value: value,
                    input:input,
                    redisUrl:redisUrl
                },
            };
            return [this.helpers.returnJsonArray([returnItem])];    
        }
    }
}
