import _ from "lodash";

import { wrap } from "../utils/config";
import { resolve } from "../utils/path";
import defaultConfig from "./default";

export default async (configFile = "./vanipack.js", env) => {
  try {
    const path = resolve(configFile);
    const config = wrap(await import(path))(env);
    return _.defaultsDeep(config, defaultConfig);
  } catch (error) {
    return _.cloneDeep(defaultConfig);
  }
};
