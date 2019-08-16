const rS = new WeakMap()

export default class Record {
	constructor(name){
		const _this = {
			_name: name || '',
			_UUID: name ? getUUID() : 0,
			_password: '',
			_userId: ''
		}
		rS.set(this, _this)
	}

	get UUID() {
		return rS.get(this)._UUID
	}

	get name() {
		return rS.get(this)._name
	}

	get password() {
		return rS.get(this)._password
	}

	get userId() {
		return rS.get(this)._userId
	}

	set name(name) {
		rS.get(this)._name = name
	}

	set password(pass) {
		rS.get(this)._password = pass
	}

	set userId(uId) {
		rS.get(this)._userId = uId
	}

	parse(recordString) {
		let {rId,name,pass,uId} = JSON.parse(recordString),
				_this = rS.get(this)
		_this._UUID = rId
		_this._name = name
		_this._password = pass
		_this._userId = uId
		return this
	}

	toString() {
		let {_UUID,_password,_name,_userId} = rS.get(this)
		return JSON.stringify({rId: _UUID, name: _name, pass: _password, uId: _userId})
	}
}

function getUUID() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c==='x' ? r : (r&0x3|0x8)).toString(16);
	});
	return uuid;
}