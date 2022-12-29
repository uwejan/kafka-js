const { parentPort } = require("worker_threads");

// define helper function random
Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};

// 5 / 10 seconds
const busyTime = [5000, 10000];

function releaseWorker(message) {
  // notify pool worker is available
  parentPort.postMessage(message);
}

const handleData = (msg) => {
  let message = {
    isBusy: true,
    id: msg.id,
  };

  // notify the pool that this worker is busy
  parentPort.postMessage(message);

  // print the message
  console.log(msg.data.value);

  // mimic random busy handle time (5sec / 10sec)
  const duration = busyTime.random();
  message.isBusy = false;
  setTimeout(() => releaseWorker(message), duration);
};

parentPort.on("message", handleData);
