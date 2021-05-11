let Datastore = require("nedb");
export let db = new Datastore({
  filename: "../packs/tradegoods.db",
  autoload: true,
  timestampData: true
});
