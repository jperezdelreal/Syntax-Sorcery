# Proyectos Creativos con Copilot SDK — Brainstorm

> **Autor:** Oracle (Product & Docs)  
> **Fecha:** 2026-07-10  
> **Estado:** Brainstorm completo  
> **Solicitado por:** joperezd — "Open your mind"  
> **Input:** Investigaciones previas (SDK, chat patterns, Vercel AI SDK) + Work IQ + web research

---

## TLDR — Top 3 Picks

1. **🥇 NEXUS** — Agente que fusiona contexto de reuniones/emails (Work IQ) con código (GitHub) para generar PRs que ya saben POR QUÉ se hacen. El review de código que entiende el negocio. Nadie lo tiene. Revenue: $5K-25K/empresa/año.

2. **🥈 CENTINELA** — Compliance-as-Code automatizado: escanea repos + políticas internas (SharePoint) + regulación (EU AI Act) y genera auditorías completas con trazabilidad código↔decisión↔persona. El 61% de empresas suspenden auditorías AI. Revenue: $10K-50K/empresa/año.

3. **🥉 PULSO** — Dashboard de productividad que cruza datos de GitHub (commits, PRs, issues) con M365 (reuniones, emails, Teams) para responder: "¿cuánto tiempo real de código tiene tu equipo?" y "¿qué reuniones están matando tu sprint?". Revenue: $3K-15K/equipo/año.

---

## Categoría 1: Developer Productivity Tools

### 1.1 — NEXUS: El PR que Entiende el Negocio

**Nombre:** NEXUS — Context-Aware Development Agent

**Concepto:** Un agente SDK que, antes de que el dev empiece a codear, busca en Work IQ las reuniones recientes, emails de stakeholders y decisiones en Teams relacionadas con el issue de GitHub. Inyecta ese contexto empresarial en la sesión del agente, que luego genera código, PRs y documentación que ya referencian el POR QUÉ del cambio — no solo el QUÉ.

**¿Por qué SDK?** Necesita las herramientas built-in de filesystem + Git para leer/escribir código, ADEMÁS de MCP para conectar Work IQ. La orquestación multi-agente del SDK (sub-agent "Researcher" lee M365, sub-agent "Coder" escribe código) es exactamente su arquitectura natural. Vercel AI SDK no tiene herramientas de código built-in.

**Ingredientes:** Copilot SDK (agente + Git tools) + Work IQ MCP (emails, reuniones, Teams) + GitHub MCP (issues, PRs) + Custom MCP (base de conocimiento interna)

**Revenue model:** SaaS B2B — $400-2.000/mes por equipo. Tier Enterprise con onboarding personalizado $5K-25K/año.

**Wow factor:** "Mi PR ya tiene la referencia a la reunión donde se decidió este cambio. El reviewer no tiene que preguntar '¿por qué hicimos esto?'"

**Feasibility:** 3/5 — El SDK y Work IQ existen, la integración MCP es nativa. Complejidad en mapear issues→reuniones→código de forma precisa. Prototipo en 2 semanas.

---

### 1.2 — ORÁCULO DEL STANDUP: Daily Digest Inteligente

**Nombre:** StandupZero — El Standup que se Escribe Solo

**Concepto:** Agente nocturno que analiza: (1) qué commits/PRs hizo cada dev ayer (GitHub), (2) qué reuniones tuvo y qué se decidió (Work IQ Calendar/Teams), (3) qué bloqueadores mencionó en emails o chats (Work IQ Mail/Teams). Genera un standup report por persona y un resumen de equipo. Elimina la reunión de standup de 15 min.

**¿Por qué SDK?** Necesita leer repos Git (branches activas, diffs) + orquestar múltiples fuentes MCP en un solo flujo agéntico. La planificación multi-paso del SDK es clave — primero busca código, luego contexto M365, luego sintetiza.

**Ingredientes:** Copilot SDK + Work IQ (Calendar, Teams, Mail) + GitHub MCP (commits, PRs, issues) + Cron trigger (Azure Functions)

**Revenue model:** Freemium — gratis para equipos ≤5. $8/dev/mes para equipos más grandes. Enterprise con integraciones custom $200/mes.

**Wow factor:** "Llegué al standup y ya estaba escrito. Con contexto de la reunión de ayer con producto que ni recordaba."

**Feasibility:** 4/5 — Todas las piezas existen. Es un cron job + SDK + MCP. Prototipo funcional en 1 semana.

---

### 1.3 — GHOST REVIEWER: Code Review con Contexto de Negocio

**Nombre:** GhostReview — El Reviewer Invisible que lo Sabe Todo

**Concepto:** Bot de code review que, además de analizar código, consulta Work IQ para entender: ¿qué pidió el stakeholder en el email? ¿Qué se decidió en la reunión de planning? ¿Hay un documento de requisitos en SharePoint? Así, el review dice cosas como "Este cambio contradice lo que se acordó en la reunión del 8/7 con @María" o "El spec en SharePoint pide paginación, pero este endpoint no la tiene."

