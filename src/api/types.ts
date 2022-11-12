import type { Merge } from "type-fest";

export type FunctionId = string;

export const HttpTriggerType = "HTTP";

export enum HttpMetadata {
  METHOD = "Http_Method",
  QUERY = "Http_Query",
  PARAMS = "Http_Params",
  HEADERS = "Http_Headers",
  RESPONSE = "Http_Response",
}

export enum ResponseMetaType {
  CODE = "Http_Response_Code",
  HEADER = "Http_Response_Header",
  CONTENT_TYPE = "Http_Response_ContentType",
  REDIRECT = "Http_Response_Redirect",
}

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
  ALL = "ALL",
}

export interface HttpTrigger extends BaseTrigger {
  type: typeof HttpTriggerType;
  method: HttpMethod;
  path?: string;
}

export type HttpInputMetadata = {
  query?: Record<string, string>;
  headers?: Record<string, string>;
  params?: Record<string, string>;
};

function createHttpMethodOperator(method: HttpMethod) {
  return (path?: string) => {
    return {
      name: method,
      metadata({ setMetadata }) {
        setMetadata<HttpTrigger>(OperatorType.Trigger, {
          type: HttpTriggerType,
          method,
          path,
          requestClient: {
            fetcher: "http",
            client: "@midwayjs/rpc",
          },
        });
      },
    } as Operator<void>;
  };
}

// HTTP Helper
export function Query<T extends Record<string, string>>(): Operator<{
  query: T;
}> {
  return {
    name: HttpMetadata.QUERY,
    input: true,
    metadata({ setMetadata }) {
      setMetadata(HttpMetadata.QUERY, true);
    },
  };
}

export function Params<T extends Record<string, string>>(): Operator<{
  params: T;
}> {
  return {
    name: HttpMetadata.PARAMS,
    input: true,
    metadata({ setMetadata }) {
      setMetadata(HttpMetadata.PARAMS, true);
    },
  };
}

export function Headers<T extends Record<string, string>>(): Operator<{
  headers: T;
}> {
  return {
    name: HttpMetadata.HEADERS,
    input: true,
    metadata({ setMetadata }) {
      setMetadata(HttpMetadata.HEADERS, true);
    },
  };
}

export type ResponseMetaData = {
  type: ResponseMetaType;
  code?: number;
  header?: {
    key: string;
    value: string;
  };
  url?: string;
  contentType?: string;
};

export function HttpCode(code: number): Operator<void> {
  return {
    name: "HttpCode",
    metadata(helper) {
      setResponseMetaData(helper, ResponseMetaType.CODE, { code });
    },
  };
}

export function SetHeader(key: string, value: string): Operator<void> {
  return {
    name: "SetHeader",
    metadata(helper) {
      setResponseMetaData(helper, ResponseMetaType.HEADER, {
        header: {
          key,
          value,
        },
      });
    },
  };
}

export function Redirect(url: string, code?: number): Operator<void> {
  return {
    name: "Redirect",
    metadata(helper) {
      setResponseMetaData(helper, ResponseMetaType.REDIRECT, {
        url,
        code,
      });
    },
  };
}

export function ContentType(contentType: string): Operator<void> {
  return {
    name: "ContentType",
    metadata(helper) {
      setResponseMetaData(helper, ResponseMetaType.CONTENT_TYPE, {
        contentType,
      });
    },
  };
}

function setResponseMetaData(
  helper: MetadataHelper,
  type: ResponseMetaType,
  value: Partial<ResponseMetaData>
) {
  const responseMetaData =
    helper.getMetadata<ResponseMetaData[]>(HttpMetadata.RESPONSE) || [];

  helper.setMetadata(HttpMetadata.RESPONSE, [
    ...responseMetaData,
    {
      type,
      ...value,
    },
  ]);
}

export type AsyncFunction = (...args: any[]) => Promise<any>;

export interface ApiFunction extends AsyncFunction {}

export type ApiConfig = {
  middleware?: HooksMiddleware[] | any[];
};

export type ApiModule = {
  config?: ApiConfig;
  [index: string]: ApiFunction | any;
};

export type HooksMiddleware = (next: () => any | Promise<any>) => any;

export type RawRequestOptions = {
  trigger: BaseTrigger;
  args?: any;
  metadata?: any;
};

export type FileRecord = Record<string, File | FileList>;

export type HttpRequestOptions = {
  url: string;
  method: HttpMethod;
  data?: { args: any[] } | FormData;

  // query & headers
  query?: Record<string, string>;
  headers?: Record<string, string>;
  files?: FileRecord;
};

export type RequestRoute<T = any> = {
  trigger: BaseTrigger & T;
  functionId: FunctionId;
  useInputMetadata: boolean;
};

export type RequestArgs<
  Trigger,
  InputMetaData = void
> = InputMetaData extends void
  ? [...args: any[], route: RequestRoute<Trigger>]
  : [
      ...args: any[],
      inputMetadata: InputMetaData,
      route: RequestRoute<Trigger>
    ];

export type ArrayToObject<T, R = {}> = T extends [infer First, ...infer Rest]
  ? First extends PromiseLike<infer PromiseValue>
    ? PromiseValue
    : First extends object
    ? Merge<First, ArrayToObject<Rest, R>>
    : ArrayToObject<Rest, R>
  : R;

export type ApiRunner<
  Input extends object | void | unknown,
  Handler extends AsyncFunction
> = (
  ...args: Input extends void
    ? Parameters<Handler>
    : [...args: Parameters<Handler>, input: Input]
) => ReturnType<Handler>;

export enum OperatorType {
  Trigger = "Trigger",
  Middleware = "Middleware",
}

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

export type ExtractInputType<T> = {
  [key in keyof T]: T[key] extends Operator<any> ? T[key]["type"] : void;
};

export type BaseTrigger = {
  type: string;
  requestClient?: {
    fetcher: string;
    client: string;
  };
  [key: string]: any;
};
