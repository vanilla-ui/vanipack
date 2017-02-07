import path from "path";

const root = path.resolve(".");

export const resolve = (...args) => path.resolve(root, ...args);
export const resolveMake = (...args) => resolve("./.vanilla", ...args);
