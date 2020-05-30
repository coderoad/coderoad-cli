import * as ncp from "ncp";
import * as path from "path";
import { promisify } from "util";

const copy = promisify(ncp);

const copyFiles = async (filePath: string): Promise<void> => {
  try {
    const pathToSrc = path.join(__dirname, "..", "src");
    const templateDirectory = path.resolve(pathToSrc, "templates");
    const targetDirectory = process.cwd();

    await copy(templateDirectory, targetDirectory, {
      clobber: false,
    });
  } catch (e) {
    console.log("Error on creating the files:");
    console.log(JSON.stringify(e, null, 1));
  }
};

const create = copyFiles;

export default create;
