# Plataforma de Eventos e Ingressos

Projeto para o Desafio Elite Dev 2026. O objetivo e criar uma plataforma onde organizadores publicam eventos, clientes compram ingressos e a portaria valida a entrada com QR Code.

## Stack

- Front-end: React, Vite e TypeScript
- Back-end: Node.js, Fastify e TypeScript
- Banco de dados planejado: PostgreSQL
- ORM planejado: Prisma
- Organizacao: monorepo com `apps/web`, `apps/api` e `packages/shared`

## Como Rodar

```bash
npm install
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

Estes usuarios serao semeados quando o banco for implementado:

| Papel | Email | Senha |
| --- | --- | --- |
| Organizador | organizador@elite.dev | 123456 |
| Cliente 1 | cliente1@elite.dev | 123456 |
| Cliente 2 | cliente2@elite.dev | 123456 |
| Portaria | portaria@elite.dev | 123456 |

## Fluxo De Demonstracao

O roteiro principal esta em `docs/demo-flow.md`.

## Decisoes Tecnicas

As decisoes do projeto serao registradas em `docs/decisions.md`.

## Uso De IA

Este projeto usa IA como apoio para organizacao, planejamento, geracao de esqueleto inicial e revisao de decisoes. As decisoes finais de produto, arquitetura e escopo devem ser registradas ao longo do desenvolvimento.

## Limitacoes Conhecidas

- A base inicial contem telas placeholder e mocks para prototipacao.
- A integracao real com Ticketmaster ainda sera implementada.
- O banco e as migracoes Prisma ainda precisam ser conectados ao fluxo real.
