//Crypto Object to make usage of WebCrypto less verbose
import {encode,decode,toHexString,fromHexString,toBase64,fromBase64} from './utils.js'

const c = crypto,
      s = c.subtle,
      tranAad = encode('transmission')


let ecKey, dataKey, passbytes, serverPubKey, currentPubKey

export default class CRYPTO {
  constructor() {
    ecKey || this.generateECKeyPair().then(kp => ecKey = kp)
  }

  async generateECKeyPair() {
    let keyPair = await s.generateKey({name:"ECDH",namedCurve:"P-256"},true,['deriveKey'])
    return keyPair
  }

  async unlockDataKey(passphrase,data) {
    data = fromHexString(data)
    passbytes = encode(passphrase)
    let passKey = await deriveKey(data.slice(0,16)),
      rawKey = await decrypt(data.slice(16),passKey)
    dataKey = await s.importKey('raw',
      rawKey,
      {name: 'AES-GCM',length: 256},
      false,
      ['encrypt','decrypt'])
  }
}

function random(size = 1) {
  return c.getRandomValues(new Uint8Array(size))
}

async function encrypt(data,key = dataKey,aad = passbytes) {
  if(typeof data === 'string') data = encode(data)
  let iv = random(12),
    ciphertext = await s.encrypt({
      name: 'AES-GCM',
      iv,
      additionalData: aad
    },key,data)
  const cipherblock = [...iv,...new Uint8Array(ciphertext)]
  return cipherblock
}

async function decrypt(data,key = dataKey, aad = passbytes) {
  let iv = data.slice(0,12),
    plaintext = await s.decrypt({
      name: 'AES-GCM',
      iv,
      additionalData: aad
    },key,data.slice(12))
  return plaintext
}

async function deriveKey(salt, pass=passbytes) {
  let iterations = 100000,
  keySeed = await s.importKey('raw',
    pass,
    {name: 'PBKDF2'},
    false,
    ['deriveKey']),
  passKey = await s.deriveKey({
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256'
    }, keySeed, {name: 'AES-GCM',length: 256},
    false, ['encrypt','decrypt'])
  return passKey
}

async function createExchangeKey(privateKey = ecKey.privateKey,publicKey = serverPubKey) {
  let sharedKey = await s.deriveKey({name: "ECDH", public: publicKey},
    privateKey,
    {name: "AES-GCM", length: 256},
    false,
    ['encrypt','decrypt'])
  return sharedKey
}

async function importPublicKey(data) {
  let pemkey = fromBase64(data)
  let pubKey = await s.importKey('spki',
    pemkey,
    {name:'ECDH',namedCurve:'P-256'},
    false,
    ['deriveKey'])
  return pubKey
}

export async function exportPublicKey(key = ecKey.publicKey ) {
  let keyBytes = await s.exportKey('spki', key)
  return toBase64(keyBytes)
}

export async function setServerPubKey(key) {
  key = await importPublicKey(key)
  serverPubKey = key
}

export async function wrap(message) {
  if(serverPubKey) {
    const tranKey = await createExchangeKey()
    message = toHexString(await encrypt(message,tranKey,tranAad))
  }
  return message
}

export async function unwrap(data) {
  if(serverPubKey) {
    const tranKey = await createExchangeKey()
    data = decode(await decrypt(fromHexString(data),tranKey,tranAad))
  }
  return data
}

export async function unlockRecords(data,records) {
  for(const record of data) {
    let plain = await decrypt(fromHexString(record))
    plain = decode(plain).replace(/\(/,'[').replace(/\)/,']').replace(/'/g,'"')
    records.set(record,JSON.parse(plain))
  }
}


export async function unlockData([name,data]) {
  const key = await deriveKey(passbytes,encode(name))
  data = await decrypt(fromHexString(data),key,encode(''))
  data = decode(data).replace(/\(/,'[').replace(/\)/,']').replace(/'/g,'"')
  return [name,JSON.parse(data)]
}

export async function lockData([name,data]) {
  const key = await deriveKey(passbytes,encode(name))
  data = JSON.stringify(data).replace(/\[/,'(').replace(/\]/,')').replace(/'/g,'"')
  data = await encrypt(encode(data),key,encode(''))
  return [name,toHexString(data)]
}