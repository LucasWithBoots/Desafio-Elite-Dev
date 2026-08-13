# Decisões Do Projeto

Este arquivo registra as principais decisões de produto e tecnologia. A ideia é deixar visível como o projeto foi pensado, não apenas o que foi entregue.

<img width="1280" height="832" alt="Mock Up" src="https://github.com/user-attachments/assets/828af10e-4768-4c38-b21f-51b9c590c37c" />

## Recorte Do MVP

O MVP prioriza eventos com mapa de assentos, pagamento simulado, ingresso com QR Code assinado e validação pela portaria.

## Processo De UX Enxuto

O problema foi organizado no FigJam a partir de atores, Jobs to Be Done, jornada principal e user flows. Os protótipos foram criados em baixa fidelidade no Excalidraw.

Não houve pesquisa formal com usuários.

## Experiências Separadas Por Papel

Cliente, organizador e portaria possuem objetivos, permissões e contextos de uso diferentes. Cada papel recebe uma navegação própria e somente as funções necessárias para cumprir sua tarefa.

## API Externa

O organizador pode criar eventos a partir da Ticketmaster Discovery API ou cadastrar um evento manualmente.

Motivo:

- A API acelera o cadastro quando o evento existe no catálogo.
- O cadastro manual evita bloquear o organizador quando a API falha ou não encontra o evento.

A importação não publica nem finaliza o cadastro. Os dados externos preenchem o formulário de criação, no qual o organizador pode revisar, completar e editar as informações antes de salvar.

<img width="383" height="764" alt="gif1" src="https://github.com/user-attachments/assets/3528999c-523f-4236-b90d-f82ebe154a0e" />

## Mobile First Com Contexto

Cliente e portaria foram tratados como experiências mobile first, porque compra, exibição do QR e leitura pela câmera tendem a acontecer no celular ou tablet.

<img width="383" height="764" alt="gif2" src="https://github.com/user-attachments/assets/cc76ddc9-34f4-421e-8d75-737da070e4fe" />

A área do organizador é responsiva, com melhor aproveitamento de telas maiores para tarefas administrativas mais densas.

## Consistência Visual

A interface utiliza identidade própria baseada em verde-lima, rosa, superfícies brancas e elementos translúcidos.

Cabeçalhos, botões, campos, navegação e estados de feedback são reutilizados entre as telas para manter continuidade perceptiva entre as etapas do fluxo.

## Feedback Como Parte Do Fluxo

Carregamento, erro e lista vazia são tratados como estados da interface. Em ações críticas, como pagamento e validação, o sistema apresenta respostas específicas para que o usuário entenda o resultado e o próximo passo.

## Assento Não Pode Ser Vendido Duas Vezes

A interface mostra disponibilidade, mas a decisão final acontece no back-end, com validação no servidor e garantia de consistência no banco.

<img width="383" height="764" alt="gif3" src="https://github.com/user-attachments/assets/56bda0b9-1a03-4a07-a11b-40628d8f0f65" />

## QR Code Não Pode Ser Forjado

O QR não contém apenas um ID previsível. Ele carrega claims codificadas e uma assinatura HMAC criada com um segredo exclusivo do back-end. A portaria verifica a assinatura antes de localizar o ingresso e consome o status `ACTIVE` com uma atualização condicional atômica, evitando duas validações simultâneas.
