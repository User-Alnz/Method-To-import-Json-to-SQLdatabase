import { open, writeFile, appendFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";


class handleConversionToJson
{
    constructor(fileSource, fileDestination)
    {
        if (typeof fileSource !== "string")
            throw new TypeError("fileSource must be a string. Example of constructor \"new handleConversionToJson(fileSource.csv, fileDestination.json);\"");
        this.fileToconvert = fileSource;
        if (typeof fileDestination !== "string")
            throw new TypeError("fileSource must be a string. Example of constructor \"new handleConversionToJson(fileSource.csv, fileDestination.json);\"");
        this.NewfileInJson = fileDestination;
    }

    constructPathFile(filename)
    {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const filePath = path.resolve(__dirname, "../exportedFiles");
        const fullPath = path.join(filePath, filename); 

        return (fullPath);
    }

    checkExtentionJson(filename)
    {
        console.log(filename);
        if(filename.endsWith(".json") !== true )
            filename += ".json";
        
        return(filename);
    }


    controlDataTypeStringOrNumber(valueAsString)
    {
        let index = 0;

        while(index < valueAsString.length)
        {
            if(!(valueAsString.charCodeAt(index) > 47 && valueAsString.charCodeAt(index) < 58) && valueAsString.charCodeAt(index) !==  46)
                return(`\"${valueAsString}\"`);

            index ++;
        }
        return(valueAsString);

    }

    async  writeIntoJsonFormat(indexTitle, TitleEntriesArray, valuesToWrite)
    {
        let indexValue = 0;
        let DoNotBeLongerThan = TitleEntriesArray.length;
        let buffer = "";
        
        while(indexValue < valuesToWrite.length)
        {
            //console.log(TitleEntriesArray[indexTitle], "is at index : ", indexTitle, "Its value is : ", `${valuesToWrite[indexValue]}` ,"is at index : ", indexValue, "\n\n");
            if(indexTitle.value === 0)
                buffer += "{";

            buffer += `"${TitleEntriesArray[indexTitle.value]}":${this.controlDataTypeStringOrNumber(valuesToWrite[indexValue])}` ;

            if(indexTitle.value !== (DoNotBeLongerThan - 1))
                buffer += ",";

            if(indexTitle.value === (DoNotBeLongerThan - 1))
                buffer += "}\n";

            indexTitle.value = (indexTitle.value + 1) % DoNotBeLongerThan; //create infinite loop in TitleEntires Array to make match each value always with its title
            indexValue++;
        }

        return (buffer);
    }

    async  transformValueIntoArray(valuesToWrite)
    {
        valuesToWrite = valuesToWrite.replace(/[\r\n]/g, ","); //Control if line return "\n" or "\r" were not delete.
        valuesToWrite = valuesToWrite.split(",").filter(value => value.trim() !== ""); //create array by removing "," in string. then remove empty cells ""
        return(valuesToWrite);
    }

    async getValuesIntoStringRawData(incommingBuffer, isLastValueSliced, indexValue)
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

        if(indexValue.firstIncommingpackage ===  false)
        {
            index = indexValue.value;
            indexValue.firstIncommingpackage = true;
        }

        while(index < reverseIndex) //Stop writing to value sliced from previous loop. Because it will be reconsitiue in next 
        {
            if(incommingBuffer[index] == "\n" && incommingBuffer[index] != "\r")
                sliceValueInString += ",";
            else
                sliceValueInString += incommingBuffer[index];

            index ++;
        }
            
        return(sliceValueInString); // Raw data string value,value,value etc.. 
    }


    async getCSVColumnTitleToArray(incommingBuffer, isParsed)
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

    async defineWhereToStartWritingValue(incommingBuffer, indexValue)
    {
        let count = 0;

        while(incommingBuffer[count] != "\n" && incommingBuffer[count] != "\r") // "\r" because depending of encoding file
        {
            count++;
        }

        indexValue.value = count+1; // to start next index after \n
        return (indexValue.value); 
    }

    async transformCSVtoJson()
    {
        const fileTowriteIntoJson = this.checkExtentionJson(this.NewfileInJson);
        const csvFileTotransform = this.fileToconvert;
        const pathFileToRead  =  this.constructPathFile(csvFileTotransform);
        const pathTowritefile = this.constructPathFile(fileTowriteIntoJson);

        try
        {
            const filehandle = await open(pathFileToRead, "r");

            //initiate buffer parameters to readfile 
            const buffer = Buffer.alloc(4024); //read 1024 Bytes or 1 1 Kilobyte || change size to work with bigger or lower package of data
            const startReadFileFromIndex = 0;
            let positionInFile = 0;

            let incommingBuffer = "";
            let valuesToWrite;
            let TitleEntriesArray;
            let isFileDone = false;
            
            //keep persistente memory of variable while function running
            const isParsed = { fisrtLineAlreadyParsed : false };
            const isLastValueSliced = { gotSliced: false, value : "" };
            const indexTitle = { value : 0 };
            const indexValue = { value : 0, firstIncommingpackage : false};

            let fileSize;

            await writeFile(pathTowritefile, "["); //Create file to write data

            while(!isFileDone)
            {

                let data = await filehandle.read(buffer, startReadFileFromIndex , buffer.length, positionInFile);

                incommingBuffer = buffer.toString("utf-8"); // hex => char using encoding utf8

                if(data.bytesRead < buffer.length)
                    incommingBuffer = incommingBuffer.slice(0, data.bytesRead); //ensure to keep only usefull data because original buffer get overwritten

                if(!isParsed.fisrtLineAlreadyParsed) //Json entries and CSV column name are in first package of data. Therefore we only use it ounce.
                {
                    TitleEntriesArray = await this.getCSVColumnTitleToArray(incommingBuffer, isParsed);
                    indexValue.value = await this.defineWhereToStartWritingValue(incommingBuffer, indexValue);
                }

                valuesToWrite = await this.getValuesIntoStringRawData(incommingBuffer, isLastValueSliced, indexValue);                
                valuesToWrite = await this.transformValueIntoArray(valuesToWrite);
                valuesToWrite = await this.writeIntoJsonFormat(indexTitle, TitleEntriesArray, valuesToWrite);
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

            console.info("File at", pathTowritefile, " properly converted to .json");

        }
        catch(error)
        {
            if(error.code === "ENOENT") 
                console.error("Error: File not found at path", error.path);
            else
            console.error("Error caught:", error);
        }
    }

}

export {handleConversionToJson};