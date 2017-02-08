import fs from "fs-promise";
import webpack from "webpack";
import nodeExternals from "webpack-node-externals";
import ManifestPlugin from "webpack-manifest-plugin";

import { resolve, resolveMake } from "../../utils/path";
import { Config } from "../../utils/webpack";

const createEntry = async (name, entry) => {
  const env = Zone.current.get("env");
  const side = Zone.current.get("side");
  const plugins = Zone.current.get("plugins");

  const output = resolveMake(`./entry/${env}/${side}/${name}.js`);
  const entries = (Array.isArray(entry) ? entry : [entry])
    .map(file => resolve(file));
  const pluginEntries = plugins
    .filter(plugin => plugin.entry && plugin.entry[side])
    .map(plugin => plugin.entry[side]);

  const content = [
    ...entries.map((file, index) => (
      `import entry${index} from ${JSON.stringify(file)};`
    )),
    ...pluginEntries.map((file, index) => (
      `import plugin${index} from ${JSON.stringify(file)};`
    )),

    `const plugins = [${
      pluginEntries
        .map((file, index) => `plugin${index}`)
        .join(", ")
    }];`,

    `export default plugins.reduce((entry, plugin) => plugin(entry), entry${entries.length - 1});`,
  ];

  await fs.outputFile(output, content.join("\n"));

  return output;
};

const getEntry = async (entry) => {
  if (typeof entry === "string" || Array.isArray(entry)) {
    return createEntry("default", entry);
  } else {
    const result = {};
    await Promise.all((
      Object.keys(entry)
        .map(async (name) => {
          result[name] = await createEntry(name, entry[name]);
        })
    ));
    return result;
  }
};

export default async () => {
  const env = Zone.current.get("env");
  const production = env === "production";
  const cache = !production;
  const hot = env === "development";
  const side = Zone.current.get("side");
  const server = side === "server";
  const client = side === "client";
  const config = Zone.current.get("config");
  const plugins = Zone.current.get("plugins");

  const filenameTemplate =
    client && production
      ? "assets/[name].[chunkhash:8].js"
      : "assets/[name].js";

  const options = {
    context: resolve("."),

    entry: await getEntry({
      app: config.entry[side],
    }),

    output: {
      path: resolveMake(`./build/${env}/${side}`),
      publicPath: config.path.public,
      filename: filenameTemplate,
      chunkFilename: filenameTemplate,
      library: "main",
      libraryTarget: server ? "commonjs-module" : "var",
    },

    target: server ? "node" : "web",

    externals: server ? nodeExternals() : {},

    devtool:
      production
        ? "source-map"
        : "cheap-eval-source-map",
  };

  const manager = new Config({
    ...options,

    cache,

    devServer: {
      host: config.bind.client.host,
      port: config.bind.client.port,
      publicPath: config.path.public,
      contentBase: resolve(config.path.static),
      hot,
      historyApiFallback: true,
    },
  });

  manager.rule("babel", {
    test: /\.js$/,
    exclude: /node_modules/,
    use: [
      {
        loader: require.resolve("babel-loader"),
        query: {
          cacheDirectory: cache,
        },
      },
    ],
  });

  manager.plugin(
    "loader-options",
    webpack.LoaderOptionsPlugin,
    { minimize: production, options },
  );
  manager.plugin(
    "environment",
    webpack.EnvironmentPlugin,
    { NODE_ENV: env },
  );
  if (!production) {
    manager.plugin(
      "named-modules",
      webpack.NamedModulesPlugin,
    );
  }
  if (production) {
    manager.plugin(
      "uglify-js",
      webpack.optimize.UglifyJsPlugin,
      { sourceMap: true },
    );
  }
  if (client) {
    manager.plugin(
      "manifest",
      ManifestPlugin,
      {
        publicPath: config.path.public,
        writeToFileEmit: true,
      },
    );
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const plugin of [...plugins, config]) {
    if (plugin.webpack) {
      // eslint-disable-next-line no-await-in-loop
      await plugin.webpack(manager);
    }
  }

  return manager.export();
};
