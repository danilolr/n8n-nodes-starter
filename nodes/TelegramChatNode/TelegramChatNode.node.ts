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

        const redisClient = createClient({ url: 'redis://root:7b2074cca17c32673f912f03e385886448d363b4a3d1c1c0381229186b29a425@redis-13072.c8.us-east-1-3.ec2.redns.redis-cloud.com:13072' });
        redisClient.on('error', (err) => console.log('Redis Client Error', err));

        await redisClient.connect();

        const setValue = async (key: string, value: string): Promise<void> => {
          await redisClient.set(key, value);
        };

        const getValue = async (key: string): Promise<string | null> => {
          return redisClient.get(key);
        };

        setValue("cefip", "teste");

        const returnItem: INodeExecutionData = {
            json: {
                ok: true,
                credentials: credentials
            },
        };
        return [this.helpers.returnJsonArray([returnItem])];
    }
}
