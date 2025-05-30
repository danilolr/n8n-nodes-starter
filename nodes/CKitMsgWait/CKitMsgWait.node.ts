import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow'
import { CKitMemory } from '../CKit/ckit_memory';
import { cflushInput } from '../CKit/ckit_util';

export class CKitMsgWait implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CKitMsgWait',
		name: 'cKitMsgWait',
		group: ['transform'],
		version: 1,
		description: 'CKitMsgWait',
		defaults: {
			name: 'CKitMsgWait',
		},
		inputs: [
			{
				type: NodeConnectionType.Main,
				displayName: "in",
			},
			{
				type: NodeConnectionType.Main,
				displayName: "onWait",
			},
		],
		outputs: [
			{
				type: NodeConnectionType.Main,
			},
			{
				type: NodeConnectionType.Main,
				displayName: "wait",
			},
		],
		properties: [
            {
                displayName: 'Message',
                name: 'message',
                type: 'string',
                default: '',
                placeholder: 'Message text',
                description: 'Message text to be send',
            }
        ],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const input = this.getInputData()[0].json as any
		const message = this.getNodeParameter('message', 0, '') as string
		
		const conversation = CKitMemory.getInstance().getCurrentConversation(this)
		if (!conversation) {
			this.logger.error("CKitMsg: No conversation found")
			return [this.getInputData(0)]
		}

		conversation.addTextMessage(input.message.msgType, message)

        await cflushInput(this)

		return [this.getInputData(0)]
	}

}