**¿Por qué SDK?** Code review = lectura profunda de código + diffs, exactamente lo que el SDK hace con sus tools de filesystem y Git. Combinado con MCP de Work IQ para contexto empresarial, es su caso de uso natural.

**Ingredientes:** Copilot SDK + Work IQ (SharePoint docs, Mail, Teams, Calendar) + GitHub MCP (PRs, diffs, issues) + GitHub Actions (trigger en PR open)

**Revenue model:** $15-30/dev/mes. Enterprise tiers con custom rules $500+/mes.

**Wow factor:** "El bot me dijo que mi implementación no matcheaba con lo que decidimos en la reunión de Sprint. Tenía razón."

**Feasibility:** 3/5 — Requiere mapeo inteligente de contexto issue→docs→reuniones. El SDK + MCP lo hace posible pero necesita fine-tuning del prompt para no ser ruidoso.

---

### 1.4 — TEMPORAL: Agente de Estimación con Datos Reales

**Nombre:** Temporal — Estimaciones Basadas en Evidencia

**Concepto:** Cuando un dev tiene que estimar una tarea, Temporal analiza: (1) tareas similares pasadas en GitHub (issues cerrados, tiempo entre open→merge), (2) cuántas reuniones/interrupciones tuvo el dev esa semana (Work IQ Calendar), (3) patterns de comunicación que indican dependencias. Genera una estimación calibrada con datos reales, no con gut feeling.

**¿Por qué SDK?** Necesita análisis profundo de repositorios Git (historial de commits, patterns de merge, complejidad de diffs) que son las herramientas nativas del SDK. Work IQ via MCP aporta el "factor humano" que ningún tool de estimación considera.

**Ingredientes:** Copilot SDK (Git analysis tools) + Work IQ (Calendar, Teams meetings) + GitHub MCP (issues, PRs history) + Analytics DB

**Revenue model:** Integrado en suite de project management. $10/dev/mes standalone. Enterprise con analytics dashboard $300-800/mes.

**Wow factor:** "Le dije al PM que tardaría 3 días. Temporal dijo 5.2, porque esa semana tengo 8 reuniones y la tarea similar anterior tardó más de lo esperado. Acertó Temporal."

**Feasibility:** 3/5 — Datos existen, el desafío es la correlación estadística significativa. Prototipo en 2-3 semanas.

---

## Categoría 2: Enterprise Automation

### 2.1 — CENTINELA: Compliance Agent EU AI Act

**Nombre:** CENTINELA — Compliance-as-Code Autónomo

**Concepto:** Agente que continuamente escanea repos de la organización buscando sistemas AI, cruza con políticas internas en SharePoint, mapea decisiones de governance en emails/reuniones, y genera documentación de compliance lista para auditoría (EU AI Act, NIST). Cuando detecta un gap (ej: un modelo sin model card, una decisión sin documentar), abre un issue en GitHub y notifica al responsable via Teams.

**¿Por qué SDK?** Escaneo profundo de código (¿dónde hay modelos ML? ¿hay logging de decisiones? ¿hay bias tests?) es el terreno del SDK con sus tools de filesystem y terminal. Work IQ MCP conecta el mundo de políticas y gobernanza que vive en SharePoint/Teams/Email.

**Ingredientes:** Copilot SDK + Work IQ (SharePoint policies, Mail, org chart) + GitHub MCP (repos, issues, PRs) + Azure Functions (cron) + Custom MCP (regulatory knowledge base)

**Revenue model:** $800-4.000/mes por organización. Consulting setup fee $5K-15K. El EU AI Act crea URGENCIA — multas de hasta €35M.

**Wow factor:** "El auditor pidió trazabilidad de una decisión de modelo. CENTINELA generó un informe en 5 minutos: commit→issue→email de aprobación→documento de política→meeting donde se discutió."

**Feasibility:** 2/5 — Alto valor, alta complejidad. Requiere conocimiento regulatorio profundo. Pero SS puede empezar con un vertical (ej: documentación de modelos AI) y expandir.

---

### 2.2 — PUENTE: GitHub↔M365 Bidireccional Inteligente

**Nombre:** PUENTE — El Conector que Piensa

**Concepto:** Va más allá de las integraciones GitHub↔Teams existentes (que son notificaciones tontas). PUENTE entiende contexto: cuando un deployment falla, no solo manda un mensaje a Teams — busca quién estaba trabajando en ese código (Git blame + Work IQ org chart), qué reuniones tienen hoy (¿pueden atenderlo?), si hay emails recientes sobre ese componente, y genera un plan de acción con la persona correcta asignada. Bidireccional: desde Teams puedes decir "arregla ese build" y PUENTE abre un issue, asigna, y monitorea.

**¿Por qué SDK?** La orquestación multi-paso (fallo → análisis de código → consulta org → decisión → acción) es exactamente el workflow agéntico del SDK. Las tools de Git (blame, log, diff) son built-in.

