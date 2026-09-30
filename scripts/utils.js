// const { writeFile } = require("fs/promises");
// const { sep } = require("path");
import { writeFile } from "fs/promises";
import { readFileSync } from "fs";
import { sep } from "path";

export function updatePackageData(transformation, packageFilepath) {
  if (!packageFilepath) {
    // eslint-disable-next-line no-undef
    packageFilepath = `${process.cwd()}${sep}package.json`; // process is available in node.
  }
  // https://stackoverflow.com/questions/10011011/how-do-i-read-a-json-file-into-server-memory
  const file = JSON.parse(readFileSync(packageFilepath), 'utf8');
  const transformed = transformation(file);
  const data = JSON.stringify(transformed, null, 2);
  writeFile(packageFilepath, data);
}

