import {AppConsumer} from './app-consumer/app-consumer.entity'
import {Consumer, Kafka, SASLOptions} from 'kafkajs'
import {flowService} from './flows/flow/flow.service'
import {appConsumerService} from './app-consumer/app-consumer.service'
import {logger} from './helper/logger'

let backgroundConsumerProcessRunning = false
const map = new Map<AppConsumer, Consumer>()
export const manageConsumers = async () => {
    if (backgroundConsumerProcessRunning) {
        return
    }
    backgroundConsumerProcessRunning = true
    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            // logger.info('Checking consumers count.')
            // logger.info('Map size: ' + map.size.toString())
            const count = await appConsumerService.count()
            // logger.info('Consumers count: ' + count.toString())
            // logger.info('Fetching consumer configurations.')
            const consumerEntities = await appConsumerService.listConsumers()
            logger.info('Consumers: ' + JSON.stringify(consumerEntities))
            if (count !== map.size) {
                logger.info('Creating kafka consumers.')
                for (const consumerEntity of consumerEntities) {
                    if (!listExistsById(map.keys(), consumerEntity.id)) {
                        const createdConsumer = await createKafkaConsumer(consumerEntity)
                        map.set(consumerEntity, createdConsumer)
                    }
                }
                logger.info('Removing unused consumers.')
                const toRemove = []
                for (const [key, _] of map) {
                    if (!listExistsById(consumerEntities.values(), key.id)) {
                        toRemove.push(key)
                    }
                }
                for (const it of toRemove) {
                    const consumer = map.get(it)
                    await consumer?.stop()
                    await consumer?.disconnect()
                    map.delete(it)
                    await appConsumerService.deleteListeners({projectId: it.projectId, flowId: it.flowId})
                }
            }

            const toUpdate = []
            for (const consumerEntity of consumerEntities) {
                for (const [key, _] of map) {
                    if (key.id === consumerEntity.id) {
                        if (
                            key.host !== consumerEntity.host
                            || key.groupId !== consumerEntity.groupId
                            || key.topic !== consumerEntity.topic
                            || key.ssl !== consumerEntity.ssl
                            || key.username !== consumerEntity.username
                            || key.password !== consumerEntity.password
                            || key.mechanism !== consumerEntity.mechanism
                        ) {
                            toUpdate.push({
                                key,
                                entity: consumerEntity,
                            })
                        }
                    }
                }
            }
            for (const toUpdateKey of toUpdate) {
                const consumer = map.get(toUpdateKey.key)
                await consumer?.stop()
                await consumer?.disconnect()
                map.delete(toUpdateKey.key)
                const createdConsumer = await createKafkaConsumer(toUpdateKey.entity)
                map.set(toUpdateKey.entity, createdConsumer)
            }
        }
        catch (error: any) {
            logger.error('Error kafka consumer: ' + error.message)
        }
        await new Promise((resolve) => setTimeout(resolve, 1500))
    }
}

const createKafkaConsumer = async (entity: AppConsumer): Promise<Consumer> => {
    logger.info(`Creating kafka consumer with data: host=${entity.host}, topic=${entity.topic}, groupId=${entity.groupId}`)
    let sasl = undefined
    if (entity.username !== '' && entity.password !== '' && entity.mechanism !== '') {
        sasl = {
            mechanism: entity.mechanism,
            username: entity.username,
            password: entity.password,
        } as SASLOptions
    }
    const kafka = new Kafka({
        brokers: [entity.host],
        ssl: entity.ssl,
        sasl,
    })

    const consumer = kafka.consumer({ groupId: entity.groupId })
    try {

        await consumer.connect()
        await consumer.subscribe({ topic: entity.topic, fromBeginning: true })

        await consumer.run({
            eachMessage: async ({ message }) => {
                const flow = await flowService.getOneOrThrow({ projectId: entity.projectId, id: entity.flowId })
                logger.info('Received message: ' + JSON.stringify(message))
                let callback: boolean
                const payload = message.value === null ? {} : JSON.parse(message.value.toString())
                if (entity.eventTypeRegex && payload.type) {
                    const regex = new RegExp(entity.eventTypeRegex)
                    callback = regex.test(payload.type)
                }
                else {
                    callback = true
                }
                if (callback) {
                    await appConsumerService.callback({
                        flow,
                        payload,
                    })
                }
            },
        })
    } catch (e: any) {
        logger.error('Could not connect consumer: ' + e.message)
    }
    return consumer
}

const listExistsById = (list: IterableIterator<AppConsumer>, id: string): boolean => {
    for (const entity of list) {
        if (entity.id === id) {
            return true
        }
    }
    return false
}
