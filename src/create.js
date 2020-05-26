import ncp from 'ncp';
import path from 'path';
import { promisify } from 'util';

const copy = promisify(ncp);
 
const copyFiles = async (filePath) => {

  try {

    const templateDirectory = path.resolve(
      new URL(import.meta.url).pathname,
      path.join('..', 'templates'),
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