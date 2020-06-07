import schema from "../schema/skeleton";

// https://www.npmjs.com/package/ajv
// @ts-ignore ajv typings not working
import JsonSchema from "ajv";

export function validateSkeleton(json: any): Boolean | PromiseLike<Boolean> {
  // validate using https://json-schema.org/
  const jsonSchema = new JsonSchema({
    allErrors: true,
    // verbose: true,
  });

  const valid = jsonSchema.validate(schema, json);

  if (!valid) {
    // log errors
    /* istanbul ignore next */
    if (process.env.NODE_ENV !== "test") {
      jsonSchema.errors?.forEach((error: JsonSchema.ErrorObject) => {
        console.warn(
          `Validation error at ${error.dataPath} - ${error.message}`
        );
      });
    }
  }

  return valid;
}
