# Arquitectura: Copilot SDK + Work IQ — Patrones y Viabilidad

> **Autor:** Morpheus (Lead/Architect)  
> **Fecha:** 2026-07-09  
> **Estado:** Análisis de viabilidad completo  
> **Solicitado por:** joperezd  
> **Inputs:** `copilot-sdk-research.md`, `copilot-sdk-chat-patterns.md`, decisiones activas

---

## TLDR

La combinación Copilot SDK + MCP + Work IQ abre una brecha arquitectónica que casi nadie ha explorado: **agentes que entienden código Y contexto empresarial simultáneamente**. La viabilidad técnica es alta para patrones basados en eventos y orquestación backend, pero baja para sesiones interactivas en tiempo real (latencia combinada ~3-6s). La oportunidad real no es un solo producto — es un **patrón puente reutilizable** entre GitHub y M365 que puede alimentar múltiples productos. Para SS (€500/mo, equipo autónomo), la arquitectura viable es un orquestador event-driven en Azure Functions que conecta ambos mundos vía MCP, no una UI conversacional en tiempo real. Recomendación: empezar por el Patrón B (Automated Bridge) como infraestructura compartida y construir productos encima.

---

## 1. Pipeline SDK + MCP + Work IQ

### El Diagrama Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAPA DE ORQUESTACIÓN                      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              Copilot SDK (CopilotClient)                  │    │
│  │  • Planificación agéntica multi-step                      │    │
│  │  • Gestión de contexto y compactación                     │    │
│  │  • Selección y encadenamiento de tools                    │    │
│  │  • Streaming de respuestas                                │    │
│  └────────┬──────────────────┬───────────────────┬──────────┘    │
│           │                  │                   │                │
│           ▼                  ▼                   ▼                │
│  ┌──────────────┐  ┌─────────────────┐  ┌────────────────┐      │
│  │  MCP Server  │  │  MCP Server     │  │  MCP Server    │      │
│  │  GitHub/Code │  │  Work IQ/M365   │  │  Dominio SS    │      │
│  │              │  │                 │  │                │      │
│  │  • repos     │  │  • emails       │  │  • fiscal      │      │
│  │  • issues    │  │  • calendar     │  │  • deploy      │      │
│  │  • PRs       │  │  • documents    │  │  • analytics   │      │
│  │  • actions   │  │  • teams msgs   │  │  • monitoring  │      │
│  │  • code srch │  │  • people       │  │  • custom      │      │
│  └──────┬───────┘  └───────┬─────────┘  └───────┬────────┘      │
│         │                  │                    │                 │
└─────────┼──────────────────┼────────────────────┼────────────────┘
          │                  │                    │
          ▼                  ▼                    ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  GitHub API  │  │  Microsoft Graph │  │  APIs Externas   │
│  REST + GQL  │  │  + M365 Copilot  │  │  AEAT, Bancos,   │
│              │  │                  │  │  WCAG, etc.      │
│  Auth:       │  │  Auth:           │  │  Auth:           │
│  GH_TOKEN /  │  │  Azure AD /      │  │  API keys /     │
│  OAuth App   │  │  OAuth2 + MSAL   │  │  OAuth2         │
└──────────────┘  └──────────────────┘  └──────────────────┘
```

### Roles de Cada Componente

| Componente | Rol | Analogía |
|-----------|-----|---------|
| **Copilot SDK** | Orquestador — decide qué tools invocar, en qué orden, y sintetiza resultados | El cerebro |
| **MCP** | Protocolo de transporte — interfaz estándar para conectar tools heterogéneos | El sistema nervioso |
| **Work IQ** | Proveedor de datos M365 — emails, reuniones, documentos, personas, mensajes Teams | Los sentidos empresariales |
| **GitHub API** | Proveedor de datos de código — repos, issues, PRs, Actions, code search | Los sentidos técnicos |

### El Insight Clave

**MCP es el multiplicador de fuerza.** Sin MCP, conectar SDK + Work IQ requiere adaptadores ad-hoc para cada flujo de datos. Con MCP, cada fuente de datos se expone como un servidor estandarizado que cualquier cliente MCP puede consumir — incluido el Copilot SDK, Vercel AI SDK, Claude, o cualquier futuro framework. **La inversión en MCP servers es permanente; la inversión en un SDK específico es temporal.**

---

## 2. Patrones de Flujo de Datos

### Patrón 2.1: Consulta Dual (Code + Business Context)

```
Usuario: "¿Qué issues están bloqueados por la decisión del Q3 sobre migración a Azure?"

