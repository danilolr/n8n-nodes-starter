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
	outputs.push(		{
		type: NodeConnectionType.Main,
		displayName: null,
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
        inputs: [{
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
				displayName: 'Mensagem entrada',
				name: 'mensagemEntrada',
				type: 'string',
				default: 'Mensagem ao entrar no estado',
				placeholder: 'Mensagem',
				description: 'Mensagem a ser mostrada ao entrar no estado',
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
        const referencia = this.getNodeParameter('referencia', 0, '') as string;
        const returnItem: INodeExecutionData = {
            json: {
                referencia: referencia,
            },
        };
        return [this.helpers.returnJsonArray([returnItem])];
    }
}
