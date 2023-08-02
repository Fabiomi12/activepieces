
import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
import {kafkaTrigger} from './lib/triggers/kafka-trigger';

export const kafka = createPiece({
  displayName: "Kafka",
  auth: PieceAuth.None(),
  minimumSupportedRelease: '0.6.0',
  logoUrl: "https://cdn.icon-icons.com/icons2/2248/PNG/512/apache_kafka_icon_138937.png",
  authors: [],
  actions: [],
  triggers: [kafkaTrigger],
});
