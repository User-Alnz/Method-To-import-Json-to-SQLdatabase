import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import {handleImportQuerry} from "./ImportData_SQL_Database/importJsonMethods.js";


const   __filename = fileURLToPath(import.meta.url);
const   __dirname = path.dirname( __filename);
const filePath = path.resolve(__dirname, "filesToImport","df2_export (1).json"); //write filename you wanna import 
console.log(__filename);
console.log(__dirname);
console.log(filePath);


const rawData = readFileSync(filePath, "utf-8");
const json = JSON.parse(rawData);

const DoImport = new handleImportQuerry(
    "electdatabase",
    "station",
    ["id_station", "n_station", "ad_station", "xlongitude", "ylatitude", "nbre_pdc", "accessibilite", "puiss_max", "type_prise"],
    json,
  );
  
console.info(DoImport.executeSQLQuerry());