SDK Agent:
  1. Work IQ → buscar emails/documentos sobre "decisión Q3 migración Azure"
     ← Encuentra: email del CTO del 15-jun, doc en SharePoint "Plan Azure Q3"
  2. GitHub MCP → buscar issues con label "azure-migration" estado "blocked"
     ← Encuentra: Issue #234 "Migrate auth to Azure AD", Issue #267 "Move CI to Azure Pipelines"
  3. Sintetizar → Cruzar documentos M365 con issues GitHub
     ← Respuesta: "Issues #234 y #267 están bloqueados. La decisión del CTO
        (email 15-jun) requiere primero completar la auditoría SOC2 (doc SharePoint).
        Recomiendo priorizar issue #189 (SOC2 prep) como desbloqueante."
```

**Flujo de datos:**
```
Request → SDK (planifica) → [Work IQ MCP | GitHub MCP] (paralelo) → SDK (sintetiza) → Response
                                    │                │
                              MS Graph API     GitHub REST API
                              (OAuth2/MSAL)    (GH_TOKEN)
```

### Patrón 2.2: Evento M365 → Acción GitHub

```
Trigger: Nueva reunión "Sprint Planning" detectada en calendario M365

Pipeline:
  1. Work IQ MCP → Leer agenda de la reunión + notas previas
  2. Work IQ MCP → Leer mensajes de Teams del canal del equipo (últimos 7 días)
  3. GitHub MCP → Listar PRs mergeados desde último sprint
  4. GitHub MCP → Listar issues cerrados + nuevos
  5. SDK Agent → Generar "Sprint Report" con:
     - PRs completados (GitHub)
     - Temas discutidos (Teams)
     - Decisiones tomadas (emails/docs SharePoint)
     - Issues propuestos para siguiente sprint
  6. GitHub MCP → Crear issue "Sprint Report — [fecha]" con contenido generado
  7. Work IQ MCP → Enviar resumen a canal de Teams
```

### Patrón 2.3: Código Consciente de Contexto Empresarial

```
Desarrollador: "@agent ¿Es seguro deprecar el endpoint /api/v1/invoices?"

SDK Agent:
  1. GitHub MCP → Analizar uso de /api/v1/invoices (grep en repos, dependencias)
     ← 3 repos lo usan internamente, 2 workflows de Actions
  2. Work IQ MCP → Buscar comunicaciones sobre este endpoint
     ← Email de soporte (hace 2 semanas): "Cliente ACME reporta integración con /api/v1/invoices"
     ← Doc SharePoint: "API Contracts — ACME" menciona este endpoint
  3. Sintetizar → "NO deprecar. Cliente ACME tiene integración activa según email
     de soporte del 25-jun y contrato API documentado en SharePoint.
     Recomiendo: crear /api/v2/invoices con backward compatibility."
