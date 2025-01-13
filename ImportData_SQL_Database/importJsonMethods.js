import { database, ShowEnv } from "../ModulesConnectionDataBase.js";

class handleImportQuerry {

  constructor( SQLDataBase = null , SQLTableName = null, parameters = [], jsonFile) {
    this.dataBase = SQLDataBase;
    this.table = SQLTableName;
    this.parameters = parameters;
    this.JsonToImport = jsonFile;
  }

  displayJsonSample(nbrsOfEntries)
  { 
    if(nbrsOfEntries === undefined)
      nbrsOfEntries = 1;
    else if(typeof nbrsOfEntries !== "number" || nbrsOfEntries < 0)
      throw new Error(" Please enter valid DataType. number is expected, negative number are not allowed. like => displayJsonSample(5); ");

    let index = 0;
    let displaysample = [];
    while(index < nbrsOfEntries)
    {
        displaysample.push(Object.values(this.JsonToImport)[index]);
        index++;
    }
    
    return displaysample; 
   
  }

  getAllEntriesFromJsonFile() 
  {
    const array = [];
    let index = 0;
    let jsonToSingleArray = Object.values(this.JsonToImport)[0];
    jsonToSingleArray = Object.entries(jsonToSingleArray);

    while (index < jsonToSingleArray.length) 
    {
      array.push(jsonToSingleArray[index][0]);
      index++;
    }

    return array;
  }

  compareEntriesBetweenJsonAndParameters(parameterList, referenceList) {
 
    const isMissMatch = parameterList.every((eachEntry) =>
      referenceList.includes(eachEntry),
    );

    return isMissMatch;
  }

  async verifyParameters() {

    if (Array.isArray(this.parameters) == false)
      throw new Error("Enter parameters otherwise it will not work");

      const parameterList = this.parameters;
      const referenceList = this.getAllEntriesFromJsonFile(); // extract a sample of object entries and return tab containing entries
      const doesMatch = this.compareEntriesBetweenJsonAndParameters(parameterList, referenceList);

    if (!doesMatch)
      throw new Error(
      "Parameters does not match with json entries \n Please Verify following list :", 
      this.parameters, 
      "\n  !! Mind to use getAllEntriesFromJsonFile() or displayJsonSample(nbrsOfEntries) to fin out syntax error"
      );
    else 
    return true;
  }

