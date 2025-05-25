import { ICredentialDataDecryptedObject } from 'n8n-workflow'
import { createClient } from 'redis'

export class RedisService {
    
    private redisClient: any;

    constructor(credentials: ICredentialDataDecryptedObject) {
        const redisUrl = `redis://${credentials.user}:${credentials.password}@${credentials.host}:${credentials.port}`;
        this.redisClient = createClient({ url: redisUrl });
        this.redisClient.on('error', (err: any) => console.error('Redis Client Error', err));
        // console.log("Build redis credentials", redisUrl);
    }

    async connect() {
        await this.redisClient.connect()
    }

    async disconnect() {
        await this.redisClient.quit()
    }

    async setValue(key: string, value: string): Promise<void> {
        await this.redisClient.set(key, value)
    }

    async getValue(key: string): Promise<string | null> {
        return this.redisClient.get(key)
    }

    async deleteKey(key: string): Promise<void> {
        await this.redisClient.del(key)
    }

    async updateChatDataByUuid(uuid: string, cb: (data: any) => any) {
        const key = 'chat_' + uuid
		var value = await this.getValue(key) 
        console.error("Workflow VALUE **********************", value)
        if (value != null) {
            value = JSON.parse(value)
        }        
        var newValue = await cb(value)
        console.error("Workflow NEW VALUE **********************", newValue)
        await this.setValue(key, JSON.stringify(newValue))
	}

    async updateChatDataByWorkflowId(workflowId: string | undefined, cb: (data: any) => any) {
        if (!workflowId) {
            console.error("Workflow ID is null **********************")
            return
        }
        const key = 'workflow_' + workflowId
        console.error("Workflow KEY **********************", key)
		var uuid = await this.getValue(key) as string
        console.error("Workflow UUID **********************", uuid)
        await this.updateChatDataByUuid(uuid, cb)
	}

 
}