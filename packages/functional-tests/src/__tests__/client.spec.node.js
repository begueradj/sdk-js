// @flow
import Tanker from '@tanker/client-node';
import { type TankerInterface, type b64string } from '@tanker/core';
import PouchDBMemory from '@tanker/datastore-pouchdb-memory';

import { tankerUrl, makePrefix, makeRandomUint8Array } from '../Helpers';
import { generateFunctionalTests } from '../functional';
import { type TestResources } from '../TestArgs';

const makeTanker = (trustchainId: b64string): TankerInterface => {
  const tanker: TankerInterface = (new Tanker({
    trustchainId,
    dataStore: { adapter: PouchDBMemory, prefix: makePrefix() },
    sdkType: 'test',
    url: tankerUrl,
  }): any);

  return tanker;
};

const generateTestResources = (): TestResources => {
  const small = makeRandomUint8Array(1024); // 1kB -> this will use v3 format
  const medium = makeRandomUint8Array(1024 * 1024); // 1MB -> this will use v4 format with 2 chunks
  const big = makeRandomUint8Array(6 * 1024 * 1024); // 6MB -> this will use v4 format with 7 chunks

  const result = {
    small: [
      { type: ArrayBuffer, resource: small.buffer },
      { type: Buffer, resource: Buffer.from(small.buffer) },
      { type: Uint8Array, resource: small },
    ],
    medium: [
      { type: ArrayBuffer, resource: medium.buffer },
      { type: Buffer, resource: Buffer.from(medium.buffer) },
      { type: Uint8Array, resource: medium },
    ],
    big: [
      { type: ArrayBuffer, resource: big.buffer },
      { type: Buffer, resource: Buffer.from(big.buffer) },
      { type: Uint8Array, resource: big },
    ],
  };

  return result;
};

generateFunctionalTests('client-node', makeTanker, generateTestResources);
