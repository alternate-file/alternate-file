import * as File from "../utils/File";
import { lookupConfig, combineFileConfigs } from "./ConfigFile";
import { ok } from "result-async";

describe("ConfigFile", () => {
  describe("given simple config", () => {
    const configFile = [
      {
        path: "**/*.js",
        alternate: "**/*.test.js"
      }
    ];

    const expectedConfig = {
      rootPath: "/tmp",
      files: [
        {
          alternate: "**/*.js",
          path: "**/*.test.js",
          template: "",
          alternateTemplate: ""
        },
        {
          path: "**/*.js",
          alternate: "**/*.test.js",
          template: "",
          alternateTemplate: ""
        }
      ]
    };

    describe("lookupConfig", () => {
      it("looks up config", async () => {
        jest
          .spyOn(File, "findFileFrom")
          .mockImplementation(
            (_fileName: string[] | string) => async (_userFilePath: string) =>
              ok("/tmp/.alternate-file.json")
          );

        jest
          .spyOn(File, "readFile")
          .mockResolvedValue(ok(JSON.stringify(configFile)));

        expect(await lookupConfig("/tmp/main.js")).toEqual(ok(expectedConfig));
      });
    });

    describe("combineFileConfigs", () => {
      it("parses one config", () => {
        expect(combineFileConfigs("/tmp")(configFile)).toEqual(expectedConfig);
      });
    });
  });

  describe("combineFileConfigs", () => {
    it("parses multiple alternates", () => {
      const configFile = [
        {
          path: "**/*.js",
          alternate: ["**/*.test.js", "**/__tests__/*.test.js"]
        }
      ];

      const expectedConfig = {
        rootPath: "/tmp",
        files: [
          {
            path: "**/*.test.js",
            alternate: "**/*.js",
            template: "",
            alternateTemplate: ""
          },
          {
            path: "**/*.js",
            alternate: "**/*.test.js",
            template: "",
            alternateTemplate: ""
          },
          {
            path: "**/__tests__/*.test.js",
            alternate: "**/*.js",
            template: "",
            alternateTemplate: ""
          },
          {
            path: "**/*.js",
            alternate: "**/__tests__/*.test.js",
            template: "",
            alternateTemplate: ""
          }
        ]
      };

      expect(combineFileConfigs("/tmp")(configFile)).toEqual(expectedConfig);
    });
  });
});
