import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import external from "rollup-plugin-peer-deps-external";
import { uglify } from "rollup-plugin-uglify";

import packageJSON from "./package.json";
const input = "../src/shared/index.js";
const minifyExtension = pathToFile => pathToFile.replace(/\.js$/, ".min.js");

export default [
  // CommonJS
  {
    input,
    output: {
      file: packageJSON.main,
      format: "cjs",
      sourcemap: true
    },
    plugins: [
      resolve(),
      babel({
        presets: ['@babel/env', '@babel/preset-react'],
        plugins: ["@babel/plugin-proposal-class-properties"],
        exclude: "node_modules/**"
      }),
      external(),
      commonjs()
    ]
  }, {
    input,
    output: {
      file: minifyExtension(packageJSON.main),
      format: "cjs",
      sourcemap: true
    },
    plugins: [
      resolve(),
      babel({
        presets: ['@babel/env', '@babel/preset-react'],
        plugins: ["@babel/plugin-proposal-class-properties"],
        exclude: "node_modules/**"
      }),
      external(),
      commonjs(),
      uglify()
    ]
  }
];
