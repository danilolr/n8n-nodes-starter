import { IExecuteFunctions, INodeExecutionData } from "n8n-workflow"
import { RedisService } from "../TelegramChatNode/redis.util"

export async function processMessages(self: IExecuteFunctions, requestData: any, chatbotsConfig: any, onMessageResponseData: INodeExecutionData[][]) {
    const uuid = requestData.payload.context.uuid
    const workflowId = self.getWorkflow().id
    const credentials = await self.getCredentials('redis')
    const redisService = new RedisService(credentials)
    redisService.connect()

    await redisService.updateChatDataByUuid(uuid, (data: any) => {
        if (data!=null) {

        }
        data.context['workflowId'] = workflowId
        return data
    })
    await redisService.setValue("workflow_" + workflowId, uuid)
    const chatbotName = requestData.payload.context.chatbotName as string;
    self.logger.error("Passando aqui no onMessage" + JSON.stringify(requestData.payload))
    self.logger.error("chatbotsConfig" + JSON.stringify(chatbotsConfig));
    var p = 0
    chatbotsConfig.chatbot.forEach((chatbotEntry: { name: string; version: string }) => {
        self.logger.error("****** chatbotEntry.name: " + chatbotEntry.name + " chatbotName: " + chatbotName)
        if (chatbotEntry.name == chatbotName) {
            self.logger.error("****** chatbotEntry.name FOUND: " + chatbotEntry.name + " chatbotName: " + chatbotName + " p: " + p)
            onMessageResponseData[p] = [{
                json: {
                    "ok": true,
                    "response": requestData.payload
                }                
            }]	
        }
        p++
    })
    await redisService.disconnect()
    self.logger.error("****** chatbotEntry.name ENDS: " + onMessageResponseData)
}