import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeParameters,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
import { addTextMessage, flushInput, waitForReply } from '../CbMsgFlushNode/flush_utill';

const configuredOutputs = (parameters: INodeParameters) => {
	var outputs = [
	]
	outputs.push({
		type: NodeConnectionType.Main,
		displayName: "onWait",
	})
	if (parameters.estados) {
		(parameters.estados as any).estado.forEach((estado: any) => {
			outputs.push({
				type: NodeConnectionType.Main,
				displayName: estado.outputName == null || estado.outputName == "" ? `onOption${estado.key}` : estado.outputName,
			});
		});
	}
	outputs.push({
		type: NodeConnectionType.Main,
		displayName: "onNone",
	});
	return outputs
}

export class AtendimentoEstadoMenuNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Estado Menu',
		name: 'atendimentoEstadoMenu',
		group: ['transform'],
		version: 1,
		description: 'Estado Menu',
		defaults: {
			name: 'Estado Menu',
		},
		credentials: [
			{
				name: 'redis',
				required: true,
			},
		],
		inputs: [{
			type: NodeConnectionType.Main,
			displayName: 'inWait',
		}, {
			type: NodeConnectionType.Main,
			displayName: 'inStart',
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
				displayName: 'Mensagem entrada',
				name: 'mensagemEntrada',
				type: 'string',
				default: 'Mensagem ao entrar no estado',
				placeholder: 'Mensagem',
				description: 'Mensagem a ser mostrada ao entrar no estado',
			},
			{
				displayName: 'Mensagem opcão invalida',
				name: 'mensagemOpcaoInvalida',
				type: 'string',
				default: 'Escolha uma opção válida',
				placeholder: 'Escolha uma opção válida',
				description: 'Mensagem a ser mostrada quando o usuário escolhe uma opção inválida',
			},
			{
				displayName: 'Mensagem tipo mensagem incorreta',
				name: 'mensagemTipoMensagemIncorreta',
				type: 'string',
				default: 'Você deve digitar uma mensagem com a opcão válida',
				placeholder: 'Mensagem quando o usuário envia uma mensagem que não é de texto',
				description: 'Mensagem quando o usuário envia uma mensagem que não é de texto',
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
		const inputWait = this.getInputData(0)[0] as any
		const inputStart = this.getInputData(1)[0] as any
		const menuConfig = this.getNodeParameter('estados', 0, { estado: [] }) as { estado: Array<{ key: string; texto: string; outputName: string }> };

		var onOptions: INodeExecutionData[][] = []
		var onNone: INodeExecutionData[] = []
		var onWait: INodeExecutionData[] = []
		if (inputWait && inputWait.json) {
			this.logger.warn("AtendimentoEstadoMenuNode execute inputWait :" + JSON.stringify(inputWait.json))
			const resposta = inputWait.json.body.texto
			this.logger.error("OPCAO :" + resposta)
			var p = 0
			var valida = false
			menuConfig.estado.forEach((estadoEntry: { key: string; texto: string; outputName: string }) => {
				this.logger.error("ESTADO :" + JSON.stringify(estadoEntry))
				if (estadoEntry.key == resposta) {
					onOptions[p] = [{
						json: {
							"ok": true,
							// "response": estadoEntry.texto
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
			this.logger.warn("AtendimentoEstadoMenuNode execute inputWait is empty")
		}
		if (inputStart && inputStart.json) {
			this.logger.warn("AtendimentoEstadoMenuNode execute inputStart :" + JSON.stringify(inputStart.json))
			const mensagemEntrada = this.getNodeParameter('mensagemEntrada', 0, '') as string;
			const promptMenu = this.getNodeParameter('promptMenu', 0, '') as string;
			var textoStart = mensagemEntrada + "\n\n"

			menuConfig.estado.forEach((estadoEntry: { key: string; texto: string; outputName: string }) => {
				onOptions.push([])
				textoStart = textoStart + "\n" + estadoEntry.key + " - " + estadoEntry.texto
			})
			textoStart = textoStart + "\n\n" + promptMenu
            await waitForReply(this)
			await addTextMessage(this, textoStart)
			await flushInput(this)

			onWait = [{
				json: inputStart.json,
			}];
		} else {
			this.logger.warn("AtendimentoEstadoMenuNode execute inputStart is empty")
		}

		return [
			this.helpers.returnJsonArray(onWait),
			...onOptions,
			this.helpers.returnJsonArray(onNone),
		];
	}
}