import { argv, exit } from "process";
import { updatePackageData } from "./utils.js";

const name = argv[2];
if (!name) {
  console.error("Missing name of new story!");
  exit(1);
}

await updatePackageData((data) => {
  data.name = name;
  return data;
});
