const c = crypto,
			s = c.subtle

let derivedKey, salt, dataKey

export default class CRYPTO {
	random(size = 1) {
		return c.getRandomValues(new Uint8Array(size))
	}

	async generateAESKey() {
		dataKey = await s.generateKey({
			name: "AES-GCM",
			length: 256},
			true,['encrypt','decrypt'])
	}

	async encrypt(data,key = dataKey) {
		if(typeof data === "string") data = encode(data)
		let iv = this.random(12),
				ciphertext = await s.encrypt({
					name: "AES-GCM",
					iv: iv
				},key,data)
		return [...iv,...new Uint8Array(ciphertext)]
	}

	async decrypt(data,string,key = dataKey){
		let decrypted = new Uint8Array(await s.decrypt({
				name: "AES-GCM",
				iv: new Uint8Array(data.splice(0,12))
			},key, new Uint8Array(data)))
		if(string) decrypted = decode(decrypted)
		return decrypted
	}

	async createDerivedKey(passPhrase) {
		salt = salt || this.random(16)
		let keySeed = await s.importKey('raw',
					encode(passPhrase),
					{name: 'PBKDF2'},
					false,
					['deriveKey'])
		derivedKey = await s.deriveKey({
					'name': 'PBKDF2',
					salt: salt,
					'iterations': 100000,
					'hash': 'SHA-256'
				},keySeed,{ "name": "AES-GCM", "length": 256},
				false,
				[ "encrypt", "decrypt" ])
	}

	async packEncryptParameters() {
		let rawKey = await encodeAESKey(dataKey),
				encryptedAES = await this.encrypt(rawKey,derivedKey)
		return [...salt,...encryptedAES,...this.random(52)]
	}

	async unpackEncryptParameters(passPhrase,encryptParams) {
		salt = new Uint8Array(encryptParams.splice(0,16))
		let cipher = encryptParams.splice(0,60)
		let result = await this.createDerivedKey(passPhrase)
		let rawKey = await this.decrypt(cipher,false,derivedKey)
		dataKey = await decodeAESKey(rawKey)
	}
}

async function encodeAESKey(key) {
	return new Uint8Array(await s.exportKey('raw',key))
}

async function decodeAESKey(buffer) {
	return await s.importKey('raw',
		buffer,
		'AES-GCM',
		false,['encrypt','decrypt'])
}

function encode(string = "") {
	return new TextEncoder().encode(string)
}

function decode(uint8array = new Uint8Array()) {
	return  new TextDecoder().decode(uint8array)
}