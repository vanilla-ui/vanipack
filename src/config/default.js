export default {
  plugins: [],

  webpack: null,

  path: {
    public: "/",
    static: "./static",
  },

  entry: {
    client: "./entry/client",
    server: "./entry/server",
  },

  bind: {
    client: {
      host: "127.0.0.1",
      port: 8081,
    },
    server: {
      host: "127.0.0.1",
      port: 8080,
    },
  },
};
