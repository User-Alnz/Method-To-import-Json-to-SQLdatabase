import { database} from "../ModulesConnectionDataBase.js";
import { writeFile ,appendFile } from "node:fs/promises";
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
        if (!Array.isArray(parameters))
            throw new TypeError("parameters must be an array");
        this.parameters = parameters;
        if (!Array.isArray(alias))
        throw new TypeError("alias must be an array");
        this.alias = alias;
    }
  
    addColumn()
    {
        
    }

    checkExtentionCSV(filename)
    {
        if(filename.endsWith(".csv") !== true )
            filename += ".csv";
        
        return(filename);
    }

    addQuerryManually(StringQuerry) // /!\ BEWARE! No security with request if User has certains privileges it can drop database !! NO parsing Method yet !
    {
        if(typeof StringQuerry != "string" )
        throw new TypeError("Invalid parameter. Must enter a string");

        this.setManualquery = StringQuerry;
    }
    
    async writeQuery()
    {
        let buffer = "";

        if(this.setManualquery)
        buffer = this.setManualquery;
        else
        buffer = `SELECT ${this.parameters} From ${this.table}`;
        console.log(buffer);
        return(buffer);
    }


    async createColumnTitle(rawData) 
    {
      let array = [];
      let index = 0;
      let jsonToSingleArray = Object.values(rawData)[0];
      jsonToSingleArray = Object.entries(jsonToSingleArray);
        
      while (index < jsonToSingleArray.length) 
      {
        array.push(jsonToSingleArray[index][0]);
        index++;
      }

      array = array.join(",");
      array += "\n";
  
      return(array);
    }

    async transformRawDataToCSV(rawData, filename)
    {
       //console.log(Object.values(rawData[0]));

       let index = 0;
       let CSVrow = "";
       try
       {
            while(Object.keys(rawData)[index])
            {
                CSVrow = Object.values(rawData[index]).join(",");
                CSVrow += "\n";

                await appendFile(`../exportedFiles/${filename}`, CSVrow, "utf-8");
                index ++;
            }

            return;
       }
       catch(error)
        {
            console.error("Error when tranforming data to CSV. Check method :transformRawDataToCSV()", error.message, error.stack);
        }
        
    }
    
    async exportTableToCSV( filename )
    {

        if(typeof filename != "string" )
            throw new TypeError("Please exportTableToCSV() must provide name \n| like exportTableToCSV(\"data\");");

            filename = this.checkExtentionCSV(filename);
            console.log(filename);
        try
        {
            const SQLquery = await this.writeQuery();
            const rawData = await database.query(SQLquery);

            await writeFile(`../exportedFiles/${filename}`, ""); //just create file
            let CSVColumnTitle = await this.createColumnTitle(rawData[0]);
            await appendFile(`../exportedFiles/${filename}`, CSVColumnTitle, "utf-8"); //Write column title for CSV
            await this.transformRawDataToCSV(rawData[0], filename);

            database.end();
        }
        catch(error)
        {
            database.end();
            console.error("Error Exporting data:", error.message, error.stack);
        }
    }

}

const Doimport = new handleExportTable(
    "electdatabase",
    "station"
) 
//["id", "id_station", "nbre_pdc"]
Doimport.addQuerryManually("SELECT id,id_station From station");
console.info(Doimport.exportTableToCSV("borne.csv"));