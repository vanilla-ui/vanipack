import _ from "lodash";

import { resolve } from "../utils/path";
import defaultConfig from "./default";

export default async (path = resolve("./.vanilla.js")) => {
  try {
    const config = (await import(path)).default;
    return _.defaultsDeep(config, defaultConfig);
  } catch (error) {
    return _.cloneDeep(defaultConfig);
  }
};
