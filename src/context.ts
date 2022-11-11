import type { FastifyRequest, FastifyReply } from "fastify";
import { createStorage } from "./storage";

export type Context = { req: FastifyRequest; res: FastifyReply };

const { run, useContext } = createStorage<Context>();

export { run, useContext };
