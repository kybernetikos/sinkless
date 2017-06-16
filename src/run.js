const model = new Model()
const application = bindModel(model, view, document.body)

window.tabs = null
if (window.chrome && window.chrome.tabs) {
	window.tabs = window.chrome.tabs
} else if (window.browser && window.browser.tabs) {
	window.tabs = window.browser.tabs
}

if (window.tabs) {
	tabs.query({active: true,currentWindow: true}, (activeTabs) => {
		const url = new URL(activeTabs[0].url)
		application('selectPurpose', url.origin)
	})
} else {
	application('selectPurpose', window.location.origin)
}

window.addEventListener('DOMContentLoaded', () => {
	// this because firefox doesn't seem to get focus otherwise
	setTimeout(() => window.focus(), 500)
})
