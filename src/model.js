const emojiPerson = "👮🕵💂👷😈👸👳💀👽👻👶🤖👦👧👨👩".match(/./gu)
const emojiAction = "🏇⛷🏂🏌🏄🚣🏊⛹🏋🚴🎙🎪👀🛀🎷🎭🎨🏆📚🎸📞🏅🏏📷🏁🏈⚽🚀🏹🍽🎥🔮⌛".match(/./gu)
const emojiObject = "☠💣🚽🕰🎀🎁🕹💻🖥📡💰📐📌⛓⛪🚌🚒🚑🚁🍉🎩🍓🌽🌶🍗🍔🍕🌮🍿".match(/./gu)

class Model {
	constructor(initialPurpose) {
		this.settings = {}
		this.calculatedPassword = ''
		this.enteredMaster = ''
		this.calculating = false
		this.selectedView = 'main'

		if (localStorage.getItem('mypass.settings') !== null) {
			const settingsData = JSON.parse(localStorage.getItem('mypass.settings'))
			for (let settings of settingsData) {
				this.settings[settings.purpose] = new Settings(settings.purpose, settings.version, settings.salt, settings.length, settings.alphabet)
			}
		}
		this.selectPurpose(initialPurpose)
	}

	importSettings(textData) {
		try {
			textData.split('\n').map(Settings.fromRow).forEach((setting) => {
				this.settings[setting.purpose] = setting
			})
			this.save()
			this.selectView('list')
		} catch (e) {
			alert(e.message)
		}
	}

	selectView(view) {
		this.enteredMaster = ''
		this.calculatedPassword = ''
		this.selectedView = view
		this.selectPurpose(this.selectedSettings.purpose)
	}

	clearGeneratedPassword() {
		if (this.calculatedPassword !== '') {
			this.calculatedPassword = ''
			this.enteredMaster = ''
		} else {
			return uilib.NO_CHANGE
		}
	}

	selectPurpose(purpose) {
		if (!this.settings[purpose]) {
			this.settings[purpose] = new Settings(purpose)
			this.save()
		}
		this.selectedSettings = this.settings[purpose]
		this.calculatedPassword = ''
		this.enteredMaster = ''
	}

	editPurpose(purpose) {
		this.selectPurpose(purpose)
		this.selectView('editor')
	}

	async generatePassword(masterPass) {
		this.enteredMaster = masterPass
		this.calculating = true
		this.calculatedPassword = await this.selectedSettings.password(masterPass)
		this.calculating = false
	}

	getEmojiSentence() {
		return summarize(emojiPerson, this.selectedSettings.toString()) +
				" " + summarize(emojiAction, this.enteredMaster) + " " +
				summarize(emojiObject, this.calculatedPassword)
	}

	settingsEdit(newSetting) {
		this.settings[newSetting.purpose] = newSetting
		this.selectedSettings = newSetting
		this.save()
		this.selectView('main')
	}

	deleteSettings(settingToRemove) {
		delete this.settings[settingToRemove.purpose]
		this.save()
	}

	save() {
		localStorage.setItem('mypass.settings', JSON.stringify(Object.values(this.settings)))
	}

	closeWindow() {
		window.close()
	}
}

function summarize(alphabet, string) {
	if (!string) {
		return ' '
	}
	let currentValue = 7
	for (let chr of string) {
		currentValue = currentValue * 31 + chr.codePointAt(0)
		currentValue = currentValue & 0xffffffffffff
	}
	return alphabet[currentValue % alphabet.length]
}