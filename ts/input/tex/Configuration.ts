/*************************************************************
 *
 *  Copyright (c) 2018 The MathJax Consortium
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */


/**
 * @fileoverview Configuration options for the TexParser.
 *
 * @author v.sorge@mathjax.org (Volker Sorge)
 */

import {ParseMethod} from './Types.js';
import ParseMethods from './ParseMethods.js';
import {ExtensionMaps, HandlerType} from './MapHandler.js';
import {StackItemClass} from './StackItem.js';
import {TagsClass} from './Tags.js';
import {userOptions, defaultOptions, OptionList} from '../../util/Options.js';
import *  as sm from './SymbolMap.js';
import {SubHandlers} from './MapHandler.js';
import {FunctionList} from '../../util/FunctionList.js';
import {TeX} from '../tex.js';
import {PrioritizedList} from '../../util/PrioritizedList.js';


export type HandlerConfig = {[P in HandlerType]?: string[]};
export type FallbackConfig = {[P in HandlerType]?: ParseMethod};
export type StackItemConfig = {[kind: string]: StackItemClass};
export type TagsConfig = {[kind: string]: TagsClass};
export type Processor = Function | [Function, number];
export type ProcessorList = Processor[];


export class Configuration {


  /**
   * The init method.
   * @type {Function}
   */
  // protected init: (c: ParserConfiguration) => void;

  /**
   * The config method to call once jax is ready.
   * @type {FunctionList}
   */
  // protected config: (c: ParserConfiguration, j: TeX<any, any, any>) => void;


  // public priority: number = 5;
  
  /**
   * Creates a configuration for a package.
   * @param {string} name The package name.
   * @param {Object} config The configuration parameters:
   * Configuration for the TexParser consist of the following:
   *  * _handler_  configuration mapping handler types to lists of symbol mappings.
   *  * _fallback_ configuration mapping handler types to fallback methods.
   *  * _items_ for the StackItem factory.
   *  * _tags_ mapping tagging configurations to tagging objects.
   *  * _options_ parse options for the packages.
   *  * _nodes_ for the Node factory.
   *  * _preprocessors_ list of functions for preprocessing the LaTeX
   *      string wrt. to given parse options. Can contain a priority.
   *  * _postprocessors_ list of functions for postprocessing the MmlNode
   *      wrt. to given parse options. Can contain a priority.
   *  * _init_ init method.
   *  * _priority_ priority of the init method.
   * @return {Configuration} The newly generated configuration.
   */
  public static create(name: string,
                       config: {handler?: HandlerConfig,
                                fallback?: FallbackConfig,
                                items?: StackItemConfig,
                                tags?: TagsConfig,
                                options?: OptionList,
                                nodes?: {[key: string]: any},
                                preprocessors?: ProcessorList,
                                postprocessors?: ProcessorList,
                                init?: Processor,
                                config?: Processor,
                                priority?: number,
                               } = {}): Configuration {
    let configuration = new Configuration(
      name,
      config.handler || {},
      config.fallback || {},
      config.items || {},
      config.tags || {},
      config.options || {},
      config.nodes || {},
      config.preprocessors || [],
      config.postprocessors || [],
      config.init || null,
      config.config || null,
      config.priority || 5
    );
    ConfigurationHandler.set(name, configuration);
    return configuration;
  }

  /**
   * @return {Configuration} An empty configuration.
   */
  public static empty(): Configuration {
    return Configuration.create('empty');
  }


  /**
   * @return {Configuration} Initialises and returns the extension maps.
   */
  public static extension(): Configuration {
    new sm.MacroMap(ExtensionMaps.NEW_MACRO, {}, {});
    new sm.DelimiterMap(ExtensionMaps.NEW_DELIMITER,
                        ParseMethods.delimiter, {});
    new sm.CommandMap(ExtensionMaps.NEW_COMMAND, {}, {});
    new sm.EnvironmentMap(ExtensionMaps.NEW_ENVIRONMENT,
                          ParseMethods.environment, {}, {});
    return Configuration.create(
      'extension',
      {handler: {character: [],
                 delimiter: [ExtensionMaps.NEW_DELIMITER],
                 macro: [ExtensionMaps.NEW_DELIMITER,
                         ExtensionMaps.NEW_COMMAND,
                         ExtensionMaps.NEW_MACRO],
                 environment: [ExtensionMaps.NEW_ENVIRONMENT]
                }});
  }


  /**
   * Init method for the configuration.
   *
   * @param {Configuration} configuration   The configuration where this one is being initialized
   */
  // public init(configuration: Configuration) {
  //   this.initMethod.execute(configuration);
  // }

