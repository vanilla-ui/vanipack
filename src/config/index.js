import _ from "lodash";

import { resolve } from "../utils/path";
import defaultConfig from "./default";

export default async (configFile = "./.vanilla.js") => {
  try {
    const path = resolve(configFile);
    const config = (await import(path)).default;
    return _.defaultsDeep(config, defaultConfig);
  } catch (error) {
    return _.cloneDeep(defaultConfig);
  }
};
