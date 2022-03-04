import sqlite from "sqlite3";
import fs from "fs/promises";
import lodash from "lodash";
import { ClassData } from "./types";

const db = new sqlite.Database("./classes.db");

const data: ClassData[] = [];

console.log("Running query");
db.each("SELECT ClassRef, Stride FROM Classes;", onEachRow, onComplete);

function onEachRow(err: unknown, row: any) {
  console.log(row);
  data.push({
    classRef: row.ClassRef,
    stride: row.Stride,
  });
}

async function onComplete() {
  console.log(`Done pulling ${data.length} rows`);
  const cleaned = lodash(data)
    .groupBy((v) => v.classRef)
    .values()
    .flatMap((group) => lodash.uniqBy(group, (v) => v.stride))
    .value();

  await fs.writeFile("./src/data.json", JSON.stringify(cleaned));
}
