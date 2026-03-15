# Quality Sprint Post-Deployment — BiciCoruña / CityPulse Labs

**Decisión**: T1 — Morpheus (Lead/Architect)  
**Fecha**: 2026-03-20  
**Estado**: ACTIVE  
**Solicitado por**: joperezd  

---

## Contexto

BiciCoruña v0.1+v0.2+v0.3 implementado y mergeado a main en una sesión maratón:
- 5 oleadas de desarrollo en una sesión
- 193+ tests pasando
- 19 issues cerrados
- Tank desplegando a Azure (SWA + Functions + Cosmos DB)

El fundador quiere un **quality sprint** mientras duerme: que la app esté pulida cuando despierte.

---

## Issues Creados (17 issues)

### 1. Code Quality (4 issues)

| # | Issue | Prioridad | Asignado |
|---|-------|-----------|----------|
| #34 | Code review completo post-construcción rápida | 🔴 Alta | Switch + Morpheus |
| #35 | Auditoría TypeScript strict compliance | 🔴 Alta | Switch |
| #36 | Hardening de error handling en servicios y hooks | 🟡 Media | Trinity |
| #49 | Identificar y cubrir gaps de test coverage | 🟡 Media | Switch |

### 2. Post-Deploy Verification (3 issues)

| # | Issue | Prioridad | Asignado |
|---|-------|-----------|----------|
| #37 | Verificación funcional completa en Azure | 🔴 CRÍTICA | Tank + Switch |
| #38 | Verificación GBFS API desde Azure endpoint | 🔴 CRÍTICA | Tank |
| #39 | Verificación data pipeline Cosmos DB | 🟠 Alta | Tank |

### 3. UI/UX Polish (7 issues)

| # | Issue | Prioridad | Asignado |
|---|-------|-----------|----------|
| #40 | Auditoría de responsividad mobile | 🔴 Alta | Mouse |
| #41 | Revisión visual: colores, tipografía, espaciado | 🟡 Media-Alta | Mouse |
| #42 | Auditoría básica de accesibilidad (a11y) | 🟡 Media | Mouse |
| #43 | Mejorar claridad visual de marcadores de estación | 🔴 Alta | Mouse + Trinity |
| #44 | Mejorar visualización de rutas walk vs bike | 🟡 Media-Alta | Mouse + Trinity |
| #45 | Pulir estados de carga, vacíos y error | 🟡 Media | Trinity |
| #50 | Revisión de textos y consistencia idiomática | 🟡 Media | Mouse |

### 4. Improvement Roadmap (3 issues)

| # | Issue | Prioridad | Asignado |
|---|-------|-----------|----------|
| #46 | Quick wins de alto impacto para ciclistas | 🔴 Alta | Trinity |
| #47 | Optimizaciones de rendimiento | 🟡 Media | Trinity + Tank |
| #48 | Mejoras profundas — visión a medio plazo | 🟢 Baja (referencia) | Morpheus |

---

## Orden de Ejecución Recomendado

### Fase 0: AHORA (mientras Tank despliega)
**Tiempo estimado**: 1-2 horas  
**No requiere deploy**

1. **#34** — Code review completo (Switch + Morpheus)
2. **#35** — Auditoría TypeScript strict
3. **#50** — Textos en español (quick win)
4. **#43** — Marcadores de estación (mejora visual)

### Fase 1: POST-DEPLOY INMEDIATO
**Tiempo estimado**: 30 min  
**Requiere**: Azure URL live

5. **#37** — Verificación funcional completa
6. **#38** — Verificación GBFS API
7. **#39** — Verificación Cosmos DB pipeline

### Fase 2: UI POLISH (paralelo con Fase 1)
**Tiempo estimado**: 2-3 horas

8. **#40** — Mobile responsiveness (Mouse)
9. **#41** — Consistencia visual (Mouse)
10. **#44** — Rutas walk vs bike
11. **#45** — Loading/empty states

### Fase 3: HARDENING
**Tiempo estimado**: 2-3 horas

12. **#36** — Error handling
13. **#49** — Test coverage gaps
14. **#42** — Accesibilidad básica

### Fase 4: QUICK WINS (post quality sprint)
**Tiempo estimado**: 3-4 horas

15. **#46** — Geolocalización + estación más cercana (GAME CHANGER)
16. **#47** — Performance optimizations
17. **#48** — Referencia para planificación futura

---

## Hallazgos Clave del Análisis

### Lo que está BIEN hecho ✅
- TypeScript strict habilitado con todas las flags
- Design tokens centralizados (src/styles/tokens.ts)
- ARIA attributes en componentes clave (radiogroup, alert, status)
- Loading/error/empty states en todos los paneles principales
- Tailwind mobile-first con breakpoints bien definidos
- 0 TODO/FIXME/HACK en el código
- Error handling con fallback a cache stale en APIs
- 55 interfaces GBFS tipadas correctamente

### Lo que necesita atención ⚠️
- **GBFSPoller catch vacío**: Fallos silenciosos en polling
- **RouteStats.tsx duplicado**: Existe en StationPanel/ y RoutePanel/
- **Header azul vs Primary verde**: Posible inconsistencia de branding
- **Textos en inglés**: Panel de estación dice "Click a station marker"
- **Sin geolocalización**: El usuario tiene que buscar su posición manualmente
- **Sin timeouts en fetch**: Si una API cuelga, el usuario espera indefinidamente

### Lo que impactaría más al usuario 🎯
1. **Geolocalización** — "¿Dónde estoy?" resuelto en 1 tap
2. **Estación más cercana** — El 80% del caso de uso resuelto instantáneamente
3. **Marcadores claros** — Saber de un vistazo dónde hay bicis
4. **Mobile perfecto** — Los ciclistas usan el móvil, siempre

---

## Métricas de Éxito del Sprint

- [ ] Zero warnings en `tsc --noEmit`
- [ ] Verificación post-deploy completa (checklist #37)
- [ ] Lighthouse mobile score > 80 en todas las categorías
- [ ] Todos los textos en español
- [ ] Error handling sin catch vacíos
- [ ] Coverage > 80%

---

## Notas para el Equipo

**Tank**: Termina el deploy, luego ejecuta verificación #37/#38/#39. Si algo falla, es prioridad máxima.

**Switch**: Empieza con #34 y #35 AHORA — no necesitas el deploy. Code review + TypeScript audit.

**Mouse**: Cuando el deploy esté live, ataca #40 (mobile) y #43 (marcadores). Son los que más nota el usuario.

**Trinity**: Después del code review, ataca #36 (error handling) y #45 (loading states). Si queda tiempo, #46 (geolocalización) sería el MVP killer feature.

**Morpheus**: Revisaré #34 (arquitectura) y supervisaré el sprint. Priorizaré dinámicamente según lo que Tank reporte del deploy.
