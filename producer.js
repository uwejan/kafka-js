const ip = require("ip");

const { Kafka, CompressionTypes, logLevel } = require("kafkajs");

const host = process.env.HOST_IP || ip.address();

const kafka = new Kafka({
  logLevel: logLevel.DEBUG,
  brokers: [`${host}:9092`],
  clientId: "example-producer",
});

const topic = "topic-test";
const producer = kafka.producer();
const messageText = "Hello World";

const getRandomNumber = () => Math.round(Math.random(10) * 1000);
const createMessage = () => ({
  key: `key-${getRandomNumber()}`,
  value: messageText,
});

const sendMessage = () => {
  return producer
    .send({
      topic,
      compression: CompressionTypes.GZIP,
      messages: [createMessage()],
    })
    .then(console.log)
    .catch((e) => console.error(`[example/producer] ${e.message}`, e));
};

const run = async () => {
  await producer.connect();

  setInterval(sendMessage, 1000);
};

run().catch((e) => console.error(`[example/producer] ${e.message}`, e));

const errorTypes = ["unhandledRejection", "uncaughtException"];
const signalTraps = ["SIGTERM", "SIGINT", "SIGUSR2"];

errorTypes.forEach((type) => {
  process.on(type, async () => {
    try {
      console.log(`process.on ${type}`);
      await producer.disconnect();
      process.exit(0);
    } catch (_) {
      process.exit(1);
    }
  });
});

signalTraps.forEach((type) => {
  process.once(type, async () => {
    try {
      await producer.disconnect();
    } finally {
      process.kill(process.pid, type);
    }
  });
});
