const { Worker } = require("worker_threads");
const numberOfThreads = 5;
let workersPool = [];

// initiate the workers and push them into array
const initWorkers = () => {
  for (let i = 0; i < numberOfThreads; i++) {
    const worker = new Worker("./worker.js");
    let message = {
      isBusy: false,
      id: i,
      worker: worker,
    };
    worker.on("message", (data) => {
      // Not for production, quick and dirty proof of concept
      workersPool[data.id].isBusy = data.isBusy;
    });
    worker.on("error", (msg) => {
      console.log(`An error occurred: ${msg}`);
    });
    workersPool.push(message);
  }
};

const handleWorker = async (data, resolveOffset) => {
  try {
    const availableWorker = workersPool.find((i) => i.isBusy === false);
    const { id, isBusy, worker } = availableWorker;
    let message = {
      isBusy,
      id,
      data: data,
    };
    worker.postMessage(message);
    resolveOffset(data.offset);
  } catch (_) {
    //console.log('catch ::: no worker available')
  }
};

module.exports = { initWorkers, handleWorker };
