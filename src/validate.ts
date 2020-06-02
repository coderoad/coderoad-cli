async function validate(args: string[]) {
  // dir - default .
  const dir = !args.length || args[0].match(/^-/) ? "." : args[0];
  console.warn("Not yet implemented. Coming soon");
  return;

  // setup .tmp directory
  // git clone branch

  // VALIDATE SKELETON WITH COMMITS
  // parse tutorial skeleton for order and commands

  // on error, warn missing level/step

  // VALIDATE COMMIT ORDER
  // list all commits in order
  // validate that a level number doesn't come before another level
  // validate that a step falls within a level
  // validate that steps are in order

  // on error, show level/step out of order

  // VALIDATE TUTORIAL TESTS
  // load INIT commit(s)
  // run test runner setup command(s)
  // loop over commits:
  // - load level commit
  // - run level setup command(s)
  // - load step setup commit(s)
  // - run step setup command(s)
  // - if next solution:
  //    - run test - expect fail
  // - if solution
  //    - run test - expect pass

  // log level/step
  // on error, show level/step & error message

  // CLEANUP
  // finally: remove .tmp directory
}

export default validate;
