require("babel-register")({
  ignore: filename => (
    /node_modules\/(?!vanipack)/.test(filename) ||
    /\.vanipack\/build/.test(filename)
  ),

  plugins: [
    "transform-es2015-modules-commonjs",
  ],
});
