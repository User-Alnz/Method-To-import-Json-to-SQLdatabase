import { readFileSync } from "node:fs";
import { database, storeEnv } from "./ModulesConnectionDataBase.js";

//import path from "node:path";
//import { fileURLToPath } from "node:url";

//const   __filename = fileURLToPath(import.meta.url);
//const   __dirname = path.dirname( __filename);
//const filePath = path.resolve(__dirname, "df2_export (1).json");

const filePath = "df2_export (1).json";

const rawData = readFileSync(filePath, "utf-8");
const json = JSON.parse(rawData);

class handleImportQuerry {
  constructor( SQLDataBase = null , SQLTableName = null, parameters = [], jsonFile = null) {
    this.dataBase = SQLDataBase;
    this.table = SQLTableName;
    this.parameters = parameters;
    this.JsonToImport = jsonFile;
  }

  displayJsonSample()
  {
    const sample = Object.values(this.JsonToImport)[0];

    let index = 0;
    let displaysample = [];
    while(index < 5)
    {
        displaysample.push(Object.values(this.JsonToImport)[index]);
        index++;
    }
    
    return sample; 
   /// return Object.values(this.JsonToImport)[233]
  }

  getAllEntriesFromJsonFile() 
  {
    const tab = [];
    let index = 0;
    let jsonToSingleArray = Object.values(this.JsonToImport)[0];
    jsonToSingleArray = Object.entries(jsonToSingleArray);
    //console.info(jsonToSingleArray);

    while (index < jsonToSingleArray.length) {
      tab.push(jsonToSingleArray[index][0]);
      index++;
    }

    return tab;
  }

  compareEntriesBetweenJsonAndParameters(parameterList, referenceList) {
    //console.info(parameterList);
    //console.info(referenceList);
    const isMissMatch = parameterList.every((eachEntry) =>
      referenceList.includes(eachEntry),
    );

    return isMissMatch;
  }

  addQuotesToSQLQuerry(sliceWantedValues, jsonValue)
  {
    let temp = [];
    temp = jsonValue.replace(/'/g, "''");
    temp = `"${temp}"`;
    return (sliceWantedValues.push(temp));

  }

  async createParameterBuffer(ObjectValues) {

    let slicedObjectForQuerry = ObjectValues;
    slicedObjectForQuerry = Object.entries(slicedObjectForQuerry);

    const parameterList = this.parameters;
    const sliceWantedValues = [];
    let temp = [];
    let parameterListIndex = 0;
    let ObjectForQuerryIndex = 0;

    //console.info(slicedObjectForQuerry);
    //console.info(parameterList);

    while (ObjectForQuerryIndex < slicedObjectForQuerry.length) {
      parameterListIndex = 0;
      while (parameterListIndex < parameterList.length) {
        if (parameterList[parameterListIndex] == slicedObjectForQuerry[ObjectForQuerryIndex][0])
        {
            if(typeof slicedObjectForQuerry[ObjectForQuerryIndex][1] === "string" )
            {
              temp = slicedObjectForQuerry[ObjectForQuerryIndex][1];
              this.addQuotesToSQLQuerry(sliceWantedValues, temp);
              temp = null; //free memory
            }
            else if( slicedObjectForQuerry[ObjectForQuerryIndex][1]  === null)
            {
              console.log(typeof(slicedObjectForQuerry[ObjectForQuerryIndex][1]));
              sliceWantedValues.push("NULL");
            }
            else
            {
              console.log(typeof(slicedObjectForQuerry[ObjectForQuerryIndex][1]));
              sliceWantedValues.push(slicedObjectForQuerry[ObjectForQuerryIndex][1]);
            } 
            /*else if(typeof slicedObjectForQuerry[ObjectForQuerryIndex][1] === "number")
            {
              console.log(typeof(slicedObjectForQuerry[ObjectForQuerryIndex][1]));
              sliceWantedValues.push(slicedObjectForQuerry[ObjectForQuerryIndex][1]);
            }*/
        }
        parameterListIndex++;
      }
      ObjectForQuerryIndex++;
    }
    console.log(sliceWantedValues.join(","));

    return sliceWantedValues.join(",");
  }

  async createValueBuffer(ObjectValues) {
    let slicedObjectForQuerry = ObjectValues;
    slicedObjectForQuerry = Object.entries(slicedObjectForQuerry);

    const parameterList = this.parameters;
    const sliceWantedValues = [];
    let parameterListIndex = 0;
    let ObjectForQuerryIndex = 0;

    //console.info(slicedObjectForQuerry);
    //console.info(parameterList);

    while (ObjectForQuerryIndex < slicedObjectForQuerry.length) {
      parameterListIndex = 0;
      while (parameterListIndex < parameterList.length) {
        if (
          parameterList[parameterListIndex] ==
          slicedObjectForQuerry[ObjectForQuerryIndex][0]
        )
          sliceWantedValues.push(
            slicedObjectForQuerry[ObjectForQuerryIndex][0],
          );

        parameterListIndex++;
      }
      ObjectForQuerryIndex++;
    }

    return sliceWantedValues.join(",");
  }

  
  async getTempStore(index)
  { 
    let tab = [];
    tab = Object.values(this.JsonToImport)[index];
    return tab;
  };

  async executeSQLQuerry() {

      let tempStore = [];
      let SQLParameter ="";
      let SQLvalue= "";
      let index = 0;

    try{

      //this.verifyParameters();
    
      await database.query(`USE ${this.dataBase}`);

      
      while(Object.keys(this.JsonToImport)[index]) {

        //tempStore = Object.values(this.JsonToImport)[index]; //temps store object values to retrive object values to import
        tempStore = await this.getTempStore(index);
        SQLParameter =  await this.createParameterBuffer(tempStore);
        SQLvalue = await this.createValueBuffer(tempStore);

        const Buffer = `insert into ${this.table}(${SQLvalue}) values (${SQLParameter})`;
        console.log(Buffer);
        await database.query(Buffer);
        index++;
      }

      console.log(`--------------------\nImport into ${this.table} is done.\nYou have imported: \n ${this.parameters} \n${index} lines of data.\n--------------------`);
      await database.end();
    }
    catch(error)
    {
      console.error("Error importing the database:", error.message, error.stack, "Error at index :", index );
    }

    
  }

  verifyParameters() {
    if (Array.isArray(this.parameters) == false)
      throw new Error("Enter parameters otherwise it will not work");

    const parameterList = this.parameters;
    const referenceList = this.getAllEntriesFromJsonFile(); // extract a sample of object entries and return tab containing entries
    const doesMatch = this.compareEntriesBetweenJsonAndParameters(
      parameterList,
      referenceList,
    );

    if (!doesMatch)
      throw new Error("Parameters does not match with json entries");
    else return true;
  }
}

const DoImport = new handleImportQuerry(
  "elecdatabase",
  "station",
  ["id_station", "n_station", "ad_station", "xlongitude", "ylatitude", "nbre_pdc", "accessibilite", "puiss_max", "type_prise"],
  json,
);
//console.info(DoImport.verifyParameters());
console.info(DoImport.executeSQLQuerry());
//console.info(DoImport.getAllEntriesFromJsonFile());
//console.info(DoImport.displayJsonSample());

//dotenv.config({ path: '../.env' });


//console.info(DoImport.verifiedParameters());

//console.info(DoImport.importTable());

//console.log(insert(json));
//console.info(json);
