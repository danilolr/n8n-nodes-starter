import { createClient } from 'redis';

export class RedisService {
    private redisClient: any;

    constructor(redisUrl: string) {
        this.redisClient = createClient({ url: redisUrl });
        this.redisClient.on('error', (err: any) => console.error('Redis Client Error', err));
    }

    async connect() {
        await this.redisClient.connect();
    }

    async disconnect() {
        await this.redisClient.quit();
    }

    async setValue(key: string, value: string): Promise<void> {
        await this.redisClient.set(key, value);
    }

    async getValue(key: string): Promise<string | null> {
        return this.redisClient.get(key);
    }

    async deleteKey(key: string): Promise<void> {
        await this.redisClient.del(key);
    }

        // const setValue = async (key: string, value: string): Promise<void> => {
        //   await redisClient.set(key, value);
        // };

        // const deleteKey = async (key: string): Promise<void> => {
        //     await redisClient.del(key);
        //   };
  
        //   const getValue = async (key: string): Promise<string | null> => {
        //     return redisClient.get(key);
        //   };
  
}