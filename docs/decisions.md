# Decisoes Do Projeto

Este arquivo registra as principais decisoes de produto e tecnologia. A ideia e deixar visivel como o projeto foi pensado, nao apenas o que foi entregue.

## Recorte Do MVP

O MVP prioriza eventos com mapa de assentos, pagamento simulado, ingresso com QR Code assinado e validacao pela portaria.

## API Externa

O organizador podera criar eventos a partir da Ticketmaster Discovery API ou cadastrar um evento manualmente.

Motivo:

- A API acelera o cadastro quando o evento existe no catalogo.
- O cadastro manual evita bloquear o organizador quando a API falha ou nao encontra o evento.

## Mobile First Com Contexto

Cliente e portaria serao tratados como experiencias mobile first, porque compra, exibicao do QR e leitura pela camera tendem a acontecer no celular ou tablet.

A area do organizador sera responsiva, mas otimizada para desktop, porque envolve tarefas administrativas mais densas.

## Assento Nao Pode Ser Vendido Duas Vezes

A interface mostrara disponibilidade, mas a decisao final precisa acontecer no back-end, com validacao no servidor e restricao no banco.

## QR Code Nao Pode Ser Forjado

O QR nao contem apenas um ID previsivel. Ele carrega claims codificadas e uma assinatura HMAC criada com um segredo exclusivo do back-end. A portaria verifica a assinatura antes de localizar o ingresso e consome o status `ACTIVE` com uma atualizacao condicional atomica, evitando duas validacoes simultaneas.

## Fora Do Escopo Inicial

- Nota fiscal
- Revenda de ingressos
- Aplicativo nativo
- Recuperacao de senha
- Envio real de e-mail
- Pagamento real
