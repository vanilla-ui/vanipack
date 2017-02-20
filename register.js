require("babel-register")({
  ignore: /node_modules\/(?!vanilla)/,

  plugins: [
    "transform-es2015-modules-commonjs",
  ],
});
