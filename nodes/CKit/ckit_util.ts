import { IExecuteFunctions, IHttpRequestOptions } from "n8n-workflow"
import { CKitMemory } from "./ckit_memory"

export async function cflushInput(self: IExecuteFunctions) {
    const workflowId = self.getWorkflow().id
    const conversation = CKitMemory.getInstance().getCurrentConversation(self)
    if (!conversation) {
        self.logger.error("No current conversation found for workflowId: " + workflowId)
        return    
    }
    const pendingMessages = conversation.getPendingMessages()
    const urlCallback = conversation.urlCallback
    const params = {
        "uuid": conversation.uuid,
        "params": { 
            "type": "SEND_PENDING_MESSAGE",
            "messages": pendingMessages.map((msg) => {
                    return { tipo: "TEXTO", texto: msg.text }
            })
        }
    }

    self.logger.error("**********************************************************")
    self.logger.error("FLUSHING DATA :" + urlCallback +":"+ JSON.stringify(params))

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
        self.logger.warn("flushInput response :" + JSON.stringify(resp))
    }

    conversation.clearPendingMessages()

}