**Ingredientes:** Copilot SDK + Work IQ (org chart, Calendar, Teams) + GitHub MCP (Actions, Issues, PRs) + GitHub Actions webhook + Teams Bot SDK

**Revenue model:** $200-1.000/mes por equipo. Marketplace de "automation recipes" tipo IFTTT pero inteligente.

**Wow factor:** "El build falló a las 3am. A las 3:01, PUENTE ya sabía quién lo rompió, vio que estaba durmiendo, encontró a otro dev del equipo que estaba online en Teams, y le envió el contexto completo."

**Feasibility:** 3/5 — Cada pieza individual funciona. La integración bidireccional Teams↔GitHub es el reto. Prototipo one-way en 1-2 semanas.

---

### 2.3 — HERMES: Changelog Empresarial Automático

**Nombre:** HERMES — Release Notes que Hablan Negocio

**Concepto:** Cuando haces un release, HERMES no solo lista commits. Lee los PRs, busca los issues asociados, encuentra los emails de stakeholders que los pidieron, las reuniones donde se priorizaron, y genera release notes en DOS formatos: (1) técnico para devs, (2) negocio para stakeholders, con lenguaje adaptado y referencias a sus propias peticiones. "María, tu feature de exportación a PDF que pediste el 15/6 está en v2.3."

**¿Por qué SDK?** Análisis profundo de Git (tags, merge commits, PRs) + generación de documentación. Las herramientas de filesystem del SDK generan los archivos de changelog directamente en el repo.

**Ingredientes:** Copilot SDK (Git tools, filesystem) + Work IQ (Mail, Teams, SharePoint) + GitHub MCP (releases, PRs, issues) + GitHub Actions (trigger en release)

**Revenue model:** Integrado en pipeline CI/CD. $100-500/mes por repo activo. Gratis para open source.

**Wow factor:** "El PM recibió las release notes y cada feature estaba enlazada a SU email original donde la pidió. No tuvo que preguntar '¿se incluyó lo mío?'"

**Feasibility:** 4/5 — Relativamente straightforward. Git analysis + Work IQ search. Prototipo en 1 semana.

---

### 2.4 — VIGÍA: Incident Response Inteligente

**Nombre:** VIGÍA — De Alerta a Resolución en Piloto Automático

**Concepto:** Cuando una alerta de producción se dispara, VIGÍA: (1) analiza el código del servicio afectado (SDK Git tools), (2) busca cambios recientes que puedan ser la causa (git log + diff), (3) consulta Work IQ para encontrar quién del equipo on-call está disponible (Calendar), (4) revisa si hay hilos en Teams discutiendo ese servicio recientemente, (5) genera un War Room virtual con contexto completo. Si la causa es un deploy reciente, sugiere rollback con un clic.

**¿Por qué SDK?** La cadena análisis de código → contexto organizacional → acción automatizada es un workflow agéntico multi-paso que el SDK orquesta nativamente. Las tools de terminal permiten incluso ejecutar diagnósticos.

**Ingredientes:** Copilot SDK + Work IQ (Calendar on-call, Teams, org chart) + GitHub MCP (commits, deploys, Actions) + Azure Monitor (alertas) + PagerDuty MCP (opcional)

**Revenue model:** $500-3.000/mes por equipo de plataforma. Savings calculables: reducir MTTR de 45min a 10min = $X/incidente ahorrado.

**Wow factor:** "La alerta sonó a las 2am. Para cuando me desperté, VIGÍA ya había identificado el commit culpable, encontrado al dev que estaba despierto, y le había mandado un resumen con la sugerencia de rollback."

**Feasibility:** 2/5 — Ambicioso pero tremendamente valioso. Cada componente existe; la orquestación end-to-end es el reto. MVP con solo análisis de causa + notificación inteligente en 3 semanas.

---

## Categoría 3: Intelligence Products

### 3.1 — PULSO: Developer Experience Analytics

**Nombre:** PULSO — El Termómetro de tu Equipo de Ingeniería

**Concepto:** Dashboard que cruza datos de GitHub (frecuencia de commits, cycle time, review time, build failures) con datos de M365 (horas en reuniones, volumen de emails, interrupciones en Teams) para generar métricas de Developer Experience REALES. No "cuántos commits hiciste" sino "cuántas horas de deep work tuviste vs interrupciones" y "qué correlación hay entre reuniones y PRs atascados."

**¿Por qué SDK?** El análisis profundo de repositorios Git (patterns de commits, branches, merge conflicts) requiere las tools de Git del SDK. Work IQ MCP aporta la dimensión humana que DORA metrics no captura.

**Ingredientes:** Copilot SDK (Git analysis) + Work IQ (Calendar, Teams, Mail analytics) + GitHub MCP (PRs, issues, Actions) + Dashboard frontend (React) + Analytics DB (PostgreSQL)