```

### Modelo de Autenticación Dual

Este es el desafío arquitectónico central. Los dos mundos requieren auth completamente diferente:

```
┌─────────────────────────────────────────────────────┐
│              Orquestador (Azure Function)             │
│                                                       │
│  ┌─────────────────┐     ┌──────────────────────┐    │
│  │  GitHub Auth     │     │  M365 Auth            │    │
│  │                 │     │                      │    │
│  │  GH_TOKEN       │     │  MSAL + OAuth2       │    │
│  │  (PAT o App)    │     │  (delegated flow)    │    │
│  │                 │     │                      │    │
│  │  Scopes:        │     │  Scopes:             │    │
│  │  • repo         │     │  • Mail.Read         │    │
│  │  • issues       │     │  • Calendars.Read    │    │
│  │  • actions      │     │  • Files.Read.All    │    │
│  │  • read:org     │     │  • Chat.Read         │    │
│  │                 │     │  • User.Read.All     │    │
│  └────────┬────────┘     └──────────┬───────────┘    │
│           │                        │                  │
│           ▼                        ▼                  │
│  ┌──────────────┐       ┌──────────────────┐         │
│  │ GitHub MCP   │       │ Work IQ MCP      │         │
│  │ Server       │       │ Server           │         │
│  └──────────────┘       └──────────────────┘         │
└───────────────────────────────────────────────────────┘
```

**Solución:** El orquestador (Azure Function / Container App) mantiene **dos conjuntos de credenciales** como secretos de entorno:
- **GitHub:** PAT o GitHub App installation token (rotación automática)
- **M365:** Service principal con certificado + MSAL Confidential Client (auto-refresh)

**¿Puede una sesión del SDK acceder a ambos?** Sí, con MCP. El SDK no necesita saber de M365. El MCP server de Work IQ maneja su propia auth contra Graph/M365. El SDK simplemente invoca tools MCP y recibe resultados. **MCP es la capa de abstracción de auth.**

---

## 3. La Oportunidad "Puente"

### El Problema Que Nadie Ha Resuelto

GitHub y Microsoft 365 son dos de los ecosistemas más grandes del planeta:
- **GitHub:** 200M+ repos, 100M+ devs, el sistema de código del mundo
- **M365:** 400M+ usuarios pagados, email/calendar/docs del mundo corporativo

Ambos son de Microsoft. Y sin embargo, **la conexión entre ellos es prácticamente nula**:
- Los issues de GitHub no saben nada de los emails de Outlook
- Los PRs no conocen las decisiones tomadas en reuniones de Teams
- Los deployments no se reflejan en la documentación de SharePoint
- Los roadmaps técnicos viven desconectados de los objetivos de negocio

### Por Qué Es Difícil

1. **Modelos de datos incompatibles:** GitHub piensa en repos/issues/commits. M365 piensa en users/messages/files. No hay schema compartido.
2. **Auth divergente:** GitHub OAuth vs Azure AD. Dos identity providers, dos modelos de permisos.
3. **Culturas diferentes:** Los devs viven en GitHub. Los managers viven en Outlook/Teams. Ni siquiera *quieren* cruzarse.
4. **Sensibilidad asimétrica:** El código suele ser propiedad de la empresa. Los emails son del individuo. Las reglas de compliance son diferentes.

### Por Qué MCP + SDK Lo Hacen Posible Ahora

Antes de MCP, construir un puente requería:
- Adapters custom para cada API (GitHub REST, Graph, etc.)
- Lógica de orquestación from scratch
- Manejo de auth dual manual

Con MCP + SDK:
- Cada API se expone como MCP server estandarizado
- El SDK orquesta la planificación (qué tools invocar, en qué orden)
- La auth se encapsula en cada MCP server
- **El "puente" es un MCP server que habla con otro MCP server**

### Oportunidades Concretas del Puente

| Oportunidad | GitHub ↔ M365 | Valor |
|-------------|-------------|-------|
| **Sprint Intelligence** | Issues/PRs ↔ Reuniones/Teams | Los sprint plannings usan datos reales de ambos lados |
| **Decision Traceability** | Commits/PRs ↔ Emails/Docs | "¿Por qué se hizo este cambio?" tiene respuesta empresarial |
| **Stakeholder Updates** | Releases/Deployments ↔ Emails/Teams | Notificaciones automáticas a no-técnicos cuando algo se deploya |
| **Risk Detection** | Code changes ↔ Client contracts | "Este PR toca el endpoint que usa el cliente ACME" |
| **Knowledge Sync** | README/docs ↔ SharePoint/OneDrive | Documentación técnica siempre sincronizada con documentación de negocio |
| **Resource Planning** | Velocity/burndown ↔ Calendar/availability | Planning que sabe cuándo el equipo tiene reuniones |

### El Insight Estratégico

> **Quien controle el puente GitHub ↔ M365 controla la conversación entre el mundo técnico y el mundo empresarial.** Esto no es un producto — es una **plataforma**. Y ahora mismo, nadie la está construyendo.

---

## 4. Restricciones Técnicas

### 4.1 Latencia Combinada

| Componente | Latencia típica | Peor caso |
|-----------|----------------|-----------|
| SDK subprocess (CLI start) | ~400ms | ~1.5s |
| SDK session creation | ~1.2s | ~3s |
| GitHub API call (REST) | ~200ms | ~800ms |
| Work IQ / Graph API call | ~300ms | ~1.5s |
| LLM inference (GPT-4.1) | ~1-3s | ~8s |
| MCP tool roundtrip (local) | ~50ms | ~200ms |
| MCP tool roundtrip (remote) | ~200ms | ~800ms |

**Escenario: Consulta dual (code + business):**
```
SDK startup:     ~1.6s
LLM planning:    ~1.5s
GitHub MCP call:  ~0.4s  ┐
Work IQ call:     ~0.5s  ┘ (paralelo → ~0.5s)
LLM synthesis:    ~2.0s
─────────────────────────
Total:           ~5.6s (primer turno)
Turnos siguientes: ~3-4s (sin startup)
```

**Veredicto:** Para **chat interactivo en tiempo real**, 5.6s es inaceptable. Para **workflows automáticos** (event-driven, batch, background), es perfectamente viable. Para experiencias de usuario, usar streaming para mitigar la percepción de latencia.

**Optimización crítica:** External Server Mode del SDK. Si el CLI corre como servicio persistente, se eliminan 1.6s de startup. Turnos siguientes bajan a ~3s.

### 4.2 Rate Limits

| API | Límite | Implicación |
|-----|--------|-------------|
| **Copilot SDK (con suscripción)** | 300 premium requests/mes (Pro), 1500 (Pro+) | Overage a $0.04/req. Para batch jobs, considerar BYOK. |
| **GitHub REST API** | 5,000/hora (authenticated) | Suficiente para la mayoría de escenarios |
| **GitHub GraphQL** | 5,000 puntos/hora | Consultas complejas consumen más puntos |
| **Microsoft Graph API** | 10,000/10min por app + 10,000/10min por tenant | Generoso. El cuello de botella no está aquí. |
| **Work IQ (M365 Copilot)** | Depende del tier: Business/Enterprise | No documentado públicamente con granularidad. Usar Graph directo para volumen. |
| **Azure OpenAI (BYOK)** | Configurable (TPM) | Escalar según necesidad. €30-50/mo para SS volumes. |

**Estrategia anti-rate-limit:**
1. **Cachear agresivamente** resultados de Graph/GitHub que no cambian frecuentemente (org chart, repo metadata)
2. **BYOK para batch** — usar Azure OpenAI propio para jobs de alto volumen, Copilot para sesiones interactivas
3. **Webhook-driven** en lugar de polling — tanto GitHub (webhooks) como Graph (change notifications) lo soportan

### 4.3 Auth Dual — ¿Pueden Coexistir?

**Sí, pero con matices:**

| Aspecto | Solución | Complejidad |
|---------|---------|-------------|
| **Dos identity providers** | Service principal (M365) + GitHub App (GitHub) | Media — config one-time |
| **Token refresh** | MSAL auto-refresh para M365, GitHub App installation tokens (1h, auto-renew) | Baja — las librerías lo manejan |
| **User consent** | Delegated flow para M365 (usuario autoriza una vez), GitHub OAuth app | Media — UX de autorización dual |
| **Secrets management** | Azure Key Vault para ambos sets de credenciales | Baja — patrón estándar |
| **Tenant isolation** | Cada despliegue tiene su propio service principal M365 | Alta si multi-tenant |

**Patrón recomendado para SS:**
```
Azure Key Vault
  ├── github-app-private-key     → GitHub MCP Server
  ├── github-app-installation-id → GitHub MCP Server
  ├── m365-client-id             → Work IQ MCP Server
  ├── m365-client-secret         → Work IQ MCP Server
  └── m365-tenant-id             → Work IQ MCP Server
