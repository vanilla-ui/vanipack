import nodemon from "nodemon";

import { path } from "../..";
import getEnv from "../utils/env";
import createWebpack, { watch } from "../utils/webpack";
import createDevServer, { wait } from "../utils/webpack-dev-server";

export const command = "serve";

export const handler = async ({ config }) => {
  const client = await createWebpack({
    side: "client",
    config,
  });
  const server = await createWebpack({
    side: "server",
    config,
  });

  await Promise.all([
    wait(createDevServer(client)),
    watch(server)
      .first()
      .toPromise(),
  ]);

  nodemon({
    script: require.resolve("../../../cli"),
    args: config ? ["start", "--config", config] : ["start"],
    watch: [path.resolveMake(`./build/${getEnv()}/server`)],
  });
};
