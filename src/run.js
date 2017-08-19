let global = window
global.tabs = null
let isExtension = false
if (global.chrome && global.chrome.tabs) {
	global.tabs = global.chrome.tabs
	isExtension = true
} else if (global.browser && global.browser.tabs) {
	global.tabs = global.browser.tabs
	isExtension = true
}

const model = new Model()
const application = uilib.bindModel(model, view, document.body)

if (isExtension) {
	tabs.query({active: true,currentWindow: true}, (activeTabs) => {
		const url = new URL(activeTabs[0].url)
		application('selectPurpose', url.origin)
	})
} else {
    const query = global.location.search.substring(1).split("&").map((pair) => pair.split('=')).reduce((result, [key, value]) => Object.assign(result, {[key]: value === undefined ? true : value}), {})
	application('selectPurpose', query.purpose || global.location.origin)
}

window.addEventListener('DOMContentLoaded', () => {
	// this because the firefox plugin doesn't seem to get focus otherwise
	setTimeout(() => global.focus(), 500)
})
