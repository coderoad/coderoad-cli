type ArgValueParams = {
  name: string
  alias?: string
}

function checkValue<T> (args: string[], string: string): string | null {
  const nameIndex = args.indexOf(string)
  if (nameIndex >= 0) {
    const nextArg = args[nameIndex + 1]

    if (nextArg !== undefined) {
      const nextIsCommand = !!nextArg.match(/^\-/)
      if (nextIsCommand) {
        return null
      }
      return nextArg
    } else {
      // no secondary set value
      return null
    }
  }
  return null
}

export function getArg<T> (
  args: string[],
  options: ArgValueParams
): string | null {
  let stringValue: null | string = null

  if (options.alias) {
    const aliasString = `-${options.alias}`
    stringValue = checkValue(args, aliasString)
  }
  if (!stringValue) {
    const nameString = `--${options.name}`
    stringValue = checkValue(args, nameString)
  }

  return stringValue
}