  /**
   * Init method for when the jax is ready
   *
   * @param {Configuration} configuration   The configuration where this one is being initialized
   * @param {TeX} jax                       The TeX jax for this configuration
   */
  // public config(configuration: Configuration, jax: TeX<any, any, any>) {
  //   this.configMethod.execute(configuration, jax);
  //   for (const pre of this.preprocessors) {
  //     typeof pre === 'function' ? jax.preFilters.add(pre) :
  //       jax.preFilters.add(pre[0], pre[1]);
  //   }
  //   for (const post of this.postprocessors) {
  //     typeof post === 'function' ? jax.postFilters.add(post) :
  //       jax.postFilters.add(post[0], post[1]);
  //   }
  // }


  // /**
  //  * Appends configurations to this configuration. Note that fallbacks are
  //  * overwritten, while order of configurations is preserved.
  //  *
  //  * @param {Configuration} configuration A configuration setting for the TeX
  //  *       parser.
  //  */
  // public append(config: Configuration): void {
  //   let handlers = Object.keys(config.handler) as HandlerType[];
  //   for (const key of handlers) {
  //     for (const map of config.handler[key]) {
  //       this.handler[key].unshift(map);
  //     }
  //   }
  //   Object.assign(this.fallback, config.fallback);
  //   Object.assign(this.items, config.items);
  //   Object.assign(this.tags, config.tags);
  //   defaultOptions(this.options, config.options);
  //   Object.assign(this.nodes, config.nodes);
  //   for (let pre of config.preprocessors) {
  //     this.preprocessors.push(pre);
  //   }
  //   for (let post of config.postprocessors) {
  //     this.postprocessors.push(post);
  //   }
  //   for (let init of config.initMethod) {
  //     this.initMethod.add(init.item, init.priority);
  //   }
  //   for (let init of config.configMethod) {
  //     this.configMethod.add(init.item, init.priority);
  //   }
  // }

  // /**
  //  * Registers a configuration after the input jax is created.  (Used by \require.)
  //  *
  //  * @param {Configuration} config   The configuration to be registered in this one
  //  * @param {TeX} jax                The TeX jax where it is being registered
  //  * @param {OptionList=} options    The options for the configuration.
  //  */
  // public register(config: Configuration, jax: TeX<any, any, any>, options: OptionList = {}) {
  //   this.append(config);
  //   config.init(this);
  //   const parser = jax.parseOptions;
  //   parser.handlers = new SubHandlers(this);
  //   parser.nodeFactory.setCreators(config.nodes);
  //   for (const kind of Object.keys(config.items)) {
  //     parser.itemFactory.setNodeClass(kind, config.items[kind]);
  //   }
  //   defaultOptions(parser.options, config.options);
  //   userOptions(parser.options, options);
  //   config.config(this, jax);
  // }

  /**
   * @constructor
   */
  private constructor(readonly name: string,
                      readonly handler: HandlerConfig = {},
                      readonly fallback: FallbackConfig = {},
                      readonly items: StackItemConfig = {},
                      readonly tags: TagsConfig = {},
                      readonly options: OptionList = {},
                      readonly nodes: {[key: string]: any} = {},
                      readonly preprocessors: ProcessorList = [],
                      readonly postprocessors: ProcessorList = [],
                      readonly init: Processor = null,
                      readonly config: Processor = null,
                      public priority: number   // Default Priority
                     ) {
    if (this.init || !Array.isArray(this.init)) {
      this.init = [this.init as Function, this.priority];
    }
    if (this.config || !Array.isArray(this.config)) {
      this.config = [this.config as Function, this.priority];
    }
    this.handler = Object.assign(
      {character: [], delimiter: [], macro: [], environment: []}, handler);
  }

}


export namespace ConfigurationHandler {

  let maps: Map<string, Configuration> = new Map();

  /**
   * Adds a new configuration to the handler overwriting old ones.
   *
   * @param {string} name The name of the configuration.
   * @param {Configuration} map The configuration mapping.
   */
  export let set = function(name: string, map: Configuration): void {
    maps.set(name, map);
  };


  /**
   * Looks up a configuration.
   *
   * @param {string} name The name of the configuration.
   * @return {Configuration} The configuration with the given name or null.
   */
  export let get = function(name: string): Configuration {
    return maps.get(name);
  };

  /**
   * @return {string[]} All configurations in the handler.
   */
  export let keys = function(): IterableIterator<string> {
    return maps.keys();
  };

}


export class ParserConfiguration {


