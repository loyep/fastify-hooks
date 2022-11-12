import fastify from "fastify";
import { fastifyHooksPlugin, useContext } from "fastify-hooks";
import * as api from "./api/index";

(async () => {
  const app = fastify({ logger: true });
  app.register(fastifyHooksPlugin);

  // app.get("/", (req, res) => {
  //   const ctx = useContext();
  //   console.log(ctx.req);
  //   return res.send("hello world");
  // });
  console.log(api);
  await app.listen({ port: 3000 });
})();
