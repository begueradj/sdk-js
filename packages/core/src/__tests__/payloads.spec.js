// @flow

import { tcrypto, random, utils } from '@tanker/crypto';

import { expect } from './chai';

import { signBlock } from '../Blocks/Block';
import { concatArrays, encodeListLength } from '../Blocks/Serialize';
import {
  serializeTrustchainCreation,
  unserializeTrustchainCreation,
  serializeUserDeviceV1,
  serializeUserDeviceV3,
  unserializeUserDeviceV1,
  unserializeUserDeviceV2,
  unserializeUserDeviceV3,
  serializeKeyPublish,
  unserializeKeyPublish,
  serializeKeyPublishToUser,
  unserializeKeyPublishToUser,
  serializeKeyPublishToUserGroup,
  unserializeKeyPublishToUserGroup,
  serializeDeviceRevocationV2,
  unserializeDeviceRevocationV1,
  unserializeDeviceRevocationV2,
  serializeUserGroupCreation,
  unserializeUserGroupCreation,
  serializeUserGroupAddition,
  unserializeUserGroupAddition,
  serializeBlock,
  unserializeBlock,
  preferredNature,
  NATURE_KIND,
} from '../Blocks/payloads';

import makeUint8Array from './makeUint8Array';

// NOTE: If you ever have to change something here, change it in the Go code too!
// The test vectors should stay the same
describe('payload test vectors', () => {
  it('correctly deserializes a TrustchainCreation test vector', async () => {
    const trustchainCreation = {
      public_signature_key: new Uint8Array([
        0x66, 0x98, 0x23, 0xe7, 0xc5, 0x0e, 0x13, 0xe0, 0xed, 0x4a, 0x56, 0x91, 0xc6, 0x63, 0xc7, 0xeb,
        0x1b, 0xd6, 0x53, 0x12, 0xd4, 0x8d, 0x21, 0xd4, 0x86, 0x76, 0x0f, 0x04, 0x85, 0x7d, 0xf0, 0xef
      ])
    };

    const payload = trustchainCreation.public_signature_key;

    expect(unserializeTrustchainCreation(payload)).to.deep.equal(trustchainCreation);
  });

  it('correctly deserializes a DeviceCreation v1 test vector', async () => {
    const deviceCreation = {
      ephemeral_public_signature_key: new Uint8Array([
        0x4e, 0x2a, 0x65, 0xdf, 0xe6, 0x5d, 0x00, 0x58, 0xf4, 0xdf, 0xb0, 0x5d, 0x37, 0x64, 0x18, 0x1d,
        0x10, 0x61, 0xf7, 0x54, 0xbb, 0x70, 0x30, 0x4f, 0x08, 0x6e, 0x32, 0x14, 0x85, 0x7a, 0xee, 0xe5
      ]),
      user_id: new Uint8Array([
        0xbd, 0xec, 0xe7, 0xbe, 0x4c, 0xd6, 0xc8, 0x33, 0xec, 0xf9, 0x42, 0xe1, 0xa9, 0xc4, 0xa7, 0x3e,
        0x39, 0xac, 0xdd, 0x6d, 0x99, 0x37, 0xc2, 0x9a, 0xbf, 0xf8, 0x6c, 0x4f, 0xce, 0x3a, 0x34, 0xcd
      ]),
      delegation_signature: new Uint8Array([
        0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA,
        0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA,
        0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA,
        0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA
      ]),
      public_signature_key: new Uint8Array([
        0x21, 0x2c, 0x54, 0x3a, 0xae, 0xcf, 0xc6, 0xef, 0x0b, 0x60, 0xae, 0xe6, 0x11, 0x52, 0xa1, 0x30,
        0x60, 0xbc, 0x34, 0xbc, 0x1b, 0x89, 0x39, 0xe1, 0xd9, 0x94, 0x9a, 0xaa, 0x14, 0x4c, 0x41, 0x60
      ]),
      public_encryption_key: new Uint8Array([
        0x42, 0x9a, 0xfa, 0x09, 0xee, 0xea, 0xce, 0x12, 0xec, 0x59, 0x06, 0x35, 0xa8, 0x7f, 0x82, 0xe6,
        0x39, 0xc8, 0xce, 0xd0, 0xc8, 0xe5, 0x57, 0x16, 0x72, 0x94, 0x9e, 0xfb, 0xed, 0x59, 0xde, 0x2e
      ]),
      user_key_pair: null,
      is_ghost_device: false,
      is_server_device: false,
      last_reset: new Uint8Array(tcrypto.HASH_SIZE),
      revoked: Number.MAX_SAFE_INTEGER,
    };

    const payload = concatArrays(
      deviceCreation.ephemeral_public_signature_key,
      deviceCreation.user_id,
      deviceCreation.delegation_signature,
      deviceCreation.public_signature_key,
      deviceCreation.public_encryption_key
    );

    expect(unserializeUserDeviceV1(payload)).to.deep.equal(deviceCreation);
  });

  it('correctly deserializes a DeviceCreation v2 test vector', async () => {
    const deviceCreation = {
      last_reset: new Uint8Array(tcrypto.HASH_SIZE),
      ephemeral_public_signature_key: new Uint8Array([
        0x4e, 0x2a, 0x65, 0xdf, 0xe6, 0x5d, 0x00, 0x58, 0xf4, 0xdf, 0xb0, 0x5d, 0x37, 0x64, 0x18, 0x1d,
        0x10, 0x61, 0xf7, 0x54, 0xbb, 0x70, 0x30, 0x4f, 0x08, 0x6e, 0x32, 0x14, 0x85, 0x7a, 0xee, 0xe5
      ]),
      user_id: new Uint8Array([
        0xbd, 0xec, 0xe7, 0xbe, 0x4c, 0xd6, 0xc8, 0x33, 0xec, 0xf9, 0x42, 0xe1, 0xa9, 0xc4, 0xa7, 0x3e,
        0x39, 0xac, 0xdd, 0x6d, 0x99, 0x37, 0xc2, 0x9a, 0xbf, 0xf8, 0x6c, 0x4f, 0xce, 0x3a, 0x34, 0xcd
      ]),
      delegation_signature: new Uint8Array([
        0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA,
        0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA,
        0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA,
        0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA
      ]),
      public_signature_key: new Uint8Array([
        0x21, 0x2c, 0x54, 0x3a, 0xae, 0xcf, 0xc6, 0xef, 0x0b, 0x60, 0xae, 0xe6, 0x11, 0x52, 0xa1, 0x30,
        0x60, 0xbc, 0x34, 0xbc, 0x1b, 0x89, 0x39, 0xe1, 0xd9, 0x94, 0x9a, 0xaa, 0x14, 0x4c, 0x41, 0x60
      ]),
      public_encryption_key: new Uint8Array([
        0x42, 0x9a, 0xfa, 0x09, 0xee, 0xea, 0xce, 0x12, 0xec, 0x59, 0x06, 0x35, 0xa8, 0x7f, 0x82, 0xe6,
        0x39, 0xc8, 0xce, 0xd0, 0xc8, 0xe5, 0x57, 0x16, 0x72, 0x94, 0x9e, 0xfb, 0xed, 0x59, 0xde, 0x2e
      ]),
      user_key_pair: null,
      is_ghost_device: false,
      is_server_device: false,
      revoked: Number.MAX_SAFE_INTEGER,
    };

    const payload = concatArrays(
      deviceCreation.last_reset,
      deviceCreation.ephemeral_public_signature_key,
      deviceCreation.user_id,
      deviceCreation.delegation_signature,
      deviceCreation.public_signature_key,
      deviceCreation.public_encryption_key
    );

    expect(unserializeUserDeviceV2(payload)).to.deep.equal(deviceCreation);
  });

  it('correctly deserializes a DeviceCreation v3 test vector', async () => {
    const payload = new Uint8Array([
      // ephemeral_public_signature_key
      0x65, 0x70, 0x68, 0x20, 0x70, 0x75, 0x62, 0x20, 0x6b, 0x65, 0x79, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      // user_id
      0x75, 0x73, 0x65, 0x72, 0x20, 0x69, 0x64, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      // delegation_signature
      0x64, 0x65, 0x6c, 0x65, 0x67, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x20, 0x73,
      0x69, 0x67, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      // public_signature_key
      0x70, 0x75, 0x62, 0x6c, 0x69, 0x63, 0x20, 0x73, 0x69, 0x67, 0x6e, 0x61,
      0x74, 0x75, 0x72, 0x65, 0x20, 0x6b, 0x65, 0x79, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      // public_encryption_key
      0x70, 0x75, 0x62, 0x6c, 0x69, 0x63, 0x20, 0x65, 0x6e, 0x63, 0x20, 0x6b,
      0x65, 0x79, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      // user public_encryption_key
      0x75, 0x73, 0x65, 0x72, 0x20, 0x70, 0x75, 0x62, 0x20, 0x65, 0x6e, 0x63,
      0x20, 0x6b, 0x65, 0x79, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      // user encrypted_private_encryption_key
      0x75, 0x73, 0x65, 0x72, 0x20, 0x65, 0x6e, 0x63, 0x20, 0x6b, 0x65, 0x79,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      // is_ghost_device
      0x01,
    ]);

    const deviceCreation = {
      last_reset: new Uint8Array(32),
      ephemeral_public_signature_key: makeUint8Array('eph pub key', tcrypto.SIGNATURE_PUBLIC_KEY_SIZE),
      user_id: makeUint8Array('user id', tcrypto.HASH_SIZE),
      delegation_signature: makeUint8Array('delegation sig', tcrypto.SIGNATURE_SIZE),
      public_signature_key: makeUint8Array('public signature key', tcrypto.SIGNATURE_PUBLIC_KEY_SIZE),
      public_encryption_key: makeUint8Array('public enc key', tcrypto.ENCRYPTION_PUBLIC_KEY_SIZE),
      user_key_pair: {
        public_encryption_key: makeUint8Array('user pub enc key', tcrypto.ENCRYPTION_PUBLIC_KEY_SIZE),
        encrypted_private_encryption_key: makeUint8Array('user enc key', tcrypto.SEALED_KEY_SIZE),
      },
      is_ghost_device: true,
      is_server_device: false,
      revoked: Number.MAX_SAFE_INTEGER,
    };

    expect(unserializeUserDeviceV3(payload)).to.deep.equal(deviceCreation);
  });

  it('correctly deserializes a KeyPublishV1 test vector', async () => {
    const keyPublish = {
      recipient: new Uint8Array([
        0xbd, 0xec, 0xe7, 0xbe, 0x4c, 0xd6, 0xc8, 0x33, 0xec, 0xf9, 0x42, 0xe1, 0xa9, 0xc4, 0xa7, 0x3e,
        0x39, 0xac, 0xdd, 0x6d, 0x99, 0x37, 0xc2, 0x9a, 0xbf, 0xf8, 0x6c, 0x4f, 0xce, 0x3a, 0x34, 0xcd
      ]),
      resourceId: new Uint8Array([
        0x21, 0x2c, 0x54, 0x3a, 0xae, 0xcf, 0xc6, 0xef, 0x0b, 0x60, 0xae, 0xe6, 0x11, 0x52, 0xa1, 0x30,
      ]),
      key: new Uint8Array([
        0x0b, 0x5a, 0xa5, 0x9e, 0xf1, 0x8e, 0x5c, 0xef, 0x61, 0xc4, 0x95, 0x26, 0x77, 0xe2, 0xb6, 0x96,
        0x55, 0x96, 0xbd, 0xbe, 0x7d, 0x8f, 0xfc, 0x8e, 0x9b, 0xd4, 0xeb, 0xab, 0xd3, 0xaf, 0xa1, 0x36,
        0x01, 0x00, 0x8b, 0x86, 0x08, 0xea, 0xb4, 0xa4, 0x90, 0x67, 0x66, 0xbd, 0x4c, 0xb0, 0x08, 0xe3,
        0x01, 0x00, 0x8b, 0x86, 0x08, 0xea, 0xb4, 0xa4, 0x90, 0x67, 0x66, 0xbd, 0x4c, 0xb0, 0x08, 0xe3,
        0x01, 0x00, 0x8b, 0x86, 0x08, 0xea, 0xb4, 0xa4
      ]),
    };

    const payload = concatArrays(
      keyPublish.recipient,
      keyPublish.resourceId,
      new Uint8Array([keyPublish.key.length]),
      keyPublish.key
    );

    expect(unserializeKeyPublish(payload)).to.deep.equal(keyPublish);
  });

  it('correctly deserializes a KeyPublishV2 test vector', async () => {
    const keyPublish = {
      recipient: makeUint8Array('recipient user', tcrypto.HASH_SIZE),
      resourceId: makeUint8Array('resource mac', tcrypto.MAC_SIZE),
      key: makeUint8Array('encrypted key...', tcrypto.SEALED_KEY_SIZE),
    };

    const payload = new Uint8Array([
      0x72, 0x65, 0x63, 0x69, 0x70, 0x69, 0x65, 0x6e, 0x74, 0x20, 0x75, 0x73, 0x65, 0x72, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x72, 0x65, 0x73, 0x6f, 0x75, 0x72, 0x63, 0x65, 0x20, 0x6d, 0x61, 0x63, 0x00, 0x00, 0x00, 0x00,
      0x65, 0x6e, 0x63, 0x72, 0x79, 0x70, 0x74, 0x65, 0x64, 0x20, 0x6b, 0x65, 0x79, 0x2e, 0x2e, 0x2e,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);

    expect(unserializeKeyPublishToUser(payload)).to.deep.equal(keyPublish);
  });

  it('correctly deserializes a KeyPublish to usert est vector', async () => {
    const keyPublish = {
      recipient: makeUint8Array('recipient group', tcrypto.ENCRYPTION_PUBLIC_KEY_SIZE),
      resourceId: makeUint8Array('resource mac', tcrypto.MAC_SIZE),
      key: makeUint8Array('encrypted key...', tcrypto.SEALED_KEY_SIZE),
    };

    const payload = new Uint8Array([
      0x72, 0x65, 0x63, 0x69, 0x70, 0x69, 0x65, 0x6e, 0x74, 0x20, 0x67, 0x72, 0x6f, 0x75, 0x70, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x72, 0x65, 0x73, 0x6f, 0x75, 0x72, 0x63, 0x65, 0x20, 0x6d, 0x61, 0x63, 0x00, 0x00, 0x00, 0x00,
      0x65, 0x6e, 0x63, 0x72, 0x79, 0x70, 0x74, 0x65, 0x64, 0x20, 0x6b, 0x65, 0x79, 0x2e, 0x2e, 0x2e,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);

    expect(unserializeKeyPublishToUserGroup(payload)).to.deep.equal(keyPublish);
  });

  it('correctly deserializes a DeviceRevocationV1 test vector', async () => {
    const deviceRevocation = {
      device_id: new Uint8Array([
        0xe9, 0x0b, 0x0a, 0x13, 0x05, 0xb1, 0x82, 0x85, 0xab, 0x9d, 0xbe, 0x3f, 0xdb, 0x57, 0x2b, 0x71,
        0x6c, 0x0d, 0xa1, 0xa3, 0xad, 0xb8, 0x86, 0x9b, 0x39, 0x58, 0xcb, 0x00, 0xfa, 0x31, 0x5d, 0x87
      ]),
    };

    const payload = deviceRevocation.device_id;

    expect(unserializeDeviceRevocationV1(payload)).to.deep.equal(deviceRevocation);
  });

  it('correctly deserializes a DeviceRevocationV2 test vector', async () => {
    const deviceRevocation = {
      device_id: new Uint8Array([
        0xe9, 0x0b, 0x0a, 0x13, 0x05, 0xb1, 0x82, 0x85, 0xab, 0x9d, 0xbe, 0x3f, 0xdb, 0x57, 0x2b, 0x71,
        0x6c, 0x0d, 0xa1, 0xa3, 0xad, 0xb8, 0x86, 0x9b, 0x39, 0x58, 0xcb, 0x00, 0xfa, 0x31, 0x5d, 0x87
      ]),
      user_keys: {
        public_encryption_key: new Uint8Array([
          0x42, 0x9a, 0xfa, 0x09, 0xee, 0xea, 0xce, 0x12, 0xec, 0x59, 0x06, 0x35, 0xa8, 0x7f, 0x82, 0xe6,
          0x39, 0xc8, 0xce, 0xd0, 0xc8, 0xe5, 0x57, 0x16, 0x72, 0x94, 0x9e, 0xfb, 0xed, 0x59, 0xde, 0x2e
        ]),
        previous_public_encryption_key: new Uint8Array([
          0x8e, 0x3e, 0x33, 0x57, 0x3d, 0xd5, 0x3c, 0xe7, 0x29, 0xbc, 0x73, 0x90, 0x7f, 0x83, 0x20, 0xee,
          0xe9, 0x0b, 0x0a, 0x13, 0x05, 0xb1, 0x82, 0x85, 0xab, 0x9d, 0xbe, 0x3f, 0xdb, 0x57, 0x2b, 0x71,
        ]),
        encrypted_previous_encryption_key: new Uint8Array([
          0xf1, 0x28, 0xa8, 0x12, 0x03, 0x8e, 0x7c, 0x9c, 0x39, 0xad, 0x73, 0x21, 0xa3, 0xee, 0x50, 0x53,
          0xc1, 0x1d, 0xda, 0x76, 0xaf, 0xc8, 0xfd, 0x70, 0x74, 0x5c, 0xbb, 0xd6, 0xb8, 0x7f, 0x8f, 0x6b,
          0xe1, 0xaf, 0x36, 0x80, 0x3f, 0xf3, 0xbc, 0xb2, 0xfb, 0x4e, 0xe1, 0x7d, 0xea, 0xbd, 0x19, 0x6b,
          0x8e, 0x3e, 0x33, 0x57, 0x3d, 0xd5, 0x3c, 0xe7, 0x29, 0xbc, 0x73, 0x90, 0x7f, 0x83, 0x20, 0xee,
          0x0e, 0xc0, 0x91, 0x63, 0xe7, 0xc2, 0x04, 0x69, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        ]),
        private_keys: [
          {
            recipient: new Uint8Array([
              0xd0, 0xa8, 0x9e, 0xff, 0x7d, 0x59, 0x48, 0x3a, 0xee, 0x7c, 0xe4, 0x99, 0x49, 0x4d, 0x1c, 0xd7,
              0x87, 0x54, 0x41, 0xf5, 0xba, 0x51, 0xd7, 0x65, 0xbf, 0x91, 0x45, 0x08, 0x03, 0xf1, 0xe9, 0xc7,
            ]),
            key: new Uint8Array([
              0xe1, 0xaf, 0x36, 0x80, 0x3f, 0xf3, 0xbc, 0xb2, 0xfb, 0x4e, 0xe1, 0x7d, 0xea, 0xbd, 0x19, 0x6b,
              0x8e, 0x3e, 0x33, 0x57, 0x3d, 0xd5, 0x3c, 0xe7, 0x29, 0xbc, 0x73, 0x90, 0x7f, 0x83, 0x20, 0xee,
              0xf1, 0x28, 0xa8, 0x12, 0x03, 0x8e, 0x7c, 0x9c, 0x39, 0xad, 0x73, 0x21, 0xa3, 0xee, 0x50, 0x53,
              0xc1, 0x1d, 0xda, 0x76, 0xaf, 0xc8, 0xfd, 0x70, 0x74, 0x5c, 0xbb, 0xd6, 0xb8, 0x7f, 0x8f, 0x6b,
              0x0e, 0xc0, 0x91, 0x63, 0xe7, 0xc2, 0x04, 0x69, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            ]),
          },
        ],
      },
    };

    const payload = concatArrays(
      deviceRevocation.device_id,
      deviceRevocation.user_keys.public_encryption_key,
      deviceRevocation.user_keys.previous_public_encryption_key,
      deviceRevocation.user_keys.encrypted_previous_encryption_key,
      encodeListLength(deviceRevocation.user_keys.private_keys),
      ...deviceRevocation.user_keys.private_keys.map((userKey) => concatArrays(userKey.recipient, userKey.key)),
    );

    expect(unserializeDeviceRevocationV2(payload)).to.deep.equal(deviceRevocation);
  });

  it('correctly deserializes a UserGroupCreation test vector', async () => {
    const userGroupCreation = {
      public_signature_key: makeUint8Array('pub sig key', tcrypto.SIGNATURE_PUBLIC_KEY_SIZE),
      public_encryption_key: makeUint8Array('pub enc key', tcrypto.ENCRYPTION_PUBLIC_KEY_SIZE),
      encrypted_group_private_signature_key: makeUint8Array('encrypted priv sig key', tcrypto.SEALED_SIGNATURE_PRIVATE_KEY_SIZE),
      encrypted_group_private_encryption_keys_for_users: [
        {
          public_user_encryption_key: makeUint8Array('pub user key', tcrypto.ENCRYPTION_PUBLIC_KEY_SIZE),
          encrypted_group_private_encryption_key: makeUint8Array('encrypted group priv key', tcrypto.SEALED_ENCRYPTION_PRIVATE_KEY_SIZE),
        },
        {
          public_user_encryption_key: makeUint8Array('second pub user key', tcrypto.ENCRYPTION_PUBLIC_KEY_SIZE),
          encrypted_group_private_encryption_key: makeUint8Array('second encrypted group priv key', tcrypto.SEALED_ENCRYPTION_PRIVATE_KEY_SIZE),
        }],
      self_signature: makeUint8Array('self signature', tcrypto.SIGNATURE_SIZE),
    };

    const payload = new Uint8Array([
      // public signature key
      0x70, 0x75, 0x62, 0x20, 0x73, 0x69, 0x67, 0x20, 0x6b, 0x65, 0x79, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      // public encryption key
      0x70, 0x75, 0x62, 0x20,
      0x65, 0x6e, 0x63, 0x20, 0x6b, 0x65, 0x79, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      // encrypted group private signature key
      0x65, 0x6e, 0x63, 0x72, 0x79, 0x70, 0x74, 0x65,
      0x64, 0x20, 0x70, 0x72, 0x69, 0x76, 0x20, 0x73, 0x69, 0x67, 0x20, 0x6b,
      0x65, 0x79, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      // varint
      0x02,
      // public user encryption key 1
      0x70, 0x75, 0x62,
      0x20, 0x75, 0x73, 0x65, 0x72, 0x20, 0x6b, 0x65, 0x79, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00,
      // encrypted group private encryption key 1
      0x65, 0x6e, 0x63, 0x72, 0x79, 0x70, 0x74,
      0x65, 0x64, 0x20, 0x67, 0x72, 0x6f, 0x75, 0x70, 0x20, 0x70, 0x72, 0x69,
      0x76, 0x20, 0x6b, 0x65, 0x79, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00,
      // public user encryption key 2
      0x73, 0x65, 0x63, 0x6f, 0x6e, 0x64, 0x20, 0x70, 0x75, 0x62, 0x20,
      0x75, 0x73, 0x65, 0x72, 0x20, 0x6b, 0x65, 0x79, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      // encrypted group private encryption key 2
      0x73, 0x65, 0x63,
      0x6f, 0x6e, 0x64, 0x20, 0x65, 0x6e, 0x63, 0x72, 0x79, 0x70, 0x74, 0x65,
      0x64, 0x20, 0x67, 0x72, 0x6f, 0x75, 0x70, 0x20, 0x70, 0x72, 0x69, 0x76,
      0x20, 0x6b, 0x65, 0x79, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00,
      // self signature
      0x73, 0x65, 0x6c, 0x66, 0x20, 0x73, 0x69,
      0x67, 0x6e, 0x61, 0x74, 0x75, 0x72, 0x65, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);

    expect(serializeUserGroupCreation(userGroupCreation)).to.deep.equal(payload);
    expect(unserializeUserGroupCreation(payload)).to.deep.equal(userGroupCreation);
  });

  it('correctly deserializes a UserGroupAddition test vector', async () => {
    const userGroupAdd = {
      group_id: makeUint8Array('group id', tcrypto.HASH_SIZE),
      previous_group_block: makeUint8Array('prev group block', tcrypto.HASH_SIZE),
      encrypted_group_private_encryption_keys_for_users: [
        {
          public_user_encryption_key: makeUint8Array('pub user key', tcrypto.ENCRYPTION_PUBLIC_KEY_SIZE),
          encrypted_group_private_encryption_key: makeUint8Array('encrypted group priv key', tcrypto.SEALED_ENCRYPTION_PRIVATE_KEY_SIZE),
        },
        {
          public_user_encryption_key: makeUint8Array('second pub user key', tcrypto.ENCRYPTION_PUBLIC_KEY_SIZE),
          encrypted_group_private_encryption_key: makeUint8Array('second encrypted group priv key', tcrypto.SEALED_ENCRYPTION_PRIVATE_KEY_SIZE),
        }],
      self_signature_with_current_key: makeUint8Array('self signature', tcrypto.SIGNATURE_SIZE),
    };

    const payload = new Uint8Array([
      // group id
      0x67, 0x72, 0x6f, 0x75, 0x70, 0x20, 0x69, 0x64, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      // previous group block
      0x70, 0x72, 0x65, 0x76, 0x20, 0x67, 0x72, 0x6f, 0x75, 0x70, 0x20, 0x62,
      0x6c, 0x6f, 0x63, 0x6b, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      // varint
      0x02,
      // public user encryption key 1
      0x70, 0x75, 0x62,
      0x20, 0x75, 0x73, 0x65, 0x72, 0x20, 0x6b, 0x65, 0x79, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00,
      // encrypted group private encryption key 1
      0x65, 0x6e, 0x63, 0x72, 0x79, 0x70, 0x74,
      0x65, 0x64, 0x20, 0x67, 0x72, 0x6f, 0x75, 0x70, 0x20, 0x70, 0x72, 0x69,
      0x76, 0x20, 0x6b, 0x65, 0x79, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00,
      // public user encryption key 2
      0x73, 0x65, 0x63, 0x6f, 0x6e, 0x64, 0x20, 0x70, 0x75, 0x62, 0x20,
      0x75, 0x73, 0x65, 0x72, 0x20, 0x6b, 0x65, 0x79, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      // encrypted group private encryption key 2
      0x73, 0x65, 0x63,
      0x6f, 0x6e, 0x64, 0x20, 0x65, 0x6e, 0x63, 0x72, 0x79, 0x70, 0x74, 0x65,
      0x64, 0x20, 0x67, 0x72, 0x6f, 0x75, 0x70, 0x20, 0x70, 0x72, 0x69, 0x76,
      0x20, 0x6b, 0x65, 0x79, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00,
      // self signature
      0x73, 0x65, 0x6c, 0x66, 0x20, 0x73, 0x69,
      0x67, 0x6e, 0x61, 0x74, 0x75, 0x72, 0x65, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);

    expect(serializeUserGroupAddition(userGroupAdd)).to.deep.equal(payload);
    expect(unserializeUserGroupAddition(payload)).to.deep.equal(userGroupAdd);
  });
});

describe('payloads', () => {
  it('should serialize/unserialize a TrustchainCreation', async () => {
    const trustchainCreation = {
      public_signature_key: random(tcrypto.SYMMETRIC_KEY_SIZE),
    };

    expect(unserializeTrustchainCreation(serializeTrustchainCreation(trustchainCreation))).to.deep.equal(trustchainCreation);
  });

  it('should serialize/unserialize a UserDeviceV1', async () => {
    const ephemeralKeys = tcrypto.makeSignKeyPair();
    const signatureKeys = tcrypto.makeSignKeyPair();
    const encryptionKeys = tcrypto.makeEncryptionKeyPair();
    const userDevice = {
      last_reset: new Uint8Array(tcrypto.HASH_SIZE),
      ephemeral_public_signature_key: ephemeralKeys.publicKey,
      user_id: utils.fromString('12341234123412341234123412341234'),
      delegation_signature: utils.fromString('1234123412341234123412341234123412341234123412341234123412341234'),
      public_signature_key: signatureKeys.publicKey,
      public_encryption_key: encryptionKeys.publicKey,
      user_key_pair: null,
      is_ghost_device: false,
      is_server_device: false,
      revoked: Number.MAX_SAFE_INTEGER,
    };

    expect(unserializeUserDeviceV1(serializeUserDeviceV1(userDevice))).to.deep.equal(userDevice);
  });

  it('should serialize/unserialize a UserDeviceV3', async () => {
    const ephemeralKeys = tcrypto.makeSignKeyPair();
    const signatureKeys = tcrypto.makeSignKeyPair();
    const encryptionKeys = tcrypto.makeEncryptionKeyPair();
    const userDevice = {
      last_reset: new Uint8Array(tcrypto.HASH_SIZE),
      ephemeral_public_signature_key: ephemeralKeys.publicKey,
      user_id: utils.fromString('12341234123412341234123412341234'),
      delegation_signature: utils.fromString('1234123412341234123412341234123412341234123412341234123412341234'),
      public_signature_key: signatureKeys.publicKey,
      public_encryption_key: encryptionKeys.publicKey,
      user_key_pair: {
        public_encryption_key: makeUint8Array('user pub enc key', tcrypto.ENCRYPTION_PUBLIC_KEY_SIZE),
        encrypted_private_encryption_key: makeUint8Array('user enc priv key', tcrypto.SEALED_KEY_SIZE),
      },
      is_ghost_device: true,
      is_server_device: false,
      revoked: Number.MAX_SAFE_INTEGER,
    };

    expect(unserializeUserDeviceV3(serializeUserDeviceV3(userDevice))).to.deep.equal(userDevice);
  });

  it('should serialize/unserialize a KeyPublish', async () => {
    const keyPublish = {
      resourceId: random(tcrypto.MAC_SIZE),
      recipient: random(tcrypto.HASH_SIZE),
      key: random(tcrypto.SYMMETRIC_KEY_SIZE + tcrypto.MAC_SIZE + tcrypto.XCHACHA_IV_SIZE)
    };

    expect(unserializeKeyPublish(serializeKeyPublish(keyPublish))).to.deep.equal(keyPublish);
  });

  it('should serialize/unserialize a KeyPublishV2', async () => {
    const keyPublish = {
      resourceId: random(tcrypto.MAC_SIZE),
      recipient: random(tcrypto.HASH_SIZE),
      key: random(tcrypto.SEALED_KEY_SIZE),
    };

    expect(unserializeKeyPublishToUser(serializeKeyPublishToUser(keyPublish))).to.deep.equal(keyPublish);
  });

  it('should serialize/unserialize a KeyPublish to User Group', async () => {
    const keyPublish = {
      resourceId: random(tcrypto.MAC_SIZE),
      recipient: random(tcrypto.HASH_SIZE),
      key: random(tcrypto.SEALED_KEY_SIZE),
    };

    expect(unserializeKeyPublishToUserGroup(serializeKeyPublishToUserGroup(keyPublish))).to.deep.equal(keyPublish);
  });

  it('should serialize/unserialize a DeviceRevocation', async () => {
    const deviceRevocation = {
      device_id: random(tcrypto.HASH_SIZE),
      user_keys: {
        public_encryption_key: random(tcrypto.ENCRYPTION_PUBLIC_KEY_SIZE),
        previous_public_encryption_key: random(tcrypto.ENCRYPTION_PUBLIC_KEY_SIZE),
        encrypted_previous_encryption_key: random(tcrypto.SEALED_KEY_SIZE),
        private_keys: [],
      },
    };

    expect(unserializeDeviceRevocationV2(serializeDeviceRevocationV2(deviceRevocation))).to.deep.equal(deviceRevocation);
  });

  it('should serialize/unserialize a Block', async () => {
    const keyPublish = {
      resourceId: random(tcrypto.MAC_SIZE),
      recipient: random(tcrypto.HASH_SIZE),
      key: random(tcrypto.SYMMETRIC_KEY_SIZE + tcrypto.MAC_SIZE + tcrypto.XCHACHA_IV_SIZE)
    };

    const signatureKeys = tcrypto.makeSignKeyPair();
    const block = {
      trustchain_id: new Uint8Array(tcrypto.HASH_SIZE),
      index: 999,
      nature: preferredNature(NATURE_KIND.key_publish_to_device),
      payload: serializeKeyPublish(keyPublish),
      author: random(tcrypto.HASH_SIZE)
    };
    const signedBlock = signBlock(block, signatureKeys.privateKey);

    expect(unserializeBlock(serializeBlock(signedBlock))).to.deep.equal(signedBlock);
  });

  it('should throw if the last reset is not null when serializing a new userDeviceV1', async () => {
    const ephemeralKeys = tcrypto.makeSignKeyPair();
    const signatureKeys = tcrypto.makeSignKeyPair();
    const encryptionKeys = tcrypto.makeEncryptionKeyPair();
    const userDevice = {
      last_reset: new Uint8Array(Array.from({ length: tcrypto.HASH_SIZE }, () => 1)),
      ephemeral_public_signature_key: ephemeralKeys.publicKey,
      user_id: utils.fromString('12341234123412341234123412341234'),
      delegation_signature: utils.fromString('1234123412341234123412341234123412341234123412341234123412341234'),
      public_signature_key: signatureKeys.publicKey,
      public_encryption_key: encryptionKeys.publicKey,
      user_key_pair: null,
      is_ghost_device: false,
      is_server_device: false,
      revoked: Number.MAX_SAFE_INTEGER,
    };

    expect(() => serializeUserDeviceV1(userDevice)).to.throw('Assertion error: user device last reset must be null');
  });

  it('should throw if the last reset is not null when serializing a new userDeviceV3', async () => {
    const ephemeralKeys = tcrypto.makeSignKeyPair();
    const signatureKeys = tcrypto.makeSignKeyPair();
    const encryptionKeys = tcrypto.makeEncryptionKeyPair();
    const userDevice = {
      last_reset: new Uint8Array(Array.from({ length: tcrypto.HASH_SIZE }, () => 1)),
      ephemeral_public_signature_key: ephemeralKeys.publicKey,
      user_id: utils.fromString('12341234123412341234123412341234'),
      delegation_signature: utils.fromString('1234123412341234123412341234123412341234123412341234123412341234'),
      public_signature_key: signatureKeys.publicKey,
      public_encryption_key: encryptionKeys.publicKey,
      user_key_pair: {
        public_encryption_key: makeUint8Array('user pub enc key', tcrypto.ENCRYPTION_PUBLIC_KEY_SIZE),
        encrypted_private_encryption_key: makeUint8Array('user enc priv key', tcrypto.SEALED_KEY_SIZE),
      },
      is_ghost_device: true,
      is_server_device: false,
      revoked: Number.MAX_SAFE_INTEGER,
    };

    expect(() => serializeUserDeviceV3(userDevice)).to.throw();
  });
});
