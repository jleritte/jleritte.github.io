import CRYPTO from './crypto.js'
import Record from './record.js'
import keys from './keys.js'
const vault = new Map(),
			c = new CRYPTO()

firebase.initializeApp(keys)

let d = firebase.database(),
		enparms

export default class Vault {
	constructor(password) {
		return login(password).then(r => r ? this : null)
	}

	async addRecord(record) {
		vault.set(record.UUID,await c.encrypt(`${record}`))
	}

	deleteRecord(UUID) {
		vault.delete(UUID)
	}

	async retrieveRecord(UUID) {
		return new Record().parse(await c.decrypt([...vault.get(UUID)],true))
	}

	get enParms() {
		return enparms
	}

	get ids() {
		return vault.keys()
	}

	async fill() {
		let rs = await d.ref('rs').once('value')
		rs.val() ? rs.val().map(r => vault.set(r[0],r[1])) : null
	}

	sync() {
		d.ref('rs').set(Array.from(vault))
	}
}

async function login(password) {
	enparms = await d.ref('ep').once('value')
	enparms = enparms.val() || []

	if(enparms.length) {
		try {
			await c.unpackEncryptParameters(password,[...enparms])
		} catch(err) {
			return false
		}
	} else {
		await c.createDerivedKey(password)
		await c.generateAESKey()
		enparms = await c.packEncryptParameters()
		d.ref('ep').set(enparms)
	}
	return true
}