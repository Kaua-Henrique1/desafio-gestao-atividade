# Desafio Gestão de Atividades - Painel de Engenharia (Kanban & KPIs)

Este projeto consiste em uma aplicação web para gestão de fluxos de trabalho e indicadores de produtividade. Ele foi desenhado especificamente para resolver as dores operacionais de acompanhamento de demandas, gargalos de time e previsibilidade de entregas de projetos.

---

## Links do Projeto
* **Link do PRD (Product Requirement Document):** [Acesse o PRD do Desafio Aqui](./PRD.md)
---

## Inspiração Metodológica: A Solução para as Dores do Ricardo

Para resolver o problema de gestão do Ricardo, baseamos a solução em algumas metodologias, criando uma **Variação Adaptada do Kanban**, combinando conceitos de outras estruturas ágeis:

* **Kanban Nativo:** Utilizado para garantir a **visualização do fluxo de trabalho em tempo real**. O Ricardo consegue bater o olho no painel e entender o status de cada demanda imediatamente.
* **Scrum (Conceito de Esforço):** Absorvemos a estimativa por **Pontos de Fibonacci** e o conceito de **WIP (Work In Progress)** para limitar o trabalho em andamento por desenvolvedor, evitando sobrecargas.
* **Ciclo PDCA (Melhoria Contínua):** O Dashboard acoplado atua diretamente na fase de **Checagem (Check)** e **Ação (Act)** do PDCA. Os indicadores geram dados históricos para que o Ricardo tome decisões de melhoria de processos na próxima etapa.

### Por que esta variação ataca as dores do Ricardo de verdade?
Um Kanban tradicional apenas move cards. Já a variação do projeto, entrega diferenciais táticos desenhados para o cenário do Ricardo:
1. **Gargalos Visíveis instantaneamente:** Ao cruzar o limite de colunas com o painel de **Carga de Trabalho Ativa (WIP)**, o Ricardo não precisa perguntar quem está sobrecarregado; o sistema aponta quem acumulou mais pontos ativos na sprint.
2. **Previsibilidade de Prazos Simples:** Donos de empresas sofrem para calcular quando um projeto vai ser entregue. Traduzir pontos abstratos de Fibonacci em **Dias Reais e Horas Úteis** através da nossa regra de negócio tira o peso do gerenciamento empírico e traz previsibilidade matemática para o cliente final.
3. **Segurança Operacional:** A trava que impede o executor de aprovar a própria tarefa na fase de "Teste" introduz um fluxo de auditoria nativo, garantindo a qualidade da entrega sem burocratizar o processo do time.

---

## Metodologia e Decisões de Arquitetura

A aplicação foi desenvolvida utilizando **Angular (v17+)** com foco em **DDD (Domain-Driven Design)**, onde a estrutura de pastas revela imediatamente o domínio de negócio do sistema (`domain/board`).

### Por que Angular & Signals?
* **Inversão de Controle Dinâmica:** O projeto faz uso massivo do sistema nativo de **Iniciação/Injeção de Dependência** do Angular, centralizando a inteligência no `BoardStateService`.
* **Reatividade (Signals):** Toda a reatividade da aplicação (tarefas, colunas, cálculos e indicadores) foi construída usando **Angular Signals**. Isso garante que quando um card é arrastado ou atualizado, o Angular modifique apenas o elemento afetado.
* **Padrão Estrito TypeScript:** 100% do código utiliza tipagem real estrita (através de interfaces unificadas em `core/models/interfaces.ts`).
* **Familiaridade com Framework:** O Angular é um framework robusto e maduro, particularmente tenho experiência em projetos acadêmicos.

### Por que Tailwind CSS?
* **Utility-First:** Escolhido para evitar o crescimento inflacionário de arquivos CSS globais. O Tailwind compila apenas as classes utilitárias de estilo utilizadas em tempo de build, gerando um artefato leve e de carregamento instantâneo.

---

## Indicadores que Geram Decisão (KPIs Implementados)

Os três indicadores abaixo foram incluídos para dar visibilidade em tempo real sobre a saúde do projeto:

1.  **Throughput por Usuário (Pontos Concluídos):**
    * *Justificativa:* Mede a vazão real de entregas de cada engenheiro calculando os pontos de Fibonacci das tarefas na coluna **Feito**. Ajuda o gestor a entender a velocidade de entrega real do tempo por sprint.
2.  **Carga de Trabalho Ativa (WIP - Work In Progress):**
    * *Justificativa:* Lista a volumetria de pontos e a quantidade de tarefas ativas associadas a cada usuário nas colunas de execução. Essencial para **identificar sobrecarga** dos colaboradores e evitar o **gargalo** de tarefas abertas que **não são concluídas**.
3.  **Alertas de Prazo Crítico (< 48h ou Atrasadas):**
    * *Justificativa:* Um painel de exceção reativo que captura **tarefas ativas** cujos **prazos expiram** em menos de 48 horas ou já passaram da data atual. Permite ações ágeis de contorno (como pareamento ou desimpedimento) antes do **estouro do prazo**.

