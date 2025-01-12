// Get variables from .env file for database connection
import "dotenv/config";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

// Create a connection pool to the database
import mysql from "mysql2/promise";

const database = mysql.createPool({
  host: DB_HOST,
  port: Number.parseInt(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

const ShowEnv = () =>{
    console.log("Check .env if following info are undefined\n\n" ,"DB_HOST",DB_HOST,"DB_PORT",DB_PORT, "DB_USER", DB_USER, "DB_NAME", DB_NAME, "\n\n");
};

// Ready to export
export { database, ShowEnv };
export { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME };