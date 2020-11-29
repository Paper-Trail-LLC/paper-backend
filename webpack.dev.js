const nodeExternals = require("webpack-node-externals");
const  merge  = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require("webpack");
const path = require('path');

module.exports = merge(common,{
  entry: ["webpack/hot/poll?100", "./src/index.ts"],
  mode: "development",
  devtool: 'inline-source-map',
  watch: true,
  externals: [
    nodeExternals({
      allowlist: ["webpack/hot/poll?100"]
    })
  ],
  devServer: {
    contentBase: './dist',
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
});