import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeParameters,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

const configuredOutputs = (parameters: INodeParameters) => {
	var outputs = [
	]
	outputs.push({
		type: NodeConnectionType.Main,
		displayName: "onStart",
	});
	outputs.push({
		type: NodeConnectionType.Main,
		displayName: "onNone",
	});
	if (parameters.estados) {
		(parameters.estados as any).estado.forEach((estado: any) => {
			outputs.push({
				type: NodeConnectionType.Main,
				displayName: estado.outputName == null || estado.outputName == "" ? `onOption${estado.key}` : estado.outputName,
			});
		});
	}
	return outputs
}

export class TelegramMenuNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Telegram Menu',
		name: 'telegramMenu',
		group: ['transform'],
		version: 1,
		description: 'Telegram Menu',
		defaults: {
			name: 'Telegram Menu',
		},
		credentials: [
            {
                name: 'redis',
                required: true,
            },
        ],
		inputs: [{
			type: NodeConnectionType.Main,
			displayName: 'callbackStart',
		}, {
			type: NodeConnectionType.Main
		}],
		outputs: `={{(${configuredOutputs})($parameter)}}`,
		properties: [
			{
				displayName: 'Prompt menu',
				name: 'promptMenu',
				type: 'string',
				default: 'Selecione uma opção',
				placeholder: 'Prompt',
				description: 'Prompt do a ser mostrado para o usuário',
			},
			{
				displayName: 'Estados',
				name: 'estados',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				default: { chatbot: [] },
				placeholder: 'Adicionar opcão menu',
				description: 'Adiciona opção menu',
				options: [
					{
						name: 'estado',
						displayName: 'Estado',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
								description: 'Opção digitada',
							},
							{
								displayName: 'Texto',
								name: 'texto',
								type: 'string',
								default: '',
								description: 'Texto do menu (Selecione esta opção para ...)',
							},
							{
								displayName: 'Nome saída',
								name: 'outputName',
								type: 'string',
								default: '',
								description: 'Nome da saída',
							},
						],
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const inputCallbackStart = this.getInputData(0)[0] as any
		const input = this.getInputData(1)[0] as any

		var onOptions: INodeExecutionData[][] = []
		var onNone: INodeExecutionData[] = []
		var onStart: INodeExecutionData[] = []

		const menuConfig = this.getNodeParameter('estados', 0, { estado: [] }) as { estado: Array<{ key: string; texto: string; outputName: string }> };
		const promptMenu = this.getNodeParameter('promptMenu', 0) as string;

		var textoStart = promptMenu + "\n\n"

		menuConfig.estado.forEach((estadoEntry: { key: string; texto: string; outputName: string }) => {
			onOptions.push([])
			textoStart = textoStart + "\n" + estadoEntry.key + " - " + estadoEntry.texto
		})

		console.log("********************************************************************");
		console.log("********************************************************************");
		console.log("********************************************************************");
		console.log("inputCallbackStart", inputCallbackStart);
		console.log("input", input);
		if (inputCallbackStart) {
			var p = 0
			var valida = false
			const resposta = "3"
			menuConfig.estado.forEach((estadoEntry: { key: string; texto: string; outputName: string }) => {
				if (estadoEntry.key == resposta) {
					onOptions[p] = [{
						json: {
							"ok": true,
							"response": "XXXXXXXXXXX"
						}
					}];		
					valida = true
				}
				p++
			})
			if (valida == false) {
				onNone = [{
					json: {
						"ok": false,
						"response": "Opção inválida"
					}
				}]
			}
		} else {
			onStart = [{
				json: {
					"ok": true,
					"response": textoStart
				}
			}]
		}
		return [
			this.helpers.returnJsonArray(onStart),
			this.helpers.returnJsonArray(onNone),
			...onOptions,
		]
	}
}
