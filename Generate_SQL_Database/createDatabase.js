import mysql from "mysql2/promise";
import "dotenv/config";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";


const   __filename = fileURLToPath(import.meta.url);
const   __dirname = path.dirname( __filename);
const   filePath = path.resolve(__dirname, "schema.sql");
const   SQLDataBase = readFileSync(filePath, "ascii");

async function initiateDataBaseWith_schema_sql()
{
    try
    {
        var importData = await mysql.createConnection({
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            password: DB_PASSWORD,
            multipleStatements: true // Allow to pass a full file of querry rather than slicing it into several queries using loop.
        });
    
        console.info(`Dropping database if exists: ${DB_NAME}`);
        await importData.query(`drop database if exists ${DB_NAME}`);
        console.info(`Creating database: ${DB_NAME}`);
        await importData.query(`create database ${DB_NAME}`);
        console.info(`Using database: ${DB_NAME}`);
        console.info("Executing your _file.sql...");
        await importData.query(`use ${DB_NAME}`);
        await importData.query(SQLDataBase);
        console.info("\n Your schema got successfully imported");

        importData.end();
    }
    catch(error)
    {
        importData.end();
        const { message, stack } = error;
        console.error(" Mind To check User Privilege on SQL database | Or | Error updating the database:", message, stack);
    }

}

initiateDataBaseWith_schema_sql();