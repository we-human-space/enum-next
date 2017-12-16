import 'babel-polyfill';
import { expect } from 'chai';
import enumerable from '../../../src';

/* eslint-disable no-unused-expressions */
describe('Enum', function(){
  let EnumClass;
  let Enum;

  before(function(done) {
    // Loading module under test
    EnumClass = enumerable;
    Enum = (...args) => new EnumClass(...args);
    done();
  });

  describe('constructor(constants, behaviour)', function(){
    it('should refuse non-array constants argument, or insufficiently long arrays', function(done){
      const err = `Enum expected argument 'constants' to be an array of length >= 2`;
      const symbolOnlyErr = `Enum expected argument 'constants' to be a non-empty array`;

      expect(Enum.bind(null, null)).to.throw(err);
      expect(Enum.bind(null, undefined)).to.throw(err);
      expect(Enum.bind(null, 1)).to.throw(err);
      expect(Enum.bind(null, true)).to.throw(err);
      expect(Enum.bind(null, () => {})).to.throw(err);
      expect(Enum.bind(null, {a: 'a', b: 'b'})).to.throw(err);
      expect(Enum.bind(null, [])).to.throw(err);

      expect(Enum.bind(null, null, true)).to.throw(symbolOnlyErr);
      expect(Enum.bind(null, undefined, true)).to.throw(symbolOnlyErr);
      expect(Enum.bind(null, 1, true)).to.throw(symbolOnlyErr);
      expect(Enum.bind(null, true, true)).to.throw(symbolOnlyErr);
      expect(Enum.bind(null, () => {}, true)).to.throw(symbolOnlyErr);
      expect(Enum.bind(null, {a: 'a', b: 'b'}, true)).to.throw(symbolOnlyErr);
      expect(Enum.bind(null, [], true)).to.throw(symbolOnlyErr);

      done();
    });

    it('should refuse invalid constants array length', function(done){
      expect(Enum.bind(null, ['A', {a: 'a', b: 'b'}, 'B'])).to.throw(`Enum expected argument 'constants' to have even length`);
      done();
    });

    it('should refuse duplicate constant keys', function(done){
      expect(
        Enum.bind(null, ['A', {a: 'a', b: 'b'}, 'A', {c: 'c', d: 'd'}])
      ).to.throw(`Duplicate Enum constant for key 'A'`);
      done();
    });

    it('should refuse invalid constant keys', function(done){
      const should_refuse_invalid_key = (key) => {
        expect(Enum.bind(null, [key, {a: 'a', b: 'b'}])).to.throw(
          'Enum constants must be valid upper case variable names. ' +
          `Constant '${key}', at index 0, violates this invariant`
        );
      };

      should_refuse_invalid_key(1);
      should_refuse_invalid_key(null);
      should_refuse_invalid_key(undefined);
      should_refuse_invalid_key(() => {});
      should_refuse_invalid_key(true);
      should_refuse_invalid_key('a');
      should_refuse_invalid_key('1A');
      should_refuse_invalid_key('A-A');
      should_refuse_invalid_key('-A');
      should_refuse_invalid_key('+A');
      should_refuse_invalid_key('%A');

      done();
    });

    it('should assign constant values as enumerable.value', function(done){
      const should_assign_enum_val = (value) => {
        const e = Enum(['A', value]);
        expect(e.A.value).to.be.equal(value);
      };

      should_assign_enum_val('a');
      should_assign_enum_val(null);
      should_assign_enum_val(undefined);
      should_assign_enum_val(true);
      should_assign_enum_val(1);
      should_assign_enum_val(() => {});
      should_assign_enum_val({ foo: () => 'foo' });

      done();
    });

    it('should throw a TypeError if an invalid behaviour argument is provided', function(done){
      const should_refuse_invalid_behaviour = (be) => {
        expect(Enum.bind(null, ['A', {a: 'a', b: 'b'}], be)).to.throw(
          `Enum expected argument 'behaviour' to be an object. Found ${typeof be} instead`
        );
      };

      should_refuse_invalid_behaviour(null);
      should_refuse_invalid_behaviour(1);
      should_refuse_invalid_behaviour('a');
      should_refuse_invalid_behaviour(() => {});

      done();
    });

    it('should accept undefined or empty behaviour object', function(done){
      expect(Enum(['A', {a: 'a', b: 'b'}])).to.be.instanceof(EnumClass);
      expect(Enum(['A', {a: 'a', b: 'b'}], {})).to.be.instanceof(EnumClass);
      done();
    });

    it('should create an Enum object', function(done){
      expect(Enum(['A', {a: 'a', b: 'b'}])).to.be.instanceof(EnumClass);
      done();
    });

    it('should have all enumerable constants provided', function(done){
      const e = Enum([
        'A', {a: 'a', b: 'b'},
        'B', {a: 'a', b: 'b'},
        'C', {a: 'a', b: 'b'}
      ]);

      expect(e.A).to.be.instanceof(Symbol);
      expect(e.A).to.be.instanceof(Object);
      expect(e.B).to.be.instanceof(Symbol);
      expect(e.B).to.be.instanceof(Object);
      expect(e.C).to.be.instanceof(Symbol);
      expect(e.C).to.be.instanceof(Object);

      done();
    });

    it('should return constants that are Symbols tagged with the provided keys', function(done){
      const e = Enum([
        'A', {a: 'a', b: 'b'},
        'B', {a: 'a', b: 'b'},
        'C', {a: 'a', b: 'b'}
      ], {}, true);

      expect(e.A.toString()).to.match(/.*Symbol\(A\)/);
      expect(e.B.toString()).to.match(/.*Symbol\(B\)/);
      expect(e.C.toString()).to.match(/.*Symbol\(C\)/);

      done();
    });

    it('should bind the name of the enumerable constant to $key', function(done){
      const e = Enum([
        'A', { a: 'Aa', b: 'Ab' },
        'B', { a: 'Ba', b: 'Bb', c: 'Bc' },
        'C', { a: 'Ba', b: 'Bb', c: 'Bc' }
      ]);

      expect(e.A.$key).to.be.equal('A');
      expect(e.B.$key).to.be.equal('B');
      expect(e.C.$key).to.be.equal('C');

      done();
    });

    it('should bind the enumerable constant Symbols to $id', function(done){
      const e = Enum([
        'A', { a: 'Aa', b: 'Ab' },
        'B', { a: 'Ba', b: 'Bb', c: 'Bc' },
        'C', { a: 'Ba', b: 'Bb', c: 'Bc' }
      ]);

      expect(e.A.$id.toString()).to.equal('Symbol(A)');
      expect(e.B.$id.toString()).to.equal('Symbol(B)');
      expect(e.C.$id.toString()).to.equal('Symbol(C)');

      done();
    });

    it('should return an iterable object with constants respecting the order in which the enumerable constants were provided', function(done){
      const e = Enum([
        'C', {a: 'a', b: 'b'},
        'A', {a: 'a', b: 'b'},
        'B', {a: 'a', b: 'b'}
      ]);

      let i = 0;
      let order = ['C', 'A', 'B'];
      for(let k of e){
        expect(k.$key).to.be.equal(order[i++]);
      }

      done();
    });

    it('should refuse enumerable constant members with keys $key or $id', function(done){
      expect(Enum.bind(null, ['A', { $key: 'Aa' }])).to.throw(
        `Enum constants' members cannot be named '$key' or '$id' as it would override default behaviour`
      );
      expect(Enum.bind(null, ['A', { $id: 'Aa' }])).to.throw(
        `Enum constants' members cannot be named '$key' or '$id' as it would override default behaviour`
      );

      done();
    });

    it('should refuse behaviour properties with keys $key or $id', function(done){
      expect(Enum.bind(null, ['A', { a: 'Aa', b: 'Ab' }], { $key: 'Aa' })).to.throw(
        `Enum constants' behaviour properties cannot be named '$key' or '$id' as it would override default behaviour`
      );
      expect(Enum.bind(null, ['A', { a: 'Aa', b: 'Ab' }], { $id: 'Aa' })).to.throw(
        `Enum constants' behaviour properties cannot be named '$key' or '$id' as it would override default behaviour`
      );

      done();
    });

    it('should bind all of the member properties to each one of the enumerable keys', function(done){
      const e = Enum([
        'A', { a: 'Aa', b: 'Ab' },
        'B', { a: 'Ba', b: 'Bb', c: 'Bc' }
      ]);

      expect(e.A.a).to.be.equal('Aa');
      expect(e.B.a).to.be.equal('Ba');
      expect(e.A.b).to.be.equal('Ab');
      expect(e.B.b).to.be.equal('Bb');
      expect(e.B.c).to.be.equal('Bc');

      done();
    });

    it('should bind all the behaviour property to all of the enumerable keys', function(done){
      const should_bind_behaviour = (e, k, be) => {
        for(let key in be){
          expect(e[k][key]).to.be.equal(be[key]);
        }
      };

      const behaviour = {
        P1: 42,
        P2: 'K2',
        P3: true,
        P4: {},
        P5: undefined,
        P6: { a: 'a' },
        p7(){
          return 'derp';
        }
      };

      const e = Enum([
        'A', { a: 'Aa', b: 'Ab' },
        'B', { a: 'Ba', b: 'Bb' },
        'C', { a: 'Ca', b: 'Cb' }
      ], behaviour);

      should_bind_behaviour(e, 'A', behaviour);
      should_bind_behaviour(e, 'B', behaviour);
      should_bind_behaviour(e, 'C', behaviour);

      done();
    });
  });

  describe('constructor(constants, symbolOnly)', function(){
    it('should refuse duplicate constant keys', function(done){
      expect(
        Enum.bind(null, ['A', 'A'], true)
      ).to.throw(`Duplicate Enum constant for key 'A'`);
      done();
    });

    it('should throw a TypeError for non-string keys', function(done){
      const should_refuse_invalid_key = (key) => {
        expect(Enum.bind(null, [key], true)).to.throw(
          `Enum expected constant key '${typeof key === 'symbol' ? key.toString() : key}' at index 0 to be of type string. Found ${typeof key} instead`
        );
      };

      should_refuse_invalid_key(1);
      should_refuse_invalid_key(null);
      should_refuse_invalid_key(undefined);
      should_refuse_invalid_key(() => {});
      should_refuse_invalid_key({});
      should_refuse_invalid_key(true);
      should_refuse_invalid_key(Symbol('A'));

      done();
    });

    it('should refuse invalid constant keys', function(done){
      const should_refuse_invalid_key = (key) => {
        expect(Enum.bind(null, [key], true)).to.throw(
          'Enum constants must be valid upper case variable names. ' +
          `Constant '${key}', at index 0, violates this invariant`
        );
      };

      should_refuse_invalid_key('a');
      should_refuse_invalid_key('1A');
      should_refuse_invalid_key('A-A');
      should_refuse_invalid_key('-A');
      should_refuse_invalid_key('+A');
      should_refuse_invalid_key('%A');

      done();
    });

    it('should create an Enum object', function(done){
      expect(Enum(['A'], true)).to.be.instanceof(EnumClass);
      done();
    });

    it('should have all enumerable constants provided', function(done){
      const e = Enum(['A', 'B', 'C'], true);

      expect(e.A).to.be.a('symbol');
      expect(e.B).to.be.a('symbol');
      expect(e.C).to.be.a('symbol');

      done();
    });

    it('should return constants that are Symbols tagged with the provided keys', function(done){
      const e = Enum(['A', 'B', 'C'], true);

      expect(e.A.toString()).to.match(/.*Symbol\(A\).*/);
      expect(e.B.toString()).to.match(/.*Symbol\(B\).*/);
      expect(e.C.toString()).to.match(/.*Symbol\(C\).*/);

      done();
    });

    it('should return an iterable object with constants respecting the order in which the enumerable constants were provided', function(done){
      const e = Enum(['C', 'A', 'B'], true);

      let i = 0;
      let order = ['C', 'A', 'B'];
      for(let k of e){
        expect(k.toString()).to.be.equal(`Symbol(${order[i++]})`);
      }

      done();
    });
  });

  describe('concat', function(){
    it('should accept an Array of Enums', function(done){
      const FOO = Enum(['FOO'], true);
      const BAR = Enum(['BAR'], true);
      const FOOBAR = EnumClass.concat([FOO, BAR]);
      expect(FOOBAR).to.be.instanceof(EnumClass);
      done();
    });

    it('should throw if an element of the first argument is not instanceof Enum', function(done){
      const FOO = Enum(['FOO'], true);
      const BAR = Enum(['BAR'], true);
      const BAZ = ['BAZ'];
      const thrower = (enums) => EnumClass.concat(enums);
      expect(thrower.bind(null, [FOO, BAR, BAZ])).to.throw(
        'Enum.concat expected first argument to be an Array of Enums. Found ' +
        'instanceof Array in the lot instead.'
      );
      done();
    });

    it('[dirty] should return an Enum containing all of the constants of its constituent enums', function(done){
      const FOO = Enum(['FOO'], true);
      const BAR = Enum(['BAR', 'BAZ'], true);
      const FOOBAR = EnumClass.concat([FOO, BAR]);

      expect(FOOBAR).to.be.instanceof(EnumClass);
      expect(FOOBAR.FOO).to.be.equal(FOO.FOO);
      expect(FOOBAR.BAR).to.be.equal(BAR.BAR);
      expect(FOOBAR.BAZ).to.be.equal(BAR.BAZ);
      done();
    });

    it('[dirty] symbolOnly should override passed behaviour', function(done){
      const FOO = Enum(['FOO'], true);
      const BAR = Enum(['BAR'], true);
      const FOOBAR = EnumClass.concat(
        [FOO, BAR],
        {
          symbolOnly: true,
          behaviour: { foo() { return 'foo'; } }
        }
      );

      expect(FOOBAR.FOO.foo).to.be.undefined;
      done();
    });

    it('[dirty] should override passed behaviour', function(done){
      const FOO = Enum(['FOO'], true);
      const BAR = Enum(['BAR'], true);
      const FOOBAR = EnumClass.concat(
        [FOO, BAR],
        {
          symbolOnly: true,
          behaviour: { foo() { return 'foo'; } }
        }
      );

      expect(FOOBAR.FOO.foo).to.be.undefined;
      done();
    });

    it('[dirty] should return a Symbol-only Enum if all constituent Enums are such and no behaviour is passed', function(done){
      const FOO = Enum(['FOO'], true);
      const BAR = Enum(['BAR'], true);
      const FOOBAR = EnumClass.concat([FOO, BAR]);

      expect(FOOBAR.symbolOnly).to.be.true;
      done();
    });

    it('[dirty] should not alter the constituent Enums\' keys with passed behaviour', function(done){
      const FOO = Enum(['FOO'], true);
      const BAR = Enum(['BAR'], true);
      const FOOBAR = EnumClass.concat([FOO, BAR], { behaviour: { foo() { return 'foo'; } } });

      expect(FOOBAR.symbolOnly).to.be.false;
      expect(FOOBAR.FOO).to.be.a('symbol');
      expect(FOOBAR.FOO.foo).to.be.undefined;
      done();
    });

    it('[dirty] should return a normal Enum if behaviour is passed, no matter whether all constituent Enums are Symbol-only', function(done){
      const FOO = Enum(['FOO'], true);
      const BAR = Enum(['BAR'], true);
      const FOOBAR = EnumClass.concat([FOO, BAR], { behaviour: { foo() { return 'foo'; } } });

      expect(FOOBAR.symbolOnly).to.be.false;
      expect(FOOBAR.FOO).not.to.be.instanceof(Object);
      expect(FOOBAR.FOO.foo).to.be.undefined;
      done();
    });

    it('[dirty] should return a normal Enum if no behaviour is passed and there is at least one normal constituent Enum', function(done){
      const FOO = Enum(['FOO', { foo() { return 'foo'; } }]);
      const BAR = Enum(['BAR'], true);
      const FOOBAR = EnumClass.concat([FOO, BAR]);

      expect(FOOBAR.symbolOnly).to.be.false;
      expect(FOOBAR.FOO).to.be.instanceof(Object);
      expect(FOOBAR.FOO.foo).to.be.a('function');
      expect(FOOBAR.BAR).to.be.a('symbol');
      done();
    });

    it('[clean] should throw on duplicate keys', function(done){
      const FOO = Enum(['FOO'], true);
      const BAR = Enum(['FOO'], true);
      const thrower = (enums, options) => EnumClass.concat(enums, options);
      expect(thrower.bind(null, [FOO, BAR], { clean: true })).to.throw(
        `Enum.concat: Duplicate Enum constant for key 'FOO'`
      );
      done();
    });

    it('[clean] should return an Enum containing copies of the constants of its constituent Enums', function(done){
      const FOO = Enum(['FOO', { foo() { return 'foo'; } }]);
      const BAR = Enum(['BAR'], true);
      const FOOBAR = EnumClass.concat([FOO, BAR], { clean: true });

      expect(FOOBAR.FOO).to.be.instanceof(Object);
      expect(FOOBAR.FOO.foo).to.be.a('function');
      expect(FOOBAR.FOO.foo).to.be.equal(FOO.FOO.foo);
      expect(FOOBAR.FOO).not.to.be.equal(FOO.FOO);
      expect(FOOBAR.BAR).to.be.a('symbol');
      expect(FOOBAR.BAR).not.to.be.equal(BAR.BAR);
      done();
    });

    it('[clean] should return an Enum with standardized behaviour for all of its keys', function(done){
      const FOO = Enum(['FOO', {}]);
      const BAR = Enum(['BAR', {}]);
      const FOOBAR = EnumClass.concat([FOO, BAR], { clean: true, behaviour: { foo() { return 'foo'; } } });

      expect(FOOBAR.FOO).to.be.instanceof(Object);
      expect(FOOBAR.FOO.foo).to.be.a('function');
      expect(FOOBAR.BAR).to.be.instanceof(Object);
      expect(FOOBAR.BAR.foo).to.be.a('function');
      expect(FOOBAR.FOO.foo).to.be.equal(FOOBAR.BAR.foo);
      done();
    });

    it('[clean] should ignore the constituent Enums\' behaviour if behaviour is passed', function(done){
      const FOO = Enum(['FOO', {}], { foo() { return 'foo'; } });
      const BAR = Enum(['BAR', {}], { foo() { return 'bar'; } });
      const FOOBAR = EnumClass.concat(
        [FOO, BAR],
        { clean: true, behaviour: { baz(){ return 'baz'; } } }
      );

      expect(FOOBAR.FOO).to.be.instanceof(Object);
      expect(FOOBAR.FOO.foo).to.be.undefined;
      expect(FOOBAR.FOO.baz).to.be.a('function');
      expect(FOOBAR.BAR).to.be.instanceof(Object);
      expect(FOOBAR.BAR.foo).to.be.undefined;
      expect(FOOBAR.BAR.baz).to.be.a('function');
      done();
    });

    it('[clean] should return an Enum with the union of the behaviour of all of its constituent Enums', function(done){
      const FOO = Enum(['FOO', {}], { foo() { return 'foo'; } });
      const BAR = Enum(['BAR', {}], { bar() { return 'bar'; } });
      const FOOBAR = EnumClass.concat([FOO, BAR], { clean: true });

      expect(FOOBAR.FOO).to.be.instanceof(Object);
      expect(FOOBAR.FOO.foo).to.be.a('function');
      expect(FOOBAR.FOO.bar).to.be.a('function');
      expect(FOOBAR.BAR).to.be.instanceof(Object);
      expect(FOOBAR.BAR.foo).to.be.a('function');
      expect(FOOBAR.BAR.bar).to.be.a('function');
      expect(FOOBAR.BAR.foo).to.be.equal(FOOBAR.BAR.foo);

      expect(FOO.FOO.foo).to.be.equal(FOOBAR.FOO.foo);
      expect(FOOBAR.FOO.foo).to.be.equal(FOOBAR.BAR.foo);
      expect(BAR.BAR.bar).to.be.equal(FOOBAR.BAR.bar);
      expect(FOOBAR.FOO.bar).to.be.equal(FOOBAR.BAR.bar);
      done();
    });

    it('[clean] should override the behaviour according to the order in which the Enums are passed', function(done){
      const FOO = Enum(['FOO', {}], { foo() { return 'foo'; } });
      const BAR = Enum(['BAR', {}], { foo() { return 'bar'; } });
      const FOOBAR = EnumClass.concat([FOO, BAR], { clean: true });

      expect(FOOBAR.FOO).to.be.instanceof(Object);
      expect(FOOBAR.FOO.foo).to.be.a('function');
      expect(FOOBAR.FOO.foo()).to.be.equal('bar');
      expect(FOOBAR.BAR).to.be.instanceof(Object);
      expect(FOOBAR.BAR.foo).to.be.a('function');
      expect(FOOBAR.BAR.foo()).to.be.equal('bar');
      done();
    });

    it('[clean] should produce a Symbol-only Enum if all constituents are Symbol-only too', function(done){
      const FOO = Enum(['FOO'], true);
      const BAR = Enum(['BAR'], true);
      const FOOBAR = EnumClass.concat([FOO, BAR], { clean: true });

      expect(FOOBAR.FOO).not.to.be.instanceof(Object);
      expect(FOOBAR.FOO).to.be.a('symbol');
      expect(FOOBAR.BAR).not.to.be.instanceof(Object);
      expect(FOOBAR.BAR).to.be.a('symbol');
      expect(FOOBAR.symbolOnly).to.be.true;
      done();
    });

    it('[clean] should produce a Symbol-only Enum if symbolOnly is passed', function(done){
      const FOO = Enum(['FOO'], true);
      const BAR = Enum(['BAR', {}], { bar() { return 'bar'; } });
      const FOOBAR = EnumClass.concat([FOO, BAR], { clean: true, symbolOnly: true });

      expect(FOOBAR.FOO).not.to.be.instanceof(Object);
      expect(FOOBAR.FOO).to.be.a('symbol');
      expect(FOOBAR.BAR).not.to.be.instanceof(Object);
      expect(FOOBAR.BAR).to.be.a('symbol');
      done();
    });

    it('[clean] should ignore the behaviour if symbolOnly is truthy', function(done){
      const FOO = Enum(['FOO', {}], { foo() { return 'foo'; } });
      const BAR = Enum(['BAR', {}], { foo() { return 'bar'; } });
      const FOOBAR = EnumClass.concat(
        [FOO, BAR],
        { clean: true, symbolOnly: true, behaviour: { baz(){ return 'baz'; } } }
      );

      expect(FOOBAR.FOO).not.to.be.instanceof(Object);
      expect(FOOBAR.FOO).to.be.a('symbol');
      expect(FOOBAR.BAR).not.to.be.instanceof(Object);
      expect(FOOBAR.BAR).to.be.a('symbol');
      expect(FOOBAR.behaviour).to.be.undefined;
      done();
    });
  });

  describe('iterator', function(){
    it('[symbolOnly=false] should return an iterator with constants respecting the order in which the enumerable constants were provided', function(done){
      const e = Enum([
        'C', {a: 'a', b: 'b'},
        'A', {a: 'a', b: 'b'},
        'B', {a: 'a', b: 'b'}
      ]);

      let i = 0;
      let order = ['C', 'A', 'B'];
      for(let k of e.iterator()){
        expect(k).to.be.instanceof(Symbol);
        expect(k).to.be.instanceof(Object);
        expect(k.$key).to.be.equal(order[i++]);
      }

      done();
    });

    it('[symbolOnly=true] should return an iterator with constants respecting the order in which the enumerable constants were provided', function(done){
      const e = Enum(['C', 'A', 'B'], true);

      let i = 0;
      let order = ['C', 'A', 'B'];
      for(let k of e.iterator()){
        expect(k.toString()).to.be.equal(`Symbol(${order[i++]})`);
      }

      done();
    });
  });

  describe('keys', function(){
    it('should return a list of the keys provided to the constructor respecting the order in which they were provided', function(done){
      const e = Enum([
        'C', {a: 'a', b: 'b'},
        'A', {a: 'a', b: 'b'},
        'B', {a: 'a', b: 'b'}
      ]);

      const keys = e.keys();
      expect(keys[0]).to.be.equal('C');
      expect(keys[1]).to.be.equal('A');
      expect(keys[2]).to.be.equal('B');

      done();
    });
  });

  describe('values', function(){
    it('[symbolOnly=false] should return a list of the values provided to the constructor respecting the order in which they were provided', function(done){
      const e = Enum([
        'C', {a: 'Ca', b: 'Cb'},
        'A', {a: 'Aa', b: 'Ab'},
        'B', {a: 'Ba', b: 'Bb'}
      ]);

      const values = e.values();
      expect(values[0].toString()).to.match(/.*Symbol\(C\).*/);
      expect(values[0].a).to.equal('Ca');
      expect(values[0].b).to.equal('Cb');
      expect(values[1].toString()).to.match(/.*Symbol\(A\).*/);
      expect(values[1].a).to.equal('Aa');
      expect(values[1].b).to.equal('Ab');
      expect(values[2].toString()).to.match(/.*Symbol\(B\).*/);
      expect(values[2].a).to.equal('Ba');
      expect(values[2].b).to.equal('Bb');

      done();
    });

    it('[symbolOnly=true] should return a list of the values provided to the constructor respecting the order in which they were provided', function(done){
      const e = Enum(['C', 'A', 'B'], true);

      const values = e.values();
      expect(values[0].toString()).to.equal('Symbol(C)');
      expect(values[1].toString()).to.equal('Symbol(A)');
      expect(values[2].toString()).to.equal('Symbol(B)');

      done();
    });
  });

  describe('entries', function(){
    it('[symbolOnly=false] should return a list of the entries provided to the constructor respecting the order in which they were provided', function(done){
      const e = Enum([
        'C', {a: 'Ca', b: 'Cb'},
        'A', {a: 'Aa', b: 'Ab'},
        'B', {a: 'Ba', b: 'Bb'}
      ]);

      const entries = e.entries();
      expect(entries[0][0]).to.equal('C');
      expect(entries[0][1].a).to.equal('Ca');
      expect(entries[0][1].b).to.equal('Cb');
      expect(entries[1][0]).to.equal('A');
      expect(entries[1][1].a).to.equal('Aa');
      expect(entries[1][1].b).to.equal('Ab');
      expect(entries[2][0]).to.equal('B');
      expect(entries[2][1].a).to.equal('Ba');
      expect(entries[2][1].b).to.equal('Bb');

      done();
    });

    it('[symbolOnly=true] should return a list of the entries provided to the constructor respecting the order in which they were provided', function(done){
      const e = Enum(['C', 'A', 'B'], true);

      const values = e.entries();
      expect(values[0][0]).to.equal('C');
      expect(values[0][1].toString()).to.equal('Symbol(C)');
      expect(values[1][0]).to.equal('A');
      expect(values[1][1].toString()).to.equal('Symbol(A)');
      expect(values[2][0]).to.equal('B');
      expect(values[2][1].toString()).to.equal('Symbol(B)');
      done();
    });
  });
});

/* eslint-enable no-unused-expressions */
