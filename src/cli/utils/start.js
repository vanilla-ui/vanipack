import { path, getConfig } from "../..";
import getEnv from "../utils/env";

export default async ({ config: configFile }) => {
  const config = await getConfig(configFile, getEnv());
  const manifest = await import(
    path.resolveMake(`./build/${getEnv()}/client/manifest.json`),
  );
  const entryFile = (await import(
    path.resolveMake(`./build/${getEnv()}/server/manifest.json`),
  ))["app.js"];
  const entry = await import(
    path.resolveMake(`./build/${getEnv()}/server/${entryFile}`),
  );
  (entry.default || entry)({ config, manifest });
};
