type ArgValueParams = {
  name: string;
  alias?: string;
  type?: "string" | "bool" | "number";
};

function checkValue<T>(
  args: string[],
  string: string,
  isBool: boolean
): string | null {
  const nameIndex = args.indexOf(string);
  if (nameIndex >= 0) {
    const nextArg = args[nameIndex + 1];

    if (nextArg !== undefined) {
      const nextIsCommand = !!nextArg.match(/^\-/);
      if (nextIsCommand) {
        return isBool ? "true" : null;
      }
      return nextArg;
    } else {
      // no secondary set value
      return isBool ? "true" : null;
    }
  }
  return null;
}

export function getArg<T>(
  args: string[],
  options: ArgValueParams
): string | boolean | number | null {
  let stringValue: null | string = null;
  const isBool = options.type === "bool";

  if (options.alias) {
    const aliasString = `-${options.alias}`;
    stringValue = checkValue(args, aliasString, isBool);
  }
  if (!stringValue) {
    const nameString = `--${options.name}`;
    stringValue = checkValue(args, nameString, isBool);
  }

  if (stringValue === null) {
    return null;
  }

  if (!options.type) {
    options.type = "string";
  }

  // coerce type
  switch (options.type) {
    case "bool":
      return (stringValue || "").toLowerCase() !== "false";
    case "number":
      return Number(stringValue);
    case "string":
    default:
      return stringValue;
  }
}
