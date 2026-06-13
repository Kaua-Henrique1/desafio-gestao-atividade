# SUMÁRIO
1. [PRD — Product Requirements Document](#1-prd--product-requirements-document)\
   1.1 [Visão Geral](#11-visão-geral)\
   1.2 [Problemas Principais](#12-problemas-principais)
2. [Público Alvo](#2-público-alvo)\
   2.1 [Perfis de usuário](#21-perfis-de-usuário)
3. [User Stories e Critérios de Aceite](#3-user-stories-e-critérios-de-aceite)
4. [Indicadores e Métricas](#4-indicadores-e-métricas)\
   4.1 [Dicionário](#41-dicionário)

---

# 1. PRD — Product Requirements Document

### 📌 1.1 Visão Geral
O sistema consiste em uma plataforma centralizada de gestão de fluxo de trabalho desenvolvida em TypeScript/Angular para PMEs. Unindo conceitos de Kanban adaptável (baseado em fluxos/branches de desenvolvimento) e Scrum, a ferramenta elimina o uso de canais informais e planilhas descentralizadas, provendo visibilidade em tempo real da carga de trabalho, prazos e métricas de desempenho individuais e coletivas do time.

### 🎯 1.2 Problemas Principais

| Problema | Impacto Atual | Como a Ferramenta Resolve |
| :--- | :--- | :--- |
| **Trabalho descentralizado e invisível** | "O trabalho do time vive espalhado em planilha, papel e grupo de WhatsApp. Eu nunca sei o que está em andamento de verdade." | Quadro Kanban unificado com colunas padrão fixas e a possibilidade de criar colunas dinâmicas que representam as branches/fluxos de trabalho ativos do time. |
| **Desequilíbrio de demandas (Gargalos)** | "Tem gente afogada de tarefa e gente ociosa — e eu só descubro quando alguém reclama ou quando algo não sai." | Distribuição transparente de tarefas com pontuação baseada na sequência de Fibonacci e indicação clara de carga de trabalho acumulada por usuário. |
| **Prazos estourados sem aviso** | "Prazo combinado com cliente estoura e eu só fico sabendo depois que estourou. Ninguém me avisa antes." | Cronômetro regressivo visível em cada card ("Faltam X dias") integrado com a conversão automatizada de horas de esforço em dias úteis de trabalho. |
| **Reuniões baseadas em achismo** | "Na reunião de segunda-feira ninguém tem número nenhum. A conversa é toda baseada em 'acho que foi uma boa semana'." | Relatório de encerramento de Sprint contendo o throughput exato e o somatório de pontos Fibonacci entregues tanto pelos executores quanto pelos revisores. |

---

# 2. Público Alvo

### 2.1 Perfis de usuário

**a. Ricardo (Gestor / Dono da Empresa)**
* **Quem é:** Proprietário da PME responsável por gerenciar o progresso do time de 10 pessoas, definir prioridades de negócios e alinhar prazos com clientes.
* **Necessidades:** Cadastrar novas atividades, estipular critérios de aceite, acompanhar o andamento técnico sem precisar perguntar no WhatsApp e extrair relatórios numéricos claros para tomada de decisão.
* **Permissões no Sistema:** Criar, editar, mover e cancelar qualquer tarefa no quadro; criar colunas de fluxo; visualizar o painel de indicadores completo.

**b. Desenvolvedor / Colaborador (Executor)**
* **Quem é:** Membro técnico da equipe encarregado de puxar as tarefas priorizadas e realizar a implementação/codificação no dia a dia.
* **Necessidades:** Saber exatamente o que precisa ser feito (critérios de aceite), qual o prazo restante e movimentar seus cards conforme o progresso do desenvolvimento técnico.
* **Permissões no Sistema:** Criar tarefas no Backlog; mover cards de tarefas sob sua responsabilidade; interagir com os checkboxes dos critérios de aceite de suas tarefas.

**c. Revisor / Validador do Time**
* **Quem é:** Qualquer colaborador da equipe (que não seja o executor original daquela tarefa específica) encarregado de auditar os critérios de aceite na coluna de teste.
* **Necessidades:** Interface limpa para assinar a autoria da revisão, checar se todas as pendências foram cumpridas e validar a qualidade técnica da entrega.
* **Permissões no Sistema:** Assinar tarefas como Revisor na coluna de "Teste"; marcar sub-itens de validação técnica; liberar o card para movimentação final.

---

# 3. User Stories e Critérios de Aceite

### US01 - Gestão do Fluxo de Trabalho (Kanban Customizável)
**Como** Ricardo ou gestor do time,  
**Quero** criar colunas customizadas que representem o status da branch em que a feature está sendo desenvolvida,  
**Para que** eu possa ver exatamente o andamento do fluxo técnico sem fragmentação de informações.

* **CA 1.1:** O quadro Kanban deve carregar obrigatoriamente as colunas fixas estruturais: `Backlog`, `Ready`, `Teste`, `Feito` e `Cancelado`.
* **CA 1.2:** Deve permitir ao usuário adicionar dinamicamente novas colunas intermediárias customizadas entre as abas `Ready` e `Teste` (ex: `feature/autenticacao`, `develop`), simulando o fluxo de branches do Git.
* **CA 1.3:** O sistema deve suportar a movimentação de cards de forma sequencial ou livre entre as colunas mapeadas.

### US02 - Detalhamento, Estimativa e Checklist do Card
**Como** Membro do time,  
**Quero** detalhar as características de esforço, prazos e escopo dentro de cada card,  
**Para que** todos saibam os requisitos exatos da atividade e o tempo restante para a entrega.

* **CA 2.1:** Cada card deve permitir a vinculação de um Membro do Time como executor principal.
* **CA 2.2:** O card deve apresentar um cronômetro regressivo destacado indicando o tempo restante (ex: *"Faltam 3 dias de trabalho"* ou *"Faltam 4 horas"*).
* **CA 2.3:** O campo de valor/complexidade da tarefa deve aceitar obrigatoriamente apenas valores contidos na sequência de Fibonacci (1, 2, 3, 5, 8, 13).
* **CA 2.4:** O campo de tempo total deve converter automaticamente horas brutas inseridas em dias úteis equivalentes, assumindo o padrão de que 8 horas equivalem a 1 dia de trabalho (ex: Inserir 16h deve renderizar automaticamente "2 dias de trabalho").
* **CA 2.5:** O card deve conter uma lista dinâmica de checkboxes representando os critérios de aceitação individuais, permitindo que o desenvolvedor marque cada item conforme conclui a sub-atividade.

### US03 - Ciclo de Conclusão e Auditoria (Teste para Feito)
**Como** Validador do Time,  
**Quero** inspecionar a tarefa na coluna de "Teste", assinar como revisor responsável e garantir a validação dos critérios de aceite antes de sua conclusão,  
**Para que** o histórico de auditoria armazene os envolvidos e distribua os pontos de esforço e revisão de forma justa.

* **CA 3.1:** Quando um card entra na coluna `Teste`, o sistema deve exigir obrigatoriamente que um colaborador (diferente do executor original da tarefa) assine o card como **Revisor**.
* **CA 3.2:** O card deve registrar visualmente e salvar no banco/estado duas entidades distintas de responsabilidade: **Quem Fez** (Executor Original) e **Quem Revisou** (Revisor Logado na Etapa de Teste).
* **CA 3.3:** O colaborador que assinar como Revisor na aba de teste receberá automaticamente uma pontuação fixa de bonificação (ex: 2 pontos) por realizar a auditoria da tarefa.
* **CA 3.4:** Após a assinatura do Revisor e a checagem dos critérios de aceite, o card fica elegível para conclusão. Qualquer membro da equipe ou o próprio Ricardo poderá arrastá-lo/movê-lo para a coluna `Feito`.
* **CA 3.5:** No momento exato em que a tarefa é movida para a coluna `Feito`, o valor Fibonacci original da atividade é computado e somado ao histórico de pontos do desenvolvedor que a executou, e a bonificação de revisão é somada ao histórico do revisor.
* **CA 3.6:** Se a tarefa for movida para a coluna `Cancelado` em qualquer etapa do ciclo, ela perde toda a pontuação associada, interrompe imediatamente o cronômetro regressivo e armazena uma justificativa de cancelamento.

---

# 4. Indicadores e Métricas

### 📊 4.1 Indicadores de Decisão (KPIs para o Ricardo)

1.  **Métrica de Throughput e Pontos por Usuário (Velocidade da Sprint)**
    * *O que mostra:* O volume total de pontos Fibonacci e de pontos de revisão entregues e validados por cada funcionário individualmente ao final da sprint.
    * *Decisão do Ricardo:* Olhando esse gráfico, o Ricardo identifica quem são os maiores motores técnicos e os revisores mais ativos do time, eliminando o "achismo" na reunião de segunda-feira e fundamentando feedbacks em dados de complexidade real entregue.
2.  **Carga Balanceada de Trabalho Técnico (WIP Real)**
    * *O que mostra:* A soma dos pontos Fibonacci acumulados em tarefas que estão ativas nas colunas intermediárias (em andamento/branches), agrupados por responsável.
    * *Decisão do Ricardo:* Permite ao Ricardo visualizar instantaneamente quem está sobrecarregado (ex: acumulando mais de 13 pontos em andamento) ou ocioso. A decisão tomada é rebalancear os cards e redistribuir novas tarefas de forma justa antes que os prazos quebrem.
3.  **Índice de Alerta de Prazos (Risco de Entrega)**
    * *O que mostra:* A lista de tarefas com cronômetro regressivo inferior a 48 horas que ainda possuem menos de 80% dos checkboxes de critérios de aceite marcados.
    * *Decisão do Ricardo:* O Ricardo detecta gargalos com antecedência e toma a decisão proativa de designar um segundo desenvolvedor para ajudar na atividade ou ligar preventivamente para o cliente para renegociar o prazo antes do estouro real.

### 📖 4.2 Dicionário

* **Backlog:** O repositório ou lista centralizada de todas as demandas, ideias e tarefas que a empresa precisa realizar, mas que ainda não possuem priorização ou data de execução definida para o ciclo atual.
* **Ready (Pronto para Início):** O status ou coluna que agrupa tarefas que já foram devidamente detalhadas por Ricardo, possuem prazos e estimativas calculadas e estão prontas para serem coletadas pelo time de desenvolvimento.
* **Branch (Fluxo de Trabalho Customizado):** Uma ramificação de desenvolvimento. No contexto do sistema, refere-se às colunas dinâmicas criadas pelos usuários para espelhar exatamente em qual frente de código/trabalho o card está alocado no momento.
* **Sequência de Fibonacci:** Uma escala numérica progressiva (onde cada número é a soma dos dois anteriores: 1, 2, 3, 5, 8, 13) utilizada em metodologias ágeis para estimar a complexidade/esforço relativo de uma tarefa, mitigando os erros de estimativas puramente baseadas em horas relógio.
* **Critérios de Aceite:** Uma lista de requisitos objetivos e verificáveis em formato de checklist que descreve detalhadamente o escopo que a tarefa deve cumprir para que seja considerada aceita pelo cliente e pelo gestor.
* **Throughput (Taxa de Entrega):** Métrica de desempenho que aponta a quantidade exata de tarefas de valor que o time ou um colaborador conseguiu mover com sucesso para o status de concluído dentro de um período de tempo específico.
* **Sprint:** Um ciclo curto de trabalho (comumente de uma a duas semanas) adotado pelo time para focar no desenvolvimento e na entrega de um bloco fechado de tarefas priorizadas, culminando em uma revisão de resultados numéricos.