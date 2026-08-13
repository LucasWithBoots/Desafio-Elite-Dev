# Plataforma de Eventos e Ingressos

<p align="center">
 <img width="1920" height="1080" alt="Mock-up tela" src="https://github.com/user-attachments/assets/0859c2d9-1fd5-4fdc-b4ed-6ff15a475c7c" />
</p>

Projeto para o Desafio Elite Dev 2026. O objetivo é criar uma plataforma onde organizadores publicam eventos, clientes compram ingressos e a portaria valida a entrada com QR Code.

## Stack

- Front-end: React, Vite e TypeScript
- Back-end: Node.js, Fastify e TypeScript
- Banco de dados: PostgreSQL
- ORM: Prisma
- Organização: monorepo com `apps/web`, `apps/api` e `packages/shared`

## Como Rodar

```bash
npm install
docker compose up -d postgres
npm run db:push -w @elite/api
npm run db:seed -w @elite/api
npm run dev
```

Para usar a busca real da Ticketmaster, preencha no `.env`:

```env
TICKETMASTER_API_KEY="sua_consumer_key"
VITE_API_URL="http://localhost:3333"
```

Também é possível rodar separadamente:

```bash
npm run dev:web
npm run dev:api
```

## Estrutura

```txt
apps/
  web/      Aplicação React com Vite
  api/      API Node/Fastify
packages/
  shared/   Tipos e contratos compartilhados
docs/       Decisões, fluxo de demonstração e notas de produto
```

## Processo De Produto E UX

Antes da implementação, os requisitos do desafio foram organizados em um painel para transformar o enunciado em um fluxo de produto coerente. Foram definidos os atores do sistema, Jobs to Be Done, jornada principal, user flows e os estados mais importantes de cada etapa.

Os protótipos foram produzidos em baixa fidelidade no Excalidraw. O objetivo dessa etapa foi validar hierarquia, navegação e continuidade do fluxo antes de investir no acabamento visual. A identidade, a responsividade e as microinterações foram refinadas durante a implementação.

- [Processo de UX](docs/ux-process.md)
- [Notas de produto](docs/product-notes.md)
- [Decisões de produto e tecnologia](docs/decisions.md)
- [Roteiro de demonstração](docs/demo-flow.md)

## Usuários De Teste

Estes usuários são criados pelo seed:

| Papel       | Email                                                 | Senha  |
| ----------- | ----------------------------------------------------- | ------ |
| Organizador | [organizador@elite.dev](mailto:organizador@elite.dev) | 123456 |
| Cliente     | [cliente@elite.dev](mailto:cliente@elite.dev)         | 123456 |
| Cliente 2   | [cliente2@elite.dev](mailto:cliente2@elite.dev)       | 123456 |
| Portaria    | [portaria@elite.dev](mailto:portaria@elite.dev)       | 123456 |

## Fluxo De Demonstração

O roteiro principal está em [`docs/demo-flow.md`](docs/demo-flow.md).

## Decisões Técnicas

As principais decisões e trade-offs estão registrados em [`docs/decisions.md`](docs/decisions.md).

## Uso De IA

Este projeto usou de IA como ferramenta de apoio para explorar possibilidades de arquitetura, revisar modelos e regras de negócio, acelerar implementações iniciais, investigar erros e sugerir cenários de teste.

As definições de atores, Jobs to Be Done, jornada, fluxos, protótipos, identidade visual e priorização foram conduzidas e revisadas por mim. O código produzido com apoio de IA foi adaptado ao contexto do projeto, testado e alterado de acordo com os problemas encontrados durante o desenvolvimento.

## Limitações Conhecidas

- A leitura de QR usa a câmera pelo ZXing e mantém envio de imagem, colagem e digitação manual como alternativas. A câmera exige HTTPS ou `localhost`, [conforme as regras dos navegadores](https://www.npmjs.com/package/@zxing/library).
- O setup inicial usa `db:push`.

## Segurança Do Ingresso

- O QR Code carrega os dados do ingresso e uma assinatura HMAC gerada apenas pelo back-end.
- A portaria rejeita qualquer payload cuja assinatura tenha sido alterada.
- O consumo usa uma atualização condicional atômica, garantindo que apenas a primeira leitura de um ingresso ativo seja aprovada.
