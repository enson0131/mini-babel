#!/usr/bin/env node
// 要支持命令行启动需要在 js 文件开头加上 #!/usr/bin/env node

// node ./index.js ../../sourceCode/input/*.js --out-dir ./dist
const commander = require("commander"); // 通过 commander 可以获取命令行的参数
const { cosmiconfigSync } = require("cosmiconfig"); // 参照 babel/eslint 的配置
const glob = require("glob");
const fsPromises = require("fs").promises;
const fs = require("fs-extra");
const path = require("path");
const myBabel = require("../core");

commander.option("--out-dir <outDir>", "输出目录");
commander.option("--watch", "监听文件变动");

if (process.argv.length <= 2) {
  commander.outputHelp();
  process.exit(0);
}

commander.parse(process.argv);
const cliOpts = commander.opts();

if (!commander.args[0]) {
  console.error("没有指定编译文件");
  commander.outputHelp();
  process.exit(1);
}

if (!cliOpts.outDir) {
  console.error("没有指定输出目录");
  commander.outputHelp();
  process.exit(1);
}

if (cliOpts.watch) {
  const chokidar = require("chokidar");

  chokidar.watch(commander.args[0]).on("all", (event, path) => {
    console.log("检测到文件变动，编译:" + path);
    compile([path]);
  });
}
console.log(`commander`, commander);
const filenames = glob.sync(commander.args[0]);

const exportSync = cosmiconfigSync("myBabel");
const searchResultconfig = exportSync.search();

console.log(`searchResultconfig===>`, searchResultconfig);
const options = {
  babelOptions: searchResultconfig.config,
  cliOptions: {
    ...cliOpts,
    filenames,
  },
};

function compile(fileNames) {
  fileNames.forEach(async (filename) => {
    const fileContent = await fsPromises.readFile(filename, "utf-8");
    const baseFileName = path.basename(filename);
    const sourceMapFileName = baseFileName + ".map.json";

    const res = myBabel.transformSync(fileContent, {
      ...options.babelOptions,
      fileName: baseFileName,
    });

    const generatedFile =
      res.code + "\n" + "//# sourceMappingURL=" + sourceMapFileName;

    const distFilePath = path.join(options.cliOptions.outDir, baseFileName);
    const distSourceMapPath = path.join(
      options.cliOptions.outDir,
      sourceMapFileName
    );

    fs.outputFile(distFilePath, generatedFile);
    fs.outputFile(distSourceMapPath, res.map);
  });
}

compile(options.cliOptions.filenames);
