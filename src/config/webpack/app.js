import fs from "fs-promise";
import webpack from "webpack";
import nodeExternals from "webpack-node-externals";
import ManifestPlugin from "webpack-manifest-plugin";
import ExtractTextPlugin from "extract-text-webpack-plugin";
import atImport from "postcss-import";
import cssnext from "postcss-cssnext";

import { resolve, resolveMake } from "../../utils/path";
import { Config } from "../../utils/webpack";

const createEntry = async (name, entry, opts) => {
  const { env, side, plugins } = opts;

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

const getEntry = async (entry, opts) => {
  if (typeof entry === "string" || Array.isArray(entry)) {
    return createEntry("default", entry);
  } else {
    const result = {};
    await Promise.all((
      Object.keys(entry)
        .map(async (name) => {
          result[name] = await createEntry(name, entry[name], opts);
        })
    ));
    return result;
  }
};

export default async (opts) => {
  const { env, side, config, plugins } = opts;
  const production = env === "production";
  const cache = !production;
  const hot = env === "development";
  const server = side === "server";
  const client = side === "client";

  const filenameTemplate =
    client && production
      ? "assets/[name].[chunkhash:8].js"
      : "assets/[name].js";

  const options = {
    context: resolve("."),

    entry: await getEntry({
      app: config.entry[side],
    }, opts),

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
      proxy: {
        "/": {
          target: `http://${config.bind.server.host}:${config.bind.server.port}`,
        },
      },
    },
  });

  manager.rule("eslint", {
    enforce: "pre",
    test: /\.js$/,
    exclude: /node_modules/,
    loader: require.resolve("eslint-loader"),
  });
  manager.rule("babel", {
    test: /\.js$/,
    exclude: /node_modules\/(?!vanipack)/,
    loader: require.resolve("babel-loader"),
    options: {
      cacheDirectory: cache,
    },
  });
  manager.rule("css", {
    test: /\.css$/,
    use: ExtractTextPlugin.extract({
      fallback: require.resolve("style-loader"),
      use: [
        {
          loader: require.resolve("css-loader"),
          options: {
            sourceMap: true,
            modules: true,
            autoprefixer: false,
          },
        },
        {
          loader: require.resolve("postcss-loader"),
          options: {
            plugins: () => ([
              atImport(),
              cssnext(),
            ]),
          },
        },
      ],
    }),
  });
  manager.rule("file", {
    test: /\.(webp|png|ico|icon|jpg|jpeg|gif|svg|ttf|eot|woff|woff2)$/,
    loader: require.resolve("file-loader"),
    options: {
      name: "assets/[name].[hash:8].[ext]",
    },
  });
  manager.rule("html", {
    test: /\.html$/,
    loader: require.resolve("html-loader"),
  });

  manager.plugin(
    "ignore",
    webpack.WatchIgnorePlugin,
    [resolveMake(".")],
  );

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
  manager.plugin(
    "css",
    ExtractTextPlugin,
    {
      filename: production
        ? "assets/[name].[contenthash:8].css"
        : "assets/[name].css",
      allChunks: true,
      ignoreOrder: true,
    },
  );
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
      await plugin.webpack(manager, opts);
    }
  }

  return manager.export();
};
