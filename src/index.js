
const ERRORS = {
  CONSTANTS: {
    MIN_ARRAY: `Enum expected argument 'constants' to be an array of length >= 2`,
    ARRAY: `Enum expected argument 'constants' to be a non-empty array`,
    ARRAY_LENGTH: `Enum expected argument 'constants' to have even length`,
    NAME: (c, i) => {
      return 'Enum constants must be valid upper case variable names. ' +
             `Constant '${c}', at index ${Math.floor(i / 2)}, violates this invariant`;
    },
    DUPLICATE: (k) => `Duplicate Enum constant for key '${k}'`,
    KEY_AND_ID: `Enum constants' members cannot be named '$key' or '$id' as it would override default behaviour`,
    TYPEOF: (type, val, i) => `Enum expected constant key '${typeof val === 'symbol' ? val.toString() : val}' at index ${i} to be of type ${type}. Found ${typeof val} instead`
  },
  BEHAVIOUR: {
    TYPEOF: (be) => `Enum expected argument 'behaviour' to be an object. Found ${typeof be === 'symbol' ? be.toString() : typeof be} instead`,
    KEY_AND_ID: `Enum constants' behaviour properties cannot be named '$key' or '$id' as it would override default behaviour`
  },
  CONCAT: {
    TYPEOF: (e, i) =>
      `Enum.concat expected first argument to be an Array of Enums. Found ` +
      `${e && typeof e === 'object' ? `instanceof ${e.constructor.name}` : e === null ? null : typeof e} in the lot instead.`,
    DUPLICATE: (k) => `Enum.concat: Duplicate Enum constant for key '${k}'`
  }
};

const CONST_REGEX = /^[$A-Z_][0-9A-Z_$]*$/;

class Enum {
  constructor(constants, behaviour = {}){
    this.symbolOnly = typeof behaviour === 'boolean' && behaviour;
    this[Symbol.iterator] = this.iterator;

    // Concatenation of multiple Enums
    if(Array.isArray(constants) && constants.length && constants.every((c) => c instanceof Enum)){
      // To check if not just default behaviour
      if(!this.symbolOnly){
        return ConcatenatedEnumerable.call(this, constants, behaviour);
      }
      return ConcatenatedEnumerable.call(this, constants);
    // Single Enum
    }else{
      // symbolOnly
      if(this.symbolOnly){
        return SymbolOnlyEnumerable.call(this, constants);
      // if behaviour is undef or object => Enumerable
      }else if(behaviour && typeof behaviour === 'object'){
        return Enumerable.call(this, constants, behaviour);
      // else is null, function, string, symbol, number, false
      }else{
        throw new TypeError(ERRORS.BEHAVIOUR.TYPEOF(behaviour));
      }
    }
  }

  static concat(enums, opts = {}) {
    // Validation
    const options = opts && typeof opts === 'object' ? opts : {};
    enums.forEach((e, i) => {
      if(!(e instanceof Enum)){
        throw new TypeError(ERRORS.CONCAT.TYPEOF(e, i));
      }
    });

    // Clean Concat (New constants)
    if(options.clean){
      const allSymbolOnly = enums.every(e => e.symbolOnly);
      const set = new Set();
      const { constants, behaviour } = enums.reduce((a, e) => {
        for(const key of e.$keys){
          if(set.has(key)){
            throw new Error(ERRORS.CONCAT.DUPLICATE(key));
          }
          set.add(key);
          a.constants.push(key);
          if(!options.symbolOnly && !allSymbolOnly){
            if(e[key] instanceof Object && 'value' in e[key]) {
              a.constants.push(e[key].value);
            }else{
              a.constants.push({});
            }
          }
        }
        if(!options.symbolOnly && !options.behaviour && e.behaviour){
          a.behaviour = a.behaviour
            ? { ...a.behaviour, ...e.behaviour }
            : { ...e.behaviour };
        }
        return a;
      }, { constants: [], behaviour: undefined });

      // This essentially calls the normal Enumerable constructor
      return new Enum(constants, options.symbolOnly || options.behaviour || behaviour || true);
    }
    // Dirty Concat (Referenced constants); calls ConcatenatedEnumerable constructor
    return options.symbolOnly || (enums.every((e) => e.symbolOnly) && !options.behaviour)
      ? new Enum(enums, true)
      : new Enum(enums, options.behaviour);
  }

