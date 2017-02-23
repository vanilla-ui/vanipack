import webpack from "webpack";

import { wrap } from "../utils/config";
import getConfig from "../config";
import app from "../config/webpack/app";

export default async ({
  env,
  side,
  config: configFile,
}) => {
  const config = await getConfig(configFile, env);
  const plugins = await Promise.all((
    config.plugins
      .map(async name => wrap(await import(name))(env))
  ));
  return webpack(await app({
    env,
    side,
    config,
    plugins,
  }));
};
