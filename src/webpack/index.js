import webpack from "webpack";

import getConfig from "../config";
import app from "../config/webpack/app";

export default async ({
  env,
  side,
  config: path,
  plugins,
}) => {
  const config = await getConfig(path);
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