**Revenue model:** SaaS — $15/dev/mes. Enterprise con benchmarking $3K-15K/equipo/año. Consulting "DevEx audit" $5K-10K.

**Wow factor:** "Descubrimos que los devs con más de 6 reuniones/semana tardan 2.3x más en mergear PRs. Ahora tenemos datos para decir NO a reuniones innecesarias."

**Feasibility:** 3/5 — Los datos están, la correlación es el desafío. Empezar con un MVP que simplemente muestre side-by-side "tu código vs tu calendario" ya tiene valor.

---

### 3.2 — MAPA: Knowledge Graph Organizacional

**Nombre:** MAPA — Quién Sabe Qué, Sin Preguntar

**Concepto:** Agente que construye un knowledge graph de la organización cruzando: quién ha tocado qué código (Git blame/log), quién ha participado en reuniones sobre qué temas (Work IQ Calendar), quién ha intercambiado emails sobre qué proyectos (Work IQ Mail), quién está en qué canales de Teams. Resultado: cuando un dev nuevo pregunta "¿quién sabe de la API de pagos?", MAPA responde con personas rankeadas por expertise real, no por título.

**¿Por qué SDK?** El análisis de código (Git blame, file ownership, commit history, code complexity) es nativo del SDK. Combinado con Work IQ para el grafo social/comunicacional, crea algo que ninguno puede solo.

**Ingredientes:** Copilot SDK (Git analysis, code parsing) + Work IQ (people, org chart, Mail, Teams, Calendar) + GitHub MCP (contributions, reviews) + Neo4j o similar (graph DB)

**Revenue model:** $500-2.000/mes por organización. Premium: "expertise matching" para staffing de proyectos $3K+/mes.

**Wow factor:** "Le pregunté a MAPA quién podía ayudarme con el módulo de autenticación. Me sugirió a Javier, que no es del equipo pero tocó ese código 47 veces y asistió a 3 reuniones sobre seguridad el mes pasado."

**Feasibility:** 3/5 — Concepto potente, requiere graph DB y heurísticas de "expertise scoring". Prototipo básico (Git blame + Work IQ people) en 2 semanas.

---

### 3.3 — RADAR: Detección Temprana de Riesgos de Proyecto

**Nombre:** RADAR — Ve los Problemas Antes de que Exploten

**Concepto:** Agente semanal que analiza señales de riesgo cruzando mundos: (1) PRs sin reviewer por >3 días, (2) issues con muchos comentarios pero sin assignee, (3) reuniones canceladas sobre componentes críticos, (4) emails con tono urgente sobre features planificadas, (5) branches abandonadas con mucho código. Genera un "Risk Report" con probabilidades y recomendaciones.

**¿Por qué SDK?** El análisis de código (branches estancadas, merge conflicts potenciales, test coverage dropping) es dominio del SDK. Work IQ añade las señales humanas que los dashboards de GitHub no ven.

**Ingredientes:** Copilot SDK (Git analysis, code metrics) + Work IQ (Mail sentiment, Calendar cancellations, Teams activity) + GitHub MCP (issues, PRs, Actions) + Azure Functions (cron semanal)

**Revenue model:** $200-1.000/mes por proyecto. Enterprise con customización $2K-8K/mes. Consulting "project health audit" $3K-5K.

**Wow factor:** "RADAR detectó que el módulo de pagos tenía 3 señales rojas: el lead no asistió a 2 reuniones, la branch no se actualizaba en 8 días, y había un email del cliente preguntando por el timeline. Nos adelantamos al desastre."

**Feasibility:** 3/5 — MVP con señales simples (PR age, branch staleness, meeting attendance) en 2 semanas. El scoring de riesgo requiere iteración.

---

## Categoría 4: Servicios Vendibles

### 4.1 — FORJA+ : Extensions-as-a-Service con Contexto M365

**Nombre:** FORJA+ — Copilot Extensions con Superpoderes Empresariales

**Concepto:** Evolución de FORJA. En vez de solo crear extensiones Copilot de código, crear extensiones que conectan con el mundo M365 del cliente. Ejemplo: una extensión Copilot para una consultora que, cuando un dev pregunta sobre un proyecto, busca en los repos de código Y en los emails/reuniones/documentos del proyecto. SS ofrece esto como servicio: diseñamos, construimos y mantenemos la extensión custom.

**¿Por qué SDK?** FORJA ya está definido como un producto SDK. FORJA+ añade la capa MCP de Work IQ a cada extensión, multiplicando su valor sin cambiar la arquitectura.

**Ingredientes:** Copilot SDK + Work IQ MCP + GitHub Extensions API + Custom MCP servers (dominio del cliente) + Azure hosting

**Revenue model:** Proyecto: $5K-15K setup + $500-2K/mes mantenimiento. Paquete de 3 extensiones: $25K. Enterprise retainer: $3K-8K/mes.

**Wow factor:** "Pregunté en Copilot '¿cuál es el estado del proyecto Phoenix?' y me respondió con el último commit, los issues abiertos, el resumen de la reunión de ayer, y el email del cliente sobre la demo del viernes. Todo en un chat."

