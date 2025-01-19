import { open, writeFile, appendFile } from "node:fs/promises";
import path, { join } from "node:path";
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

async function writeIntoJsonFormat(indexTitle, TitleEntriesArray, ValuesaSArray)
{
    let indexValue = 0;
    let DoNotBeLongerThan = TitleEntriesArray.length;
    let buffer = "";
    
    while(indexValue < ValuesaSArray.length)
    {
        //console.log(TitleEntriesArray[indexTitle], "is at index : ", indexTitle, "Its value is : ", `${ValuesaSArray[indexValue]}` ,"is at index : ", indexValue, "\n\n");
        if(indexTitle.value === 0)
            buffer += "{";
        
        buffer += `"${TitleEntriesArray[indexTitle.value]}" : "${ValuesaSArray[indexValue]}" ` ;

        if(indexTitle.value !== (DoNotBeLongerThan - 1))
            buffer += ",";

        if(indexTitle.value === (DoNotBeLongerThan - 1))
            buffer += "}\n";

        indexTitle.value = (indexTitle.value + 1) % DoNotBeLongerThan; //create infinite loop in TitleEntires Array to make match each value always with it's title
        indexValue++;
    }

    return (buffer);
}

async function transformValueIntoArray(CSV_ValuesInRows)
{
    CSV_ValuesInRows = CSV_ValuesInRows.replace(/[\r\n]/g, ","); //Control if line return "\n" or "\r" were not delete.
    CSV_ValuesInRows = CSV_ValuesInRows.split(",").filter(value => value.trim() !== ""); //create array by removing "," in string. then remove empty cells ""
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
        
            //Important to Debug mehtod 
           // console.log("\n ...... Current buffer in function is :", sliceValueInString);
           // console.log("\n ...... Last char in buffer is : ",incommingBuffer[lastChar]);
           // console.log("\n ...... Last string in buffer is : ", getLastvalueIfSliced);
        

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
        const buffer = Buffer.alloc(1024); //read 1024 Bytes or 1 1 Kilobyte || change size to work with bigger or lower package of data
        const startReadFileFromIndex = 0;
        let positionInFile = 0;

        let incommingBuffer = "";
        let valuesToWrite;
        let TitleEntriesArray;
        let isFileDone = false;
        
        //keep persistente memory of variable while function running
        const isParsed = { fisrtLineAlreadyParsed : false };
        const isLastValueSliced = { gotSliced: false, value : "" };
        const indexTitle = {value : 0};

        let fileSize;

        await writeFile(pathTowritefile, "["); //Create file to write data

        while(!isFileDone)
        {

            let data = await filehandle.read(buffer, startReadFileFromIndex , buffer.length, positionInFile);

            incommingBuffer = buffer.toString("utf-8"); // hex => char using encoding utf8

            if(data.bytesRead < buffer.length)
                incommingBuffer = incommingBuffer.slice(0, data.bytesRead); //ensure to keep only usefull data because original buffer get overwritten

            if(!isParsed.fisrtLineAlreadyParsed) //Json entries and CSV column name are in first package of data. Therefore we only use it ounce.
            TitleEntriesArray = await getCSVColumnTitleToArray(incommingBuffer, isParsed);

            valuesToWrite = await getValuesIntoStringRawData(incommingBuffer, isLastValueSliced);                
            valuesToWrite = await transformValueIntoArray(valuesToWrite);
            valuesToWrite = await writeIntoJsonFormat(indexTitle, TitleEntriesArray, valuesToWrite);
            valuesToWrite = valuesToWrite.split("\n").join(",");
                
            await appendFile(pathTowritefile, valuesToWrite, "utf-8");
 
            if(data.bytesRead < buffer.length) //stop when no more buffer to read.
                isFileDone = true;

            positionInFile += data.bytesRead; //move position to next hex data (buffer) to read 
        }
        
        const jsonFile = await open(pathTowritefile, 'r+');
        fileSize =  await jsonFile.stat();
        fileSize = fileSize.size;

        await jsonFile.write("]", fileSize - 1);

        await filehandle.close();
        await jsonFile.close();

        console.log("File proprely",filePath, "converted to .json");

    }
    catch(error)
    {
        console.error(error);
    }
}

transformCSVtoJson()