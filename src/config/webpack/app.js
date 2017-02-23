import fs from "fs-promise";
import webpack from "webpack";
import nodeExternals from "webpack-node-externals";
import CaseSensitivePathsPlugin from "case-sensitive-paths-webpack-plugin";
import ManifestPlugin from "webpack-manifest-plugin";
import ExtractTextPlugin from "extract-text-webpack-plugin";
import FriendlyErrorsPlugin from "friendly-errors-webpack-plugin";
import atImport from "postcss-import";
import cssnext from "postcss-cssnext";

import { wrap } from "../../utils/config";
import { resolve, resolveMake } from "../../utils/path";
import { Config, exclude } from "../../utils/webpack";

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

export default async (opts) => {
  const { env, side, config, plugins } = opts;
  const production = env === "production";
  const development = env === "development";
  const server = side === "server";
  const client = side === "client";
  const cache = development;
  const hot = development && client;

  const filenameTemplate =
    production
      ? "assets/[name].[chunkhash:8].js"
      : "assets/[name].js";

  const entry = await createEntry("app", config.entry[side], opts);

  const options = {
    context: resolve("."),

    entry: {
      app: hot
        ? [
          `${require.resolve("webpack-dev-server/client")}?http://${config.bind.client.host}:${config.bind.client.port}`,
          require.resolve("webpack/hot/only-dev-server"),
          entry,
        ]
        : entry,
    },

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
      development
        ? "cheap-eval-source-map"
        : "source-map",
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

  if (development && client) {
    manager.rule("eslint", {
      enforce: "pre",
      test: /\.js$/,
      exclude: exclude(config.module.include),
      loader: require.resolve("eslint-loader"),
    });
  }
  manager.rule("babel", {
    test: /\.js$/,
    exclude: exclude(["vanipack", ...config.module.include]),
    loader: require.resolve("babel-loader"),
    options: {
      cacheDirectory: cache,
    },
  });
  manager.rule("css", {
    test: /\.css$/,
    use: [
      hot && "style-loader",
      ...ExtractTextPlugin.extract({
        remove: !hot,
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
              plugins: wrap(config.postcss || (_ => _))([
                atImport(),
                cssnext(),
              ]),
            },
          },
        ],
      }),
    ].filter(Boolean),
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
    "case-sensitive",
    CaseSensitivePathsPlugin,
  );

  if (hot) {
    manager.plugin(
      "hot",
      webpack.HotModuleReplacementPlugin,
    );
  }

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
  manager.plugin(
    "manifest",
    ManifestPlugin,
    {
      publicPath: client ? config.path.public : "",
      writeToFileEmit: true,
    },
  );

  if (development && client) {
    manager.plugin(
      "output",
      FriendlyErrorsPlugin,
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
