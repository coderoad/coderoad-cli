import * as T from "../../typings/tutorial";
import schema from "./schema";

// https://www.npmjs.com/package/ajv
// @ts-ignore ajv typings not working
import JsonSchema from "ajv";

export function validateSchema(json: T.Tutorial) {
  // validate using https://json-schema.org/
  const jsonSchema = new JsonSchema({ allErrors: true, verbose: true });
  // support draft-07 of json schema
  jsonSchema.addMetaSchema(require("ajv/lib/refs/json-schema-draft-07.json"));

  const valid = jsonSchema.compile(schema, json);

  if (!valid) {
    // log errors
    console.log(jsonSchema.errorsText());
    throw new Error("Invalid schema. See log for details");
  }

  return true;
}
