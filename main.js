import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { handleImportQuerry} from "./ImportData_SQL_Database/importJsonMethods.js";
import { handleExportTable } from "./ExportData_SQL_Database/exportFromDatabase.js";
import { handleConversionToJson } from "./TransformCsvToJsonFile/transformCSVtoJson.js";


const   __filename = fileURLToPath(import.meta.url);
const   __dirname = path.dirname( __filename);
let filePath = path.resolve(__dirname, "fileToImport","df2_export (1).json"); //write filename you wanna import 
let rawData = readFileSync(filePath, "utf-8");
let json = JSON.parse(rawData);

//STEP 1
const DoImport = new handleImportQuerry(
  "electdatabase",
  "station",
  ["id_station", "n_station", "ad_station", "xlongitude", "ylatitude", "nbre_pdc", "puiss_max", "type_prise", "accessibilite"],
  [],
  json,
);

//DoImport.executeSQLQuerry();

//STEP 2
// Precaution ! Track duplicates ex with json given 
// the command will give you duplicates
// select id_station, n_station, ad_station, xlongitude, ylatitude, COUNT(*) AS duplicate_count FROM station GROUP BY id_station, n_station, ad_station, xlongitude, ylatitude HAVING COUNT(*) > 1;

/* Clean up duplicates Directly in Database

WITH CTE AS (
  SELECT 
      id,
      ROW_NUMBER() OVER (
          PARTITION BY id_station, n_station, ad_station, xlongitude, ylatitude
          ORDER BY id
      ) AS row_num
  FROM station
)
DELETE FROM station
WHERE id IN (
  SELECT id
  FROM CTE
  WHERE row_num > 1
);

*/

//STEP 3

const DoExport = new handleExportTable( 
  "electdatabase",
  "station"
  //["id", "id_station", "nbre_pdc"] Can also be used as argument in handleExportTable()
);
//DoExport.addQuerryManually("SELECT id, id_station, nbre_pdc From station");
//DoExport.addColumn(["available", "True"]);
//DoExport.exportTableToCSV("bornesTest.csv");

//STEP 4
const DoConversionToJson = new handleConversionToJson("bornesTest.csv", "borne.json");
//DoConversionToJson.transformCSVtoJson();

//STEP 5

filePath = path.resolve(__dirname, "exportedFiles", "borne.json"); //write filename you wanna import 
rawData = readFileSync(filePath, "utf-8");
let json2 = JSON.parse(rawData);

const DoImportNextTable = new handleImportQuerry(
  "electdatabase",
  "bornes",
  ["id", "id_station", "available"],
  ["station_id", "id_station", "available"], 
  json2
);

//DoImportNextTable.executeSQLQuerry();