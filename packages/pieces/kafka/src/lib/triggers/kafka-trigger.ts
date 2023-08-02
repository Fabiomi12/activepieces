import {createTrigger, Property, TriggerStrategy} from '@activepieces/pieces-framework';

export const kafkaTrigger = createTrigger({
    name: 'kafka_trigger',
    displayName: 'Kafka Trigger',
    description: 'Triggers when a a message arrives in kafka queue with specified topic',
    props: {
        host: Property.LongText({
            displayName: 'Bootstrap server',
            description: 'bootstrap server',
            required: true,
            defaultValue: '',
        }),
        topic: Property.LongText({
            displayName: 'Topic',
            description: 'topic',
            required: true,
            defaultValue: '',
        }),
        clientId: Property.ShortText({
            displayName: 'Client Id',
            description: 'client id',
            required: true,
            defaultValue: '',
        }),
        groupId: Property.ShortText({
            displayName: 'Group Id',
            description: 'consumer group id',
            required: true,
            defaultValue: '',
        }),
    },
    type: TriggerStrategy.KAFKA_MESSAGE_CONSUMER,
    sampleData: {
        "id":"186ede2f-5137-4c15-ac1c-050bab39275b",
        "type":"ASSET_CREATED",
        "target":"3a5c55fb-a921-40b6-9e40-64328d9c4879",
        "triggeredAt":"2023-08-01T09:46:48.853Z",
        "triggeredBy":"93d17cd5-ee4d-436a-ad91-ff70dca2e7a0",
        "clientIPAddress":"0.0.0.0"
    },
    onEnable: async (ctx) => {
        ctx.createConsumer({
            host: ctx.propsValue.host,
            topic: ctx.propsValue.topic,
            clientId: ctx.propsValue.clientId,
            groupId: ctx.propsValue.groupId,
        })
    },
    run(context) {
        return Promise.resolve([context.payload]);
    },
    onDisable: async () => {
        console.log('onDisable');
    },
    test(ctx) {
        return Promise.resolve([this.sampleData])
    },
});

