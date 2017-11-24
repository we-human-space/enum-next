# Enumerated Type

> JS Implementation of the Java Enumerable type

[![npm version](https://badge.fury.io/js/enum-next.svg)](https://badge.fury.io/js/enum-next)
[![Travis Build Status](https://travis-ci.org/we-human-space/enum-next.svg?branch=master)](https://travis-ci.org/we-human-space/misstep)
[![Coverage Status](https://coveralls.io/repos/github/we-human-space/enum-next/badge.svg?branch=master)](https://coveralls.io/github/we-human-space/enum-next?branch=master)
[![Dependencies Status](https://david-dm.org/we-human-space/enum-next.svg)](https://david-dm.org/)

### Table of Contents

* [What is an Enumerated Type (Enum)?](#what-is)
* [Why should I use Enums?](#why)
* [Installation](#installation)
* [API](#api)

### <a name="what-is"></a>What is an Enumerated Type (Enum)?

> In computer programming, an enumerated type [...] is a data type consisting of
a set of named values called elements, members, enumeral, or enumerators of the
type. The enumerator names are usually identifiers that behave as constants in
the language. [...]

> Conceptually, an enumerated type is similar to a list of nominals (numeric
codes), since each possible value of the type is assigned a distinctive natural
number. A given enumerated type is thus a concrete implementation of this notion.
When order is meaningful and/or used for comparison, then an enumerated type
becomes an ordinal type.

— "Enumerated type" on [Wikipedia](https://en.wikipedia.org/wiki/Enumerated_type)

### <a name="why"></a>Why should I use Enums?

Enumerated types are useful as iterable, ordinal constants to which behaviour
can be attached. They are especially useful for declaring constants in a
consistent, expressive way. See [this StackOverflow question](https://stackoverflow.com/questions/3519429/what-is-main-use-of-enumeration#3519460)
as for how to use enums.

A non-native JS implementation of Enums such as this one do not however provide
the benefits of type-safe or increase of compile-time type
checkup. What it *does* provides however, is a **clean interface for declaring
semantically meaningful groups of constants**, **full constant support** through
ES2015 Symbols, and giving them **shared and non-shared state and behaviour**.

For example, here is an Enum of the planets of the solar system (translated from this [Java
documentation example on Enums](https://docs.oracle.com/javase/tutorial/java/javaOO/enum.html)):

```js
const PLANETS = new Enum(
  [
    'MERCURY', { mass: 3.303e+23, radius: 2.4397e6 },
    'VENUS',   { mass: 4.869e+24, radius: 6.0518e6 },
    'EARTH',   { mass: 5.976e+24, radius: 6.3781e6 },
    'MARS',    { mass: 6.421e+23, radius: 3.3972e6 },
    'JUPITER', { mass: 1.900e+27, radius: 7.1492e7 },
    'SATURN',  { mass: 5.688e+26, radius: 6.0268e7 },
    'URANUS',  { mass: 8.686e+25, radius: 2.5559e7 },
    'NEPTUNE', { mass: 1.024e+26, radius: 2.4746e7 }
  ],
  {
    // universal gravitational constant  (m3 kg-1 s-2)
    G: 6.67300E-11,
    surfaceGravity(){
      return this.G * this.mass / (Math.pow(this.radius, 2));
    },
    surfaceWeight(mass){
      return this.surfaceGravity() * mass;
    }
  }
);

```

Not only does it provide a clear, visual cue of this being a set of constants,
but it also provides a neat interface:  

```js
PLANETS.MERCURY; // Symbol {mass: 3.303e+23, radius: 2439700, G: 6.673e-11, …}
PLANETS.MERCURY.$id; // Symbol(MERCURY)
PLANETS.MERCURY.$key; // 'MERCURY'
PLANETS.EARTH.surfaceGravity(); // 9.803
PLANETS.VENUS.mass === PLANETS.JUPITER.mass; // false
```

It is also easy to switch on an Enum:

```js
switch(value){
case PLANETS.MERCURY:
  // action
  break;
case PLANETS.VENUS:
  // action
  break;

...

default:
  // action
  break;
}
```

With the `symbolOnly` argument, one can create a Symbol-only enumerable:

```js
const PLANETS = new Enum(
  [
    'MERCURY',
    'VENUS',  
    'EARTH',  
    'MARS',   
    'JUPITER',
    'SATURN',
    'URANUS',
    'NEPTUNE',
  ],
  true
);
```

```js
PLANETS.MERCURY // Symbol(MERCURY)
PLANETS.MERCURY.mass // undefined
PLANETS.VENUS // Symbol(VENUS)
...
PLANETS.NEPTUNE // Symbol(NEPTUNE)
```

### <a name="installation"></a>Installation

`
yarn add enum-next
`

**ESM:**

```js
import Enum from 'enum-next';

const ENUM = new Enum([...],{...});
```

**ES5:**

```js
const Enum = require('enum-next');

const ENUM = new Enum([...],{...});
```


### <a name="api"></a>API

#### new Enum(constants [, behaviour])

`// Enum :: [string, \*, ..., string, \*], Object -> Enum`

* `constants` {Array}: Array containing all of your constants, with the keys
  at each even index and the member values at each odd index.
  * **Keys** have to be strings and valid `UPPERCASE_CONSTANTS` variable names.
  * **Values** can be anything. Objects will be expanded and their properties bound
    to the constant - think `PLANETS.VENUS.mass`. Non-object values will be
    assigned to `constant.val` - think `PLANETS.VENUS.val`
* `behaviour` {Object}: Object containing all of the state and behaviour that
  should be shared by all of the constants. These will be bound to the constants.

Constructor for the Enum type.

#### new Enum(constants, symbolOnly)

`// Enum :: [string, \*, ..., string, \*], Bool -> Enum`

* `constants` {Array}: Array containing all of your constants, with the keys
  at each even index and the member values at each odd index.
  * **Keys** have to be strings and valid `UPPERCASE_CONSTANTS` variable names.
  * **Values** can be anything. Objects will be expanded and their properties bound
    to the constant - think `PLANETS.VENUS.mass`. Non-object values will be
    assigned to `constant.val` - think `PLANETS.VENUS.val`
* `symbolOnly` {boolean}: If all values in constants are strings, will convert all
  strings in symbol and return an enum of Symbols without any extra properties.
  Defaults to false.

Constructor for the Enum type. Returns an enum that is only comprised of Symbols.

#### Enum#iterator()

`// Enum.iterator :: * -> Iterator`

Returns an iterator for the current Enum. Can be used in conjunction with `for..of`.

**N.B.:** It is not necessary to use Enum.iterator to use `for..of` - the Enum
objects are iterable by default :rainbow:

#### Enum#keys()

`// Enum.keys :: * -> [string]`

Returns an array of all the constant keys provided to the constructor.

#### Enum#values()

`// Enum.values :: * -> [Symbol]`

Returns an array of all the Symbol values. If symbolOnly is specified, primitive
Symbols will be returned; Object(Symbol) otherwise.
