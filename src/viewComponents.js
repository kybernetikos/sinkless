const {div, datalist, option, span, br, textarea, input, form, button:domButton} = uilib.tags

const button = (label, actionName, actionArg) => (action) => domButton({type: 'button', onclick: () => action(actionName, actionArg)}, label)
const backButton = button("Back", "selectView", "main")

const viewSwitcher = (children) => (model, action) => div(
	children[model.selectedView](model, action)
)

function chunk(arr,n){
	var r = Array(Math.ceil(arr.length/n)).fill();
	return r.map((e,i) => arr.slice(i*n, i*n+n));
}

const renderPassword = (password) => {
	return chunk(password.split('')
		.map((a) => /[a-zA-Z]/.test(a) ? a : span({className: /[0-9]/.test(a) ? 'numberchar' : 'symbolchar'}, a)), 5)
		.map((children) => span({className: 'chargroup'}, children))
}

const passwordGenerator = (model, action) => 	div({className: 'passwordGenerator'},
	span({className: 'label'}, "Master"),
	input({
		name: 'master',
		type: 'password',
		onfocus: (e) => action('clearGeneratedPassword'),
		onchange: (e) => action('generatePassword', e.target.value),
		value: model.enteredMaster,
		disabled: model.calculating,
		onclick: (e) => e.target.select(),
		autofocus: true,
		autocomplete: 'off',
		inputmode: 'verbatim',
		spellcheck: false,
		tabIndex: 1,
		'data-request-focus': String(!model.calculating && model.calculatedPassword === '')
	}),
	br(),
	span({
		className: 'password',
		tabIndex: 2,
		onkeydown: (e) => {
			console.log('keydown', e.key);
			if (e.key === 'Enter') {
				if (e.shiftKey) {
					if (window.tabs) {
						tabs.executeScript({
							code: `document.activeElement.value='${model.calculatedPassword.replace(/'/g, "\\'")}';`
						})
					} else {
						console.log('Not running as an extension, will not insert generated password.')
					}
				} else {
					document.execCommand('copy')
				}
				if (window.tabs) {
					window.close()
				}
			}
		},
		onclick: (e) => {
			const selection = window.getSelection();
			const range = document.createRange();
			range.selectNodeContents(e.currentTarget);
			selection.removeAllRanges();
			selection.addRange(range);
		},
		'data-request-focus': String(!model.calculating && model.calculatedPassword !== '')
	}, model.calculating ? 'calculating...' : renderPassword(model.calculatedPassword))
)

const purposeEntry = (model, action) => div({className: 'purposeEntry'},
	datalist({id: 'storedPurposes'}, Object.keys(model.settings).map((name) => option({value: name}))),
	span({className: 'label'}, "Purpose"),
	input({
		name: 'purpose',
		onchange: (e) => action('selectPurpose', e.target.value),
		onfocus: (e) => e.target.select(),
		list: 'storedPurposes',
		value: model.selectedSettings.purpose
	}),
	button("Edit", "selectView", "editor")(action),
	button("Show All", "selectView", "list")(action)
)

const settingsRow = (settings, action) => div({className: 'settingsRow'}, settings.toString())

const settingsButtons = (settings, action) => div({className: 'settingsButtons'},
	button("Edit", "editPurpose", settings.purpose)(action),
	button("Del", "deleteSettings", settings)(action)
)

function setInputs(lowercase, uppercase, numbers, symbols, length) {
	return (e) => {
		const form = e.target.form
		if (lowercase !== null) form.lowercase.value = lowercase
		if (uppercase !== null) form.uppercase.value = uppercase
		if (numbers !== null) form.numbers.value = numbers
		if (symbols !== null) form.symbols.value = symbols
		if (length !== null) form.passLen.value = length
	}
}

const formInputsButton = (name, ...inputs) => domButton({type: 'button', onclick: setInputs(...inputs)}, name)

const settingsEditor = ({selectedSettings: settings}, action) => settings === null ? div('no setting selected') : form({
		classList: ['settingsEditor'],
		onsubmit: (e) => {
			e.preventDefault()
			const form = e.target
			action('settingsEdit', new Settings(form.purpose.value, form.version.value, form.salt.value, form.passLen.value, form.lowercase.value + form.uppercase.value + form.numbers.value + form.symbols.value))
			return false
		}
	},
	span({className: 'label'}, "Purpose"),
	input({name: 'purpose', value: settings.purpose}), br(),
	span({className: 'label'}, "Lower"),
	input({name: "lowercase", value: stringFilter(/[a-z]/)(settings.alphabet)}),
	br(),
	span({className: 'label'}, "Upper"),
	input({name: "uppercase", value: stringFilter(/[A-Z]/)(settings.alphabet)}),
	formInputsButton("Default", 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '0123456789', "_-%$#.!@^&*()", 40),
	br(),
	span({className: 'label'}, "Numbers"),
	input({name: "numbers", value: stringFilter(/[0-9]/)(settings.alphabet)}),
	formInputsButton("Just Numbers", '', '', '0123456789', '', null),
	formInputsButton('PIN', '', '', '0123456789', '', 4),
	br(),
	span({className: 'label'}, "Symbols"),
	input({name: "symbols", value: stringFilter(/[^a-zA-Z0-9]/)(settings.alphabet)}),
	formInputsButton("No Symbols", null, null, null, '', null),
	br(),
	span({className: 'label'}, "Length"),
	input({name: 'passLen', type: 'number', value: settings.length}),
	formInputsButton("Short", null, null, null, null, 20),
	br(),
	span({className: 'label'}, "Version"),
	input({name: 'version', type: 'number', value: settings.version}),
	br(),
	span({className: 'label'}, "Salt"),
	input({name: 'salt', value: settings.salt}),
	br(),
	domButton({type: 'submit'}, "Save"),
	backButton(action)
)

const settingsList = (model, action) => div(
	div({style: {display: 'flex'}},
		div({className: 'allButtons'},
			Object.values(model.settings).map((setting) => settingsButtons(setting, action))
		),
		div({className: 'storedSettingsTable', onclick: (e) => document.execCommand('selectAll', false, null)},
			Object.values(model.settings).map((setting) => settingsRow(setting, action)),
		)
	),
	div(
		{style: {'user-select': 'none'}},
		backButton(action),
		button("Import", "selectView", "importer")(action)
	)
)

const settingsImport = (model, action) => form(
	textarea({rows: 10, cols: 80, name: 'importData'}),
	br(),
	backButton(action),
	domButton({type: 'button', onclick: (e) => action("importSettings", e.target.form.importData.value)}, "Import")
)

const passwordView = (model, action) => div(
	purposeEntry(model, action),
	passwordGenerator(model, action),
	div({className: 'emojisentence'}, model.getEmojiSentence()),
	button("Close", "closeWindow")(action)
)

const view = viewSwitcher({
	main: passwordView,
	editor: settingsEditor,
	list: settingsList,
	importer: settingsImport
})

function stringFilter(regex) {
	return (str) => str.split('').filter((chr) => chr.match(regex)).join('')
}