import createWebpack, { run } from "../utils/webpack";

export const command = "build";

export const handler = async ({ config }) => {
  const webpack = [
    await createWebpack({
      side: "client",
      config,
    }),
    await createWebpack({
      side: "server",
      config,
    }),
  ];
  await Promise.all(webpack.map(run));
};
