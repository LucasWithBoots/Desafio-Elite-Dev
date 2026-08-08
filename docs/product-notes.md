# Notas De Produto

## Objetivo

Permitir que um organizador publique eventos rapidamente, que clientes comprem ingressos com seguranca e que a portaria valide a entrada com clareza.

## Atores

### Organizador

- Cria eventos via API externa ou cadastro manual.
- Define data, local, capacidade e preco.
- Gerencia eventos publicados.

### Cliente

- Navega por eventos.
- Escolhe assento.
- Simula pagamento.
- Recebe ingresso com QR Code.
- Compartilha ingresso por link.

### Portaria

- Le QR Code ou digita codigo manualmente.
- Valida ingresso na entrada.
- Recebe retorno claro sobre o status.

## Jornada Principal

Organizador cria evento -> Cliente compra ingresso -> Portaria valida entrada.

## Jobs To Be Done Principais

- Quando quero criar um evento, quero poder buscar filmes ou shows em uma API externa ou cadastrar manualmente para ter agilidade e flexibilidade.
- Quando estou comprando ingresso, quero saber quais assentos estao livres para evitar erro.
- Quando faco o pagamento, quero saber se foi aprovado ou recusado para entender o proximo passo.
- Quando recebo meu ingresso, quero acessar QR Code e codigo manual para conseguir entrar mesmo se a camera falhar.
- Quando estou na portaria, quero validar rapidamente se o ingresso e valido, invalido, ja usado ou de outro evento.

## Regras De Negocio

- Pagamento aprovado gera ingresso.
- Pagamento recusado nao gera ingresso.
- Um assento confirmado nao pode ser vendido duas vezes.
- Ingresso validado nao pode ser usado novamente.
- QR Code precisa ser validado no back-end.
- Link compartilhavel nao altera o dono do ingresso.
- Cada papel acessa apenas suas proprias funcoes.