  /**
   * Priority list of init methods.
   * @type {FunctionList}
   */
  protected initMethod: FunctionList = new FunctionList();

  /**
   * Priority list of init methods to call once jax is ready.
   * @type {FunctionList}
   */
  protected configMethod: FunctionList = new FunctionList();

  protected configurations: PrioritizedList<Configuration> = new PrioritizedList();

  public handler: HandlerConfig;
  public fallback: FallbackConfig;
  public items: StackItemConfig;
  public tags: TagsConfig;
  public options: OptionList;
  public nodes: {[key: string]: any};
  public preprocessors: ProcessorList;
  public postprocessors: ProcessorList;

//  protected 

  /**
   * Initmethod for the configuration;
   *
   * @param {Configuration} configuration   The configuration where this one is being initialized
   */
  public init() {
    this.initMethod.execute(this);
  }

  /**
   * Init method for when the jax is ready
   *
   * @param {Configuration} configuration   The configuration where this one is being initialized
   * @param {TeX} jax                       The TeX jax for this configuration
   */
  public config(jax: TeX<any, any, any>) {
    this.configMethod.execute(this, jax);
    for (const pre of this.preprocessors) {
      typeof pre === 'function' ? jax.preFilters.add(pre) :
        jax.preFilters.add(pre[0], pre[1]);
    }
    for (const post of this.postprocessors) {
      typeof post === 'function' ? jax.postFilters.add(post) :
        jax.postFilters.add(post[0], post[1]);
    }
  }


  /**
   * Appends configurations to this configuration. Note that fallbacks are
   * overwritten, while order of configurations is preserved.
   *
   * @param {Configuration} configuration A configuration setting for the TeX
   *       parser.
   */
  public append(config: Configuration): void {
    let handlers = Object.keys(config.handler) as HandlerType[];
    for (const key of handlers) {
      for (const map of config.handler[key]) {
        this.handler[key].unshift(map);
      }
    }
    Object.assign(this.fallback, config.fallback);
    Object.assign(this.items, config.items);
    Object.assign(this.tags, config.tags);
    defaultOptions(this.options, config.options);
    Object.assign(this.nodes, config.nodes);
    for (let pre of config.preprocessors) {
      this.preprocessors.push(pre);
    }
    for (let post of config.postprocessors) {
      this.postprocessors.push(post);
    }
    if (config.init) {
    this.initMethod.add(config.init[0], config.init[0]);
      
    }
    if (config.config) {
      this.configMethod.add(config.config[0], config.config[1]);
    }
  }

  /**
   * Registers a configuration after the input jax is created.  (Used by \require.)
   *
   * @param {Configuration} config   The configuration to be registered in this one
   * @param {TeX} jax                The TeX jax where it is being registered
   * @param {OptionList=} options    The options for the configuration.
   */
  public register(config: Configuration, jax: TeX<any, any, any>, options: OptionList = {}) {
    this.append(config);
    config.init(this);
    const parser = jax.parseOptions;
    parser.handlers = new SubHandlers(this);
    parser.nodeFactory.setCreators(config.nodes);
    for (const kind of Object.keys(config.items)) {
      parser.itemFactory.setNodeClass(kind, config.items[kind]);
    }
    defaultOptions(parser.options, config.options);
    userOptions(parser.options, options);
    config.config(this, jax);
  }

  // private add(config: Configuration, priority: number) {
  //   config.
  // }

  
  /**
   * @constructor
   */
  constructor(packages: (string|[string, number])[]) {
    // Combine package configurations
    for (let key of packages) {
      const name = typeof key === 'string' ? key : key[0];
      let conf = ConfigurationHandler.get(name);
      if (conf) {
        this.configurations.add(conf, typeof key === 'string' ? conf.priority : key[1]);
      }
    }
    // for (let conf of this.configurations) {
    //   this.add(conf.item, conf.priority);
    // }
    // for (let conf of this.configurations) {
    //   const config = (typeof macros[cs] === 'string' ? [macros[cs]] : macros[cs]);
    //   if (config.init) {
    //     this.initMethod.add(init, priority || 0);
    // }
    // // Combine package configurations
    // for (let key of packages) {
    //   let conf = ConfigurationHandler.get(key);
    //   if (conf) {
    //     configuration.append(conf);
    //   }
    // }
    // configuration.init(configuration);
    // return configuration;

      
    // }
    // if (config) {
    //   this.configMethod.add(config, configPriority || priority || 0);
    // }
    // this.handler = Object.assign(
    //   {character: [], delimiter: [], macro: [], environment: []}, handler);
    // ConfigurationHandler.set(name, this);
  }

}
