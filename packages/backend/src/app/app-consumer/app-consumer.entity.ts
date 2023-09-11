import { FlowId, ProjectId } from '@activepieces/shared'
import { ApIdSchema, BaseColumnSchemaPart } from '../database/database-common'
import { EntitySchema } from 'typeorm'

export type AppConsumer = {
    id: string
    created: string
    updated: string
    host: string
    topic: string
    groupId: string
    username: string
    password: string
    mechanism: string
    ssl: boolean
    projectId: ProjectId
    flowId: FlowId
    eventTypeRegex: string
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
        username: {
            type: String,
        },
        password: {
            type: String,
        },
        mechanism: {
            type: String,
        },
        ssl: {
            type: Boolean,
        },
        groupId: {
            type: String,
        },
        projectId: ApIdSchema,
        flowId: ApIdSchema,
        eventTypeRegex: {
            type: String,
            nullable: true,
        },
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
            unique: false,
        },
    ],
})
