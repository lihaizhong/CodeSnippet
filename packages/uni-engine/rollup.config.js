import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "es",
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    json({
      include: ["./package.json"],
      compact: true,
    }),
    commonjs(),
    typescript({ tsconfig: "./tsconfig.build.json" }),
    terser(),
  ],
};
