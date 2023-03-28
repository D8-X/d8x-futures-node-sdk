const path = require("path");

module.exports = {
  entry: "./dist/src/index.js",
  mode: "development",
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"],
    modules: [
      path.resolve(__dirname, "abi"),
      path.resolve(__dirname, "config"),
      path.resolve(__dirname, "node_modules"),
    ],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    library: {
      name: "@d8x/perpetuals-sdk",
      type: "umd",
      export: "default",
    },
    globalObject: "this",
  },

  devtool: "source-map",
};
