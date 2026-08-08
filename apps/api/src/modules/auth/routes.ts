import type { FastifyInstance } from "fastify";

const demoUsers = [
  {
    id: "usr_organizer",
    name: "Organizador Demo",
    email: "organizador@elite.dev",
    role: "organizer",
  },
  {
    id: "usr_customer_1",
    name: "Cliente Demo",
    email: "cliente1@elite.dev",
    role: "customer",
  },
  {
    id: "usr_gate",
    name: "Portaria Demo",
    email: "portaria@elite.dev",
    role: "gate",
  },
];

export async function registerAuthRoutes(server: FastifyInstance) {
  server.post("/auth/login", async () => ({
    token: "demo-token",
    user: demoUsers[1],
  }));

  server.get("/auth/demo-users", async () => demoUsers);
}
