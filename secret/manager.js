//"73,149,58,161,36,218,12,49,206,167,11,224,167,99,195,28,206,3,13,196,255,198,194,12,14,88,104,184,74,88,41,143,221,91,24,37,246,191,245,33,48,102,245,54,81,70,135,151,17,147,37,54,60,227,111,219,120,131,88,99,1,83,204,95,134,48,149,117,188,192,26,250,34,55,5,214,51,234,141,81,223,2,208,68,164,88,69,14,155,187,88,40,4,92,186,151,31,163,193,144,128,83,100,193,43,84,250,185,213,251,213,171,245,149,103,82,72,39,169,100,195,56,23,219,156,12,49,92|b6ae39a9-c9bf-4e10-9b5c-2ba825a30f4c_94,164,88,66,236,51,158,126,139,252,127,71,145,144,51,61,218,236,15,200,151,92,228,158,215,113,139,2,35,186,16,252,31,54,232,191,134,233,34,174,198,14,67,45,101,252,78,250,85,170,242,76,0,49,154,173,45,73,240,1,118,61,197,183,215,172,228,182,118,38,82,251,69,95,194,161,148,169,169,35,123,56,111,21,217,237,86,114,253,179,160,85,4,60,42,170,148,82,108,45,217,178,155,198,37,198,215|dc086de5-7f6a-4009-9ed4-35abcadbc2c8_218,51,93,238,177,32,112,165,188,33,119,167,68,106,41,124,52,236,59,31,97,217,158,218,78,117,101,193,75,137,220,216,216,3,17,98,237,32,27,250,201,58,17,72,102,76,214,209,30,60,63,60,88,93,103,139,112,2,227,26,3,223,46,83,172,104,24,23,204,10,48,214,180,129,155,214,158,95,3,6,53,131,97,127,158,163,2,150,150,81,129,238,199,233,202,73,216,97,34,108,111,91,103,176,8,129,202,220|7f2bd69b-ae98-4688-8fb7-82966de922a3_138,59,214,118,224,182,42,166,170,136,45,136,183,141,16,238,114,97,230,157,68,166,151,27,232,79,43,127,41,50,70,201,40,96,253,74,228,37,14,223,44,55,45,243,22,221,217,23,165,139,115,188,237,45,12,152,152,143,148,44,236,205,90,110,147,229,81,11,148,31,218,181,63,189,144,28,136,199,142,111,217,170,218,151,171,169,252,254,122,251,48,31,73,109,95,84,101,135,205,148,192,229,240,161,208,3,11,7|9e336d8c-2f40-4111-b79e-810622cf6ca3_208,94,80,148,107,210,236,190,85,141,24,195,0,95,12,92,234,46,106,233,208,56,75,55,36,151,102,223,207,140,185,111,170,149,0,240,178,89,186,17,28,186,58,92,159,156,178,235,119,227,87,159,54,167,37,85,215,240,103,94,28,96,219,241,90,161,249,239,123,96,142,149,135,78,1,158,144,193,161,172,152,132,192,139,164,124,191,89,75,151,63,251,163,241,137,118,178,28,207,132,157,118,103,238,43,117,189,161|"
import Record from './record.js'
import Vault from './vault.js'
import ui from './ui.js'

let body = document.body,
		vault, error, records, buttons, add,
		selected, record, edit, logform, modal

export default class PasswordManager {
	constructor() {
		logform = new ui.Login(body,{onclick:login,onkeydown:clearError})
		animate(logform,'fadeIn')
		window.onkeydown = e => {
			switch(e.code) {
				case "Enter":
				case "NumpadEnter": login(); break;
			}
		}
	}
}

async function login() {
	let password = logform.querySelector('.password').value

	vault = await new Vault(password) || undefined
	if(!vault) {
		error = error ? error : new ui.ErrorDiv(logform.parentNode,'Invalid Password')
		animate(logform,'shake')
	} else {
		await vault.fill()
		remove(logform,'fadeOut',showRecords)
	}
}

function clearError() {
	if(error) {
		remove(error,'fadeOut')
		error = undefined
	}
}

function showRecords() {
	records = new ui.RecordList(body,vault,selectRecord,copyPass)
	buttons = new ui.RecordButtons(body,newRecord,editRecord,promptDelete)
	add = buttons.lastElementChild
	animate(records,'fadeIn')
}

function selectRecord(e) {
	let record = e.target
	clearError()
	for(let child of records.children) {
		child.classList.remove('highlight')
	}

	selected = record.dataset.UUID
	record.classList.add('highlight')
}

async function copyPass(e) {
	let record = await vault.retrieveRecord(e.target.dataset.UUID).password
	console.log(record)
	await navigator.clipboard.writeText(record)
}

async function editRecord(e) {
	if(!selected) {
		buttonError(e.target)
	} else {
		clearError()
		record = await vault.retrieveRecord(selected)
		openEditFrom(record)
	}
}

function newRecord() {
	clearError()
	selected = undefined
	record = undefined
	for(let child of records.children) {
		child.classList.remove('highlight')
	}
	openEditFrom()
}

async function promptDelete(e) {
	if(!selected) {
		buttonError(e.target)
	} else {
		clearError()
		let temp = await vault.retrieveRecord(selected)
		openModal()
		new ui.DeleteConfirm(modal,temp.name,deleteRecord,closeModal)
	}
}

function buttonError(target) {
	if(vault.ids.next().done) {
		error = error ? error : new ui.ErrorDiv(buttons, 'Please Create a Record First')
		animate(add,'shake')
	} else {
		error = error ? error : new ui.ErrorDiv(buttons,'Please Select a Record')
		animate(target,'shake')
	}
}


function deleteRecord() {
	closeModal()
	closeEditForm()
	let temp = Array.from(records.children).reduce((a,c) => {
		return c.dataset.UUID === selected ? c : a
	})
	vault.deleteRecord(selected)
	remove(temp,'fadeOut',_ => vault.sync())
	selected = undefined
	record = undefined
}

function openEditFrom(record = {}) {
	if(edit) closeEditForm(0)
	edit = new ui.EditRecordForm(body,record,saveRecord,closeEditForm)
	animate(edit,'slideInRight')
}

function closeEditForm(replace = true) {
	if(edit) {
		remove(edit,replace ? 'slideOutRight' : 'fadeOut')
		edit = undefined
	}
}

async function saveRecord() {
	let temp = Array.from(edit.querySelectorAll('input')).reduce((a,v) => {
							a[v.className] = v.value
							return a
						},{}),
			isNew = !record
	record = !record ? new Record(temp.name) : record
	record.name = temp.name
	record.userId = temp.userId
	record.password = temp.password
	await vault.addRecord(record)
	vault.sync()
	if(isNew){
		temp = new ui.RecordHTML(records,record,selectRecord)
		animate(temp,'fadeIn')
	}
	closeEditForm()
}


function animate(node, clss) {
	node.classList.toggle(clss)
	let duration = +getComputedStyle(node).animationDuration.replace('s','') * 1000
	setTimeout(_ => node.classList.toggle(clss),duration)
}

function remove(node, clss, follow) {
	animate(node,clss)
	let duration = +getComputedStyle(node).animationDuration.replace('s','') * 1000
	setTimeout(_ => {
		node.parentNode.removeChild(node)
		follow && follow()
	},duration-50)
}
function openModal() {
	modal = new ui.Modal(body)
	animate(modal,'fadeIn')
}

function closeModal() {
	remove(modal,'fadeOut')
	modal = undefined
}