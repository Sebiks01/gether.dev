import { connect } from "mongoose";

import { info, success, error, debug } from "./logger";

export async function mongoConnect() {
  // Creating a new database connection
  info("Connecting to the database...");

  // Checking if the database connection URI is provided
  if (!process.env.MONGO_URI) {
    error("No database connection URI provided.");
    process.exit(1);
  }

  const { connection } = await connect(process.env.MONGO_URI as string).catch((err) => {
    debug(`Database connection URI: ${process.env.MONGO_URI}`);
    error("Failed to connect to the database.");
    console.log(err);

    // Ending the process if the connection fails
    process.exit(1);
  });

  success("Successfully connected to the database.");
  debug(`Host: "${connection.host}".`);
  debug(`Database: "${connection.db.databaseName}".`);
  debug(`Connection ID: "${connection.id}".`);

  return;
}
