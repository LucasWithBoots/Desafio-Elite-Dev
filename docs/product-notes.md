# Notas De Produto

## Atores Do Sistema

### Cliente

Pessoa que deseja descobrir eventos, comprar ingressos e apresentá-los na entrada.

Principais necessidades:

- Encontrar eventos relevantes por destaque, categoria ou busca.
- Consultar data, local, preço e disponibilidade antes da compra.
- Escolher a modalidade de ingresso ou um assento disponível.
- Receber feedback claro sobre o pagamento.
- Encontrar facilmente ingressos ativos e utilizados.
- Apresentar um QR Code confiável na portaria.
- Salvar eventos para consultar novamente depois.

### Organizador

Pessoa responsável por cadastrar, revisar e publicar eventos.

Principais necessidades:

- Importar informações da Ticketmaster para reduzir trabalho manual.
- Cadastrar um evento do zero quando ele não existir no catálogo externo.
- Revisar e editar dados importados antes de publicar.
- Escolher entre entrada geral e mapa de assentos.
- Definir data, local, preço e capacidade.
- Manter um evento como rascunho enquanto ele estiver incompleto.

### Portaria

Pessoa responsável por verificar os ingressos na entrada do evento.

Principais necessidades:

- Ler um QR Code rapidamente.
- Enviar uma imagem com QR Code ao utilizar um computador.
- Informar um código manual quando a câmera não estiver disponível.
- Receber uma resposta visual imediata e sem ambiguidade.
- Identificar ingressos inválidos ou já utilizados.
- Impedir que o mesmo ingresso seja aceito duas vezes.

## Jobs To Be Done

Os Jobs to Be Done foram escritos no formato situação, motivação e resultado esperado. Eles representam hipóteses de produto derivadas do enunciado e da análise do domínio, e não resultados de entrevistas com usuários.

### Cliente

- Quando quero encontrar algo para fazer, quero navegar por eventos e categorias para descobrir opções relevantes.
- Quando já sei o que procuro, quero buscar por nome para chegar ao evento com rapidez.
- Quando encontro um evento interessante, quero consultar suas informações completas para decidir se quero participar.
- Quando ainda não estou pronto para comprar, quero salvar o evento para encontrá-lo novamente depois.
- Quando escolho um evento, quero visualizar os tipos de entrada ou assentos disponíveis para selecionar a opção adequada.
- Quando seleciono meus ingressos, quero revisar itens e valor total antes de confirmar a compra.
- Quando realizo o pagamento, quero receber feedback imediato para saber se a compra foi aprovada ou recusada.
- Quando a compra é aprovada, quero encontrar meu ingresso facilmente para utilizá-lo na entrada.
- Quando estou entrando no evento, quero apresentar um QR Code sem precisar procurar novamente os dados da compra.
- Quando um ingresso já foi utilizado, quero que esse estado fique evidente para evitar confusão.

### Organizador

- Quando quero publicar um evento que existe em um catálogo externo, quero importar seus dados para reduzir o preenchimento manual.
- Quando importo um evento, quero revisar e editar os dados antes de salvá-lo para corrigir informações incompletas.
- Quando o evento não existe na API externa, quero cadastrá-lo manualmente para não ficar dependente do catálogo.
- Quando ainda estou preparando um evento, quero mantê-lo como rascunho até que as informações estejam corretas.
- Quando defino a forma de entrada, quero escolher entre entrada geral e mapa de assentos para representar diferentes tipos de evento.
- Quando publico um evento, quero que apenas a versão revisada fique disponível para os clientes.

### Portaria

- Quando um participante apresenta um QR Code, quero validá-lo rapidamente para evitar filas.
- Quando a câmera não está disponível, quero usar uma imagem ou o código manual para continuar a operação.
- Quando o código é inválido, quero receber uma mensagem clara para saber que a entrada não deve ser autorizada.
- Quando um ingresso já foi utilizado, quero identificar a segunda tentativa imediatamente.
- Quando valido um ingresso, quero que a verificação aconteça no servidor para confiar no resultado apresentado.

<img width="976" height="726" alt="image" src="https://github.com/user-attachments/assets/b0b77acc-9ac6-4c3e-870a-14cbe2825cf0" />


## Jornada Principal

A jornada principal conecta os três atores:

`Criação -> Publicação -> Descoberta -> Escolha -> Pagamento -> Emissão -> Validação`

<img width="998" height="405" alt="image" src="https://github.com/user-attachments/assets/b9855743-5a0b-4657-8d9c-41ec8cd61aa3" />


### 1. Criação

O organizador entra no sistema e busca um evento na Ticketmaster ou inicia um cadastro manual. Ao importar, os dados externos apenas preenchem o formulário e continuam editáveis.

### 2. Configuração E Publicação

O organizador revisa as informações, escolhe a modalidade de entrada, define preço e capacidade e salva o evento. Enquanto estiver em preparação, ele permanece como rascunho. Depois da revisão, o evento é publicado para os clientes.

### 3. Descoberta

O cliente encontra eventos pela home, pelos destaques, pelas categorias ou pela busca. Ao selecionar um evento, consulta informações suficientes para tomar a decisão de compra.

### 4. Escolha E Checkout

O cliente escolhe o ingresso ou o assento, revisa os dados do pedido e segue para o checkout.

### 5. Pagamento

O sistema permite simular um pagamento aprovado ou recusado. Apenas a aprovação conclui a emissão do ingresso.

### 6. Pós-compra

O ingresso fica disponível na área do cliente, separado entre ativo e utilizado. A visualização apresenta os dados do evento e o QR Code.

### 7. Entrada

A portaria lê o QR Code, envia uma imagem ou informa o código manual. O servidor verifica a autenticidade e o estado do ingresso. A primeira validação correta autoriza a entrada; uma nova tentativa retorna que o ingresso já foi utilizado.

## User Flows

<img width="9892" height="4813" alt="image" src="https://github.com/user-attachments/assets/acfdfa49-c505-44c0-bb98-fde18cf5c0d7" />

## Pontos Críticos Da Experiência

Durante o mapeamento, foram identificados momentos em que o usuário precisa de feedback especialmente claro:

- Falha ao consultar a API externa.
- Evento encontrado com dados incompletos.
- Evento ainda em rascunho.
- Busca ou lista sem resultados.
- Assento indisponível.
- Pagamento recusado.
- Compra concluída.
- QR Code inválido.
- Ingresso já utilizado.
- Câmera indisponível.

Esses cenários foram considerados estados do produto, e não apenas exceções técnicas.

## Regras De Negócio

- Pagamento aprovado gera ingresso.
- Pagamento recusado não gera ingresso.
- Um assento confirmado não pode ser vendido duas vezes.
- Ingresso validado não pode ser usado novamente.
- QR Code precisa ter sua assinatura validada no back-end.
- Link compartilhável não transfere a propriedade do ingresso.
- Cada papel acessa apenas as funções autorizadas para ele.
- Dados importados da Ticketmaster precisam ser revisados antes da publicação.
