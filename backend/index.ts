import { httpServer, port } from "./server";

httpServer.listen(port, () => {
    console.log(`TypeScript with Express
          http://localhost:${port}/`);
});
