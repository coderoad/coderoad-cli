type ArgValueParams = { name: string; alias?: string; param?: boolean };

const checkValue = (
  args: string[],
  string: string,
  options: ArgValueParams
) => {
  const nameIndex = args.indexOf(string);
  if (nameIndex > -1) {
    if (options.param) {
      const value = args[nameIndex + 1];
      if (!value) {
        throw new Error(`Argument ${string} is missing a parameter value`);
      }
      return value;
    }
  }
  return null;
};

export function getArg(args: string[], options: ArgValueParams): string | null {
  let value: null | string = null;

  const aliasString = `-${options.alias}`;
  value = checkValue(args, aliasString, options);
  if (!value) {
    const nameString = `--${options.name}`;
    value = checkValue(args, nameString, options);
  }

  return value;
}
