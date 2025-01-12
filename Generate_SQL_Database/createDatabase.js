import {database} from "../ModulesConnectionDataBase.js"
import { DB_NAME } from "../ModulesConnectionDataBase.js";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";


const   __filename = fileURLToPath(import.meta.url);
const   __dirname = path.dirname( __filename);
const   filePath = path.resolve(__dirname, "schema.sql");
const   SQLDataBase = readFileSync(filePath, "utf-8");

async function initiateDataBaseWith_schema_sql()
{
    try
    {
        console.log(`Dropping database if exists: ${DB_NAME}`);
        await database.query(`drop database if exists ${DB_NAME}`);
        console.log(`Creating database: ${DB_NAME}`);
        await database.query(`create database ${DB_NAME}`);
        console.log(`Using database: ${DB_NAME}`);
        console.log("Executing schema.sql...");
        await database.query(`use ${DB_NAME}`);
        await database.query(SQLDataBase);
        console.log("schema.sql Imported");
        database.end();
    }
    catch(error)
    {
        database.end();
        const { message, stack } = error;
        console.error(" Mind To check User Privilege on SQL database | Or | Error updating the database:", message, stack);
    }

}

initiateDataBaseWith_schema_sql();