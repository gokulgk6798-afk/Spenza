const mongoose = require("mongoose");
const env = require("./env");

async function connectDatabase() {
  await mongoose.connect(env.dbUrl, {
    autoIndex: true,
  });

  return mongoose.connection;
}

module.exports = {
  connectDatabase,
};

