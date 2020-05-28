import ncp from 'ncp';
import path from 'path';
import { promisify } from 'util';
import * as os from 'os';

const copy = promisify(ncp);
 
const copyFiles = async (filePath) => {

  try {

    let filePath = new URL(import.meta.url).pathname;

    if (os.platform() === 'win32') {
      // removes the leading drive letter from the path
      filePath = filePath.substr(3);
    }

    const templateDirectory = path.resolve(
      filePath, '..', 'templates',
    );

    const targetDirectory = process.cwd();

    await copy(templateDirectory, targetDirectory, {
      clobber: false,
    });
  }
  catch(e) {
    console.log('Error on creating the files:');
    console.log(JSON.stringify(e, null, 1));
  }
}

export default copyFiles;