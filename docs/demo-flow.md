# Roteiro De Demonstração

Este roteiro existe para que avaliadores consigam testar o fluxo principal sem montar tudo do zero.

## 1. Organizador

1. Entrar como `organizador@elite.dev`.
2. Buscar um evento na Ticketmaster ou criar manualmente.
3. Definir data, horário, local, capacidade e preço.
4. Publicar o evento.

<img width="383" height="758" alt="gif4" src="https://github.com/user-attachments/assets/be16e9f2-9b5a-431c-985d-91131054742c" />

## 2. Cliente

1. Entrar como `cliente@elite.dev`.
2. Abrir a lista de eventos publicados.
3. Selecionar um evento.
4. Escolher um assento disponível.
5. Revisar a compra.
6. Simular pagamento aprovado.
7. Ver ingresso gerado com QR Code.
8. Copiar link compartilhável.

<img width="383" height="758" alt="gif5" src="https://github.com/user-attachments/assets/d1253d21-1def-472d-941c-cb74f882146e" />

## 3. Pagamento Recusado

1. Repetir o fluxo de compra com outro assento.
2. Simular pagamento recusado.
3. Confirmar que o ingresso não foi gerado.

<img width="383" height="758" alt="gif5" src="https://github.com/user-attachments/assets/759ea69a-256c-40b2-9a92-c7eb2c82a6a5" />

## 4. Portaria

1. Entrar como `portaria@elite.dev`.
2. Ler o QR Code pela câmera, enviar uma imagem com o QR ou digitar o código manualmente.
3. Validar ingresso correto.
4. Tentar validar o mesmo ingresso novamente.
5. Confirmar retorno de ingresso já utilizado.

<img width="381" height="751" alt="gif6" src="https://github.com/user-attachments/assets/903911a4-4bac-4edc-9c26-8d51487886fe" />

## O Que Observar Durante A Demonstração

O roteiro também demonstra decisões de produto e UX:

- O organizador pode importar ou cadastrar sem depender totalmente da Ticketmaster.
- A importação preenche um formulário editável e mantêm o organizador no controle dos dados.
- O cliente recebe feedback diferente para pagamento aprovado e recusado.
- O ingresso permanece acessível depois da compra e muda de estado depois do uso.
- A portaria oferece alternativas quando a câmera não pode ser utilizada.
- Uma segunda leitura e diferenciada de um ingresso invalido.
- Cada ator visualiza apenas a navegação relevante para suas responsabilidades.