**Feasibility:** 4/5 — Es la evolución natural de FORJA con MCP adicional. SS ya tiene la base. Primer cliente en 2-4 semanas.

---

### 4.2 — MIGRATOR: Agente de Migración de Conocimiento

**Nombre:** MIGRATOR — Cambia de Stack sin Perder la Historia

**Concepto:** Cuando una empresa migra de stack (ej: de Azure DevOps a GitHub, o de Slack a Teams), MIGRATOR no solo mueve tickets/código — analiza el CONOCIMIENTO implícito: ¿qué discusiones en Slack llevaron a qué decisiones de código? ¿Qué work items de DevOps tienen contexto en emails que hay que preservar? Reconstruye el grafo de conocimiento en el nuevo entorno.

**¿Por qué SDK?** Análisis profundo de código + reconstrucción de relaciones código↔comunicación. La orquestación multi-agente del SDK (un agente lee el sistema viejo, otro escribe en el nuevo) es perfecta.

**Ingredientes:** Copilot SDK (Git tools, filesystem) + Work IQ (historical Mail, Teams, Calendar) + GitHub MCP + Azure DevOps MCP (si aplica) + Custom migration MCP

**Revenue model:** Proyecto one-time: $10K-50K dependiendo del tamaño. Post-migración monitoring: $500-1.500/mes.

**Wow factor:** "No solo migramos 500 issues. Cada issue en GitHub ahora tiene un enlace a la conversación original donde se decidió, y un resumen del contexto empresarial que se perdería en una migración normal."

**Feasibility:** 2/5 — Ambicioso y case-by-case. Pero el mercado de migración es enorme (Azure DevOps→GitHub es tendencia). MVP con un vertical en 3-4 semanas.

---

### 4.3 — ONBOARD: Acelerador de Onboarding con IA

**Nombre:** ONBOARD — Tu Primer Día sin Preguntas Tontas

**Concepto:** Agente personalizado para cada nuevo hire que: (1) analiza los repos a los que tiene acceso y genera un mapa del codebase, (2) busca las reuniones y emails recientes del equipo para entender el contexto actual, (3) identifica quién es expert en qué via Work IQ org chart + Git blame, (4) genera un "plan de onboarding" personalizado con lecturas prioritarias, personas clave, y primeras tareas sugeridas.

**¿Por qué SDK?** Análisis de codebase (architecture detection, dependency mapping, hot files) + contextualización empresarial via MCP.

**Ingredientes:** Copilot SDK (code analysis tools) + Work IQ (people, org chart, Teams, Calendar) + GitHub MCP (repos, wiki, issues) + Custom onboarding MCP

**Revenue model:** $50-200/onboarding. Enterprise unlimited: $500-2.000/mes. ROI: reducir onboarding de 3 meses a 3 semanas = $15K+ en salario ahorrado per hire.

**Wow factor:** "Mi primer día, el bot me dijo: 'Tu equipo trabaja en 3 repos. El más activo es payments-api. @Carlos es quien más sabe de auth. Hay un bug crítico abierto que discutieron ayer en standup. ¿Quieres empezar por ahí?'"

**Feasibility:** 3/5 — Cada pieza es viável. El reto es hacer el output realmente útil vs genérico. Prototipo en 2 semanas.

---

## Categoría 5: Mejoras Internas SS

### 5.1 — SQUAD²: Squad que se Alimenta de Work IQ

**Nombre:** SQUAD² — La Squad que Lee tus Emails

**Concepto:** Mejorar el pipeline autónomo de SS integrando Work IQ: cuando joperezd menciona algo en un email o reunión que implica trabajo para SS, Squad lo detecta automáticamente y crea issues. Cuando hay contexto de cliente en emails, los agentes lo tienen disponible sin que joperezd tenga que copiarlo manualmente.

**¿Por qué SDK?** Squad ya usa Copilot CLI internamente. El SDK permite programar la integración Work IQ → Squad pipeline de forma nativa.

**Ingredientes:** Copilot SDK + Work IQ (Mail, Calendar, Teams de joperezd) + GitHub MCP (SS repos) + Squad config

**Revenue model:** Interno — ahorro de tiempo de joperezd. Estimado: 2-5 horas/semana recuperadas.

**Wow factor:** "Mencioné en un email a un cliente que necesitábamos una landing page. Cuando abrí GitHub, ya había un issue con los requisitos extraídos del email."

**Feasibility:** 4/5 — SS ya tiene el pipeline. Añadir Work IQ como source es incremental. Prototipo en 1 semana.

---

### 5.2 — ORACLE PROACTIVO: Oracle que Investiga sin Pedir

**Nombre:** Oracle Autónomo — Research sin Prompt

