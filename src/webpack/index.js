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
  const zone = Zone.current.fork({
    properties: {
      env,
      side,
      config,
      plugins,
    },
  });
  return zone.run(async () => webpack(await app()));
};
