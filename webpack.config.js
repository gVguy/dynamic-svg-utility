const path = require('path')

const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanTerminalPlugin = require('clean-terminal-webpack-plugin')

module.exports = env => ({
   mode: env.production ? 'production' : 'development',
   entry: './src/entry.ts',
   plugins: [
      new HtmlWebpackPlugin({
         template: './src/index.html'
       }),
      new CleanTerminalPlugin()
   ],
   output: {
      filename: 'main.js',
      path: path.resolve(__dirname, './dist'),
      publicPath: env.production ? './' : '/',
      clean: true
   },
   devtool: env.production ? false : 'inline-source-map',
   devServer: {
      static: './dist'
   },
   stats: 'errors-warnings',
   module: {
      rules: [
         {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
         },
         {
            test: /\.s[ac]ss$/,
            use: ['style-loader', 'css-loader', 'sass-loader']
         },
         {
            test: /\.(png|svg|jpg|jpeg|gif)$/i,
            type: 'asset/resource'
         },
         {
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node_modules/
         },
         {
            test: /\.template$/,
            type: 'asset/source'
         }
      ]
   },
   resolve: {
      alias: {
         '@': path.resolve(__dirname, './src')
      },
      extensions: ['.ts', '.js']
   }
})
