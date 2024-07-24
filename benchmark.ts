import { Connection } from "@solana/web3.js";
import {
  COMMITMENT_LEVEL,
  RPC_HTTP_ENDPOINT_ONE,
  RPC_HTTP_ENDPOINT_TWO,
  RPC_WEBSOCKET_ENDPOINT_ONE,
  RPC_WEBSOCKET_ENDPOINT_TWO,
  NUM_WORKERS,
  TEST_DURATION,
} from "./helpers";
import chalk from "chalk";

const numWorkers = Number(NUM_WORKERS);
const durationMs = Number(TEST_DURATION);
let failedResponses = 0;
let successfulResponses = 0;
let firstRun = true;

async function testNode(connection: Connection, durationMs: number) {
  failedResponses = 0;
  successfulResponses = 0;

  const responseTimes: number[] = [];

  const warmupStartTime = Date.now();
  while (Date.now() - warmupStartTime < 5000) {
    try {
      await connection.getLatestBlockhash();
    } catch (e) {}
  }

  if (firstRun) {
    console.log(`Starting ${durationMs / 1000}s benchmark...\n`);
    firstRun = false;
  }

  const startTime = Date.now();
  while (Date.now() - startTime < durationMs) {
    const timeBefore: number = Date.now();

    try {
      await connection.getLatestBlockhash();
      successfulResponses += 1;
    } catch (e: any) {
      failedResponses += 1;
    }

    const timeAfter: number = Date.now();
    const responseTime: number = timeAfter - timeBefore;
    responseTimes.push(responseTime);
  }

  return responseTimes;
}

async function runTests(httpEndpoint: string, wssEndpoint: string) {
  console.log(
    `${chalk.magenta(
      `\nStarting benchmark for endpoint: ${chalk.white(`${httpEndpoint}`)}`
    )}\n`
  );

  const connectionGod = new Connection(httpEndpoint, {
    wsEndpoint: wssEndpoint,
    commitment: COMMITMENT_LEVEL,
    disableRetryOnRateLimit: true,
  });

  console.log("Warming up for 5 seconds...\n");
  const workerPromises = Array.from({ length: numWorkers }, () =>
    testNode(connectionGod, durationMs * 1000)
  );

  const allResponseTimes = await Promise.all(workerPromises);
  const flattenedResponseTimes = allResponseTimes.flat();

  // Calculate metrics
  const minResponseTime = Math.min(...flattenedResponseTimes);
  const maxResponseTime = Math.max(...flattenedResponseTimes);
  const avgResponseTime =
    flattenedResponseTimes.reduce((sum, time) => sum + time, 0) /
    flattenedResponseTimes.length;

  // Sort response times for median calculation
  flattenedResponseTimes.sort();
  const middle = Math.floor(flattenedResponseTimes.length / 2);
  const medianResponseTime =
    flattenedResponseTimes.length % 2 === 0
      ? (flattenedResponseTimes[middle - 1] + flattenedResponseTimes[middle]) /
        2
      : flattenedResponseTimes[middle];

  console.log(
    `${chalk.green(
      `Minimum TX Response Time: ${minResponseTime.toFixed()} milliseconds`
    )}`
  );
  console.log(
    `${chalk.red(
      `Maximum TX Response Time: ${maxResponseTime.toFixed()} milliseconds`
    )}`
  );
  console.log(
    `${chalk.blue(
      `Average TX Response Time: ${avgResponseTime.toFixed()} milliseconds`
    )}`
  );
  console.log(
    `${chalk.yellow(
      `Median TX Response Time: ${medianResponseTime.toFixed()} milliseconds`
    )}\n`
  );
  console.log(`${chalk.green(`Successful Responses: ${successfulResponses}`)}`);
  console.log(`${chalk.red(`Failed Responses: ${failedResponses}`)}`);
  console.log(
    `Success Rate: ${chalk.blueBright(
      failedResponses === 0
        ? "100%"
        : `${(
            (successfulResponses / (successfulResponses + failedResponses)) *
            100
          ).toFixed(2)}%`
    )}`
  );
  console.log(`${chalk.blue(`Test Duration: ${durationMs} seconds`)}\n`);
}

async function main() {
  console.log(
    chalk.blue(
      `\nRunning rpc benchmark [${chalk.green(
        RPC_HTTP_ENDPOINT_ONE
      )}] VS [${chalk.green(RPC_HTTP_ENDPOINT_TWO)}]`
    )
  );

  await runTests(RPC_HTTP_ENDPOINT_ONE, RPC_WEBSOCKET_ENDPOINT_ONE);

  await runTests(RPC_HTTP_ENDPOINT_TWO, RPC_WEBSOCKET_ENDPOINT_TWO);
}

main();
