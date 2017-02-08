import start from "../utils/start";

export const command = "start";

export const handler = async ({ config }) => {
  await start({ config });
};
