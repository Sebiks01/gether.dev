import { glob } from "fast-glob";
import { resolve, join } from "path";

import { error, debug } from "./logger";

// Deleting cached files function
async function deleteCachedFile(filePath: string) {
  // Resolving for absolute file path
  const file = resolve(filePath);

  // Checking if the file is cached
  if (require.cache[file]) {
    debug(`Deleting cached version of file "${filePath}".`);

    // Deleting cached versions of a file
    delete require.cache[file];
  }
}

// Loading files function
export async function loadFiles(dirName: string) {
  try {
    debug(`Loading files from directory "${dirName}".`);

    // Finding all js and ts files within specified directory
    const filePaths = await glob(join(__dirname, "..", dirName, "**/*{.ts,.js}").replace(/\\/g, "/"));

    debug(`Found ${filePaths.length} file(s) in directory "${dirName}".`);

    // Async deleting all cached versions of the files
    await Promise.all(filePaths.map(deleteCachedFile));

    // Returning the files
    return filePaths;
  } catch (err) {
    // Logging error if occured
    error(`Error loading files from directory "${dirName}".`);

    console.log(err);

    return [];
  }
}

export async function importFile(filePath: string) {
  debug(`Importing file "${filePath}".`);
  return (await import(`../${filePath.includes("src") ? filePath.split("src/").pop() : filePath.split("dist/").pop()}`))
    ?.default;
}
