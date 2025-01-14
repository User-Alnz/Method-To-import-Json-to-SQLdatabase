import { database} from "../ModulesConnectionDataBase.js";
import { writeFile ,appendFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
  
    addColumn(array)
    {
        if (!Array.isArray(array))
        throw new TypeError(".addColumn() Invalid datatype. Parameters must be an array");

        if(array.length % 2 != 0)
        throw new TypeError(".addColumn() Must insert even number of parameters");

        this.newColumns = array;
    }

    addQuerryManually(StringQuerry) // /!\ BEWARE! No security with request if User has certains privileges it can drop database !! NO parsing Method yet !
    {
        if(typeof StringQuerry != "string" )
        throw new TypeError("addQuerryManually() Invalid parameter. Must enter a string");

        this.setManualquery = StringQuerry;
    }

    checkExtentionCSV(filename)
    {
        if(filename.endsWith(".csv") !== true )
            filename += ".csv";
        
        return(filename);
    }


    async writeQuery()
    {
        let buffer = "";

        if(this.setManualquery)
        buffer = this.setManualquery;
        else
        buffer = `SELECT ${this.parameters} From ${this.table}`;
        console.info( "SQL Querry is\n\n",`\"${buffer}\"`, "\n");
        return(buffer);
    }

    insertColumnTitle() // Create array containing only title column form addColumn()
    {
        let getOnlyColumnTitle = [];
        const newColumns = this.newColumns;
        
        for (let index = 0; index < newColumns.length; index += 2) 
        {
            getOnlyColumnTitle.push(newColumns[index]);
        }

        return (getOnlyColumnTitle);
    }

    async insertColumnValue() // Create array containing only value column form addColumn()
    {
        let getOnlyColumnValue = [];
        const newColumns = this.newColumns;
       
        for (let index = 1; index < newColumns.length; index += 2) 
        {
            getOnlyColumnValue.push(newColumns[index]);
        }

        return (getOnlyColumnValue);
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

      if(this.newColumns)
      {
        const addNewColumn = this.insertColumnTitle();
        array.push(addNewColumn);
      }

      array = array.join(",");
      array += "\n";
  
      return(array);
    }

    async transformRawDataToCSV(rawData, fullPath)
    {
       //console.log(Object.values(rawData[0]));

       let index = 0;
       let CSVrow = "";
       let addNewColumn;
       try
       {
            while(Object.keys(rawData)[index])
            {
                CSVrow = Object.values(rawData[index]);

                if(this.newColumns)
                {
                    addNewColumn = await this.insertColumnValue();
                    CSVrow.push(addNewColumn);
                }

                CSVrow = CSVrow.join(",");
                CSVrow += "\n";

                await appendFile(fullPath, CSVrow, "utf-8");
                index ++;
            }

            return(index);
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
            const   __filename = fileURLToPath(import.meta.url);
            const   __dirname = path.dirname( __filename);
            const filePath = path.resolve(__dirname, "../exportedFiles");
            const fullPath = path.join(filePath, filename);
            
        try
        {
            const SQLquery = await this.writeQuery();
            console.info("export to ",filename);
            const rawData = await database.query(SQLquery);
            console.info("\n Export is pending...");
            
            await writeFile(fullPath, ""); //just create file
            const CSVColumnTitle = await this.createColumnTitle(rawData[0]);
            await appendFile(`${fullPath}`, CSVColumnTitle, "utf-8"); //Write column title for CSV
            const exportCSV = await this.transformRawDataToCSV(rawData[0], fullPath);// Write line by line because we can use method to addColumn();

            console.info(`--------------------\nExport From ${this.table} is done.\n\nYou have exported the following list: ${CSVColumnTitle}\nYour file got written there : ${fullPath}\nTotal: ${exportCSV} lines \n--------------------`);
            database.end();
        }
        catch(error)
        {
            database.end();
            console.error("Error Exporting data:", error.message, error.stack);
        }
    }

}

export {handleExportTable};