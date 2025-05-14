import type {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow'; 

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
        inputs: [],
        outputs: [NodeConnectionType.Main],
        properties: [
			{
				displayName: 'Promt menu',
				name: 'promptMenu',
				type: 'string',
				default: 'Selecione uma opção',
				placeholder: 'Prompt',
				description: 'Propmt do a ser mostrado para o usuário',
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
								default: '1',
								description: 'Tecla pressionada',
							},
							{
								displayName: 'Texto',
								name: 'texto',
								type: 'string',
								default: 'Selecione esta opção para ...',
								description: 'Texto do menu',
							},
							{
								displayName: 'Nome saída',
								name: 'outputName',
								type: 'string',
								default: 'on',
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