---

## Regras de Negócio e Estimativa Ágil (Nova Escala Fibonacci)

A aplicação foi adaptada para uma escala realista de **Conversão de Dias de Trabalho baseada em Proporção Ágil**:
* A estimativa de esforço utiliza a sequência clássica de Fibonacci (`1, 2, 3, 5, 8, 13`), validada rigorosamente em tempo de digitação através da diretiva reativa `appFibonacciValidator`.
* **Regra de Negócio Implementada:** Adotou-se o padrão onde **5 Pontos de Fibonacci equivalem a 1 Dia de Trabalho completo (8 Horas)**.
* A conversão matemática é realizada em tempo real na UI através do pipe `workdayConversion`, exibindo, por exemplo, que uma tarefa de `13 pontos` demanda `2,6 dias (20,8h)` de esforço estimado.

---

## Cortes do Escopo (Trade-offs do Prazo) e Melhorias Futuras

Para garantir uma entrega funcional que rode de primeira no prazo estipulado, os seguintes cortes conscientes foram realizados:

### O que foi cortado (Débito Técnico Consciente)
* **Persistência em Memória Local:** O estado do sistema é reiniciado via `SeedDataService` e mantido dinamicamente no `localStorage`. Não há persistência em banco de dados real em nuvem nesta fase.
* **Gerenciamento de Usuários Limitado:** O cadastro e gerenciamento de usuários é estático, sem autenticação ou controle de acesso. Todos os usuários são pré-selecionados no dropdown de atribuição.
* **Acoplamento Visual de Contexto:** A visualização das abas de Kanban, o Modal de Detalhes da Tarefa e os cards do Dashboard residem no mesmo arquivo de página orquestradora de dados entre subcomponentes isolados.

### Visão de Futuro (Melhorias e Escalabilidade)
Se houvesse mais tempo para o crescimento do projeto, as seguintes melhorias seriam:
1.  **Isolamento de Componentes Visuais:** Extração do Modal de Tarefas e dos blocos do Dashboard para componentes independentes (`task-modal.component.ts` e `kpi-dashboard.component.ts`) aumentando a reusabilidade.
2.  **Página de Gestão da equipe:** Adicionar uma página dedicada para o Dono do Projeto/Gestor cadastrar, editar e desativar funcionários (Usuários do Quadro).
3.  **Evolução da Infraestrutura:** Criação de uma camada de repositório independente (`BoardRepository`) conectada a uma backend (ex: Java) que poderia implementar Autenticação e Segurança (JWT) com banco de dados relacional (ex: PostgreSQL), substituindo completamente o `localStorage`.
4.  **Envio de E-mails de Notificação:** Implementar um serviço de notificação por e-mail para alertar os usuários sobre tarefas críticas ou mudanças de status importantes.

---
## Dependências e Ecossistema Técnico

### Core da Aplicação (Dependencies)
* **Angular (v17+):** Framework principal.
* **Angular Signals:** Motor nativo de gerenciamento de estado.
* **Angular CDK (Drag & Drop):** Módulo oficial do Angular para manipulação nativa.
* **Tailwind CSS:** Framework utilitário de CSS.

### Ferramental de Desenvolvimento (DevDependencies)
* **TypeScript (v5+):** Superset da linguagem que adiciona tipagem estática estrita a todo o fluxo de dados do painel.
* **Vitest (v4+):** Framework de testes unitários.
* **@types/jasmine:** Pacote de tipagens mantido para garantir a compatibilidade de assinaturas de tipos de testes nativos do ecossistema Angular dentro do ambiente virtualizado do Vitest.

---

## Suite de Testes Unitários (Vitest)

O projeto foi migrado com sucesso do ecossistema antigo do Karma para o **Vitest** (v4.1.8). Os testes rodam de forma instantânea diretamente no Node.js virtualizado.

Atualmente, a aplicação conta com **31 testes unitários em 100% de sucesso**, cobrindo:
* Mecanismo de manipulação de estado do Kanban.
* Mocks de controle de tempo reativo simulando viradas de fuso horário.
* Validadores dinâmicos de formulário.

Como rodar os testes:
Garanta que esteja no diretório **'projeto-gestao'** e execute o comando abaixo para rodar a suíte de testes:
```bashnpm run test
ng test
```

---

## Como Rodar o Projeto (Passo a Passo)

Siga as instruções abaixo para clonar, instalar as dependências e colocar o projeto rodando com dados de exemplo de primeira.

### Pré-requisitos
* Node.js (versão 18 ou superior recomendada)
* Angular CLI instalado globalmente (`npm install -g @angular/cli`)

### 1. Clonar o Repositório e rodar Projeto
```bash
git clone https://github.com/Kaua-Henrique1/desafio-gestao-atividade.git

cd desafio-gestao-atividade/projeto-gestao

ng serve
```