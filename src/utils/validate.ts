import schema from "./schema";

// https://www.npmjs.com/package/ajv
// @ts-ignore ajv typings not working
import JsonSchema from "ajv";

export function validateSchema(json: any): boolean | PromiseLike<boolean> {
  // validate using https://json-schema.org/
  const jsonSchema = new JsonSchema({
    allErrors: true,
    // verbose: true,
  });

  const valid = jsonSchema.validate(schema, json);

  if (!valid) {
    // log errors
    if (process.env.NODE_ENV !== "test") {
      console.error("Validation failed. See below for details");
      jsonSchema.errors?.forEach((error: JsonSchema.ErrorObject) => {
        console.warn(
          `Validation error at ${error.dataPath} - ${error.message}`
        );
      });
    }
  }

  return valid;
}
