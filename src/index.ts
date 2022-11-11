import type { FastifyPluginCallback } from "fastify";
import { run, useContext } from "./context";
import fp from "fastify-plugin";

export { useContext };

export type Hook =
  | "onRequest"
  | "preParsing"
  | "preValidation"
  | "preHandler"
  | "preSerialization"
  | "onSend"
  | "onResponse"
  | "onTimeout"
  | "onError"
  | "onRoute"
  | "onRegister"
  | "onReady"
  | "onClose";

export interface FastifyHooksOptions {
  hook?: Hook;
}

const plugin: FastifyPluginCallback<FastifyHooksOptions> = async (
  fastify,
  opts,
  next
) => {
  // fastify.decorate("hooksContext", hooksContext);
  // fastify.decorateRequest("hooksContext", { getter: () => hooksContext });
  // fastify.decorateRequest(asyncResourceSymbol, null);

  const hook = opts?.hook || "onRequest";

  fastify.addHook("onRequest", (req: any, res, done) => {
    run({ req, res }, done);
  });

  // if (hook === "onRequest" || hook === "preParsing") {
  //   fastify.addHook("preValidation", (req: any, res, done) => {
  //     // const asyncResource = req[asyncResourceSymbol];
  //     // asyncResource.runInAsyncScope(done, req.raw);
  //   });
  // }
  next();
};

export const fastifyHooksPlugin = fp<FastifyHooksOptions>(plugin, {
  fastify: "4.x",
  name: "@fastify/request-context",
});
