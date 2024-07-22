import dotenv from 'dotenv';
import { Commitment } from '@solana/web3.js';

dotenv.config();

type Logger = {
  info: (details: object | string, msg?: string) => void;
  error: (details: object | string, msg?: string) => void;
  trace: (details: object | string, msg?: string) => void;
  debug: (details: object | string, msg?: string) => void;
  warn: (details: object | string, msg?: string) => void;
};

const retrieveEnvVariable = (variableName: string) => {
  const variable = process.env[variableName] || '';
  if (!variable) {
    console.log(`${variableName} is not set`);
    process.exit(1);
  }
  return variable;
};

// Connection
export const NETWORK = 'mainnet-beta';
export const COMMITMENT_LEVEL: Commitment = retrieveEnvVariable('COMMITMENT_LEVEL') as Commitment;
export const RPC_HTTP_ENDPOINT_ONE = retrieveEnvVariable('RPC_HTTP_ENDPOINT_ONE');
export const RPC_HTTP_ENDPOINT_TWO = retrieveEnvVariable('RPC_HTTP_ENDPOINT_TWO');
export const RPC_WEBSOCKET_ENDPOINT_ONE = retrieveEnvVariable('RPC_WEBSOCKET_ENDPOINT_ONE');
export const RPC_WEBSOCKET_ENDPOINT_TWO = retrieveEnvVariable('RPC_WEBSOCKET_ENDPOINT_TWO');
export const NUM_WORKERS = retrieveEnvVariable('NUM_WORKERS');
export const TEST_DURATION = retrieveEnvVariable('TEST_DURATION');