```

### 4.4 Sensibilidad de Datos M365

**Este es el restrictor más serio.** Los datos de M365 son inherentemente sensibles:
- Emails contienen información confidencial, contratos, datos personales
- Documentos de SharePoint pueden tener clasificación interna
- Mensajes de Teams incluyen conversaciones privadas

**Principios de manejo:**

| Principio | Implementación |
|-----------|---------------|
| **Least privilege** | Scopes mínimos en Graph. Solo `Mail.Read`, no `Mail.ReadWrite`. |
| **No persistencia** | Datos de M365 se procesan en memoria, nunca se almacenan en DB propia |
| **Audit trail** | Log de cada acceso a Graph con timestamp, scope, y user context |
| **User consent** | Flujo delegado — el usuario debe autorizar explícitamente |
| **Data residency** | Procesamiento en Azure West Europe (misma región que los datos M365) |
| **Redacción** | Antes de enviar datos al LLM, redactar PII/emails/teléfonos si no son relevantes |
| **Compliance labels** | Respetar Microsoft Information Protection (MIP) labels en documentos |

**Arquitectura de seguridad:**
```
Work IQ MCP Server
  ├── Auth layer (MSAL, delegated)
  ├── Scope filter (solo scopes autorizados)
  ├── PII redactor (antes de pasar al SDK/LLM)
  ├── Audit logger (cada operación registrada)
  └── Response sanitizer (no devolver raw data sensible)
