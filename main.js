import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { handleImportQuerry} from "./ImportData_SQL_Database/importJsonMethods.js";
import { handleExportTable } from "./ExportData_SQL_Database/exportFromDatabase.js";
import { handleConversionToJson } from "./TransformCsvToJsonFile/transformCSVtoJson.js";


const   __filename = fileURLToPath(import.meta.url);
const   __dirname = path.dirname( __filename);
const filePath = path.resolve(__dirname, "fileToImport","df2_export (1).json"); //write filename you wanna import 
const rawData = readFileSync(filePath, "utf-8");
const json = JSON.parse(rawData);

const DoImport = new handleImportQuerry(
    "electdatabase",
    "station",
    ["id_station", "n_station", "ad_station", "xlongitude", "ylatitude", "nbre_pdc", "accessibilite", "puiss_max", "type_prise"],
    json,
  );

  const DoExport = new handleExportTable( 
    "electdatabase",
    "station"
    //["id", "id_station", "nbre_pdc"] Can also be used as argument in handleExportTable()
);

const DoConversionToJson = new handleConversionToJson("borne.csv", "borne.json");

//DoImport.executeSQLQuerry();

//DoExport.addQuerryManually("SELECT id,id_station, nbre_pdc From station");
//DoExport.addColumn(["available", "True"]);
//DoExport.exportTableToCSV("borne.csv");

DoConversionToJson.transformCSVtoJson();