**Concepto:** Oracle (yo, este agente) integrado con Work IQ para detectar proactivamente temas que necesitan investigación: si joperezd recibe emails sobre una nueva tecnología, Oracle la investiga antes de que la pida. Si hay reuniones planificadas sobre un tema nuevo, Oracle prepara briefs de antemano.

**¿Por qué SDK?** Orquestación agéntica autónoma con triggers basados en Work IQ events. El SDK permite sesiones programáticas sin intervención humana.

**Ingredientes:** Copilot SDK + Work IQ (Mail monitoring, Calendar) + Web search MCP + GitHub MCP (para guardar research en docs/)

**Revenue model:** Interno — multiplicador de velocidad de decisión.

**Wow factor:** "Tenía una reunión con un posible cliente de fintech mañana. Oracle ya había investigado su stack, su competencia, y preparado un brief en docs/research/."

**Feasibility:** 3/5 — Requiere triggers inteligentes para no generar ruido. Pero el concepto de "agente proactivo" es el futuro de la productividad.

---

### 5.3 — CHRONO: Timesheet Automático para SS

**Nombre:** CHRONO — Saber en Qué se Gasta el Tiempo Sin Trackear

**Concepto:** Genera automáticamente un desglose de tiempo de SS cruzando: commits/PRs en GitHub (¿qué proyectos?), reuniones en Calendar (¿con quién?), emails enviados (¿a qué clientes?). Útil para facturación, para entender rentabilidad de proyectos, y para reportar a inversores sin que nadie llene un timesheet.

**¿Por qué SDK?** Análisis de Git history (qué repo, qué branch, cuánto tiempo entre commits) + Work IQ (calendar time blocks, email activity) = reconstrucción automática de timesheet.

**Ingredientes:** Copilot SDK (Git tools) + Work IQ (Calendar, Mail) + GitHub MCP + Simple DB for aggregation

**Revenue model:** Interno primero, luego productizable. $5-10/usuario/mes. Agencies y consultoras pagarían $20-50/usuario/mes.

**Wow factor:** "Fin de mes y no llené el timesheet. CHRONO lo generó con 90% de accuracy a partir de mis commits y mi calendario."

**Feasibility:** 4/5 — Datos claramente disponibles. La heurística de asignación de tiempo a commits es el reto menor. Prototipo en 1 semana.

---

## Categoría 6: Wild Cards 🃏

### 6.1 — DIPLOMÁTICO: Agente de Comunicación Stakeholder

**Nombre:** DIPLOMÁTICO — Traduce Código a Negocio (y Viceversa)

**Concepto:** Un agente que vive entre el mundo técnico y el empresarial. Cuando un dev necesita explicar un problema técnico a un stakeholder, DIPLOMÁTICO lee el código/error, busca el contexto empresarial en Work IQ (¿qué le importa a ese stakeholder? ¿qué emails ha enviado sobre el tema?), y genera un draft de email en el tono correcto para esa persona. Viceversa: cuando un PM envía requisitos vagos, DIPLOMÁTICO los traduce a specs técnicas basadas en el código existente.

**¿Por qué SDK?** Lectura profunda de código para entender el problema técnico + Work IQ para entender al interlocutor humano. La combinación es única del SDK.

**Ingredientes:** Copilot SDK (code analysis) + Work IQ (Mail, people profiles, communication patterns) + GitHub MCP (issues, PRs)

**Revenue model:** $10/usuario/mes. Enterprise con custom communication templates: $300-1.000/mes.

**Wow factor:** "Le pedí a DIPLOMÁTICO que le explicara a la VP de Producto por qué el deploy se retrasó. Generó un email que mencionaba su prioridad (la demo del viernes) y explicaba el impacto en su lenguaje, no en el mío."

**Feasibility:** 3/5 — NLP + contexto personal de Work IQ. El reto es el tono correcto por persona.

---

### 6.2 — ESPEJO: Cultura de Ingeniería Scanner

**Nombre:** ESPEJO — ¿Cómo Es Realmente tu Cultura de Ingeniería?

**Concepto:** Meta-análisis de la organización: ¿los devs reviewan PRs en <24h? ¿Los PMs leen los docs técnicos? ¿Las decisiones de arquitectura se toman en reuniones o en Slack/Teams? ¿Hay "shadow IT" (repos sin CI/CD, docs sin owner)? ESPEJO escanea GitHub + Work IQ y genera un "Culture Report" con métricas y recomendaciones.

**¿Por qué SDK?** Escaneo masivo de repos (CI/CD configs, test coverage trends, documentation freshness) + patrones de comunicación (Work IQ) = una vista que ninguna herramienta individual puede dar.

**Ingredientes:** Copilot SDK (multi-repo analysis) + Work IQ (Teams engagement, email patterns, meeting culture) + GitHub MCP (org-wide repo stats) + Analytics dashboard

**Revenue model:** Consulting report: $5K-15K one-time. Continuous monitoring SaaS: $1K-5K/mes. Engineering leaders pagarían esto fácilmente.

