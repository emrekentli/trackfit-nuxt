type StartMessage = {
  type: 'start';
  duration: number;
};

type StopMessage = {
  type: 'stop';
};

type WorkerMessage = StartMessage | StopMessage;

let endTime = 0;
let intervalId: ReturnType<typeof setInterval> | null = null;

const stopTimer = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  endTime = 0;
};

const tick = () => {
  const remainingMs = endTime - Date.now();
  const remaining = Math.max(0, Math.ceil(remainingMs / 1000));
  postMessage({ type: 'tick', remaining });

  if (remaining <= 0) {
    postMessage({ type: 'done' });
    stopTimer();
  }
};

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;
  if (message.type === 'start') {
    stopTimer();
    endTime = Date.now() + message.duration * 1000;
    tick();
    intervalId = setInterval(tick, 500);
    return;
  }

  if (message.type === 'stop') {
    stopTimer();
  }
};
