import type { FastifyPluginCallback } from "fastify";
import { run } from "./context";
import fp from "fastify-plugin";

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
  const hook = opts?.hook || "onRequest";

  fastify.addHook("onRequest", (req: any, res, done) => {
    run({ req, res }, done);
  });

  next();
};

export const fastifyHooksPlugin = fp<FastifyHooksOptions>(plugin, {
  fastify: "4.x",
  name: "@fastify/request-context",
});
