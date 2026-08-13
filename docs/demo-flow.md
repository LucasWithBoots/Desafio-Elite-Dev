# Roteiro De Demonstracao

Este roteiro existe para que avaliadores consigam testar o fluxo principal sem montar tudo do zero.

## 1. Organizador

1. Entrar como `organizador@elite.dev`.
2. Buscar um evento na Ticketmaster ou criar manualmente.
3. Definir data, horario, local, capacidade e preco.
4. Publicar o evento.

## 2. Cliente

1. Entrar como `cliente@elite.dev`.
2. Abrir a lista de eventos publicados.
3. Selecionar um evento.
4. Escolher um assento disponivel.
5. Revisar a compra.
6. Simular pagamento aprovado.
7. Ver ingresso gerado com QR Code.
8. Copiar link compartilhavel.

## 3. Pagamento Recusado

1. Repetir o fluxo de compra com outro assento.
2. Simular pagamento recusado.
3. Confirmar que o ingresso nao foi gerado.

## 4. Portaria

1. Entrar como `portaria@elite.dev`.
2. Ler o QR Code pela camera, enviar uma imagem com o QR ou digitar o codigo manualmente.
3. Validar ingresso correto.
4. Tentar validar o mesmo ingresso novamente.
5. Confirmar retorno de ingresso ja utilizado.

## Estados Esperados

- Valido
- Invalido
- Ja utilizado
- Evento errado
- Camera indisponivel, com imagem, colagem ou digitacao manual como alternativas
