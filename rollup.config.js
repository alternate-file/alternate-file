import pkg from "./package.json";
import resolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import builtins from "builtin-modules";

export default {
  input: "./src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      sourcemap: true
    },
    {
      file: pkg.module,
      format: "es",
      sourcemap: true
    }
  ],
  external: [...builtins, "result-async", "find-up"],
  plugins: [
    typescript(),
    resolve({
      extensions: ".ts",
      preferBuiltins: true
    })
  ]
};
