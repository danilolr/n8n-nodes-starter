import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow'
import { CKitMemory } from '../CKit/ckit_memory';
import { cflushInput } from '../CKit/ckit_util';

export class CKitMsg implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CKitMsg',
		name: 'cKitMsg',
		group: ['transform'],
		version: 1,
		description: 'CKitMsg',
		defaults: {
			name: 'CKitMsg',
		},
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
            {
                displayName: 'Message',
                name: 'message',
                type: 'string',
                default: '',
                placeholder: 'Message text',
                description: 'Message text to be send',
            },
            {
                displayName: 'Send imediately',
                name: 'imediate',
                type: 'boolean',
                default: true,
                description: 'Send message immediately',
            }
        ],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const input = this.getInputData()[0].json as any
		const message = this.getNodeParameter('message', 0, '') as string
		const imediate = this.getNodeParameter('imediate', 0, '') as boolean
		
		const conversation = CKitMemory.getInstance().getCurrentConversation(this)
		if (!conversation) {
			this.logger.error("CKitMsg: No conversation found")
			return [this.getInputData(0)]
		}

		conversation.addTextMessage(input.message.msgType, message)

		if (imediate) {
			await cflushInput(this)
		}

		return [this.getInputData(0)]
	}

}