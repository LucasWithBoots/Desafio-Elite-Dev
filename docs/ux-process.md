# Processo De UX

## Objetivo

O processo de UX teve como objetivo transformar os requisitos do desafio em um produto coerente antes da implementação. Em vez de iniciar pelas telas, o trabalho começou pela relação entre os atores e pelo ciclo completo do ingresso: criar, publicar, comprar, emitir e validar.

<img width="790" height="569" alt="image" src="https://github.com/user-attachments/assets/90296d20-0359-4dd5-a615-b1999b24d658" />

## Contexto E Restrições

Não foram realizadas entrevistas ou testes formais com usuários. Atores, necessidades e Jobs to Be Done foram definidos como hipóteses a partir do enunciado, da análise do domínio de eventos e de padrões conhecidos em plataformas de ingressos.

Essa limitação é importante: os artefatos registram o raciocínio utilizado para construir o MVP, mas ainda precisam ser validados com usuários reais em uma futura evolução do produto.

## Etapas Realizadas

### 1. Leitura E Decomposição Do Problema

O enunciado foi dividido em três contextos conectados:

- Gestão e publicação do evento.
- Descoberta e compra do ingresso.
- Validação do ingresso na entrada.

Essa divisão ajudou a identificar responsabilidades, dependências e regras que atravessam mais de uma interface.

### 2. Definição Dos Atores

Foram definidos três atores principais no FigJam:

- Cliente, que descobre eventos, compra e utiliza ingressos.
- Organizador, que cria, revisa e publica eventos.
- Portaria, que valida a autenticidade e o uso do ingresso.

<img width="876" height="832" alt="image" src="https://github.com/user-attachments/assets/898e9b1c-eae5-4e69-b7b0-058ec1c98f64" />

Cada ator recebeu uma navegação própria para reduzir distrações e evitar acesso a tarefas que não fazem parte de sua responsabilidade.

### 3. Jobs To Be Done

Os Jobs to Be Done foram utilizados para descrever o progresso que cada ator deseja alcançar, sem limitar a solução a uma tela específica.

Exemplos centrais:
<img align="right" width="328" height="201" alt="image" src="https://github.com/user-attachments/assets/70a5b1cb-77c2-4b3b-8287-aa59d526f60c" />
- Quando quero publicar um evento que existe em um catálogo externo, quero importar seus dados para reduzir o preenchimento manual.
- Quando quero participar de um evento, quero entender as opções disponíveis e concluir a compra com segurança. 
- Quando recebo um participante, quero validar rapidamente o ingresso para permitir ou negar a entrada com confiança.




A lista completa está em [Notas de produto](product-notes.md#jobs-to-be-done).

### 4. Jornada Principal

A jornada principal foi desenhada antes dos fluxos individuais para verificar se o produto entregava valor de ponta a ponta:

`Criação -> Publicação -> Descoberta -> Escolha -> Pagamento -> Emissão -> Validação`

O fluxo não foi considerado completo apenas quando a compra terminava. A emissão do ingresso e sua validação na portaria também fazem parte da experiência principal.

### 5. User Flows

Depois da jornada, foram criados fluxos separados para cliente, organizador e portaria. Essa etapa ajudou a mapear caminhos alternativos e estados que poderiam interromper a tarefa, como:

- Cadastro manual quando a Ticketmaster não encontra o evento.
- Pagamento recusado.
- Busca sem resultados.
- Câmera indisponível na portaria.
- Segunda tentativa de uso do mesmo ingresso.

Os fluxos completos estão em [Notas de produto](product-notes.md#user-flows).

<img align="right" width="516" height="558" alt="image" src="https://github.com/user-attachments/assets/1d435ce3-7c89-41ff-97ac-cc5e53e05ee2" />

### 6. Protótipos De Baixa Fidelidade

Os protótipos foram produzidos no Excalidraw para validar rapidamente:

- Hierarquia das informações.
- Posição das ações principais.
- Navegação inferior no mobile.
- Separação das experiências por papel.
- Continuidade entre evento, checkout e ingresso.
- Estados essenciais das telas.

A baixa fidelidade foi uma escolha intencional. Diante do prazo, o objetivo era responder perguntas de estrutura e fluxo antes de investir no acabamento visual.

### 7. Implementação E Refinamento

Depois da baixa fidelidade, o refinamento visual foi feito diretamente na aplicação. As referências serviram como inspiração de composição, mas os componentes foram adaptados para formar uma identidade própria baseada em verde-lima, rosa, branco e superfícies translúcidas.

O desenvolvimento foi mobile first nas experiências de cliente e portaria. Em telas maiores, o conteúdo é reorganizado sem alterar a ordem mental das tarefas. A área do organizador também é responsiva, com maior densidade para as tarefas administrativas.

Durante a implementação, foram refinados:

- Hierarquia tipográfica.
- Consistência de cabeçalhos, botões e navegação.
- Estados de carregamento, erro e lista vazia.
- Feedback de pagamento e validação.
- Adaptação entre mobile e desktop.
- Alternativas para leitura do ingresso no computador.

## Aprendizados E Limitações

- Definir a jornada completa antes das telas evitou tratar pagamento, ingresso e portaria como funcionalidades isoladas.
- Separar os atores simplificou a navegação e as regras de autorização.
- A baixa fidelidade acelerou decisões de estrutura, mas deixou parte da validação visual para o navegador.
- A ausência de pesquisa com usuários limita a certeza sobre as hipóteses iniciais.
- Testes de usabilidade com representantes dos três papéis seriam o próximo passo de descoberta mais relevante.
