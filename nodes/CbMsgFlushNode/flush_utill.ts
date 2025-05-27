import { IExecuteFunctions, IHttpRequestOptions } from "n8n-workflow"
import { RedisService } from "../TelegramChatNode/redis.util"

export async function flushInput(self: IExecuteFunctions) {
    const workflowId = self.getWorkflow().id
    const redisCredentials = await self.getCredentials('redis')
    self.logger.warn("CbMsgAddNode execute workflowId :" + workflowId)        
    const redisService = new RedisService(redisCredentials)
    redisService.connect()

    await redisService.updateChatDataByWorkflowId(workflowId, async (data: any) => {
        const urlCallback = data.ids.urlCallback
        const params = {
            "uuid": data.ids.uuid,
            "params": { 
                "type": "SEND_PENDING_MESSAGE",
                "messages": data.pendingMessages,
            }
        }
        self.logger.warn("**********************************************************")
        self.logger.warn("FLUSHING DATA :" + JSON.stringify(data))
        self.logger.warn("FLUSHING PARAMS :" + JSON.stringify(params))
        self.logger.warn("FLUSHING TO URL :" + JSON.stringify(urlCallback))

        self.logger.warn("CbMsgFlushNode urlCallback :" + urlCallback)
        self.logger.warn("CbMsgFlushNode params :" + JSON.stringify(params))
        if (urlCallback) {
            const options: IHttpRequestOptions = {
                method: 'POST',
                url: urlCallback,
                body: params,
                json: true, 
                headers: { 
                   'Content-Type': 'application/json'
                },
            }
            const resp = await self.helpers.httpRequest(options)
            self.logger.warn("CbMsgFlushNode response :" + JSON.stringify(resp))
        }

        data.pendingMessages = []            
        self.logger.warn("CbMsgFlushNode return OUT redisData :" + JSON.stringify(data))
        return data
    })

    await redisService.disconnect()
}
