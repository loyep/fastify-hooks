import { useContext } from "./context";
import { fastifyHooksPlugin } from "./plugin";
import type { FastifyHooksOptions, Hook } from "./plugin";
export { useContext, fastifyHooksPlugin };
export type { FastifyHooksOptions, Hook };
import "reflect-metadata";
import { validateFunction } from "./api/validator";
import { HttpMetadata } from "./api/types";
import { USE_INPUT_METADATA } from "./const";
export { Get, Post, Params, Patch, Put } from "./api/http";

export type MetadataHelper = {
  setMetadata: <T = any>(key: any, value: T) => void;
  getMetadata: <T = any>(key: any) => T;
};

export type ExecuteHelper = {
  result?: any;
  getInputArguments?: () => any[];
};

export type Operator<Input> = {
  name: string;
  type?: Input;
  input?: boolean;
  metadata?: (helper: MetadataHelper) => void;
  execute?: (helper: ExecuteHelper, next: () => Promise<any>) => Promise<void>;
};

export type AsyncFunction = (...args: any[]) => Promise<any>;

export function Api<
  Operators extends Operator<any>[],
  Handler extends AsyncFunction
>(...args: [...operators: Operators, handler: Handler]) {
  const handler = args.pop() as Function;
  const operators = args as Operator<any>[];
  // const ctx = useContext();
  // console.log(ctx);
  console.log("operators", operators);
  const metadataHelper: MetadataHelper = {
    getMetadata(key: any) {
      return Reflect.getMetadata(key, runner);
    },
    setMetadata(key: any, value: any) {
      return Reflect.defineMetadata(key, value, runner);
    },
  };

  for (const operator of operators) {
    if (operator.metadata) {
      validateFunction(operator.metadata, "operator.metadata");
      operator.metadata(metadataHelper);
    }
  }

  const useInputMetadata = operators.some((operator) => operator.input);
  const executors = operators
    .filter((operator) => typeof operator.execute === "function")
    .map((operator) => operator.execute);

  async function runner(...args: any[]) {
    const stack = [...executors];

    const executeHelper: ExecuteHelper = {
      result: undefined,
      getInputArguments: () => args,
    };

    stack.push(async (helper: ExecuteHelper, next: any) => {
      helper.result = await handler(...args);
      return next();
    });

    // handle HttpCode/Redirect/etc.
    const responseMetadata = Reflect.getMetadata(HttpMetadata.RESPONSE, runner);
    // if (Array.isArray(responseMetadata)) {
    //   await framework.handleResponseMetaData(responseMetadata);
    // }
    return executeHelper.result;
  }

  Reflect.defineMetadata(USE_INPUT_METADATA, useInputMetadata, runner);
  return runner as any;
}