  iterator(){
    const self = this;
    return (function * () {
      for(let i = 0; i < self.$keys.length; i++){
        yield self.symbolOnly ? self[self.$keys[i]] : self[self.$keys[i]];
      }
    })();
  }

  keys(){
    return this.$keys.slice();
  }

  values(){
    return this.$keys.map((k) => this[k]);
  }

  entries(){
    return this.$keys.map((k) => [k, this[k]]);
  }
}

function Enumerable(constants, behaviour){
  // Validation
  if(!Array.isArray(constants) || constants.length < 2){
    throw new Error(ERRORS.CONSTANTS.MIN_ARRAY);
  }
  if(!((constants.length + 1) % 2)){
    throw new Error(ERRORS.CONSTANTS.ARRAY_LENGTH);
  }

  // Enum.$keys
  this.$keys = constants.filter((a, i) => !(i % 2));
  if(this.$keys.length !== new Set(this.$keys).length){
    [...this.$keys].sort().reduce((k, k2) => {
      if(k === k2){
        throw new Error(ERRORS.CONSTANTS.DUPLICATE(k));
      }
    });
  }

  // Enum.behaviour
  this.behaviour = behaviour;

  // Enum constants
  for(let i = 0; i < constants.length; i = i + 2){
    if(!CONST_REGEX.test(constants[i])){
      throw new Error(ERRORS.CONSTANTS.NAME(constants[i], i));
    }
    const id = Symbol(constants[i]);
    const enumerable = Object(id);
    const value = constants[i + 1];
    const valueIsObject = (value && typeof value === 'object');
    enumerable.__defineGetter__('$key', () => constants[i]);
    enumerable.__defineGetter__('$id', () => id);
    enumerable.value = value;

    for(const key of Object.keys(behaviour)){
      if(key === '$key' || key === '$id'){
        throw new Error(ERRORS.BEHAVIOUR.KEY_AND_ID);
      }
      if(!valueIsObject || !(key in value)){
        enumerable.__defineGetter__(key, () => this.behaviour[key]);
      }
    }

    if(valueIsObject){
      for(const key of Object.keys(value)){
        if(key === '$key' || key === '$id'){
          throw new Error(ERRORS.CONSTANTS.KEY_AND_ID);
        }
        enumerable.__defineGetter__(key, () => value[key]);
      }
    }

    this.__defineGetter__(enumerable.$key, () => enumerable);
  }

  return this;
}

function SymbolOnlyEnumerable(constants){
  // Validation
  if(!Array.isArray(constants) || !constants.length){
    throw new Error(ERRORS.CONSTANTS.ARRAY);
  }
  if(constants.length !== new Set(constants).length){
    [...constants].sort().reduce((k, k2) => {
      if(k === k2){
        throw new Error(ERRORS.CONSTANTS.DUPLICATE(k));
      }
    });
  }
  this.$keys = [];
  for(let i = 0; i < constants.length; i++){
    const key = constants[i];
    if(typeof key !== 'string'){
      throw new TypeError(ERRORS.CONSTANTS.TYPEOF('string', key, i));
    }
    if(!CONST_REGEX.test(constants[i])){
      throw new Error(ERRORS.CONSTANTS.NAME(key, i));
    }
    const c = Symbol(key);
    this.$keys.push(key);
    this.__defineGetter__(key, () => c);
  }
  return this;
}

function ConcatenatedEnumerable(enums, behaviour){
  if(!this.symbolOnly){
    this.behaviour = behaviour;
  }
  this.$keys = [];
  for(const e of enums){
    for(const k of e.$keys){
      if(this.$keys.indexOf(k) !== -1){
        throw new Error(ERRORS.CONCAT.DUPLICATE(k));
      }
      this.$keys.push(k);
      this.__defineGetter__(k, () => e[k]);
    }
  }
}

export default Enum;