  addQuotesToSQLQuerry(sliceWantedValues, jsonValue)
  {
    let temp = [];
    temp = jsonValue.replace(/"/g, " ");
    temp = temp.replace(/'/g, "\\'");
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

    while (ObjectForQuerryIndex < slicedObjectForQuerry.length) 
    {
          parameterListIndex = 0;
        while (parameterListIndex < parameterList.length) 
        {
            if (parameterList[parameterListIndex] == slicedObjectForQuerry[ObjectForQuerryIndex][0])
            {
                if(typeof slicedObjectForQuerry[ObjectForQuerryIndex][1] === "string")
                {
                  temp = slicedObjectForQuerry[ObjectForQuerryIndex][1];
                  this.addQuotesToSQLQuerry(sliceWantedValues, temp);
                  temp = null; //free memory
                }
                else if( slicedObjectForQuerry[ObjectForQuerryIndex][1]  === null)
                {
                  sliceWantedValues.push("NULL");
                }
                else
                {
                  sliceWantedValues.push(slicedObjectForQuerry[ObjectForQuerryIndex][1]);
                } 
                
            }

          parameterListIndex++;
        }

      ObjectForQuerryIndex++;
    }
  
    return sliceWantedValues.join(",");
  }

  async createValueBuffer(ObjectValues) 
  {
    let slicedObjectForQuerry = ObjectValues;
    slicedObjectForQuerry = Object.entries(slicedObjectForQuerry);

    const parameterList = this.parameters;
    const sliceWantedValues = [];
    let parameterListIndex = 0;
    let ObjectForQuerryIndex = 0;


    while (ObjectForQuerryIndex < slicedObjectForQuerry.length) 
    {
      parameterListIndex = 0;
        while (parameterListIndex < parameterList.length) 
        {
          if ( parameterList[parameterListIndex] == slicedObjectForQuerry[ObjectForQuerryIndex][0])
            sliceWantedValues.push(slicedObjectForQuerry[ObjectForQuerryIndex][0],);

          parameterListIndex++;
        }

      ObjectForQuerryIndex++;
    }

    return sliceWantedValues.join(",");
  }

  JsonValueAt(index)
  { 
    let array = [];
    array = Object.values(this.JsonToImport)[index];
    array = Object.entries(array);
    return array;
  };

  async listDatatypeOfParameters()
  {
    let arrayContaningDatatype = [];
    const parameterList = this.parameters;
    const sliceASample = this.JsonValueAt(0);
    
    let sliceASampleIndex = 0;
    let parameterListIndex = 0;
    let row = 0;

    while(parameterListIndex < parameterList.length)
    {
        sliceASampleIndex = 0;
          
          while(sliceASampleIndex < sliceASample.length)
          {
            if(sliceASample[sliceASampleIndex][0] == parameterList[parameterListIndex])
            {
              if(!arrayContaningDatatype[row]) //Create a 2D array to store parmeterName and dataType on same array row index
                  arrayContaningDatatype[row]=[];

                arrayContaningDatatype[row].push(sliceASample[sliceASampleIndex][0]);
                arrayContaningDatatype[row].push(typeof sliceASample[sliceASampleIndex][1]);
              
              row++;  
            }

            sliceASampleIndex++;
          }


        parameterListIndex++;
    }

    return(arrayContaningDatatype);
  }
  
  async verifyDataTypeConformity(parametersDataTypeArray, tempStore)
  {
    let DataToControl = tempStore;
    DataToControl = Object.entries(DataToControl);

    let DataToControlIndex = 0;
    let parametersDataTypeArrayIndex = 0;

    while(DataToControlIndex < DataToControl.length)
    {
      parametersDataTypeArrayIndex = 0;

        while(parametersDataTypeArrayIndex < parametersDataTypeArray.length)
        {

          if(parametersDataTypeArray[parametersDataTypeArrayIndex][0] ==  DataToControl[DataToControlIndex][0] || typeof DataToControl[DataToControlIndex][1] === null)
          {

            if(parametersDataTypeArray[parametersDataTypeArrayIndex][1] != typeof DataToControl[DataToControlIndex][1])
              return(false);
            
          }
          parametersDataTypeArrayIndex ++;
        }

      DataToControlIndex++;
    }
    return(true);
  }
 
  async getJsonValueAt(index)
  { 
    let array = [];
    array = Object.values(this.JsonToImport)[index];
    return array;
  };

  async executeSQLQuerry() {

      let tempStore = [];
      let SQLParameter ="";
      let SQLvalue= "";
      let index = 0;
      let skiped = 0;

    try{

      await this.verifyParameters();
      const parametersDataTypeArray = await this.listDatatypeOfParameters();
      await database.query(`USE ${this.dataBase}`);

      while(Object.keys(this.JsonToImport)[index]) 
      {

        tempStore = await this.getJsonValueAt(index);
        let isDataConform = await this.verifyDataTypeConformity(parametersDataTypeArray, tempStore);

          if(!isDataConform)
          {
            index++;
            skiped++;
          }
          else
          {
            SQLParameter =  await this.createParameterBuffer(tempStore);
            SQLvalue = await this.createValueBuffer(tempStore);

            const Buffer = `insert into ${this.table}(${SQLvalue}) values (${SQLParameter})`;
            console.info(Buffer);
            console.info("index : ", index);
            await database.query(Buffer);
          }
        index++;
      }

      console.info(`--------------------\nImport into ${this.table} is done.\nYou have imported: \n${this.parameters} \nTotal ${index} lines of data.\nTotal lines ${skiped} skipped due to Invalid Datatype\n--------------------`);
      database.end();
    }
    catch(error)
    {
      database.end();
      console.error("Error importing the database:", error.message, error.stack, "Error at index :", index );
    }

  }

}

export {handleImportQuerry};  