import yargs from "yargs";

process.on("SIGINT", () => {
  process.exit();
});

// eslint-disable-next-line no-unused-expressions
yargs
  .alias("config", "c")
  .commandDir("./commands")
  .demandCommand(1)
  .help()
  .argv;
