# El Patrón "Tester Autónomo" — Copilot SDK como Usuario de tu App

> Investigación: Oracle (Product & Docs) — Julio 2026
> Origen: joperezd descubrió LLM-Fighter (jrubiosainz) — IA que JUEGA, no solo genera

## TLDR

Existe un patrón emergente que llamamos **"Tester Autónomo con Juicio"** (Autonomous Judgment Tester): una IA que no ejecuta tests predefinidos sino que **usa tu aplicación como un usuario real**, observa lo que funciona y lo que no, y propone mejoras concretas. Es la diferencia entre un Playwright que dice "el botón existe" y una IA que dice "el botón existe pero está en el lugar equivocado". El mercado de AI testing supera $1B en 2025 (CAGR ~20%), hay ~15 competidores directos, pero **ninguno** combina el loop completo de Actuar → Observar → Proponer → Verificar → Evolucionar con juicio de producto real. Hay espacio para SS como servicio boutique ("danos tu URL, nuestro agente la usa 24h y te damos un informe") con pricing €500-2.000/reporte o €200-800/mes en modelo continuo.

---

## 1. El Patrón: Actuar → Observar → Proponer → Verificar

### 1.1 Origen: LLM-Fighter y el SDK como Cerebro

jrubiosainz creó [LLM-Fighter](https://github.com/jrubiosainz/LLM-Fighter): un juego de pelea arcade HTML5 donde cada luchador es un modelo LLM (GPT, Claude, Gemini) que toma decisiones en tiempo real — atacar, bloquear, esquivar — basándose en el estado del juego. El `@github/copilot-sdk` no se usa para chat, sino como **motor de decisión**. El modelo recibe el estado del ring y responde con acciones. 13 acciones de combate, barra de super, personalidades únicas por modelo.

La versión Bomberman amplía el concepto: la IA juega, observa los resultados, propone mejoras al nivel y repite — **evolución autónoma a través del juego**.

### 1.2 El Insight de Transferencia

La revelación de joperezd: aplicar este mismo patrón al desarrollo de software. En vez de que la IA escriba tests desde specs, la IA **USA** la app como un usuario real:

```
Ejemplo con CityPulseLabs (app de rutas en bici):
1. SDK abre la app → busca ruta A→B → observa que tarda 4s → propone "cachear /routes"
2. SDK prueba en móvil → bottom sheet no responde al primer tap → propone "touch targets demasiado pequeños"  
3. SDK genera issues → equipo las arregla → SDK re-testea → loop
```

### 1.3 Definición Formal del Patrón

**AOPR (Act-Observe-Propose-Repeat)** — Un agente IA con capacidad de juicio que:

| Fase | Descripción | Diferencia vs Testing Tradicional |
|------|-------------|----------------------------------|
| **Actuar** | Navega la app como un usuario sin instrucciones previas | Los tests tradicionales siguen scripts predefinidos |
| **Observar** | Evalúa el resultado con criterio de producto/UX, no solo pass/fail | Playwright solo verifica assertions binarias |
| **Proponer** | Genera recomendaciones accionables con contexto | Los tests reportan errores, no soluciones |
| **Verificar** | Re-testea tras los cambios, confirma la mejora | Requiere reescribir tests manualmente |
| **Evolucionar** | Aprende de iteraciones anteriores, encuentra nuevos problemas | Cobertura estática, no crece sola |

### 1.4 El Loop OODA Adaptado

Este patrón es una aplicación del loop **OODA** (Observe-Orient-Decide-Act) de John Boyd, adaptado para software testing con LLMs. La diferencia clave: el "Orient" incluye razonamiento multimodal — el agente no solo ve el DOM, entiende la **intención** detrás de la interfaz.

---

## 2. ¿Qué Puede Encontrar una IA que un Test No Puede?

### 2.1 La Pirámide del Juicio

```
                    ┌─────────────┐
                    │  JUICIO DE   │  ← Solo IA con criterio
                    │  PRODUCTO    │     "Este flujo confunde"
                    ├─────────────┤
                    │ PERCEPCIÓN   │  ← IA + visión
                    │ SUBJETIVA    │     "Se siente lento"
                    ├─────────────┤
                    │ HEURÍSTICAS  │  ← IA + reglas
                    │ UX/A11Y      │     "Contraste insuficiente"
                    ├─────────────┤
                    │ FUNCIONAL    │  ← Tests tradicionales
                    │ PASS/FAIL    │     "El botón existe"
                    └─────────────┘
```

### 2.2 Categorías de Problemas Detectables

#### A. Problemas de UX/Usabilidad
- **Flujos confusos**: "Para completar el checkout necesité 7 clicks, 3 parecen innecesarios"
- **Discoverability pobre**: "La función de exportar existe pero está enterrada en un menú de 3 niveles"
- **Inconsistencias**: "El botón 'Guardar' está arriba en la pantalla A pero abajo en la B"
- **Fricción innecesaria**: "El formulario pierde los datos si navegas atrás"

#### B. Percepción de Performance
- **Técnicamente rápido, perceptualmente lento**: "La API responde en 200ms pero la UI tarda 2s en renderizar por animaciones bloqueantes"
- **Ausencia de feedback**: "No hay indicador de carga — parece que no pasó nada"
- **Jank visual**: "El scroll tiene micro-pausas en el listado de 50+ items"

#### C. Accesibilidad Más Allá de WCAG
- **Usable pero no intuitivo**: "El lector de pantalla lee los elementos pero el orden no tiene sentido lógico"
- **Touch targets**: "Los botones existen pero el área clickeable es de 24px en móvil (debería ser 44px+)"
- **Contraste contextual**: "El texto es legible en fondo blanco pero ilegible sobre las imágenes hero"

#### D. Calidad de Contenido
- **Copy confuso**: "El botón dice 'Procesar' pero no queda claro qué procesará"
- **Mensajes de error inútiles**: "'Error 500' no ayuda al usuario — debería decir qué falló y qué hacer"
- **Localización rota**: "La moneda muestra $ pero la app está configurada para España (€)"

#### E. Edge Cases que un Humano Probaría Naturalmente
- **Doble click**: "Si hago doble click en 'Enviar', se crean 2 pedidos"
- **Navegación errática**: "Si vuelvo atrás 3 veces rápidamente, la app pierde el estado"
- **Datos vacíos**: "Con 0 resultados, la pantalla queda en blanco sin mensaje"
- **Datos extremos**: "Con un nombre de 200 caracteres, el layout se rompe"

### 2.3 Lo que la IA Puede vs No Puede (Hoy)

| ✅ Puede Detectar | ❌ Todavía No Puede |
|---|---|
| Flujos objetivamente confusos (>N pasos) | Preferencias culturales/estéticas específicas |
| Problemas de contraste, tamaño, layout | Emociones sutiles del usuario |
| Lógica rota o inconsistente | Confianza y seguridad percibida de marca |
| Contenido incompleto o confuso | Contexto organizacional del usuario |
| Performance medible (tiempos, jank) | Intención de negocio detrás de decisiones de diseño |

---

## 3. Estado del Arte: ¿Quién Más Hace Esto?

### 3.1 Mapa del Mercado (Julio 2026)

```
Alto ←── Juicio de Producto ──→ Bajo
│                                  │
│  [VACÍO - Oportunidad SS]        │  Applitools ($969+/mo)
│  Autonomous Judgment Tester      │  Visual AI, regression
│                                  │
│  ────────────────────────────     │  ────────────────────────
│                                  │
│  UXAgent                         │  Momentic (quote-based)
│  Simulación UX Research          │  AI self-healing E2E
│  (académico, no productizado)    │
│                                  │  Octomind ($89-589/mo)
│                                  │  AI test generation
│                                  │
│                                  │  QA Wolf ($60-250K/año)
│                                  │  Managed service E2E
│                                  │
│                                  │  Testim ($300+/mo)
│                                  │  AI authoring + Salesforce
│                                  │
│                                  │  Wopee.io
│                                  │  Playwright + AI agents
│                                  │
│                                  │  Functionize
│                                  │  Enterprise AI QA
│                                  │
│                                  │  BugBug ($189-559/mo)
│                                  │  No-code basic E2E
│                                  │
Exploración ←── Ejes ──→ Scripts
```

### 3.2 Análisis Competitivo Detallado

| Herramienta | Tipo | Precio | ¿Juzga? | ¿Propone? | ¿Evoluciona? | Gap vs AOPR |
|---|---|---|---|---|---|---|
| **Playwright/Cypress** | Framework E2E | Open source | ❌ | ❌ | ❌ | Solo ejecuta scripts humanos |
| **Applitools** | Visual AI | $969+/mo | 🟡 Visual | ❌ | ❌ | Solo comparación visual pixel-a-pixel |
| **Momentic** | AI E2E | Quote | ❌ | ❌ | 🟡 Self-heal | Solo auto-repara selectores rotos |
| **Octomind** | AI test gen | $89-589/mo | ❌ | ❌ | ❌ | Genera tests, no los inventa |
| **QA Wolf** | Managed E2E | $60-250K/año | ❌ (humanos) | 🟡 | ❌ | Humanos escriben los tests |
| **Testim** | AI authoring | $300+/mo | ❌ | ❌ | 🟡 Self-heal | Mismo patrón: scripts + heal |
| **Wopee.io** | AI agents | - | ❌ | ❌ | 🟡 | Mapea pero no juzga |
| **Functionize** | Enterprise AI | Enterprise | 🟡 | ❌ | 🟡 | Auto-heal, no juicio de UX |
| **UXAgent** | Research sim | Académico | ✅ | 🟡 | ❌ | No productizado, no loop |
| **TestSprite** | AI UX/UI | - | 🟡 | 🟡 | ❌ | UX checks pero sin loop completo |

### 3.3 El Gap Que Nadie Ocupa

**Ninguna herramienta actual combina los 5 elementos del patrón AOPR:**

1. ✅ **Actuar** autónomamente (sin scripts) — Wopee/UXAgent lo intentan
2. ✅ **Observar** con juicio de producto — UXAgent lo tiene, pero no está productizado
3. ✅ **Proponer** mejoras accionables — Ninguna lo hace bien
4. ✅ **Verificar** tras cambios — Algunas con re-runs, pero no verificación de mejora
5. ✅ **Evolucionar** — Ninguna aprende entre sesiones de forma significativa

El mercado tiene dos polos: **frameworks de testing** (Playwright, scripts) y **AI testing** (self-healing, generation). El espacio del **juicio autónomo** está vacío.

### 3.4 Datos del Mercado

- **Tamaño global AI Testing**: ~$1B en 2025, $8.8B en AI test automation
- **CAGR**: 18-22% anual
- **ROI reportado**: 300% primer año, reducción 40% costes operativos, 65% costes laborales
- **Adopción enterprise**: Meta, Wayfair usan agentes LLM para QA
- **Sectores principales**: Banca, telecomunicaciones, healthcare, automotive

### 3.5 Investigación Académica Relevante

| Paper/Proyecto | Contribución | Relevancia para SS |
|---|---|---|
| EvolveR (ICLR 2026) | Self-evolving LLM agents, aprenden de trayectorias | Patrón core del loop de evolución |
| SE-Agent (arXiv:2508.02085) | Optimización de trayectorias multi-paso | Cómo mejorar las rutas de exploración |
| BioMedAgent (Nature 2026) | Multi-agente que adquiere skills continuamente | Modelo de adquisición de conocimiento |
| Survey Self-Evolving Agents (arXiv:2508.07407) | Framework unificado de auto-evolución | Base teórica completa |
| OpenAI Self-Evolving Agents Cookbook | Receta práctica de retraining autónomo | Implementación de referencia |

---

## 4. Potencial como Producto/Servicio

### 4.1 Modelo de Negocio: "VIGÍA"

> **VIGÍA** — Tu App Bajo la Lupa de una IA que Piensa como Usuario

#### Opción A: Reporte Puntual (Auditoría)
```
Cliente nos da URL → VIGÍA la usa 24h → Entregamos informe detallado

Contenido del informe:
- 📊 Scorecard general (0-100 en UX, Performance, Accesibilidad, Robustez)
- 🐛 Bugs encontrados con steps-to-reproduce
- 💡 Mejoras propuestas con prioridad estimada
- 📱 Análisis multi-dispositivo (desktop, tablet, móvil)
- ♿ Evaluación de accesibilidad con recomendaciones
- 🎯 Roadmap sugerido de mejoras (quick wins → largo plazo)

Pricing: €500-2.000 por auditoría (según complejidad)
Target: Startups pre-launch, empresas con rediseño, agencias
```

#### Opción B: Monitoreo Continuo (SaaS)
```
VIGÍA prueba tu app periódicamente → alertas + reportes mensuales

Tiers:
- Starter: €199/mo — 1 app, semanal, informe mensual
- Pro: €499/mo — 3 apps, diario, alertas en tiempo real
- Enterprise: €999+/mo — apps ilimitadas, CI/CD integration, SLA

Target: Equipos de producto, CTOs de PYMES, agencias digitales
```

#### Opción C: Integración CI/CD (Developer-focused)
```
VIGÍA como step en tu pipeline → bloquea deploy si detecta regresiones de UX

Pricing: €99-299/mo por repo
Target: Equipos de ingeniería, DevOps
```

### 4.2 Diferenciación Competitiva de SS

| Factor | Competidores | VIGÍA (SS) |
|---|---|---|
| **Qué hace** | Ejecuta tests, auto-heals selectores | **Juzga** la app como un usuario |
| **Output** | "Test passed/failed" | "Tu checkout es confuso y aquí está por qué" |
| **Requiere** | Escribir/definir tests | Solo la URL |
| **Evoluciona** | Re-ejecuta los mismos tests | Encuentra NUEVOS problemas cada vez |
| **Propuestas** | Reporta bugs | Sugiere mejoras de producto |
| **Perspectiva** | Técnica (DOM, selectores) | **Producto** (UX, negocio, a11y) |

### 4.3 Stack Técnico Propuesto

```
Copilot SDK (motor de decisión / "cerebro" del agente)
    ↓
Playwright (manos y ojos — navegación + screenshots)
    ↓
Vision API (análisis de screenshots para juicio visual)
    ↓
MCP Tools personalizados:
  - performance-profiler (Lighthouse + custom)
  - accessibility-checker (axe-core + juicio)
  - ux-evaluator (heurísticas de Nielsen + LLM)
  - issue-generator (crea GitHub Issues automáticamente)
    ↓
Azure Container Apps (hosting del agente)
    ↓
Informe → GitHub Issues / PDF / Dashboard web
```

**Coste infraestructura estimado**: €50-150/mo (Azure + tokens LLM)
**Margen bruto en modelo SaaS**: 70-85%

### 4.4 Sizing del Mercado (España)

| Segmento | Tamaño | Willingness to Pay | TAM |
|---|---|---|---|
| Startups con app web (Series A+) | ~3.000 | €200-500/mo | €7.2-18M/año |
| Agencias digitales | ~5.000 | €500-2.000/auditoría × 4/año | €10-40M/año |
| PYMES con presencia digital | ~50.000 | €99-199/mo | €59-119M/año |
| Equipos de producto en enterprise | ~2.000 | €499-999/mo | €12-24M/año |

**SAM realista primer año**: €500K-2M (50-200 clientes)

### 4.5 Go-to-Market

1. **Mes 1-2**: PoC interno — VIGÍA testea CityPulseLabs y apps propias de SS
2. **Mes 3**: Beta cerrada con 10 startups españolas (gratis, a cambio de feedback)
3. **Mes 4-5**: Launch público con 3 case studies reales
4. **Canal**: LinkedIn + comunidades dev españolas + Kit Digital como subsidio
5. **Moat**: El loop de evolución mejora los informes con cada iteración

---

## 5. El Loop de Evolución Continua

### 5.1 Del Bomberman al Software

```
BOMBERMAN (jrubiosainz)          VIGÍA (SS)
─────────────────────            ─────────────
Jugar nivel                  →   Usar la app
Observar resultados          →   Medir UX/bugs/performance  
Proponer mejoras al nivel    →   Proponer mejoras a la app
Implementar cambios          →   Equipo implementa fixes
Rejugar nivel mejorado       →   Re-testear app mejorada
Descubrir NUEVOS problemas   →   Encontrar NUEVAS oportunidades
        ↻ REPETIR                       ↻ REPETIR
```

### 5.2 Niveles de Evolución

#### Nivel 1: Test → Fix → Retest (MVP)
```
Sesión 1: "El formulario de login no muestra errores de validación"
→ Equipo arregla → Sesión 2: "Ahora muestra errores pero en inglés (app en español)"
→ Equipo arregla → Sesión 3: "Validación correcta ✅ — nuevo hallazgo: el link 'olvidé mi contraseña' lleva a un 404"
```

#### Nivel 2: Use → Suggest Features → Build → Test (Intermedio)
```
"Los usuarios que buscan ruta A→B probablemente también querrían ver 
el tiempo estimado en bici vs transporte público. Sugiero añadir 
comparador de medios de transporte."
```
Esto va más allá de QA — es **product discovery automatizado**.

#### Nivel 3: Learn → Adapt → Specialize (Avanzado)
```
Sesión 1-10: VIGÍA aprende los patrones de la app
Sesión 11+: VIGÍA empieza a testear como un "power user" que conoce la app
→ Encuentra bugs sutiles que solo aparecen con uso intensivo
→ Sugiere optimizaciones basadas en patrones de uso acumulados
```

### 5.3 El Flywheel del Valor

```
     Más sesiones
         ↓
    Mejor comprensión de la app
         ↓
    Hallazgos más profundos ← ← ← ←
         ↓                         ↑
    Más valor para el cliente      |
         ↓                         |
    Más retención                  |
         ↓                         |
    Más datos de entrenamiento → → ↑
```

Cada app que VIGÍA testea lo hace más inteligente para la siguiente. Esto crea un **efecto red de datos** que los competidores no pueden replicar fácilmente.

---

## 6. Más Allá del QA: Otros Dominios

El patrón AOPR (Actuar → Observar → Proponer → Repetir) es genérico. Aplicaciones fuera de QA:

### 6.1 Tabla de Aplicaciones

| Dominio | Actuar | Observar | Proponer | Ejemplo Concreto |
|---|---|---|---|---|
| **Contenido** | Escribir artículo | Evaluar engagement/claridad | Refinar copy/estructura | "Tu blog post tiene un bounce rate alto — los 3 primeros párrafos son demasiado densos" |
| **Diseño** | Generar variante UI | Evaluar contra heurísticas | Iterar diseño | "El CTA se pierde visualmente — propongo más contraste y 20% más grande" |
| **Ventas** | Enviar email de prospección | Analizar respuestas/aperturas | Ajustar messaging | "Los emails con pregunta en el subject tienen 3x más apertura" |
| **Educación** | Dar una lección | Evaluar comprensión | Adaptar currículum | "El 60% de alumnos falló la pregunta 3 — el concepto necesita más ejemplos" |
| **DevOps** | Desplegar infraestructura | Monitorear métricas | Optimizar configuración | "El pod se escala a 8 réplicas pero solo usa 30% CPU — reducir a 4" |
| **Legal** | Redactar contrato | Revisar contra normativa | Corregir cláusulas | "La cláusula 7 no cumple con GDPR Art. 6 — propongo esta redacción" |
| **Finanzas** | Ejecutar estrategia de inversión | Medir rendimiento | Ajustar portfolio | "El sector tech ha bajado 15% — rebalancear hacia defensivos" |

### 6.2 El Meta-Patrón

Todos estos dominios comparten el mismo mecanismo fundamental:

1. **Agente con criterio** (no solo ejecución mecánica)
2. **Feedback loop cerrado** (observación real, no simulada)
3. **Propuestas accionables** (no solo datos, sino decisiones)
4. **Mejora acumulativa** (cada ciclo es mejor que el anterior)

Esto convierte al LLM de un "generador de texto" en un **sistema de mejora continua**. Es la diferencia entre GPT respondiendo preguntas y GPT mejorando activamente un sistema del mundo real.

### 6.3 Productos SS que Podrían Usar AOPR

| Producto Existente | Cómo Aplicar AOPR |
|---|---|
| **CityPulseLabs** | VIGÍA como primer cliente — testear la app de rutas continuamente |
| **AUTONOMO.AI (PILOTO)** | El agente prueba sus propias respuestas fiscales, identifica errores |
| **FORJA** | Meta: VIGÍA testea las apps que FORJA construye automáticamente |
| **Futuras apps** | VIGÍA integrado en el pipeline de cada producto SS |

---

## 7. Recomendación para SS

### 7.1 Veredicto

**VIGÍA es la idea más diferenciada que SS ha explorado hasta ahora.** Es el primer concepto donde:
- No competimos con herramientas existentes (el espacio de "juicio de producto" está vacío)
- El moat técnico es real (loop de evolución + datos acumulados)
- El Copilot SDK tiene una ventaja genuina (agentes con razonamiento, no solo scripts)
- El mercado es grande ($1B+ y creciendo 20% anual)
- El margen es alto (70-85% en SaaS)

### 7.2 Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Copilot SDK demasiado inmaduro (v0.2.x preview) | Media | Usar Vercel AI SDK como fallback para el cerebro, Playwright para las manos |
| Calidad del juicio IA insuficiente | Media | Empezar con heurísticas conocidas (Nielsen, WCAG) + LLM como complemento |
| Competidores se mueven rápido | Alta | Primero-en-mover en el nicho de juicio UX, no en AI testing genérico |
| Adopción lenta en España | Media | Kit Digital como subsidio + case studies con apps propias |

### 7.3 Plan de Acción Recomendado

```
Fase 1 (2 semanas): PoC "VIGÍA v0"
├── Playwright + Copilot SDK (o Vercel AI SDK)
├── Testear CityPulseLabs
├── Output: informe manual → validar si la IA encuentra cosas útiles
└── Go/No-Go decision

Fase 2 (4 semanas): MVP "VIGÍA v1"
├── Informe automático en PDF/Markdown
├── Integración con GitHub Issues
├── 3 apps de prueba (CityPulseLabs + 2 externas)
└── Pricing validado con 5 prospects

Fase 3 (8 semanas): Beta Pública
├── Dashboard web
├── Modelo SaaS con tiers
├── 10-20 clientes beta
└── Iteración basada en feedback
```

### 7.4 Por Qué Ahora

1. **LLM-Fighter demuestra el patrón**: El SDK ya funciona como motor de decisión en juegos — la transferencia a apps es natural
2. **El mercado está en punto de inflexión**: $1B+ con 20% CAGR, pero nadie hace juicio de producto
3. **SS tiene las piezas**: Copilot SDK expertise, Azure infra, Playwright en el stack, apps propias para testear
4. **Kit Digital**: €12K de subsidio por PYME — puede cubrir 1-2 años de suscripción VIGÍA
5. **El timing es perfecto**: Los competidores están obsesionados con "self-healing tests" — el juicio autónomo es un flanco abierto

### 7.5 Métrica de Éxito del PoC

El PoC es exitoso si VIGÍA, testeando CityPulseLabs durante 24h, encuentra **al menos 5 problemas reales** que:
- No estaban en el backlog del equipo
- Un QA humano estaría de acuerdo en que son problemas legítimos
- Al menos 2 de ellos son de tipo "juicio" (UX, percepción) y no solo bugs funcionales

---

## Referencias

### Repos y Herramientas
- [LLM-Fighter (jrubiosainz)](https://github.com/jrubiosainz/LLM-Fighter) — Origen del patrón
- [@github/copilot-sdk (npm)](https://www.npmjs.com/package/@github/copilot-sdk) — Motor de decisión
- [Playwright](https://playwright.dev/) — Automatización de navegador
- [Axe-core](https://github.com/dequelabs/axe-core) — Accessibility engine

### Competidores
- [Applitools](https://applitools.com/) — Visual AI testing ($969+/mo)
- [Momentic](https://momentic.ai/) — AI E2E testing
- [Octomind](https://octomind.dev/) — AI test generation ($89-589/mo)
- [QA Wolf](https://www.qawolf.com/) — Managed QA ($60-250K/año)
- [Testim (Tricentis)](https://www.testim.io/) — AI test authoring ($300+/mo)
- [Wopee.io](https://wopee.io/) — AI testing agents
- [Functionize](https://www.functionize.com/) — Enterprise AI QA
- [BugBug](https://bugbug.io/) — No-code E2E ($189-559/mo)
- [Shiplight AI](https://www.shiplight.ai/) — Autonomous QA platform
- [Testsigma](https://testsigma.com/) — AI-driven test automation
- [TestSprite](https://www.testsprite.com/) — AI UX/UI testing

### UX Testing con IA
- [UXAgent](https://www.aufaitux.com/blog/uxagent-ai-ux-research-simulation/) — AI UX research simulation
- [Ramotion AI Usability](https://www.ramotion.com/blog/ai-usability-testing/) — AI usability testing overview
- [Aqua Cloud AI UI/UX Tools](https://aqua-cloud.io/ai-tools-for-ux-ui-testing/) — AI tools for UX testing

### Papers y Research
- EvolveR: Self-Evolving LLM Agents (ICLR 2026) — [OpenReview](https://openreview.net/forum?id=sooLoD9VSf)
- SE-Agent: Self-Evolution Trajectory Optimization — [arXiv:2508.02085](https://arxiv.org/abs/2508.02085)
- Self-Evolving AI Agents Survey — [arXiv:2508.07407](https://huggingface.co/papers/2508.07407)
- BioMedAgent Multi-Agent LLM — [Nature](https://www.nature.com/articles/s41551-026-01634-6)
- [Awesome AI Agent Papers](https://github.com/VoltAgent/awesome-ai-agent-papers)
- [OpenAI Self-Evolving Agents Cookbook](https://developers.openai.com/cookbook/examples/partners/self_evolving_agents/autonomous_agent_retraining)

### Mercado y Análisis
- [AI Testing Market 2025 (Fortune Business Insights)](https://www.fortunebusinessinsights.com/ai-enabled-testing-market-108825) — $1.01B, CAGR 18.3%
- [AI Test Automation Market (MarketsandMarkets)](https://www.marketsandmarkets.com/Market-Reports/ai-test-automation-market-3693343.html) — $8.81B, CAGR 22.3%
- [Gitnux AI Testing Statistics](https://gitnux.org/ai-in-the-testing-industry-statistics/) — 300% ROI, 40% cost reduction
- [2026 State of AI in QA (WeTest)](https://www.wetest.net/blog/2026-ai-trend-1136.html) — Meta/Wayfair cases

### Arquitecturas de Agentes
- [Oracle AI Agent Loop](https://blogs.oracle.com/developers/what-is-the-ai-agent-loop-the-core-architecture-behind-autonomous-ai-systems)
- [Agentic Loop Guide (Stackviv)](https://stackviv.ai/blog/agentic-loop-think-act-observe)
- [Plan-Act-Observe-Adjust (Innodata)](https://innodata.com/how-to-design-architectures-for-agentic-ai/)
- [HuggingFace Agents Course](https://huggingface.co/learn/agents-course/en/unit1/agent-steps-and-structure)
