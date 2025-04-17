import type {Config} from './types';

import fs from 'fs';
import path from 'path';
import Module from 'node:module';
import micromatch from 'micromatch';
import {Mocker} from './Mocker';


const CONFIG_FILES_BY_PRIORITY = [
  'testquire.config.js',
  'testquire.config.json',
];


// Search for a configuration file in the project root.
function findConfigFile(projectRoot: string): object | null {
  for (const file of CONFIG_FILES_BY_PRIORITY) {
    const filePath = path.join(projectRoot, file);

    if (fs.existsSync(filePath)) {
      return require(filePath);
    }
  }

  return null;
}

// Load configuration from the file system or fallback to an empty object.
function loadConfig(projectRoot: string): object {
  return findConfigFile(projectRoot) ?? {};
}

// Ensure all paths are absolute based on the current working directory.
function resolvePaths(projectRoot: string, paths: string[]): string[] {
  const pathsArray = new Array(paths.length);

  for (let i = 0; i < pathsArray.length; ++i) {
    pathsArray[i] = path.resolve(projectRoot, pathsArray[i]).replaceAll('\\', '/');
  }

  return pathsArray;
}

// Validate the configuration structure.
function validateConfig(config: Config) {
  if (typeof config.mockFn !== 'function') {
    throw new Error('config.mockFn should be a function for mocking');
  }

  const checkStringOrArray = (key: keyof Config) => {
    if (config[key] !== undefined && !Array.isArray(config[key])) {
      throw new Error(`config.${key} should be an array of strings`);
    }
  };

  (['includeFiles', 'excludeFiles', 'includeModules', 'excludeModules'] as Array<keyof Config>).forEach(checkStringOrArray);
}

// Normalize paths in the configuration.
function normalizeConfig(projectRoot: string, config: Config) {
  config.includeFiles = resolvePaths(projectRoot, config.includeFiles);

  if (config.excludeFiles) {
    config.excludeFiles = resolvePaths(projectRoot, config.excludeFiles);
  }
}

// Initialize the mocking functionality with the given configuration.
export function init(config: Config) {
  const projectRoot = process.cwd();

  config = config || loadConfig(projectRoot);
  validateConfig(config);
  normalizeConfig(projectRoot, config);
  redefineRequire(config);
}

// Redefine the `require` function to apply mocking logic.
function redefineRequire(config: Config) {
  const originalRequire = Module.prototype.require;
  const mocker = new Mocker(config.mockFn);

  Module.prototype.require = function (id: string): any {
    const module = originalRequire.call(this, id);

    if (config.includeModules?.length && !micromatch.isMatch(id, config.includeModules, {
      ignore: config.excludeModules,
    })) {
      return module;
    }

    const resolvedId = require.resolve(id, {
      paths: [this.path],
    });

    if (!config.includeFiles?.length || !micromatch.isMatch(resolvedId, config.includeFiles, {
      ignore: config.excludeFiles,
    })) {
      return module;
    }

    // @ts-ignore
    if (require.cache[resolvedId]?._isMocked) {
      return require.cache[resolvedId].exports;
    }

    const mockedModule = mocker.get(module);

    require.cache[resolvedId]!.exports = mockedModule;
    // @ts-ignore
    require.cache[resolvedId]!._isMocked = true;

    return mockedModule;
  };
}

export type { Config };
