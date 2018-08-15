# nead

**nead** is a powerful but simple tool helping you to code in a more [declarative way](http://latentflip.com/imperative-vs-declarative) and to enhance [low coupling](https://en.wikipedia.org/wiki/Coupling_(computer_programming)) between your components thanks to [dependency injection](https://en.wikipedia.org/wiki/Dependency_injection).

Earnings this package can bring to your code:
- less and dynamic dependencies: **more scalability**
- identifiable dependencies: **more maintainability**
- injected dependencies: **easier testing** (automatic isolation, straightforward validated mocks, ...)
- easier to understand code: **more all**

> nead can be used both client and server sides.

[![Build][build-image]][build-url]
[![Coverage Status][coverage-image]][coverage-url]
[![Version][version-image]][version-url]
[![Downloads][downloads-image]][downloads-url]
[![Dependencies][dependencies-image]][dependencies-url]
[![Dev Dependencies][dev-dependencies-image]][dev-dependencies-url]

## Summary
- [Installation](#installation)
- [Use](#use)
  - [Dependency injector](#dependency-injector)
    - [Inject a simple dependency](#inject-a-simple-dependency)
    - [Validate dependencies](#validate-dependencies)
    - [Inject many dependencies all at once](#inject-many-dependencies-all-at-once)
    - [Obfuscate injected property](#obfuscate-injected-property)
    - [Define dependency getters and setters](#define-dependency-getters-and-setters)
    - [Define a value type dependency](#define-a-value-type-dependency)
    - [Define an optional dependency](#define-an-optional-dependency)
    - [Define a "proxified" dependency](#define-a-proxified-dependency)
      - [Factory](#factory-proxy)
      - [Registry](#registry-proxy)
      - [List](#list-proxy)
    - [Inject a dependency with an accessor](#inject-a-dependency-with-an-accessor)
  - [Dependency injection container](#dependency-injection-container)
    - [Instantiate a container](#instantiate-a-container)
    - [Use factories to create service definitions](#use-factories-to-create-service-definitions)
      - [Service](#service-factory)
      - [Registry](#registry-factory)
      - [List](#list-factory)
      - [Factory](#factory-factory)
      - [Data](#data-factory)
      - [Set](#set-factory)
    - [Build container](#build-container)
    - [Create services from a definition object](#create-services-from-a-definition-object)
  - [Composition](#composition)
  - [Hacking](#hacking)
    - [Define your own injection proxy](#define-your-own-injection-proxy)
    - [Define your own service definition factory](#define-your-own-service-definition-factory)
  - [Testing](#testing)
    - [Unit tests](#unit-tests)
    - [Integration tests](#integration-tests)
- [Testing](#testing-1)
- [Contributing](#contributing)
- [License](#license)

## Installation
Run the following command to add the package to your dependencies:
```sh
$ npm install --save nead
```

## Use
```js
// CommonJS
const nead = require('nead');

// ES6 modules
import nead from 'nead';
```

### Dependency injector
nead can be used as a simple dependency injector.

#### Inject a simple dependency
You can inject a dependency to an object thanks to `inject` method:
```js
nead.inject = function(object, propertyName, dependency)
```

Example:
```js
const greeter = {
  sayHello: function () {
    console.log('Hello world!');
  }
};
const program = {
  run: function () {
    this.greeter.sayHello();
  }
};

nead.inject(program, 'greeter', greeter);

program.run() // Display 'Hello world!'.
```

#### Validate dependencies
Ok, at this point, some of you wonder what is the benefit of doing that instead of a simple:
```js
const greeter = {
  sayHello: function () {
    console.log('Hello world!');
  }
};
const program = {
  run: function () {
    greeter.sayHello();
  }
};
```

It is a really long subject that we will not discuss here but you may want to read a bit more about [dependency injection](https://en.wikipedia.org/wiki/Dependency_injection)

Some others wonder why not just do:
```js
program.greeter = greeter;
```

And they are right!

For a good injection, you need to check the interface defining the interaction between your 2 objects. And this is where nead can help you! Let's take the previous `program` object definition and upgrade it a little:
```js
const program = {
  need: {
    // Define 'greeter' dependency.
    greeter: {
      // Define the interface the dependency must implement.
      interface: {
        methods: ['sayHello']
      }
    }
  },
  run: function () {
    this.greeter.sayHello();
  }
};
```

When defining method need, you implement the interface needed by nead to check the validity of your dependency:
```js
nead.inject(program, 'greeter', greeter);
// Check that 'greeter' dependency is an object implementing a 'sayHello' method
// (throw an error if it is not the case).
nead.validate(program);

program.run(); // Display 'Hello world!'.
```

This way you can quickly identify real dependencies between your 2 objects, check their validity during program initialization (i.e. before runtime) and replace your default `greeter` object:
```js
import config from 'config';

const greeter = {
  sayHello: function () {
    console.log('Hello world!');
  }
};
const personalGreeter = {
  need:  {
    name: {
      value: {type: 'string'}
    }
  },
  sayHello: function () {
    console.log(`Hello ${this.name}!`);
  }
};
const program = {
  need: {
    greeter: {
      interface: {
        methods: ['sayHello']
      }
    }
  },
  run: function () {
    this.greeter.sayHello();
  }
};

if (config.name) {
  nead.inject(personalGreeter, 'name', config.name);
  nead.inject(program, 'greeter', personalGreeter);
} else {
  nead.inject(program, 'greeter', greeter);
}
nead.validate(program);

program.run(); // Display 'Hello world!'.
```

> need property can also be a function in case you would like to evaluate an expression at injection time (like the current time for instance).

#### Inject many dependencies all at once
You can inject many dependencies in one call:
```js
nead.injectSet = function(object, dependencies) {}
```

Example:
```js
// ...

import dependency from 'dependency';

nead.injectSet(program, {
  greeter,
  anotherDependency: 'foo',
  anotherObjectDependency: dependency
});
// Validate the dependencies.
nead.validate(program);
```

You can also inject all dependencies and check in one call using the second argument of `injectSet` method. The following is equivalent to the previous example:

```js
// ...

import dependency from 'dependency';

// Inject and validate the dependencies.
nead.injectSet(program, {
  greeter,
  anotherDependency: 'foo',
  anotherObjectDependency: dependency
}, true);
```

#### Obfuscate injected property
You can use the `property` attribute to obfuscate the access to your dependencies:
```js
const greeter = Symbol('greeter');

class Program {
  get need() {
    return {
      greeter: {
        property: greeter,
        interface: {
          methods: ['sayHello']
        }
      }
    };
  }

  run() {
    this[greeter].sayHello();
  }
}
```

#### Define dependency getters and setters
You can also define getters and setters in your interface:
```js
class Program {
  get need() {
    return {
      greeter: {
        property: greeter,
        interface: {
          methods: ['sayHello', 'sayBye'],
          getters: ['name'],
          setters: ['name']
        }
      }
    };
  }

  // ...
}
```

#### Define a value type dependency
As you may have noticed in a previous example, it is possible to define a value type giving a validation schema:
```js
class personalGreeter {
  get need() {
    return {
      name: {
        value: {type: 'string'}
      }
    }
  }

  // ...
};
```

> Validation schemas are powered by [felv](https://github.com/gnodi/felv).

#### Define an optional dependency
You can set a dependency as optional:
```js
class Program {
  get need() {
    return {
      greeter: {
        property: greeter,
        interface: {
          methods: ['sayHello']
        },
        optional: true
      }
    };
  }

  // ...
}
```

#### Define a "proxified" dependency
In some cases, the real dependency is not directly on the injected object but in the objects provided by this latter.

##### Factory proxy
`factory` proxy helps you to create objects (or immutable values) with validated interface (or value) at runtime.
```js
// A factory must implement 'create' and 'getObjectPrototype' methods.
class GreeterFactory {
  create(dependencies) {
    return {
      sayHello: function () {
        console.log(`Hello ${dependencies.name}!`);
      }
    };
  }

  getObjectPrototype() {
    return create({name: 'foo'});
  }
}

class Program {
  get need() {
    return {
      personName: {
        value: {type: 'string', required: true}
      },
      greeterFactory: {
        // Allow to check that injected dependency has a `create` method
        // and the created objects respect the given interface.
        proxy: 'factory',
        interface: {
          methods: ['sayHello']
        }
      }
    };
  }

  run() {
    const greeter = this.greeterFactory.create({name: this.personName});
    greeter.sayHello();
  }
}

nead.injectSet(program, {
  personName: 'John Doe',
  greeterFactory: new GreeterFactory()
});
nead.validate(program);

program.run(); // Display 'Hello John Doe!'.
```

##### Registry proxy
`registry` proxy provides a way to pass a registry of objects (or immutable values) with validated interface (or value) as dependency.
```js
const greeters = {
  friend: {
    sayHello: function (firstName, lastName) {
      console.log(`Hi ${firstName}!`);
    }
  },
  superior: {
    sayHello: function (firstName, lastName) {
      console.log(`Good morning Mister ${lastName}.`);
    }
  }
};

// A registry must implement 'get' and 'getAll' methods.
class GreeterRegistry {
  get(key) {
    return greeters[key];
  }

  getAll() {
    return greeters;
  }
}

class Program {
  get need() {
    return {
      personName: {
        value: {type: 'string', required: true}
      },
      personProximity: {
        value: {type: 'string', default: 'superior'}
      },
      greeterRegistry: {
        // Allow to check that injected dependency has a `get` and `getAll` methods
        // and the registered objects respect the given interface.
        proxy: 'registry',
        interface: {
          methods: ['sayHello']
        }
      }
    };
  }

  run() {
    const greeter = this.greeterRegistry.get(this.personProximity);
    greeter.sayHello(this.firstName, this.lastName);
  }
}

nead.injectSet(program, {
  firstName: 'John',
  lastName: 'Doe',
  personProximity: 'friend',
  greeterRegistry: new GreeterRegistry()
});
nead.validate(program);

program.run(); // Display 'Hi John!'.

nead.injectSet(program, {
  firstName: 'John',
  lastName: 'Doe',
  personProximity: 'superior',
  greeterRegistry: new GreeterRegistry()
});
nead.validate(program);

program.run(); // Display 'Good morning Mister Doe.'.
```

##### List proxy
`list` proxy provides a way to pass an ordered list of objects (or immutable values) with validated interface (or value) as dependency.
```js
const greeters = [
  {
    sayHello: function (firstName, lastName) {
      console.log(`Hi ${firstName}!`);
    }
  },
  superior: {
    sayHello: function (firstName, lastName) {
      console.log(`Good morning Mrs. ${lastName}.`);
    }
  }
];

class Program {
  get need() {
    return {
      personName: {
        value: {type: 'string', required: true}
      },
      greeterIndex: {
        value: {type: 'number', default: 0}
      },
      greeters: {
        // Allow to check that injected dependency is an instance of `Array`
        // and the item objects respect the given interface.
        proxy: 'list',
        interface: {
          methods: ['sayHello']
        }
      }
    };
  }

  run() {
    const greeter = this.greeters[this.greeterIndex];
    greeter.sayHello(this.firstName, this.lastName);
  }
}

nead.injectSet(program, {
  firstName: 'Jane',
  lastName: 'Doe',
  greeterIndex: 0,
  greeters: []
});
nead.validate(program);

program.run(); // Display 'Hi Jane!'.

nead.injectSet(program, {
  firstName: 'Jane',
  lastName: 'Doe',
  greeterIndex: 1,
  greeters: []
});
nead.validate(program);

program.run(); // Display 'Good morning Mrs. Doe.'.
```

#### Inject a dependency with an accessor
In some rare cases (external lib service, specific object, ...), you may need to use an accessor to inject a dependency.
In that kind of situation, you can use a (`{injectedValue, injectDependency}`) wrapper around your injected dependency:
```js
const originalObject = ['plop'];

const injectedObject = injector.inject(
  originalObject,
  'items',
  {
    injectedValue: ['plip', 'plup'],
    injectDependency: (object, value) => {
      value.forEach(item => object.push(item));
    }
  }
);

console.log(injectedObject); // ['plop', 'plip', 'plup']
console.log(originalObject); // ['plop']
```

> Use it with caution because it becomes easier to break immutability.

### Dependency injection container
Of course, this is a nice thing to inject dependencies like that but it can be a little tedious to:
- instantiate all your services in the correct order
- instantiate helper objects (registries, lists, ...)
- cut your (too big unreadable) injection file

No problem! You can pass to the next level of dependency injection using a dependency injection container!

#### Instantiate a container
```js
const options = {};
const container = nead.createContainer();
```

#### Use factories to create service definitions
You can create service definitions thanks to container `create` method:
```js
container.create = function (factoryName, creationName, creationOptions) {}
```

Arguments:
- `{string} factoryName`: The service factory to use for creation.
- `{string} creationName`: The name used for service creation(s).
- `{Object} [creationOptions={}]`: The options used for service creations (specific to the factory).

As you can define your own factories, there are some you can already use for main cases.

In following examples, we are going to use previous injection chapter `program` and `greeter` objects without referring to their implementations in order to focus on the most important part.

##### Service factory
You can define simple services with `service` factory:
```js
container.create('service', 'greeter', {
  object: Greeter
});

container.create('service', 'program', {
  object: program,
  singleton: true,
  dependencies: {
    // Inject 'greeter' service in 'greeter' need property if exists,
    // property descriptor or simple property.
    greeter: '#greeter'
  }
});
```

Creation options:
- `{Object} object`: The service.
- `{boolean} [singleton=false]`: If set to true, use the given service value as is, otherwise use `new` operator on functions and `Object.create` on objects.
- `{Object} [dependencies={}]`: The dependencies (keys being simple properties, property descriptors or need property/function returned keys).
- `{Object} [need]`: A need definition to merge with service own need definition.

> `#greeter` is a reference string to a service that will be resolved at container building.
> If you want to inject a standard string starting with a `#`, escape it with a double `##`.

##### Registry factory
You can define a registry of dependencies thanks to `registry` factory:
```js
container.create('service', 'superiorGreeter', {
  object: SuperiorGreeter
});

container.create('registry', 'greeterRegistry' {
  type: 'greeter',
  items: {
    friend: FriendGreeter,
    family: FamilyGreeter,
    superior: '#superiorGreeter',
    boss: '#superiorGreeter',
    default: {
      sayHello: (name) => {
        console.log(`hi ${name}!`);
      }
    }
  }
});
```

This will create a registry service with 5 items (`friend`, `family`, `superior`, `boss`, `default`) and a `superiorGreeter` service.

Creation options:
- `{string} [type=item]`: The type of item of the registry. Generate default name from service key (e.g. `superGreeterRegistry` => `super greeter`).
- `{Object} items`: An object of homogeneous services/values.

Then, you can use your registry like the following:
```js
registry.get('friend').sayHello('John Doe');
```

> Remember that you can [check real dependencies with registry items](#registry-proxy).

##### List factory
You can define an ordered list of dependencies thanks to `list` factory:
```js
container.create('service', 'superiorGreeter', {
  object: SuperiorGreeter
});

container.create('list', 'greeterList' {
  items: [FriendGreeter, FamilyGreeter, '#superiorGreeter']
});
```

This will create an ordered list service with 3 items [`friend`, `family`, `superior`] and a `superiorGreeter` service.

Creation options:
- `{Array|Object} items`: An array (or object for unordered list) of homogeneous services/values.

Then, your list is an instance of `Array` that you can use like the following:
```js
list[1].sayHello('John Doe');
```

> Remember that you can [check real dependencies with list items](#list-proxy).

##### Factory factory
You can define a factory of dependencies thanks to `factory` factory:
```js
container.create('factory', 'greeterFactory', {
  object: Greeter,
  dependencies: {
    proximity: 'friend'
  }
});
```

This will create a factory service allowing to instantiate greeter objects and inject them a `proximity` dependency of value `friend`.

Creation options:
- `{function|Object} object`: The constructor or prototype.
- `{Object} [dependencies={}]`: The dependencies (keys being simple properties, property descriptors or need property/function returned keys).

Then, you can use your factory like the following:
```js
factory.create({name: 'Bobby'});
```

> Note that you can give dependencies at application initialization in the factory definition (e.g. `proximity`) or at instantiation time (e.g. `name`).

> Remember that you can [check real dependencies with instantiated objects](#factory-proxy).

##### Data factory
You can define a structured data dependency thanks to `data` factory:
```js
container.create('data', 'config', {
  data: {
    names: {
      myName: 'Jane Doe',
      yourName: 'John Doe'
    }
  },
  schema: {
    names: {
      type: 'object',
      properties: {
        type: 'string'
      }
    }
  }
});
```

Creation options:
- `{Object} data`: The data.
- `{Object} [schema]`: The optional validation schema (powered by [felv](https://github.com/gnodi/felv)).

Then, you can inject some part of your data like the following for instance:
```js
container.create('service', 'greeter.me', {
  object: Greeter,
  dependencies: {
    name: '#config.names.myName'
  }
});
container.create('service', 'greeter.you', {
  object: Greeter,
  dependencies: {
    name: '#config.names.yourName'
  }
});
```

> An example of use case for `data` factory is to define a configuration describing a dynamic execution flow from low coupled components.

##### Set factory
You can define a set of services thanks to `set` factory:
```js
container.create('set', 'greeter', {
  items: {
    friend: {
      object: FriendGreeter,
      dependencies: {
        name: 'Jane Doe'
      }
    },
    stranger: {
      object: strangerGreeter,
      singleton: true
    }
  },
  dependencies: {
    name: 'John Doe'
  },
  registry: 'greeterRegistry',
  list: 'greeterList'
});
```

This will create 4 services:
- 2 greeters: `greeter.friend` and `greeter.stranger`
- 1 registry: `greeterRegistry` containing the 2 greeters
- 1 list: `greeterList` containing the 2 greeters

Creation options:
- `{Object} items`: An object of items with the same options as for [`service` factory](#service-factory). Options will override default ones defined in the definition root.
- `{Object} [object]`: The default service (constructor or prototype for instance).
- `{boolean} [singleton=false]`: The default singleton value. If set to true, use the given service value as is, otherwise use `new` operator on functions and `Object.create` on objects.
- `{Object} [dependencies={}]`: The dependencies (keys being simple properties, property descriptors or need property/function returned keys) that will be injected to all created services.
- `{string} [registry]`: An optional registry name to create containing the created services.
- `{string} [list]`: An optional list name to create containing the created services.

#### Build container
When you are done with all your service definitions, you can build your container to instantiate all your services:
```js
container.build();
```

Here is the algorithm used during building:
1. Sort definitions in instantiation order
2. For each definition
  1. Instantiate service
  2. Resolve references
  3. Merge service need with definition need.
  4. Inject and validate dependencies
  5. Build service references

#### Create services from a definition object
Ok, this is correcting previous exposed problems but it is still a bit verbose. Instead of defining each factory independently, you can call many factories at the same time using `createSet` method:
```js
container.createSet = function(definitions, build = false) {}
```

Example:
```js
container.createSet({
  // Create  a simple `program` service.
  program: {
    factory: 'service',
    object: program,
    singleton: true,
    dependencies: {
      greeterRegistry: '#greeterRegistry'
    }
  },
  // Create a set of `greeter` services with a registry.
  greeter: {
    factory: 'set',
    items: [
      {
        name: 'friend',
        object: FriendGreeter
      },
      {
        name: 'stranger',
        object: strangerGreeter,
        singleton: true
      }
    ],
    dependencies: {
      name: '#config.names.myName'
    },
    registry: 'greeterRegistry',
  },
  // Create a data `config` service.
  config: {
    factory: 'data',
    data: {
      names: {
        myName: 'Jane Doe'
      }
    },
    schema: {
      names: {
        type: 'object',
        properties: {
          type: 'string'
        }
      }
    }
  }
});

container.build();
```

You can create all definitions and build the container in one call using the second argument of `createSet` method:
```js
container.createSet({
  // ...
}, true);
```

### Composition
A nice feature in nead is that you can compose your containers thanks to `compose` method:
```js
container.compose = function(namespace, container) {}
```
This is useful in order to use service definitions of dependency packages.

Let's take the code of this third party container for instance:
```js
import nead from 'nead';

export const container = nead.createContainer();

container.createSet({
  greeter: {
    object: Greeter
  },
  // ...
});

container.build();
```

You can use it services in your own one thanks to composition:
```js
import nead from 'nead';
import {container as thirdPartyContainer} from 'thirdParty';

const container = nead.createContainer();

// Compose with my third party container.
container.compose('thirdParty', thirdPartyContainer);

container.createSet({
  program: {
    object: program,
    dependencies: {
      // Inject third party greeter as dependency.
      greeter: '#thirdParty.greeter'
    }
  },
  // ...
});

container.build();
```

> You can use all third party container services as it would be your own just by prefixing them
> with the namespace passed to the 'compose' method.

### Hacking
**This part is not implemented yet.**

Here is some tricks to customize your nead experience!

#### Define your own injection proxy
```js
nead.addInjectionProxy('myInjectionProxy', schema, (options) => {
  // ...
});
```

#### Define your own service definition factory
```js
nead.addServiceDefinitionFactory('myServiceDefinitionFactory', schema, (options) => {
  // ...
});
```

### Testing
#### Unit tests
Using dependency injection pattern is usually a nice thing for your unit tests (automatic isolation, straightforward validated mocks, ...). Of course, you can use nead to inject your mocks and stubs and easily validate their interfaces:
```js
import nead from 'nead';
import greeter from './greeter';

nead.injectSet(greeter, {
  name: 'John Doe',
  target: 'friend'
}, true);

// ...
```

#### Integration tests
In integration tests you would like to test the interactions between many objects and services.

To make your life easy, you may want to define one (or more) mocked (or not) container(s):
```js
// test/fixtures/container.js

const nead = require('nead');
const Greeter = require('./Greeter');

const container = nead.createContainer();

container.createSet({
  greeter: {
    object: Greeter
  },
  // ...
}, true);

module.exports = container;
```

Then, use it in your tests:
```js
// test/integration/index.js

const container = require('../fixtures/container');

const greeter = container.get('greeter');

// ...
```

## Testing
Many `npm` scripts are available to help testing:
```sh
$ npm run {script}
```
- `check`: lint and check unit and integration tests
- `lint`: lint
- `test`: check unit tests
- `test-coverage`: check coverage of unit tests
- `test-debug`: debug unit tests
- `test-integration`: check integration tests
- `test-watch`: work in TDD!

Use `npm run check` to check that everything is ok.

## Contributing
If you want to contribute, just fork this repository and make a pull request!

Your development must respect these rules:
- fast
- easy
- light

You must keep test coverage at 100%.

## License
[MIT](LICENSE)

## TODO
- upgrade validation error tracking (upgrade felv namespace)
- add lib hacking helpers
- add logging and dependency graph
    A dependency graph is logged at debug level:
    ```sh
    |- program
       |- greeterRegistry
          |- greeter.friend
          |- greeter.family
          |- strangerGreeter
    ```

[build-image]: https://img.shields.io/travis/gnodi/nead.svg?style=flat
[build-url]: https://travis-ci.org/gnodi/nead
[coverage-image]:https://coveralls.io/repos/github/gnodi/nead/badge.svg?branch=master
[coverage-url]:https://coveralls.io/github/gnodi/nead?branch=master
[version-image]: https://img.shields.io/npm/v/nead.svg?style=flat
[version-url]: https://npmjs.org/package/nead
[downloads-image]: https://img.shields.io/npm/dm/nead.svg?style=flat
[downloads-url]: https://npmjs.org/package/nead
[dependencies-image]: https://david-dm.org/gnodi/nead.svg
[dependencies-url]: https://david-dm.org/gnodi/nead
[dev-dependencies-image]: https://david-dm.org/gnodi/nead/dev-status.svg
[dev-dependencies-url]: https://david-dm.org/gnodi/nead#info=devDependencies
