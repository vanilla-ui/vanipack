require("babel-register")({
  ignore: filename => (
    /node_modules\/(?!vanilla)/.test(filename) ||
    /\.vanilla\/build/.test(filename)
  ),

  plugins: [
    "transform-es2015-modules-commonjs",
  ],
});
