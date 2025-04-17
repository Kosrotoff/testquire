export type MockFn = (...args: any) => any & { mock: unknown };

export interface Config {
  mockFn: MockFn;
  includeFiles: string[];
  excludeFiles?: string[];
  includeModules?: string[];
  excludeModules?: string[];
}
