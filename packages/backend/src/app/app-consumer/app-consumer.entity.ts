import { FlowId, ProjectId } from '@activepieces/shared'
import { ApIdSchema, BaseColumnSchemaPart } from '../database/database-common'
import { EntitySchema } from 'typeorm'

export type AppConsumer = {
    id: string
    created: string
    updated: string
    host: string
    topic: string
    clientId: string
    groupId: string
    projectId: ProjectId
    flowId: FlowId
}

export const AppConsumerEntity = new EntitySchema<AppConsumer>({
    name: 'app_consumer',
    columns: {
        ...BaseColumnSchemaPart,
        host: {
            type: String,
        },
        topic: {
            type: String,
        },
        clientId: {
            type: String,
        },
        groupId: {
            type: String,
        },
        projectId: ApIdSchema,
        flowId: ApIdSchema,
    },
    indices: [
        {
            name: 'idx_app_consumer_flow_id',
            columns: ['flowId'],
            unique: false,
        },
        {
            name: 'idx_app_consumer_project_id',
            columns: ['projectId'],
            unique: true,
        },
    ],
})
