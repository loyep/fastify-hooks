import fastify from "fastify";

import { fastifyHooksPlugin, useContext } from "fastify-hooks";

(async () => {
  const app = fastify({ logger: true });
  app.register(fastifyHooksPlugin);

  app.get("/", (req, res) => {
    const ctx = useContext();
    return res.send("hello world");
  });
  await app.listen({ port: 3000 });
})();
