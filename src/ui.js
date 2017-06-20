const uilib = {
	NO_CHANGE: {},

	// convenience acquisition of tag bound elem functions
	tags: new Proxy({}, {
		get: function(target, tagName, receiver) {
			return elem.bind(null, tagName)
		}
	}),

	// binds a model to render into a pane.  Once this has happened, the model should never be updated
	// except by calling the returned function with an event name.
	bindModel(model, app, pane) {
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
				result.then((value) => value === uilib.NO_CHANGE ? null : render())
			}
			if (result !== uilib.NO_CHANGE) {
				render()
			}
		}

		render()

		return evolveState
	}
}

// creates elements from a tag, some attributes and some children
function elem(tag, attribs = {}, ...children) {
	const element = document.createElement(tag)
	if (attribs instanceof Node || type(attribs) !== 'object') {
		children.unshift(attribs)
		attribs = {}
	}
	for (let key in attribs) {
		const value = attribs[key]
		if (key in element) {
			if (element[key] !== null && type(element[key]) === 'object') {
				for (let innerKey in value) {
					element[key][innerKey] = value[innerKey]
				}
			} else {
				element[key] = value
			}
		} else {
			element.setAttribute(key, value)
		}
	}
	appendChild(element, children)
	return element
}

// Appends nodes, arrays or strings to dom elements
function appendChild(element, child) {
	if (child instanceof Node) {
		element.appendChild(child)
	} else if (Array.isArray(child)) {
		child.forEach((child) => appendChild(element, child))
	} else {
		element.append(document.createTextNode(String(child)))
	}
}

function type(thing) {
	return Array.isArray(thing) ? 'array' : typeof thing
}