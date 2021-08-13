const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');
module.exports = {
    plugins: [
        new CleanWebpackPlugin({
            cleanAfterEveryBuildPatterns: [
                path.join(__dirname, 'dist', '', '*.txt'),
            ]
        })
    ]
}