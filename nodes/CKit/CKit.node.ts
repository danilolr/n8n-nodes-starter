import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow'
import { CKitMemory } from './ckit_memory';
import { MessageData } from './ckit_model';

export class CKit implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CKit',
		name: 'cKit',
		group: ['transform'],
		version: 1,
		description: 'CKit',
		defaults: {
			name: 'CKit',
		},
		inputs: [
			{
				type: NodeConnectionType.Main,
				displayName: "onWebhook",
			},
			{
				type: NodeConnectionType.Main,
				displayName: "onCallback",
			},
		],
		outputs: [
			{
				type: NodeConnectionType.Main,
				displayName: "onWebResponse",
			},
			{
				type: NodeConnectionType.Main,
				displayName: "onChatbot",
			},
			{
				type: NodeConnectionType.Main,
				displayName: "onError",
			},
			{
				type: NodeConnectionType.Main,
				displayName: "onCallback",
			},
		],
		properties: [
		]
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const inputWebhook = this.getInputData(0)[0] as any
		const inputCallback = this.getInputData(1)[0] as any

		var onWebResponse: INodeExecutionData[] = []
		var onChatbot: INodeExecutionData[] = []
		var onError: INodeExecutionData[] = []
		var onCallback: INodeExecutionData[] = []

		if (inputWebhook && inputWebhook.json) {
			this.logger.info("Processing webhook input: " + JSON.stringify(inputWebhook.json))
			const requestType = inputWebhook.json?.body?.type
			this.logger.error("requestType: " + requestType)

			if (requestType == "getService") {
				var resp = processGetService(this)
				this.logger.error("return processGetService" + JSON.stringify(resp))
				if (resp.onWebResponse) {
					onWebResponse = resp.onWebResponse
				}
				if (resp.onCallback) {
					onCallback = resp.onCallback
				}
				if (resp.onChatbot) {
					onChatbot = resp.onChatbot
				}
				this.logger.error("onChatbot: " + JSON.stringify(onChatbot) + " length: " + onChatbot.length)
			}
			if (requestType == "onStartConversation" || requestType === 'onMessage') {
				const paramContext = inputWebhook.json?.body.payload.context
				const chatbotName = paramContext.chatbotName
				CKitMemory.getInstance().addConversation(this, paramContext.uuid, paramContext.refCliente, paramContext.identificadorUsuario, paramContext.identificadorUsuario, paramContext.tipoCanalComunicacao, paramContext.urlCallback)
				this.logger.error("BUILD MESSAGE: " + JSON.stringify(inputWebhook.json?.body))
				const message: MessageData = new MessageData("TEXT", inputWebhook.json?.body.payload.param.mensagem)
				onChatbot = processOnStartConversation(this, chatbotName, message)
				onWebResponse = [
					{
						json: {
							"ok": true,
							"response": {
								"ok": true,
								"mensagem": []
							},
							"workflowId": this.getWorkflow().id,
							"callbackUrl": this.evaluateExpression('{{ $execution?.resumeUrl }}', 0) as string
						}
					}
				]
			}
		}
		if (inputCallback && inputCallback.json) {
			this.logger.info("Processing callback input: " + JSON.stringify(inputCallback.json))
			onWebResponse = processResponseGetService(this)
		}
		this.logger.warn("RESPONSE -> onWebResponse: " + JSON.stringify(onWebResponse) + " length: " + onWebResponse.length)
		this.logger.warn("RESPONSE -> onChatbot: " + JSON.stringify(onChatbot) + " length: " + onChatbot.length)
		this.logger.warn("RESPONSE -> onError: " + JSON.stringify(onError) + " length: " + onError.length)
		this.logger.warn("RESPONSE -> onCallback: " + JSON.stringify(onCallback) + " length: " + onCallback.length)
		return [onWebResponse, onChatbot, onError, onCallback]
	}

}

function processResponseGetService(self: IExecuteFunctions): INodeExecutionData[] {
	const chatbots = CKitMemory.getInstance().getChatbots()
	const response = chatbots.map(chatbot => ({
		"referencia": chatbot.name.trim(),
		"versao": chatbot.version.trim(),
		"tipo": "CHATBOT"
	}))
	self.logger.info("Processing callback input chatbots : " + JSON.stringify(chatbots))
	return [{
		json: {
			"ok": true,
			"response": response
		}
	}]
}

function processOnStartConversation(self: IExecuteFunctions, chatbotName: string, message: MessageData): INodeExecutionData[] {
	self.logger.error("processOnStartConversation ")
	return [{
		json: {
			"msgType": "executeChatbot",
			"chatbotName": chatbotName,
			"message": {
				"msgType": message.msgType,
				"text": message.text,
			},
		}
	}]
}

function processGetService(self: IExecuteFunctions): { onWebResponse: INodeExecutionData[], onChatbot: INodeExecutionData[], onCallback: INodeExecutionData[] } {
	const chatbots = CKitMemory.getInstance().getChatbots()
	var onWebResponse: INodeExecutionData[] = []
	var onChatbot: INodeExecutionData[] = []
	var onCallback: INodeExecutionData[] = []
	self.logger.error("processGetService called with chatbots: " + chatbots.length)
	if (chatbots.length > 0) {
		self.logger.error("**** IRA BUSCAR DO CACHE: ")
		onWebResponse = processResponseGetService(self)
		self.logger.error("**** RESULTADO CACHE: ", onWebResponse)
	} else {
		self.logger.error("No chatbots found in CKitMemory - will search")
		onChatbot = [{
			json: {
				"msgType": "queryChatbot",
			}
		}]
		onCallback = [{
			json: {
				"msgType": "queryChatbot",
			}
		}]
	}
	return { onWebResponse, onChatbot, onCallback }
}

