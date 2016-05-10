;(function (name, context, definition) {
    if (typeof define === 'function' && define.amd) {
        define(definition);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = definition();
    } else {
        context[name] = definition();
    }
}('employee', this, function () {
    const form = document.getElementById('form');
    const preview = document.getElementById('preview');
    const commands = document.getElementById('commands');

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

    class Employee {
        constructor(firstName='', lastName='', email='', position='', gender='Male', active='0') {
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.position = position;
            this.gender = gender;
            this.active = active;

            console.info(arguments);

            const elementsNames = Array.from(form.elements).reduce((accum, current) => {
                var name = current.name;
                if (accum.indexOf(name) === -1) {
                    accum.push(name);
                }

                return accum;
            }, []).filter(item => item !== '');

            const elementsMap = Object.keys(this).reduce((accum, current, index) => {
                accum[current] = form[`${elementsNames[index]}`];
                return accum;
            }, {});

            const proxy = new Proxy(this, {
                get(target, key, receiver) {
                    console.log(`GET called for field: ${key}`);
                    return Reflect.get(target, key, receiver);
                },
                set(target, key, value, receiver) {
                    console.log(`SET called for field: ${key} and value: ${value}`);

                    if (typeof value !== 'string') {
                        throw new TypeError('Expected a string');
                    }

                    if (!target.hasOwnProperty(key)) {
                        throw new ReferenceError(`Property "${key}" is not allowed`);
                    }

                    if (key === 'active') {
                        elementsMap[key].checked = value === '1';
                    }

                    elementsMap[key].value = `${value}`;
                    target[key] = value;
                    highlightElement(elementsMap[key]);
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

    let employee = new Employee();

    form.firstName.addEventListener('input', event => employee.firstName = event.target.value);
    form.lastName.addEventListener('input', event => employee.lastName = event.target.value);
    form.email.addEventListener('input', event => employee.email = event.target.value);
    form.position.addEventListener('change', event => employee.position = event.target.value);
    Array.from(form.gender).forEach(element => {
        element.addEventListener('change', event => employee.gender = event.target.value);
    });
    form.active.addEventListener('change', event => employee.active = event.target.checked ? '1' : '0');
    previewEmployee(employee, preview);

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