```

### 4.5 Costes Estimados del Stack Combinado

| Componente | Coste/mes | Notas |
|-----------|----------|-------|
| Azure Functions (orquestador) | €5-10 | Consumption plan |
| Azure OpenAI (BYOK, GPT-4.1) | €30-50 | ~50K tokens/día |
| Azure Key Vault | €1 | Operaciones secretos |
| MCP servers (3-4 Functions) | €5-10 | Consumption plan |
| Copilot Pro (ya pagado) | €0 | Para sesiones interactivas |
| Graph API | €0 | Incluido en M365 |
| **Total incremental** | **€41-71/mo** | Dentro del presupuesto €500/mo |

---

## 5. Plantillas de Arquitectura

### Patrón A: "Code-Aware Business Bot"

**Concepto:** Un agente que responde preguntas de negocio con consciencia del estado del código.

**Ejemplo:** "¿Cuál es el estado real del proyecto X?" — responde combinando issues/PRs (GitHub) con reuniones/emails (M365).

```
┌──────────────┐
│  Usuario     │
│  (Manager)   │
└──────┬───────┘
       │ "¿Estado del proyecto X?"
       ▼
┌──────────────────────────────────────────────┐
│  SDK Agent (system: project status expert)    │
│                                               │
│  Plan:                                        │
│  1. GitHub MCP → issues abiertos + PRs        │
│  2. Work IQ MCP → última reunión de status    │
│  3. Work IQ MCP → emails recientes del team   │
│  4. Sintetizar → informe ejecutivo             │
└──────────────────────────────────────────────┘
       │
       ▼
  "Proyecto X: 73% completado. 12 issues abiertos
   (3 críticos). Último deployment hace 2 días.
   En la reunión del martes, el equipo escaló
   el issue de performance (#456). No hay blockers
   reportados en emails esta semana."
```

**Viabilidad:** ⭐⭐⭐⭐ — Técnicamente sólido. La latencia de ~4-5s es aceptable para consultas ad-hoc. Valor alto para managers que no quieren navegar entre GitHub y Outlook.

**Complejidad:** Media. Requiere dos MCP servers + orquestador. Auth dual necesaria.

### Patrón B: "Automated Bridge" (Event-Driven)

**Concepto:** Eventos en M365 disparan acciones en GitHub y viceversa, sin intervención humana.

```
┌─────────────────────────────────────────────────────────────┐
│                    EVENT SOURCES                              │
│                                                               │
│  GitHub Webhooks              Graph Change Notifications      │
│  ├── issues.closed            ├── mail.received               │
│  ├── pull_request.merged      ├── event.created (calendar)    │
│  ├── release.published        ├── chatMessage.created (Teams) │
│  └── workflow_run.completed   └── driveItem.updated (SP)      │
└──────────┬──────────────────────────────────┬────────────────┘
           │                                  │
           ▼                                  ▼
┌──────────────────────────────────────────────────────────────┐
│              ORCHESTRATOR (Azure Function / Event Grid)        │
│                                                                │
│  Event Router:                                                 │
│  ├── issue.closed → Update Teams channel + Sprint doc          │
│  ├── PR.merged → Notify stakeholders via email                 │
│  ├── release.published → Post to Teams + Update SharePoint     │
│  ├── meeting.created("Sprint") → Pre-generate sprint report    │
│  ├── email(from:client, re:API) → Create GitHub issue          │
│  └── doc.updated(SharePoint:"specs") → Create/update issues    │
│                                                                │
│  SDK Agent (opcional): Para decisiones complejas que            │
│  requieren razonamiento (e.g., clasificar prioridad)           │
└──────────────────────────────────────────────────────────────┘
```

**Viabilidad:** ⭐⭐⭐⭐⭐ — La mejor ratio valor/complejidad. Event-driven elimina el problema de latencia (no hay usuario esperando). Encaja perfectamente con la filosofía autónoma de SS.

**Por qué es el más prometedor:**
1. **Sin latencia percibida** — procesa en background
2. **Escalable** — Azure Functions scale automáticamente
3. **Composable** — cada event handler es independiente
4. **Mesurable** — cada flujo tiene input/output claro
5. **Alíneado con SS** — event-driven es exactamente cómo opera Squad

### Patrón C: "Intelligence Dashboard"

**Concepto:** Ambas fuentes de datos alimentan un dashboard unificado que muestra el estado completo de un proyecto — técnico y empresarial.

```
┌─────────────────────────────────────────────────────────────┐
│              DASHBOARD (React PWA)                            │
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                  │
│  │  Code Health      │  │  Business Pulse   │                  │
│  │                  │  │                  │                  │
│  │  • Open issues   │  │  • Client emails  │                  │
│  │  • PR velocity   │  │  • Meeting count  │                  │
│  │  • Test coverage │  │  • Decision log   │                  │
│  │  • Deploy freq   │  │  • Stakeholder    │                  │
│  │  • Tech debt     │  │    sentiment      │                  │
│  └──────────────────┘  └──────────────────┘                  │
│                                                               │
│  ┌──────────────────────────────────────────┐                │
│  │  Cross-Domain Insights (AI-generated)    │                │
│  │                                          │                │
│  │  "⚠ Issue #456 (performance) mentioned   │                │
│  │   in 3 client emails this week.          │                │
│  │   Risk: client escalation likely."       │                │
│  │                                          │                │
│  │  "✅ Sprint velocity up 20%. Calendar    │                │
│  │   shows 30% fewer meetings this week —   │                │
│  │   likely correlation."                   │                │
│  └──────────────────────────────────────────┘                │
└──────────────────────────────────────────────────────────────┘
          │                          │
          ▼                          ▼
  ┌───────────────┐       ┌───────────────────┐
  │ GitHub MCP    │       │ Work IQ MCP       │
  │ (batch/cron)  │       │ (batch/cron)      │
  └───────────────┘       └───────────────────┘
```

**Viabilidad:** ⭐⭐⭐ — Alto valor pero alta complejidad. Requiere frontend, backend batch, almacenamiento de métricas, y diseño UX. Mejor como evolución del Patrón B, no como primer paso.

### Patrón D: "Context-Aware Squad" (SS-Específico)

**Concepto:** El sistema Squad de SS se enriquece con contexto empresarial. Los agentes autónomos no solo leen código — entienden el contexto de negocio de lo que están construyendo.

```
┌──────────────────────────────────────────────────────────────┐
│                SQUAD ORCHESTRATION LAYER                       │
│                                                                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐              │
│  │  Morpheus  │  │  Trinity   │  │  Tank      │              │
│  │  (Lead)    │  │  (Frontend)│  │  (Cloud)   │              │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘              │
│        │               │               │                      │
│        ▼               ▼               ▼                      │
│  ┌──────────────────────────────────────────────────┐         │
│  │         SDK Agent Session (per agent)             │         │
│  │                                                   │         │
│  │  Tools disponibles:                               │         │
│  │  ├── GitHub MCP (issues, PRs, code)              │         │
│  │  ├── Work IQ MCP (emails, docs, meetings)        │         │
│  │  ├── SS MCP (deploy, monitor, fiscal)            │         │
│  │  └── Filesystem (código local)                   │         │
│  └──────────────────────────────────────────────────┘         │
│                                                                │
│  Ejemplo de enriquecimiento:                                   │
│  Morpheus evalúa issue #78:                                    │
│  1. Lee issue (GitHub) → "Implementar auth OAuth"              │
│  2. Lee emails del cliente (Work IQ) → "ACME necesita SSO"     │
│  3. Lee doc de arquitectura (SharePoint) → "OAuth2 + SAML"     │
│  4. Decisión informada: Priorizar SSO sobre OAuth básico       │
└──────────────────────────────────────────────────────────────┘
```

**Viabilidad:** ⭐⭐⭐⭐ — Alto valor para SS específicamente. El Squad ya existe; añadir Work IQ como fuente de contexto es incremental. El riesgo principal es que el Squad actual no tiene clientes M365 — SS opera casi exclusivamente en GitHub.

**Cuándo tiene sentido:** Cuando SS tenga clientes enterprise (FORJA) que vivan en M365. Hasta entonces, es preparación de infraestructura.

---

## 6. Arquitectura para SS

### Restricciones Reales de SS

| Restricción | Impacto |
|-------------|---------|
| **€500/mo Azure** | Los patrones deben usar Consumption/Serverless. Nada de VMs always-on. |
| **Equipo autónomo** | Preferir event-driven sobre interactivo. Minimizar mantenimiento manual. |
| **Sin clientes M365 aún** | Work IQ es preparación, no necesidad inmediata. Invertir en la infra, no en productos que la usen. |
| **Copilot ya pagado** | 300 requests/mes incluidos. Usar BYOK para batch. |
| **Stack Node.js + Azure** | MCP servers en Azure Functions (Node.js). Sin polyglot innecesario. |

### Arquitectura MVP: "Bridge Foundation"

El MVP no es un producto — es la **infraestructura puente** que habilita múltiples productos futuros.

```
┌──────────────────────────────────────────────────────────────┐
│                    BRIDGE FOUNDATION (MVP)                     │
│                                                                │
│  Capa 1: MCP Servers (Azure Functions, Node.js)               │
│  ┌────────────────┐  ┌──────────────────┐                     │
│  │ mcp-github     │  │ mcp-m365         │                     │
│  │ (ya existe     │  │ (nuevo)          │                     │
│  │  parcialmente) │  │                  │                     │
│  │                │  │ Tools:           │                     │
│  │ Tools:         │  │ • read_emails    │                     │
│  │ • list_issues  │  │ • search_docs    │                     │
│  │ • get_pr       │  │ • get_meetings   │                     │
│  │ • search_code  │  │ • read_teams     │                     │
│  │ • create_issue │  │ • get_people     │                     │
│  └────────────────┘  └──────────────────┘                     │
│                                                                │
│  Capa 2: Orquestador Event-Driven (Azure Event Grid + Funcs)  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Event Handlers:                                          │ │
│  │ • PR merged → Teams notification                         │ │
│  │ • Issue created from email → auto-label + assign         │ │
│  │ • Release published → SharePoint changelog update        │ │
│  │ • Sprint meeting created → auto-generate report          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Capa 3: SDK Agent (Azure Container App, scale-to-zero)       │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Para decisiones que requieren razonamiento:              │ │
│  │ • Clasificar prioridad de issue basado en contexto M365  │ │
│  │ • Generar sprint reports con ambas fuentes               │ │
│  │ • Evaluar riesgo de PR vs contratos de clientes          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Capa 4: Configuración y Secretos                              │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Azure Key Vault:                                         │ │
│  │ • GitHub App credentials                                 │ │
│  │ • M365 Service Principal                                 │ │
│  │ • Azure OpenAI key (BYOK)                                │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

Coste estimado MVP: €41-71/mo (dentro del presupuesto)
```

### Roadmap de Implementación

| Fase | Entregable | Tiempo | Coste |
|------|-----------|--------|-------|
| **F0: MCP Server M365** | `mcp-m365` con 5 tools básicas (emails, docs, calendar, teams, people) | 1-2 semanas | €5/mo |
| **F1: Event Bridge** | 2-3 event handlers (PR→Teams, Release→SharePoint) | 1 semana | €5/mo |
| **F2: SDK Orquestador** | Agente que combina ambas fuentes para sprint reports | 1-2 semanas | €30-50/mo |
| **F3: Primer producto** | Elegir: Sprint Intelligence (FORJA client) o Squad-enriched | 2-3 semanas | +€0 (reutiliza F0-F2) |

### Qué NO Hacer

1. **No construir un chat interactivo** — la latencia dual (SDK + Graph) lo hace inviable como UX primaria
2. **No almacenar datos M365** — procesarlos in-memory, nunca persistir emails/docs de otros
3. **No hacer multi-tenant M365** en el MVP — empezar con el tenant de SS/joperezd
4. **No usar el SDK para flujos simples** — si un event handler solo necesita llamar a Graph y crear un issue, usar las APIs directamente sin SDK
5. **No invertir en UI Dashboard** todavía — el valor está en la automatización, no en la visualización

---

## 7. Recomendación

### La Tesis Arquitectónica

La combinación SDK + MCP + Work IQ no es un producto. Es una **capa de infraestructura** que habilita una nueva categoría: **agentes que operan en la intersección de código y negocio**. Esta intersección es un espacio casi vacío — nadie lo está construyendo porque requiere expertise en ambos mundos (dev tools + enterprise productivity) y ambos ecosistemas (GitHub + M365).

SS tiene una ventaja asimétrica aquí:
1. Ya opera Squad (orquestación multi-agente probada)
2. Ya tiene MCP server propio (11 tools)
3. Ya usa Copilot SDK/CLI diariamente
4. Stack alineado: Azure + Node.js + GitHub

### Decisión de Arquitectura

**Adoptar el Patrón B (Automated Bridge) como infraestructura base.**

Razones:
- Event-driven = sin problema de latencia
- Serverless = dentro del presupuesto
- Composable = los event handlers son independientes y testables
- Extensible = cualquier producto futuro puede conectarse a los MCP servers

### Prioridad de Inversión

```
1. mcp-m365 server           (alta prioridad — es el activo reutilizable)
2. Event bridge handlers     (media prioridad — demostrar valor rápido)
3. SDK orquestador           (baja prioridad — solo para decisiones complejas)
4. Dashboard / UI            (no prioridad — valor secundario por ahora)
```

### El Metric que Importa

No medir por "features shipped". Medir por: **¿Cuántas decisiones técnicas se enriquecieron con contexto empresarial sin intervención humana?**

Si un PR se mergea y automáticamente notifica a los stakeholders correctos, si un sprint report se genera con datos de ambos mundos, si un issue de cliente se crea automáticamente desde un email — eso es el puente funcionando.

### Relación con Decisiones Previas

- **Vercel AI SDK para B2C** (decisión 2026-07-08): No cambia. Los productos B2C (AUTONOMO.AI, AccesoPulse) usan Vercel AI SDK. El puente SDK + Work IQ es para **productos B2B/internos** donde el usuario es un dev o manager con acceso M365.
- **Copilot SDK para FORJA + Squad** (decisión 2026-07-08): Se refuerza. FORJA puede ofrecer "extensiones Copilot con contexto M365" como servicio diferenciado. Squad puede enriquecerse con contexto empresarial.
- **MCP como activo central** (decisión implícita): Se confirma. `mcp-m365` se suma al portfolio de MCP servers reutilizables de SS.

---

## Referencias Arquitectónicas

- [Microsoft Graph API — Overview](https://learn.microsoft.com/en-us/graph/overview)
- [Microsoft Graph — Change Notifications](https://learn.microsoft.com/en-us/graph/webhooks)
- [MSAL Node.js — Confidential Client](https://learn.microsoft.com/en-us/entra/msal/node/confidential-client)
- [Azure Event Grid + Functions](https://learn.microsoft.com/en-us/azure/event-grid/overview)
- [MCP Protocol Specification](https://modelcontextprotocol.io/specification)
- [Copilot SDK — MCP Integration](https://docs.github.com/en/copilot/how-tos/copilot-sdk/use-copilot-sdk/mcp-servers)
- [Microsoft Information Protection Labels](https://learn.microsoft.com/en-us/microsoft-365/compliance/sensitivity-labels)
- Input: `docs/research/copilot-sdk-research.md` (Oracle, 2026-07-08)
- Input: `docs/research/copilot-sdk-chat-patterns.md` (Oracle, 2026-07-08)
