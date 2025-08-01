import { NextFunction, Request, Response } from "express";

type ParamType = "number" | "boolean" | "object";

/**
 * Express automatically treats all values in req.query as strings.
 * This middleware parses and casts specified query parameters into their appropriate data types.
 *
 * For example:
 * - Converts "page" and "limit" from strings to numbers.
 * - Parses "fetchOptions" (a comma-separated string) into a structured JSON object.
 *
 * This function returns an Express middleware that ensures type-safe query parameters,
 * improving reliability and consistency in route handlers.
 *
 * @param paramsToCast - An object mapping query parameter names to the desired data type ("number", "boolean", or "object").
 */

const autoCastQueryParams = (paramsToCast: Record<string, ParamType>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const key in paramsToCast) {
      const value = req.query[key];

      if (value !== undefined && typeof value === "string") {
        switch (paramsToCast[key]) {
          case "number": {
            const num = Number(value);
            if (isNaN(num)) {
              res.status(400).json({
                message: `Invalid query param: '${key}' must be a valid number.`,
              });
              return;
            }
            (req.query as any)[key] = num;
            console.log(
              (req.query as any)[key],
              "---------------------------------"
            ); // Add this line for debug information
            console.log(typeof (req.query as any)[key], "------"); // Add this line for debug information
            break;
          }

          case "boolean": {
            if (value !== "true" && value !== "false") {
              res.status(400).json({
                message: `Invalid query param: '${key}' must be 'true' or 'false'.`,
              });
              return;
            }
            (req.query as any)[key] = value === "true";
            console.log((req.query as any)[key]); // Add this line for debug informatio
            break;
          }

          case "object": {
            const fields = value
              .split(",")
              .map((field) => field.trim())
              .filter((field) => !!field);

            if (fields.length === 0) {
              res.status(400).json({
                message: `Invalid query param: '${key}' must contain at least one valid field.`,
              });
              return;
            }

            const projectedFields: Record<string, number> = Object.fromEntries(
              fields.map((field) => [field, 1])
            );

            (req.query as any)[key] = projectedFields;
            break;
          }
        }
      }
    }

    next();
  };
};

export default autoCastQueryParams;
