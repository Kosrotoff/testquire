import type {MockFn} from './types';

import {isClass, getClassMethods} from './utils';


export class Mocker {
  constructor(mockFn: MockFn) {
    this.mockFn = mockFn;
    this.processedValues = new Set();
  }


  // ----- [ PRIVATE PROPERTIES ] --------------------------------------------------------------------------------------

  private mockFn: MockFn;
  private processedValues: Set<unknown>;


  // ----- [ PUBLIC METHODS ] ------------------------------------------------------------------------------------------

  public get<T>(module: T): T {
    return this.mockModule(module);
  }


  // ----- [ PRIVATE METHODS ] -----------------------------------------------------------------------------------------

  private mockModule(module: any): any {
    if (this.processedValues.has(module)) {
      return module;
    }

    this.processedValues.add(module);

    if (module === null) {
      return null;
    }

    if (typeof module === 'object') {
      return this.mockObject(module);
    }

    if (typeof module === 'function') {
      return this.mockFunction(module);
    }

    return module;
  }

  private mockObject<T extends object>(obj: T): T {
    const properties = Object.keys(obj) as Array<keyof T>;

    for (const property of properties) {
      if (Object.isFrozen(obj)) {
        this.mockModule(obj[property]);
      } else {
        obj[property] = this.mockModule(obj[property]);
      }
    }

    return obj;
  }

  private mockFunction<T extends Function & { mock?: unknown }>(fn: T): T {
    if (isClass(fn)) {
      return this.mockClass(fn);
    }

    if (fn.mock) {
      return fn;
    }

    return this.mockFn(fn);
  }

  private mockClass<T extends Function>(cls: T): T {
    const properties = getClassMethods(cls);

    for (const property of properties) {
      const method = cls.prototype[property];

      if (method.mock) {
        continue;
      }

      cls.prototype[property] = this.mockFn(method);
    }

    return cls;
  }
}
