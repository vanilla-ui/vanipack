import { path, getConfig } from "../..";
import getEnv from "../utils/env";

export default async ({ config: configFile }) => {
  const config = await getConfig(configFile);
  const manifest = (await import(path.resolveMake(`./build/${getEnv()}/client/manifest.json`)));
  const entry = (await import(path.resolveMake(`./build/${getEnv()}/server/assets/app.js`))).default;
  entry({ config, manifest });
};
