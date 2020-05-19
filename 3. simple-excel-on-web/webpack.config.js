module.exports = {
    entry: "./src/js/main.js",
    output: {
        path: __dirname + '/src/dist',
        filename: 'main.js'

    },
    mode: "development",
    devtool: 'source-map',
    module: {
        rules: [
          {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env'],
                plugins: ['@babel/plugin-proposal-class-properties']
              }
            }
          }
        ]
    }
};