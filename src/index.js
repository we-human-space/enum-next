
const ERRORS = {
  CONSTANTS: {
    ARRAY: `Enum expected argument 'constants' to be an array of length >= 2`,
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
  }
};

const CONST_REGEX = /^[$A-Z_][0-9A-Z_$]*$/;

class Enum {
  constructor(constants, behaviour = {}){
    this.symbolOnly = typeof behaviour === 'boolean' && behaviour;
    this[Symbol.iterator] = this.iterator;
    // if behaviour is undef, false or object => Enumerable
    if((behaviour && typeof behaviour === 'object') || (!behaviour && typeof behaviour === 'boolean')){
      return Enumerable.call(this, constants, behaviour);
    // symbolOnly
    }else if(this.symbolOnly){
      return SymbolOnlyEnumerable.call(this, constants);
    // else is null, function, string, symbol, number
    }else{
      throw new TypeError(ERRORS.BEHAVIOUR.TYPEOF(behaviour));
    }
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

function Enumerable(constants, behaviour, symbolOnly){
  if(!Array.isArray(constants) || constants.length < 2){
    throw new Error(ERRORS.CONSTANTS.ARRAY);
  }
  if(!((constants.length + 1) % 2)){
    throw new Error(ERRORS.CONSTANTS.ARRAY_LENGTH);
  }
  this.$keys = constants.filter((a, i) => !(i % 2));
  if(this.$keys.length !== new Set(this.$keys).length){
    [...this.$keys].sort().reduce((k, k2) => {
      if(k === k2){
        throw new Error(ERRORS.CONSTANTS.DUPLICATE(k));
      }
    });
  }

  for(let i = 0; i < constants.length; i = i + 2){
    if(!CONST_REGEX.test(constants[i])){
      throw new Error(ERRORS.CONSTANTS.NAME(constants[i], i));
    }

    const id = Symbol(constants[i]);
    const members = constants[i + 1];
    const enumerable = Object(id);
    enumerable.__defineGetter__('$key', () => constants[i]);
    enumerable.__defineGetter__('$id', () => id);

    if(!(members && typeof members === 'object')){
      enumerable.val = members;
    }else{
      for(let key in constants[i + 1]){
        if(key === '$key' || key === '$id'){
          throw new Error(ERRORS.CONSTANTS.KEY_AND_ID);
        }
        enumerable[key] = constants[i + 1][key];
      }
    }

    this.behaviour = behaviour;
    for(let key in behaviour){
      if(key === '$key' || key === '$id'){
        throw new Error(ERRORS.BEHAVIOUR.KEY_AND_ID);
      }
      enumerable.__defineGetter__(key, () => this.behaviour[key]);
    }

    this.__defineGetter__(enumerable.$key, () => enumerable);
  }
  return this;
}

function SymbolOnlyEnumerable(constants){
  if(constants.length !== new Set(constants).length){
    [...constants].sort().reduce((k, k2) => {
      if(k === k2){
        throw new Error(ERRORS.CONSTANTS.DUPLICATE(k));
      }
    });
  }
  this.$keys = [];
  for(let i = 0; i < constants.length; i++){
    if(typeof constants[i] !== 'string'){
      throw new TypeError(ERRORS.CONSTANTS.TYPEOF('string', constants[i], i));
    }
    if(!CONST_REGEX.test(constants[i])){
      throw new Error(ERRORS.CONSTANTS.NAME(constants[i], i));
    }
    const c = Symbol(constants[i]);
    this.$keys.push(constants[i]);
    this.__defineGetter__(constants[i], () => c);
  }
  return this;
}

export default Enum;
