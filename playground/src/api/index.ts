import { Api, Get, useContext } from "fastify-hooks";

export default Api(Get("/"), async () => {
  const ctx = useContext();
  console.log(ctx.req);
  return "hello world";
});
