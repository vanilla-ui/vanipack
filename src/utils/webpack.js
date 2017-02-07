import _ from "lodash";

// eslint-disable-next-line import/prefer-default-export
export class Config {
  constructor(config) {
    this.config = config || {};
    this.rules = {};
    this.plugins = {};
  }

  set(path, value) {
    _.set(this.config, path, value);
  }

  rule(name, rule) {
    this.rules[name] =
      typeof rule === "function"
        ? rule(this.rules[name])
        : rule;
  }

  plugin(name, plugin, params) {
    this.plugins[name] =
      typeof params === "function"
        ? { plugin, params: params((this.plugins[name] || {}).params) }
        : { plugin, params };
  }

  export() {
    return {
      ...this.config,
      module: {
        rules: Object.values(this.rules),
      },
      plugins: Object.values(this.plugins)
        .map(({ plugin: Plugin, params }) => (
          new Plugin(params)
        )),
    };
  }
}