**Wow factor:** "ESPEJO descubrió que el 40% de nuestras decisiones de arquitectura se toman en emails privados que nunca llegan a los ADRs. Y que los repos del equipo de mobile no tienen CI desde hace 3 meses."

**Feasibility:** 2/5 — Concepto ambicioso. Requiere acceso org-wide a GitHub Y M365. Pero el insight es INVALUABLE para engineering leaders. MVP limitado a un equipo en 3 semanas.

---

### 6.3 — LAZARILLO: Navegador de Codebase Conversacional

**Nombre:** LAZARILLO — "Llévame al Código que Importa"

**Concepto:** Interfaz conversacional donde un dev nuevo (o un PM curioso) puede preguntar cosas como "¿dónde se procesa el pago?" y LAZARILLO no solo encuentra el archivo — busca en Work IQ quién lo escribió, por qué (reunión/email donde se decidió), cuándo se modificó por última vez, si hay issues abiertos, y si alguien ha hablado sobre cambiarlo recientemente en Teams.

**¿Por qué SDK?** Navegación de codebase (filesystem, grep, Git) es EL caso de uso del SDK. Work IQ MCP enriquece con la historia humana detrás del código.

**Ingredientes:** Copilot SDK (filesystem, Git, code analysis) + Work IQ (people, Teams, Mail) + GitHub MCP (issues, PRs, wiki) + VS Code extension o web UI

**Revenue model:** Freemium — gratis para repos públicos. $8/dev/mes para privados. Enterprise: $200-800/mes con custom knowledge bases.

**Wow factor:** "Le pregunté a LAZARILLO '¿por qué usamos Redis aquí y no Memcached?' y me respondió: 'Carlos decidió Redis en la reunión del 15/3 porque necesitaban pub/sub. Aquí está el commit y aquí el fragmento de la reunión.'"

**Feasibility:** 4/5 — Es básicamente una sesión SDK enriquecida con MCP de Work IQ. El SDK ya navega código naturalmente. Prototipo en 1-2 semanas.

---

### 6.4 — OFRENDA: Propuesta Comercial Automática

**Nombre:** OFRENDA — De Conversación a Propuesta en 10 Minutos

**Concepto:** Cuando SS tiene una conversación con un posible cliente (por email, Teams, o reunión), OFRENDA analiza: qué pide el cliente, qué stack tiene (si se menciona), qué ha construido SS antes que sea similar (repos, issues cerrados), y genera una propuesta comercial personalizada con estimación de tiempo, coste, y referencias a trabajo previo.

**¿Por qué SDK?** Análisis de repos propios (¿qué hemos hecho antes? ¿cuánto tardamos?) + Work IQ (contexto de conversación con el cliente) + generación de documento.

**Ingredientes:** Copilot SDK (repo analysis, doc generation) + Work IQ (Mail, Calendar, Teams with client) + GitHub MCP (past projects) + Proposal template engine

**Revenue model:** Interno primero, luego vendible a agencies/consultoras. $100-500/mes. O pay-per-proposal: $20-50/propuesta generada.

**Wow factor:** "Tuve una call de 30 min con un cliente. OFRENDA generó una propuesta de 4 páginas con scope, timeline basado en proyectos similares nuestros, y un presupuesto calibrado. Solo tuve que revisar y enviar."

**Feasibility:** 3/5 — El input (conversación) puede ser ruidoso. Pero combinado con templates y datos históricos, el output puede ser 80% usable.

---

### 6.5 — ARCHIVO VIVO: Documentación que se Actualiza Sola

**Nombre:** ARCHIVO VIVO — Docs que Nunca Envejecen

**Concepto:** Agente que monitorea cambios en código (GitHub webhooks) y, cuando detecta que un cambio invalida documentación existente, automáticamente actualiza los docs, genera el PR, y busca en Work IQ si hay stakeholders que deberían ser notificados del cambio (ej: si cambias una API, notificar a los equipos que la consumen según el historial de emails/Teams).

**¿Por qué SDK?** Lectura de código + diffs + actualización de archivos markdown/docs = herramientas nativas del SDK. Work IQ identifica a los humanos afectados.

**Ingredientes:** Copilot SDK (filesystem, Git, code analysis) + Work IQ (people, Teams, Mail) + GitHub MCP (PRs, webhooks) + GitHub Actions trigger

**Revenue model:** $10/repo/mes. Enterprise: $500-2.000/mes por organización. Open source freemium tier.

**Wow factor:** "Cambié un parámetro de API. ARCHIVO VIVO actualizó el README, generó un PR de docs, y mandó un mensaje en Teams al equipo de frontend que consume esa API. Todo automático."

**Feasibility:** 4/5 — Detección de cambio es straightforward (webhook + diff analysis). La actualización inteligente de docs es el reto menor con el SDK. Prototipo en 1-2 semanas.

---

## Matriz de Priorización (Top 10)

