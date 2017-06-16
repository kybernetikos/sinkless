const NO_CHANGE = {}

function bindModel(model, app, pane) {
	function setContent(element, content) {
		element.innerHTML = ''
		element.appendChild(content)
	}

	function render() {
		setContent(pane, app(model, evolveState))
		const selectRequest = document.querySelector("[data-request-focus='true']")
		if (selectRequest) {
			selectRequest.focus()
		}
	}

	function evolveState(eventName, input) {
		if (eventName in model === false) {
			throw new Error(`No transformation '${eventName}' found, available transformations were [${Object.keys(model).join(', ')}].`)
		}
		const result = model[eventName](input)
		if (result instanceof Promise) {
			result.then((value) => value === NO_CHANGE ? null : render())
		}
		if (result !== NO_CHANGE) {
			render()
		}
	}

	render()

	return evolveState
}

const bindName = (fn) => new Proxy(fn, {
	get: function(target, property, receiver) {
		return fn.bind(null, property)
	}
})
