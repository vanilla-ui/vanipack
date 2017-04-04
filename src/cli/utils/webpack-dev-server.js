import Server from "webpack-dev-server";

export default (webpack, { output = true } = {}) => {
  const options = webpack.options.devServer;
  const server = new Server(webpack, {
    ...options,
    stats: output ? { colors: true } : "none",
  });
  server.listen(options.port, options.host);
  return server;
};

export const wait = server =>
  new Promise(resolve => {
    server.middleware.waitUntilValid(resolve);
  });
