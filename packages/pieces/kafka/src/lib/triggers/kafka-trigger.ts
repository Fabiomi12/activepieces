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
        groupId: Property.ShortText({
            displayName: 'Group Id',
            description: 'consumer group id',
            required: true,
            defaultValue: '',
        }),
        username: Property.LongText({
            displayName: 'Username',
            description: 'username',
            required: false,
            defaultValue: '',
        }),
        password: Property.LongText({
            displayName: 'Password',
            description: 'password',
            required: false,
            defaultValue: '',
        }),
        mechanism: Property.LongText({
            displayName: 'Mechanism',
            description: 'mechanism (plain, scram-sha-256, scram-sha-512)',
            required: false,
            defaultValue: '',
        }),
        ssl: Property.Checkbox({
            displayName: 'SSL',
            required: false,
        }),
        eventTypeRegex: Property.LongText({
            displayName: 'Event type regex',
            description: 'Regex to filter event type',
            required: false,
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
        "clientIPAddress":"0.0.0.0",
        "metadata": {
            "changes": [
                {
                    "name": "startDepreciationDate",
                    "oldValue":"2023-08-01T09:46:48.853Z",
                    "newValue":"2023-08-01T09:46:48.853Z",
                    "action":"EDIT",
                    "changedAt":"2023-08-01T09:46:48.853Z",
                    "changedBy":"93d17cd5-ee4d-436a-ad91-ff70dca2e7a0",
                    "changedByEntity":"PERSON"
                }
            ]
        }
    },
    onEnable: async (ctx) => {
        ctx.createConsumer({
            host: ctx.propsValue.host,
            topic: ctx.propsValue.topic,
            groupId: ctx.propsValue.groupId,
            username: ctx.propsValue.username ?? '',
            password: ctx.propsValue.password ?? '',
            mechanism: ctx.propsValue.mechanism ?? '',
            ssl: ctx.propsValue.ssl ?? false,
            eventTypeRegex: ctx.propsValue.eventTypeRegex ?? '',
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