| # | Proyecto | Impacto | Feasibility | Revenue Potencial | Diferenciación | **Score** |
|---|----------|---------|-------------|-------------------|----------------|-----------|
| 1 | **NEXUS** | 🔥🔥🔥🔥🔥 | 3/5 | $5K-25K/año/empresa | Nadie combina code+meeting context | **⭐⭐⭐⭐⭐** |
| 2 | **CENTINELA** | 🔥🔥🔥🔥🔥 | 2/5 | $10K-50K/año | EU AI Act = urgencia masiva | **⭐⭐⭐⭐⭐** |
| 3 | **PULSO** | 🔥🔥🔥🔥 | 3/5 | $3K-15K/año/equipo | DevEx analytics reales, no vanity | **⭐⭐⭐⭐** |
| 4 | **StandupZero** | 🔥🔥🔥🔥 | 4/5 | $8/dev/mes freemium | Rápido de construir, viral | **⭐⭐⭐⭐** |
| 5 | **FORJA+** | 🔥🔥🔥🔥 | 4/5 | $5K-25K/proyecto | Evolución natural de FORJA | **⭐⭐⭐⭐** |
| 6 | **HERMES** | 🔥🔥🔥 | 4/5 | $100-500/mes/repo | Quick win, fácil demo | **⭐⭐⭐⭐** |
| 7 | **ARCHIVO VIVO** | 🔥🔥🔥 | 4/5 | $10/repo/mes | Docs actualizados = dolor universal | **⭐⭐⭐⭐** |
| 8 | **LAZARILLO** | 🔥🔥🔥 | 4/5 | Freemium→$8/dev/mes | Onboarding magic | **⭐⭐⭐** |
| 9 | **SQUAD²** | 🔥🔥🔥🔥 | 4/5 | Interno (ahorro 5h/sem) | Mejora SS directamente | **⭐⭐⭐** |
| 10 | **CHRONO** | 🔥🔥🔥 | 4/5 | $5-50/user/mes | Timesheets sin esfuerzo | **⭐⭐⭐** |

### Criterios de Scoring
- **Impacto:** ¿Cuánto dolor resuelve? ¿Para cuánta gente?
- **Feasibility:** ¿SS puede construirlo con recursos actuales (€500/mo, Squad, SDK preview)?
- **Revenue:** ¿Cuánto pagarían? ¿Cuántos clientes potenciales?
- **Diferenciación:** ¿Alguien más puede hacer esto sin SDK + Work IQ?

### Observaciones Clave

1. **El patrón ganador es CODE + CONTEXT:** Todas las ideas top combinan análisis de código (SDK) con contexto empresarial (Work IQ). Esta intersección es DESIERTA. Nadie la ocupa.

2. **Quick wins vs Moonshots:** StandupZero, HERMES, CHRONO y ARCHIVO VIVO son construibles en 1-2 semanas. NEXUS y CENTINELA son los moonshots de alto valor.

3. **Work IQ es el multiplicador:** Sin Work IQ, muchas de estas ideas son "otro bot de GitHub". CON Work IQ, son productos que entienden el CONTEXTO HUMANO detrás del código.

4. **EU AI Act = market timing perfecto:** CENTINELA apunta a un pain que se intensifica en agosto 2026. El 61% de empresas no pasan auditorías. El timing no podría ser mejor.

---

## Próximos Pasos

### Inmediato (esta semana)
1. **Seleccionar 1-2 ideas para PoC** — Recomendación: StandupZero (quick win, 1 semana) + NEXUS (moonshot, 2 semanas)
2. **Validar acceso Work IQ** — Confirmar que la integración MCP funciona con los permisos de joperezd
3. **Crear issues en GitHub** — Cada idea seleccionada → issue con spec básica

### Corto plazo (2-4 semanas)
4. **PoC de StandupZero** — Cron + SDK + Work IQ → standup generado → canal de Teams
5. **PoC de NEXUS** — Trigger en issue assign → SDK analiza código + Work IQ busca contexto → enrich issue
6. **Evaluar FORJA+** — ¿Hay cliente potencial para una extensión Copilot con contexto M365?

### Medio plazo (1-3 meses)
7. **CENTINELA MVP** — Empezar con "model card generator" que escanea repos buscando modelos AI
8. **PULSO MVP** — Dashboard simple: GitHub stats + Calendar stats, side-by-side por dev
9. **Pricing research** — Validar willingness-to-pay con 5-10 engineering leaders

### Decisiones necesarias
- ¿Priorizar productos vendibles (NEXUS, CENTINELA) o mejoras internas (SQUAD², CHRONO)?
- ¿Empezar con StandupZero como "trojan horse" para validar el patrón SDK + Work IQ?
- ¿FORJA+ como servicio a clientes enterprise es viable con el equipo actual de SS?

---

*Oracle ve los patrones. El patrón aquí es claro: la intersección CODE × CONTEXT es un campo vacío esperando a que alguien lo ocupe. La pregunta no es "¿cuál idea?" sino "¿cuántas podemos lanzar antes de que alguien más lo vea?"*
