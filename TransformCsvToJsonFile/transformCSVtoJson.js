import { open, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.resolve(__dirname, "../exportedFiles");
const fullPath = path.join(filePath, "borne.csv"); 

class handleConversionToJson
{
    constructor(file)
    {
        this.fileToconvert = file;
    }

    constructPathFile(filename)
    {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const filePath = path.resolve(__dirname, "../exportedFiles");
        const fullPath = path.join(filePath, filename); 

        return (fullPath);
    }

}

async function transformValueIntoArray(CSV_ValuesInRows)
{
    CSV_ValuesInRows = CSV_ValuesInRows.replace(/[\r\n]/g, ","); //Control if line return "\n" or "\r" were not delete.
    CSV_ValuesInRows = CSV_ValuesInRows.split(",");
    
    return(CSV_ValuesInRows);
}

async function getValuesIntoStringRawData(incommingBuffer, isLastValueSliced)
{
    let sliceValueInString = "";
    let getLastvalueIfSliced = "";
    
    let incommingBufferLength = incommingBuffer.length;
    let lastChar = incommingBufferLength - 1;
    let reverseIndex = lastChar;
    let index = 0;

    if(isLastValueSliced.gotSliced === true )
        sliceValueInString += isLastValueSliced.value; //get incomplete value from previous incommingBuffer


    //this if => Control last char to retieve sliced string by reversing string to last "," before end of sting, then reconsitute last string.
    if(incommingBuffer[lastChar] !== "\n" && incommingBuffer[lastChar] !== "\r") 
    {
        isLastValueSliced.gotSliced = true;

        while(reverseIndex > 0)
        {
            if(incommingBuffer[reverseIndex] === "," )
                break;
            else
                getLastvalueIfSliced += incommingBuffer[reverseIndex];

            reverseIndex--;
        }

        getLastvalueIfSliced = getLastvalueIfSliced.split('').reverse().join(''); //this reverse string rather then coding own method
        isLastValueSliced.value = getLastvalueIfSliced; //store string to next package
    }

    
    while(index < reverseIndex) //Stop writing to value sliced from previous loop. Because it will be reconsitiue in next 
    {
        if(incommingBuffer[index] == "\n" && incommingBuffer[index] != "\r")
            sliceValueInString += ",";
        else
            sliceValueInString += incommingBuffer[index];

        index ++;
    }
        
        /*
            //Important to Debug mehtod 
            console.log("\n ...... Current buffer in function is :", sliceValueInString);
            console.log("\n ...... Last char in buffer is : ",incommingBuffer[lastChar]);
            console.log("\n ...... Last string in buffer is : ", getLastvalueIfSliced);
        */

    return(sliceValueInString); // Raw data string value,value,value etc.. 
}


async function getCSVColumnTitleToArray(incommingBuffer, isParsed)
{
    let index = 0;
    let title ="";

    while(incommingBuffer[index] != "\n" && incommingBuffer[index] != "\r") // "\r" because depending of encoding file
    {
        title += incommingBuffer[index]; 
        index++;
    }

    isParsed.fisrtLineAlreadyParsed = true;
    title = title.split(",");//transform string to array

    return (title); 
}

async function transformCSVtoJson()
{
    const pathTowritefile = path.join(filePath, "borne.json");

    try
    {
        const filehandle = await open(fullPath, "r");

        //initiate buffer parameters to readfile 
        const buffer = Buffer.alloc(100); //read 1024 Bytes or 1 1 Kilobyte || change size to work with bigger or lower package of data
        const startReadFileFromIndex = 0;
        let positionInFile = 0;  //console.log(buffer);

        let incommingBuffer = "";
        let CSV_ValuesStringInRows;
        let CSV_ValuesArray;
        let jsonEntriesArray;
        let isFileDone = false;
        let isParsed = {fisrtLineAlreadyParsed : false};
        let isLastValueSliced = { gotSliced: false, value : "" }

        
        await writeFile(pathTowritefile, "["); //Create file to write data

        while(!isFileDone)
        {

            let data = await filehandle.read(buffer, startReadFileFromIndex , buffer.length, positionInFile);

            incommingBuffer = buffer.toString("utf-8"); // hex => char using encoding utf8

            CSV_ValuesStringInRows = await getValuesIntoStringRawData(incommingBuffer, isLastValueSliced);
            

            if(!isParsed.fisrtLineAlreadyParsed) //Json entries and CSV column name are in first package of data. Therefore we only use it ounce.
                jsonEntriesArray = await getCSVColumnTitleToArray(incommingBuffer, isParsed);
                

            CSV_ValuesArray = await transformValueIntoArray(CSV_ValuesStringInRows);
            console.log(jsonEntriesArray);
            console.log(CSV_ValuesArray);
 
            if(data.bytesRead === 0) //stop when no more buffer to read.
                isFileDone = true;

            positionInFile += data.bytesRead; //move position to next hex data (buffer) to read 
        }

        await filehandle.close();

    }
    catch(error)
    {
        console.error(error);
    }
}



transformCSVtoJson()