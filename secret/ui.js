class Element {
	constructor(parent,type, options) {
		let ele = document.createElement(type)
		for(let key in options) {
			ele[key] = options[key]
		}
		parent.appendChild(ele)
		return ele
	}
}

class Div extends Element{
	constructor(parent,options = {}) {
		let div = super(parent,'div',options)

		return div
	}
}

class Button extends Element {
	constructor(parent,options = {}) {
		let {onclick,textContent} = options,
				button = super(parent,'button',options)

		if(!onclick) button.onclick = _ => console.log('No Click Handler Set.',this)
		if(!textContent) button.textContent = "Click Me"

		return button
	}
}

class Input extends Element {
	constructor(parent,options = {}) {
		let input = super(parent,'input',options)

		return input
	}
}

class Password extends Input {
	constructor(parent,options = {}) {
		options.type = 'password'
		let pass = super(parent,options)
		return pass
	}
}

class Login extends Div {
	constructor(parent,{onclick,onkeydown}) {
		let contain = super(parent,{className: 'logForm standardSize'})
		new Password(contain,{onkeydown,className: 'password',placeholder: "Password"})
		new Button(contain,{onclick,textContent: "Login"})

		return contain
	}
}

class ErrorDiv extends Div {
	constructor(parent,error) {
		let err = super(parent,{className: 'error', textContent: error})
	}
}

class RecordButtons extends Div {
	constructor(parent,add,edit,deleteR) {
		let buttons = super(parent,{className: 'buttons'})
		new Button(buttons,{onclick: deleteR,textContent: 'Delete Record'})
		new Button(buttons,{onclick: edit,textContent: 'Edit Record'})
		new Button(buttons,{onclick: add,textContent: 'Add Record'})

		return buttons
	}
}

class RecordList extends Div {
	constructor(parent,vault,onclick) {
		let list = super(parent,{className: 'records'})

		for (let record of vault.ids) {
			vault.retrieveRecord(record).then(rec => new RecordHTML(list,rec,onclick))
		}
		return list
	}
}

class RecordHTML extends Div {
	constructor(parent,data,onclick) {
		console.log(`${data}`)
		let record = super(parent,{className: 'record standardSize',
												textContent: data.name,
												onclick
											})
		record.dataset.UUID = data.UUID

		return record
	}
}

class EditRecordForm extends Div {
	constructor(parent,{name,userId,password},save,cancel) {
		let edit = super(parent,{className: 'editForm'})
		new Div(edit,{textContent: 'Record Name',title: "Required"})
		new Input(edit,{value: name || '', placeholder: 'Name',className: 'name'})
		new Div(edit,{textContent: 'Password',title: "Required"})
		new Password(edit,{value: password || '', placeholder: 'Password',className: 'password'})
		new Div(edit,{textContent: 'Username',title: "Optional"})
		new Input(edit,{value: userId || '', placeholder: 'Username',className: 'userId'})
		new Button(edit,{className: 'alt',onclick: cancel,textContent: 'Cancel'})
		new Button(edit,{onclick: save,textContent: 'Save'})

		return edit
	}
}

class Modal extends Div {
	constructor(parent) {
		let modal = super(parent,{className: 'modal'})

		return modal
	}
}

class DeleteConfirm extends Div {
	constructor(parent,name,confirm,cancel) {
		let prompt = super(parent,{className: 'deletePrompt'})
		new Div(prompt,{textContent: `Are you sure you want to delete ${name}?`})
		new Button(prompt,{className: 'alt',onclick: cancel,textContent: 'Cancel'})
		new Button(prompt,{onclick: confirm,textContent: 'Delete'})

		return prompt
	}
}
export default {Input,Login,ErrorDiv,RecordHTML,RecordList,RecordButtons,EditRecordForm,Modal,DeleteConfirm}