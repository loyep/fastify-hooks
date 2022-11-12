import { inspect } from "util";
export class ERR_INVALID_ARG_TYPE extends Error {
  constructor(name: string, expected: string, actual: any) {
    const message = `[ERR_INVALID_ARG_TYPE]: The '${name}' argument must be of type ${expected}${getTypeMessage(
      actual
    )}`;
    super(message);
  }
}

// fork from https://github.com/nodejs/node/blob/master/lib/internal/errors.js
function getTypeMessage(actual: any) {
  let msg = "";
  if (actual == null) {
    msg += `. Received ${actual}`;
  } else if (typeof actual === "function" && actual.name) {
    msg += `. Received function ${actual.name}`;
  } else if (typeof actual === "object") {
    if (actual.constructor && actual.constructor.name) {
      msg += `. Received an instance of ${actual.constructor.name}`;
    } else {
      const inspected = inspect(actual, { depth: -1 });
      msg += `. Received ${inspected}`;
    }
  } else {
    let inspected = inspect(actual, { colors: false });
    if (inspected.length > 25) inspected = `${inspected.slice(0, 25)}...`;
    msg += `. Received type ${typeof actual} (${inspected})`;
  }
  return msg;
}

export function validateFunction(value: any, name: string) {
  if (typeof value !== "function") {
    throw new ERR_INVALID_ARG_TYPE(name, "Function", value);
  }
}
