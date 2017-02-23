// eslint-disable-next-line import/prefer-default-export
export const wrap = (exports) => {
  const config = exports.default || exports;
  if (typeof config === "function") {
    return config;
  } else {
    return () => config;
  }
};
