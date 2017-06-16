const {div, datalist, option, span, li, ul, tr, pre, td, table, br, textarea, input, form, button} = bindName(hyperscript)

function viewSwitcher(children) {
	return (model, action) => div(
		children[model.selectedView](model, action)
	)
}

const backButton = (action) => button(
	{
		type: 'button',
		className: 'backButton',
		onclick: () => action('selectView', 'main')
	},
	"Back"
)

const passwordGenerator = (model, action) => 	div(
	{className: 'passwordGenerator'},
	span({className: 'label'}, "Master"),
	input({
		name: 'master',
		type: 'password',
		onfocus: (e) => action('clearGeneratedPassword'),
		onchange: (e) => action('generatePassword', e.target.value),
		value: model.enteredMaster,
		disabled: model.calculating,
		onclick: (e) => e.target.select(),
		attrs: {
			autofocus: true,
			autocomplete: 'off',
			inputmode: 'verbatim',
			spellcheck: false,
			tabIndex: 1,
			'data-request-focus': String(!model.calculating && model.calculatedPassword === '')
		},
	}),
	br(),
	input({
		className: 'password',
		value: model.calculating ? 'calculating...' : String(model.calculatedPassword),
		onfocus: (e) => {
			e.target.select()
		},
		onkeypress: (e) => {
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
		attrs: {
			readonly: true,
			'data-request-focus': String(!model.calculating && model.calculatedPassword !== '')
		}
	})
)

const purposeEntry = (model, action) => div(
	{className: 'purposeEntry'},
	datalist({id: 'storedPurposes'}, Object.keys(model.settings).map((name) => option({value: name}))),
	span({className: 'label'}, "Purpose"),
	input({
		name: 'purpose',
		onchange: (e) => action('selectPurpose', e.target.value),
		onfocus: (e) => e.target.select(),
		attrs: {list: 'storedPurposes'},
		value: model.selectedSettings.purpose
	}),
	button({onclick: () => action('selectView', 'editor')}, "Edit"),
	button({onclick: () => action('selectView', 'list')}, "Show All"),
)

const settingsRow = (settings, action) => div({
		className: 'settingsRow'
	},
	settings.toString()
)
const settingsButtons = (settings, action) => div({
		className: 'settingsButtons'
	},
	button({onclick: () => action('editPurpose', settings.purpose)}, "Edit"),
	button({onclick: () => action('deleteSettings', settings)}, "Del"),
)

const settingsEditor = ({selectedSettings: settings}, action) => settings === null ? div('no setting selected') : div(
	{className: 'settingsEditor'},
	form(
		{
			onsubmit: (e) => {
				e.preventDefault()
				const form = e.target
				action('settingsEdit', new Settings(form.purpose.value, form.version.value, form.salt.value, form.length.value, form.lowercase.value+form.uppercase.value+form.numbers.value+form.symbols.value))
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
		button({type: 'button', onclick: setInputs('abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '0123456789', "_-%$#.!@^&*()", 40)}, "Default"),
		br(),
		span({className: 'label'}, "Numbers"),
		input({name: "numbers", value: stringFilter(/[0-9]/)(settings.alphabet)}),
		button({type: 'button', onclick: setInputs('', '', '0123456789', '', null)}, "Just Numbers"),
		button({type: 'button', onclick: setInputs('', '', '0123456789', '', 4)}, "PIN"),
		br(),
		span({className: 'label'}, "Symbols"),
		input({name: "symbols", value: stringFilter(/[^a-zA-Z0-9]/)(settings.alphabet)}),
		button({type: 'button', onclick: setInputs(null, null, null, '', null)}, "No Symbols"),
		br(),
		span({className: 'label'}, "Length"),
		input({name: 'length', type: 'number', value: settings.length}),
		button({type: 'button', onclick: setInputs(null, null, null, null, 20)}, "Short"),
		br(),
		span({className: 'label'}, "Version"),
		input({name: 'version', type: 'number', value: settings.version}),
		br(),
		span({className: 'label'}, "Salt"),
		input({name: 'salt', value: settings.salt}),
		br(),
		button({type: 'submit'}, "Save"),
		button({type: 'button', onclick: () => action('selectView', 'main')}, "Cancel")
	)
)

const settingsList = (model, action) => div(
	div(
		{style: {display: 'flex'}},
		div(
			{className: 'allButtons'},
			Object.values(model.settings).map((setting) => settingsButtons(setting, action))
		),
		div({
				className: 'storedSettingsTable',
				attrs: {},
				onclick: (e) => {
					console.log('focus')
					document.execCommand('selectAll', false, null)
				}
			},
			Object.values(model.settings).map((setting) => settingsRow(setting, action)),
		)
	),
	div(
		{style: {'user-select': 'none'}},
		backButton(action),
		button({type: 'button', onclick: () => action('selectView', 'importer')}, 'Import')
	)
)

const settingsImport = (model, action) => form(
	textarea(
		{rows: 10, cols: 80, name: 'importData'}
	),
	br(),
	backButton(action),
	button({
		type: 'button',
		onclick: (e) => action('import', e.target.form.importData.value)
	}, "Import")
)

const passwordView = (model, action) => div(
	purposeEntry(model, action),
	passwordGenerator(model, action),
	div(
		{className: 'emojisentence'},
		model.getEmojiSentence()
	),
	button({
		type: 'button',
		onclick: () => window.close()
	}, "Close")
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

function setInputs(lowercase, uppercase, numbers, symbols, length) {
	return (e) => {
		const form = e.target.form
		if (lowercase !== null) form.lowercase.value = lowercase
		if (uppercase !== null) form.uppercase.value = uppercase
		if (numbers !== null) form.numbers.value = numbers
		if (symbols !== null) form.symbols.value = symbols
		if (length !== null) form.length.value = length
	}
}