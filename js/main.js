;(function (name, context, definition) {
    if (typeof define === 'function' && define.amd) {
        define(definition);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = definition();
    } else {
        context[name] = definition();
    }
}('employee', this, function () {
    const getById = id => document.getElementById(id);
    const form = getById('form');
    const preview = getById('preview');
    const commands = getById('commands');

    function previewEmployee(obj, previewEl) {
        previewEl.textContent = JSON.stringify(obj, null, '  ');
    }

    function highlightElement(element) {
        element.classList && element.classList.add('highlight');
        var timer = setTimeout(function () {
            clearTimeout(timer);
            element.classList && element.classList.remove('highlight');
        }, 1000);
    }

    function onFormEvent(model, event) {
        const field = event.target;
        const fieldName = field.name;
        const fieldValue = field.value;

        switch (fieldName) {
            case 'firstName': model.firstName = fieldValue.trim(); break;
            case 'lastName': model.lastName = fieldValue.trim(); break;
            case 'email': model.email = fieldValue.trim(); break;
            case 'position': model.position = fieldValue.trim(); break;
            case 'gender': model.gender = fieldValue.trim(); break;
            case 'active': model.active = field.checked ? '1' : '0'; break;
        }
    }

    class Employee {
        constructor(firstName='', lastName='', email='', position='', gender='Male', active='0') {
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.position = position;
            this.gender = gender;
            this.active = active;

            const elementsNames = Array.from(form.elements).reduce((accum, current) => {
                var name = current.name;
                if (accum.indexOf(name) === -1) {
                    accum.push(name);
                }

                return accum;
            }, []).filter(item => item !== '');

            const elementsMap = Object.keys(this).reduce((accum, current, index) => {
                accum.set(current, form[`${elementsNames[index]}`]);
                return accum;
            }, new Map());

            const proxy = new Proxy(this, {
                get(target, key, receiver) {
                    console.log(`GET called for field: ${key}`);
                    return Reflect.get(target, key, receiver);
                },
                set(target, key, value, receiver) {
                    console.log(`SET called for field: ${key} and value: ${value}`);

                    const element = elementsMap.get(key);

                    if (typeof value !== 'string') {
                        throw new TypeError('Expected a string');
                    }

                    if (!target.hasOwnProperty(key)) {
                        throw new ReferenceError(`Property "${key}" is not allowed`);
                    }

                    if (key === 'active') {
                        element.checked = value === '1';
                    }

                    element.value = `${value}`;
                    target[key] = value;
                    highlightElement(element);
                    previewEmployee(target, preview);

                    return Reflect.set(target, key, value, receiver);
                }
            });

            elementsNames.forEach((item, index) => {
                let element = form[`${elementsNames[index]}`];
                let value = proxy[item];

                element.value = value;

                if (element.type === 'checkbox') {
                    element.checked = value === '1';
                }
            });

            return proxy;
        }

        reset(...args) {
            [
                this.firstName, this.lastName, this.email,
                this.position, this.gender, this.active
            ] = [...args];
        }
    }

    const employee = new Employee();

    previewEmployee(employee, preview);

    form.addEventListener('input', onFormEvent.bind(this, employee), false);
    form.addEventListener('change', onFormEvent.bind(this, employee), false);

    commands.addEventListener('click', event => {
        event.preventDefault();

        const target = event.target;
        const nodeName = target.nodeName;

        switch (nodeName) {
            case 'A': eval(target.getAttribute('data-command')); // jshint ignore: line
            break;
        }
    });

    return employee;
}));
