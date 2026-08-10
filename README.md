# Plataforma de Eventos e Ingressos

Projeto para o Desafio Elite Dev 2026. O objetivo e criar uma plataforma onde organizadores publicam eventos, clientes compram ingressos e a portaria valida a entrada com QR Code.

## Stack

- Front-end: React, Vite e TypeScript
- Back-end: Node.js, Fastify e TypeScript
- Banco de dados: PostgreSQL
- ORM: Prisma
- Organizacao: monorepo com `apps/web`, `apps/api` e `packages/shared`

## Como Rodar

```bash
npm install
copy .env.example .env
docker compose up -d postgres
npm run db:push -w @elite/api
npm run db:seed -w @elite/api
npm run dev
```

Tambem e possivel rodar separadamente:

```bash
npm run dev:web
npm run dev:api
```

## Estrutura

```txt
apps/
  web/      Aplicacao React com Vite
  api/      API Node/Fastify
packages/
  shared/   Tipos e contratos compartilhados
docs/       Decisoes, fluxo de demonstracao e notas de produto
```

## Usuarios De Teste

Estes usuarios sao criados pelo seed:

| Papel | Email | Senha |
| --- | --- | --- |
| Organizador | organizador@elite.dev | 123456 |
| Cliente | cliente@elite.dev | 123456 |
| Portaria | portaria@elite.dev | 123456 |

## Fluxo De Demonstracao

O roteiro principal esta em `docs/demo-flow.md`.

## Decisoes Tecnicas

As decisoes do projeto serao registradas em `docs/decisions.md`.

## Uso De IA

Este projeto usa IA como apoio para organizacao, planejamento, geracao de esqueleto inicial e revisao de decisoes. As decisoes finais de produto, arquitetura e escopo devem ser registradas ao longo do desenvolvimento.

## Limitacoes Conhecidas

- O front ainda consome mocks em algumas telas e precisa ser conectado aos endpoints reais.
- A integracao real com Ticketmaster ainda sera implementada.
- O setup inicial usa `db:push`; migracoes versionadas podem ser adicionadas antes da entrega final.
