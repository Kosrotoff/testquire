// Check if the given value is a class.
export function isClass(value: any) {
  return typeof value === 'function' && /^\s*class\s+/.test(value.toString());
}

// Get all methods of the given class (constructor, getters, and setters are not included).
export function getClassMethods({prototype}: any): string[] {
  const methods = [];

  const properties = Object.getOwnPropertyNames(prototype);

  for (let i = 0; i < properties.length; ++i) {
    const property = properties[i];

    if (property === 'constructor') {
      continue;
    }

    const descriptor = Object.getOwnPropertyDescriptor(prototype, property);

    if (typeof descriptor?.value !== 'function') {
      continue;
    }

    methods.push(property);
  }

  return methods;
}
