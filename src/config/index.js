import _ from "lodash";
import fs from "fs-promise";

import { resolve } from "../utils/path";
import defaultConfig from "./default";

export default async (path = resolve("./.vanilla.js")) => {
  try {
    const config = JSON.parse(await fs.readFile(path));
    return _.defaultsDeep(config, defaultConfig);
  } catch (error) {
    return _.cloneDeep(defaultConfig);
  }
};
