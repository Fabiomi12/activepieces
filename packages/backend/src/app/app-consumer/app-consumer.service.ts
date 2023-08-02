import {databaseConnection} from '../database/database-connection'
import {AppConsumer, AppConsumerEntity} from './app-consumer.entity'
import {
    apId,
    ExecutionType,
    Flow,
    FlowId,
    FlowInstanceStatus,
    FlowRun,
    isNil,
    ProjectId,
    RunEnvironment
} from '@activepieces/shared'
import {logger} from '../helper/logger';
import {flowInstanceService} from '../flows/flow-instance/flow-instance.service';
import {flowVersionService} from '../flows/flow-version/flow-version.service';
import {triggerUtils} from '../helper/trigger-utils';
import {triggerEventService} from '../flows/trigger-events/trigger-event.service';
import {flowRunService} from '../flows/flow-run/flow-run-service';

const appConsumerRepo = databaseConnection.getRepository(AppConsumerEntity)

type CallbackParams = {
    flow: Flow
    payload: any
}

export const appConsumerService = {
    async listConsumers(): Promise<AppConsumer[]> {
        return await appConsumerRepo.find()
    },
    async createConsumer({host, topic, clientId, groupId, flowId, projectId}: {
        host: string
        topic: string
        clientId: string
        groupId: string
        flowId: FlowId
        projectId: ProjectId
    }): Promise<AppConsumer> {
        return appConsumerRepo.save({
            id: apId(),
            host,
            topic,
            clientId,
            groupId,
            flowId,
            projectId,
        })
    },
    async deleteListeners({projectId, flowId}: { projectId: ProjectId, flowId: FlowId }): Promise<void> {
        await appConsumerRepo.delete({
            projectId,
            flowId,
        })
    },
    async count(): Promise<number> {
        return await appConsumerRepo.count()
    },
    async callback({flow, payload}: CallbackParams): Promise<FlowRun[]> {
        logger.info(`[WebhookService#callback] flowId=${flow.id}`)

        const {projectId} = flow
        const flowInstance = await flowInstanceService.get({
            flowId: flow.id,
            projectId: flow.projectId,
        })
        if (isNil(flowInstance)) {
            logger.info(`[ConsumerService#callback] flowInstance not found, flowId=${flow.id}`)
            return []
        }
        if (flowInstance.status !== FlowInstanceStatus.ENABLED) {
            logger.info(`[ConsumerService#callback] flowInstance not found or not enabled ignoring the webhook, flowId=${flow.id}`)
            return []
        }
        const flowVersion = await flowVersionService.getOneOrThrow(flowInstance.flowVersionId)
        const payloads: unknown[] = await triggerUtils.executeTrigger({
            projectId,
            flowVersion,
            payload,
            simulate: false,
        })

        payloads.forEach((payload) => {
            triggerEventService.saveEvent({
                flowId: flow.id,
                payload,
                projectId,
            })
        })

        const createFlowRuns = payloads.map((payload) =>
            flowRunService.start({
                environment: RunEnvironment.PRODUCTION,
                flowVersionId: flowVersion.id,
                payload,
                projectId,
                executionType: ExecutionType.BEGIN,
            }),
        )

        return await Promise.all(createFlowRuns)
    },
}

