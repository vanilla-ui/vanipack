import webpack from "webpack";

import getConfig from "../config";
import app from "../config/webpack/app";

export default async ({
  env,
  side,
  config: configFile,
}) => {
  const config = await getConfig(configFile);
  const plugins = await Promise.all((
    config.plugins
      .map(async name => (await import(name)).default)
  ));
  return webpack(await app({
    env,
    side,
    config,
    plugins,
  }));
};
