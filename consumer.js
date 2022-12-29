const ip = require("ip");

const { Kafka, logLevel } = require("kafkajs");

const { initWorkers, handleWorker } = require("./pool.js");

const host = process.env.HOST_IP || ip.address();

const kafka = new Kafka({
  logLevel: logLevel.INFO,
  brokers: [`${host}:9092`],
  clientId: "example-consumer",
});

const topic = "topic-test";
const consumer = kafka.consumer({ groupId: "test-group" });

// init 5 threads
initWorkers();

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic });
  await consumer.run({
    eachBatchAutoResolve: false,
    autoCommit: false,
    eachBatch: async ({
      batch,
      resolveOffset,
      heartbeat,
      commitOffsetsIfNecessary,
      uncommittedOffsets,
      isRunning,
      isStale,
      pause,
    }) => {
      const promises = [];
      for (let message of batch.messages) {
        const data = {
          offset: message.offset,
          value: message.value.toString(),
        };

        // processed messages to be printed depending on availability of a worker
        // else is dropped
        promises.push(handleWorker(data, resolveOffset));
      }
      await Promise.all(promises);
    },
  });
};

run().catch((e) => console.error(`[example/consumer] ${e.message}`, e));

const errorTypes = ["unhandledRejection", "uncaughtException"];
const signalTraps = ["SIGTERM", "SIGINT", "SIGUSR2"];

errorTypes.forEach((type) => {
  process.on(type, async (e) => {
    try {
      console.log(`process.on ${type}`);
      console.error(e);
      await consumer.disconnect();
      process.exit(0);
    } catch (_) {
      process.exit(1);
    }
  });
});

signalTraps.forEach((type) => {
  process.once(type, async () => {
    try {
      await consumer.disconnect();
    } finally {
      process.kill(process.pid, type);
    }
  });
});
