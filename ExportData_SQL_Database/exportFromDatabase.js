import { database} from "../ModulesConnectionDataBase.js";
import "dotenv/config";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

class  handleExportTable
{
    constructor(SQLDataBase , SQLTableName, parameters=[], alias=[])
    {
        this.dataBase = SQLDataBase;
        this.table = SQLTableName;
        this.parameters = parameters;
        this.alias = alias;
    }

    async exportTableToCSV()
    {


    }


}

const Doimport = new handleExportTable(
    "electdatabase",
    "station",
    ["id", "id_station", "nbre_pdc"]
) 