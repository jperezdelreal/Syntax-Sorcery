# Productos con Copilot SDK para Usuarios No Técnicos

> **Autor:** Oracle (Product & Docs)  
> **Fecha:** 2026-07-11  
> **Estado:** Brainstorm v2 — corregido, sin herramientas de desarrollador  
> **Solicitado por:** joperezd — "los proyectos son muy de desarrollador, no me convencen"  
> **Input:** Brainstorm v1 (rechazado), arquitectura Work IQ (Morpheus), investigación de mercado  

---

## TLDR — Top 3 con Más Potencial

1. **🥇 LUNES** — El agente que elimina el "informe del lunes". Analiza emails, Teams y calendario del equipo y genera automáticamente el resumen semanal que tu jefe pide cada lunes. Para directores de operaciones y mandos intermedios. Revenue: €15-25/usuario/mes. Mercado España: ~800K managers. Sin competencia directa con enfoque M365 nativo.

2. **🥈 CERRADOR** — Asistente de ventas que lee tus emails con clientes, detecta deals que se enfrían, y te escribe el follow-up perfecto antes de que pierdas la venta. Para comerciales y equipos de ventas en PYMES. Revenue: €29-49/usuario/mes. Mercado España: ~1.2M comerciales. Competencia: Outreach/HubSpot (€100+/usuario, overkill para PYMES).

3. **🥉 CENTINELA LEGAL** — Vigila contratos almacenados en SharePoint, detecta renovaciones automáticas que se acercan, cláusulas peligrosas, y plazos legales. Te avisa 30 días antes, no 3 días después. Para PYMES con 5-50 contratos activos sin departamento legal. Revenue: €39-79/empresa/mes. Mercado España: ~500K PYMES con contratos activos. Competencia: Ironclad/Evisort (€500+/mes, Enterprise).

---

## Categoría 1: Gestión y Dirección

### 1.1 — LUNES: El Informe que se Escribe Solo

**Nombre:** LUNES  
**¿Para quién?** Directores de operaciones, mandos intermedios, jefes de departamento (empresas 20-500 empleados)

**El dolor:** Cada lunes, el director dedica 1-2 horas a leer emails del viernes, revisar conversaciones de Teams, mirar el calendario de la semana pasada, y escribir un informe de status para su jefe o para la reunión de dirección. Es trabajo manual, repetitivo, y siempre urgente. El 47% de managers considera que las reuniones de status son el mayor desperdicio de tiempo.

**La solución:** LUNES analiza automáticamente toda la actividad de M365 de tu equipo (emails enviados/recibidos, reuniones, conversaciones de Teams, documentos editados en SharePoint) y genera un informe semanal personalizado: qué se hizo, qué quedó pendiente, qué riesgos hay, y qué necesita decisión. Lo entrega en tu bandeja a las 8:00 del lunes.

**Ejemplo de uso:** *Carlos, director de marketing en una empresa de 80 personas, llega el lunes y en su bandeja ya tiene: "Tu equipo tuvo 14 reuniones la semana pasada. Se cerró la campaña de verano (email de Laura al cliente confirmando). Hay 3 tareas pendientes del proyecto web (mencionadas en Teams por Marta el jueves). Riesgo: Pedro no respondió al proveedor de diseño desde el miércoles — puede afectar el plazo del 15 de julio."*

**Ingredientes:** Copilot SDK + Work IQ MCP (Mail, Calendar, Teams, OneDrive) + Azure Functions (trigger semanal) + Templates de informe personalizables

**Revenue:** €15-25/usuario/mes (B2B SaaS)  
**Tamaño de mercado:** España: ~800K managers/directores con M365. Europa: ~12M  
**Competencia:** Otter.ai/Fireflies ($16-30/mes) solo transcriben reuniones. Ninguno cruza emails + Teams + calendario para generar un informe ejecutivo completo. M365 Copilot resume reuniones individuales, pero NO genera el informe semanal cruzado.  
**Quick win?** ✅ Sí — MVP en 1-2 semanas. Es un cron + Work IQ + plantilla de output.

---

### 1.2 — BRÚJULA: Briefing Diario para Directivos

**Nombre:** BRÚJULA  
**¿Para quién?** CEOs, C-suite, directores generales de PYMES (10-200 empleados)

**El dolor:** El CEO llega por la mañana y no sabe por dónde empezar. Tiene 87 emails, 6 invitaciones a reuniones, 4 menciones en Teams, y un documento que alguien compartió ayer. Le lleva 45 minutos filtrar qué es importante. Mientras tanto, la decisión urgente sobre el contrato con el cliente grande sigue enterrada en un hilo de email.

**La solución:** BRÚJULA genera un briefing personalizado a las 7:30 cada mañana: "Hoy necesitas decidir X, atender Y, y saber que Z pasó ayer." Prioriza por urgencia e impacto, identifica quién espera tu respuesta, y te dice en qué reuniones de hoy realmente necesitas estar vs. cuáles puedes saltar.

**Ejemplo de uso:** *Ana, CEO de una consultora de 45 personas, abre su móvil a las 7:45. BRÚJULA le dice: "🔴 Urgente: El cliente Iberdrola esperó respuesta desde el jueves (email de Pablo). 🟡 Hoy: Reunión de presupuesto Q3 a las 10:00 — el CFO envió borrador anoche, te resumo los 3 puntos clave. 🟢 FYI: RRHH cerró la contratación del nuevo PM — empieza el 21/07."*

**Ingredientes:** Copilot SDK + Work IQ MCP (Mail, Calendar, Teams, People) + NLP priorización + Push notification (email/Teams)

**Revenue:** €29-49/usuario/mes  
**Tamaño de mercado:** España: ~200K directivos/CEO PYMES. Europa: ~3M  
**Competencia:** Los EA (asistentes ejecutivos) cobran €2.000-4.000/mes. M365 Copilot da resúmenes dentro de cada app, pero NO genera un briefing cruzado priorizado.  
**Quick win?** ✅ Sí — MVP en 1-2 semanas. Similar a LUNES pero con trigger diario y priorización.

---

### 1.3 — RADAR: Detector de Problemas Silenciosos

**Nombre:** RADAR  
**¿Para quién?** Project managers, directores de programa, COOs

**El dolor:** Los problemas en proyectos no aparecen de golpe — se incuban durante semanas en emails que nadie lee, en reuniones donde alguien dice "esto me preocupa" pero no se registra, en hilos de Teams que mueren sin resolución. Cuando el PM se entera, ya es una crisis.

**La solución:** RADAR monitoriza continuamente las comunicaciones del equipo (emails, Teams, reuniones) y detecta señales de riesgo: respuestas que tardan más de lo normal, tono negativo en conversaciones con clientes, tareas mencionadas repetidamente sin resolución, personas que dejan de participar en hilos importantes. Genera alertas proactivas: "⚠️ El proveedor X no ha respondido en 5 días — históricamente responde en 2."

**Ejemplo de uso:** *Jorge, PM de un proyecto de implantación para 3 clientes, recibe alerta de RADAR el miércoles: "El cliente Repsol ha mencionado 'retraso' en 3 emails esta semana (vs. 0 la semana pasada). La conversación técnica en Teams entre tu equipo y Repsol tiene un 40% más de mensajes sin resolver. Recomendación: agenda una call con el responsable antes del viernes."*

**Ingredientes:** Copilot SDK + Work IQ MCP (Mail, Teams, Calendar) + Análisis de sentimiento + Motor de patrones + Alertas configurables

**Revenue:** €19-39/usuario/mes  
**Tamaño de mercado:** España: ~400K project managers. Europa: ~6M  
**Competencia:** Monday.com, Asana, Jira tienen tracking de tareas pero NO analizan comunicaciones. Nadie cruza el "sentiment" de emails y Teams con el estado del proyecto.  
**Quick win?** ⚠️ Parcial — MVP básico (frecuencia de respuesta) en 2 semanas. Análisis de sentimiento requiere más tuning.

---

## Categoría 2: Ventas y Comercial

### 2.1 — CERRADOR: El Follow-Up que Nunca se Olvida

**Nombre:** CERRADOR  
**¿Para quién?** Comerciales, account managers, directores comerciales en PYMES (5-100 vendedores)

**El dolor:** El 80% de ventas requieren 5+ follow-ups, pero el 44% de comerciales abandonan después del primero. El comercial tiene 30 oportunidades abiertas, no sabe cuál se enfría, y escribe follow-ups genéricos ("Solo quería hacer seguimiento...") porque no tiene tiempo para personalizar.

**La solución:** CERRADOR analiza toda tu comunicación por email con cada cliente/prospect, detecta cuáles llevan más tiempo sin respuesta, y genera follow-ups personalizados basados en el contexto real: "Hola María, después de nuestra conversación sobre los plazos de implantación del martes, quería confirmar que el presupuesto revisado les funciona. ¿Avanzamos con la firma antes del viernes?"

**Ejemplo de uso:** *Laura, comercial en una empresa de software B2B, tiene 25 deals abiertos. CERRADOR le dice a las 9:00: "🔴 3 deals fríos (>7 días sin respuesta): Accenture, Naturgy, Mapfre. 🟡 2 deals con señal de compra (cliente respondió rápido ayer): Endesa, BBVA." Para Accenture, CERRADOR genera un borrador de follow-up que referencia la última reunión y el documento de propuesta que Laura compartió hace 10 días.*

**Ingredientes:** Copilot SDK + Work IQ MCP (Mail, Calendar, OneDrive) + Custom MCP (CRM sync opcional) + Templates de follow-up por industria

**Revenue:** €29-49/usuario/mes  
**Tamaño de mercado:** España: ~1.2M comerciales/vendedores con M365. Europa: ~18M  
**Competencia:** Outreach ($100+/usuario), Salesloft ($75+), HubSpot Sales ($50+) — todos caros, complejos, y requieren CRM separado. CERRADOR lee directamente del email, sin setup. La diferencia: 0 configuración, funciona desde día 1 con tu email existente.  
**Quick win?** ✅ Sí — MVP en 2 semanas. Análisis de bandeja + generación de drafts.

---

### 2.2 — PROPUESTA: Generador de Propuestas Comerciales

**Nombre:** PROPUESTA  
**¿Para quién?** Equipos comerciales, pre-venta, consultoras, agencias

**El dolor:** Preparar una propuesta comercial toma 4-8 horas. El comercial tiene que buscar la información del cliente en emails viejos, revisar qué se habló en reuniones, encontrar propuestas anteriores similares en SharePoint, y adaptar todo a un documento nuevo. El 60% del tiempo es buscar y copiar.

**La solución:** PROPUESTA analiza todas tus interacciones con el cliente (emails, reuniones, Teams), encuentra propuestas similares anteriores en SharePoint/OneDrive, y genera un borrador de propuesta comercial personalizada con: contexto del cliente, necesidades detectadas, solución recomendada, y pricing basado en propuestas anteriores similares.

**Ejemplo de uso:** *Pedro dice: "Necesito una propuesta para Telefónica, proyecto de migración cloud." PROPUESTA busca: 3 emails con Telefónica este mes, 1 reunión (resumen de Work IQ), 2 propuestas anteriores de migración en SharePoint. Genera un borrador de 5 páginas en 3 minutos con el contexto correcto, el pricing ajustado, y las referencias del cliente.*

**Ingredientes:** Copilot SDK + Work IQ MCP (Mail, Calendar, SharePoint/OneDrive) + Templates de propuesta + Generación de documentos Word/PDF

**Revenue:** €39-79/usuario/mes (se amortiza en 1 propuesta)  
**Tamaño de mercado:** España: ~600K profesionales de pre-venta/consultoras. Europa: ~8M  
**Competencia:** Qwilr, PandaDoc, Proposify (~$35-65/mes) hacen plantillas bonitas pero NO leen tus emails ni reuniones para rellenarlas. Son "moldes vacíos" — PROPUESTA es un "primer borrador inteligente."  
**Quick win?** ⚠️ 2-3 semanas — requiere templates y generación de documento.

---

## Categoría 3: RRHH y People

### 3.1 — SHERPA: Onboarding Inteligente

**Nombre:** SHERPA  
**¿Para quién?** Responsables de RRHH, People managers, directores de equipo (empresas 20-200 empleados)

**El dolor:** El nuevo empleado llega y durante 3 semanas navega a ciegas: "¿Dónde está el documento de vacaciones?" "¿Quién sabe de X?" "¿Cómo se hace Y aquí?" El manager pierde 10-15 horas las primeras semanas explicando lo mismo que explicó al anterior. El 33% de nuevos empleados busca otro trabajo dentro de los primeros 6 meses por mal onboarding.

**La solución:** SHERPA analiza SharePoint, emails y Teams de la empresa para construir un "mapa del conocimiento" del equipo: quién sabe de qué, dónde están los documentos clave, cuáles son los procesos recurrentes. Cuando llega un nuevo empleado, SHERPA le responde preguntas en lenguaje natural: "¿Cómo pido vacaciones?" → respuesta + link al documento + persona de contacto.

**Ejemplo de uso:** *María, nueva PM, pregunta en Teams: "@SHERPA ¿cómo funciona el proceso de facturación aquí?" SHERPA responde: "El proceso de facturación se detalla en [este documento de SharePoint]. Lo gestiona Carmen (Finanzas). Las facturas se envían los días 5 de cada mes. Carmen tuvo una reunión sobre cambios en el proceso el 3 de julio — aquí están las notas clave."*

**Ingredientes:** Copilot SDK + Work IQ MCP (SharePoint, People, Teams, Mail) + Vector DB (knowledge indexing) + Interfaz Teams Bot

**Revenue:** €5-10/empleado/mes (facturado por empresa)  
**Tamaño de mercado:** España: ~200K empresas con 20-200 empleados. Europa: ~3M  
**Competencia:** BambooHR, Rippling hacen onboarding de formularios (firmar documentos, elegir beneficios). Ninguno responde "¿cómo se hacen las cosas aquí?" basándose en el conocimiento real de la empresa.  
**Quick win?** ⚠️ 3-4 semanas — requiere indexación de SharePoint + interfaz Q&A.

---

### 3.2 — PULSO HUMANO: Clima Laboral en Tiempo Real

**Nombre:** PULSO HUMANO  
**¿Para quién?** Directors de RRHH, People Ops, CEO de PYMES

**El dolor:** Las encuestas de clima laboral son cada 6-12 meses, los resultados llegan tarde, y la gente miente. Mientras tanto, 3 personas están a punto de irse y nadie lo sabe. El coste de reemplazar un empleado es 6-9 meses de salario.

**La solución:** PULSO HUMANO analiza patrones de comunicación (sin leer contenido privado) para detectar señales de desengagement: personas que dejan de participar en grupos de Teams, que reducen sus respuestas a emails, que cancelan 1-on-1s, o que empiezan a comunicarse fuera de los canales habituales. Genera alertas agregadas y anónimas: "El equipo de Desarrollo ha reducido su participación en Teams un 40% este mes vs. la media de los últimos 3 meses."

**Ejemplo de uso:** *Sofía, directora de RRHH, recibe el dashboard mensual de PULSO HUMANO: "Alerta: El equipo de Atención al Cliente tiene un índice de engagement un 35% por debajo de la media de la empresa. 2 personas no han participado en ninguna reunión de equipo en 2 semanas. El equipo de Marketing, en cambio, está en máximos de engagement tras el lanzamiento de campaña."*

**Ingredientes:** Copilot SDK + Work IQ MCP (Teams, Calendar, Mail — solo metadatos, no contenido) + Analytics engine + Dashboard

**Revenue:** €3-8/empleado/mes (modelo por headcount)  
**Tamaño de mercado:** España: ~150K empresas target. Europa: ~2.5M  
**Competencia:** Workday Peakon, Culture Amp, Officevibe (~$5-8/empleado) hacen encuestas activas. PULSO HUMANO es pasivo — no requiere que nadie rellene nada. Diferenciación total.  
**Quick win?** ⚠️ 3-4 semanas — requiere cuidado con privacidad/GDPR y solo metadatos.

---

## Categoría 4: Legal y Compliance

### 4.1 — CENTINELA LEGAL: Vigilante de Contratos

**Nombre:** CENTINELA LEGAL  
**¿Para quién?** PYMES sin departamento legal (10-100 empleados), directores financieros, office managers que "también llevan contratos"

**El dolor:** La empresa tiene 30 contratos activos (proveedores, alquileres, seguros, software, clientes). Están en PDFs repartidos por SharePoint, OneDrive, y el email de 3 personas diferentes. Nadie sabe cuándo vencen, y cada año se renuevan automáticamente 2-3 contratos que deberían haberse cancelado (coste: €5K-20K en servicios innecesarios). El 71% de empresas ha tenido pérdidas por contratos mal gestionados.

**La solución:** CENTINELA LEGAL indexa todos los contratos de tu SharePoint/OneDrive, extrae fechas clave (inicio, fin, renovación automática, preaviso), identifica cláusulas de riesgo (penalizaciones, exclusividad, cambios de precio), y genera un calendario de alertas: "⚠️ El contrato con Vodafone se auto-renueva en 28 días. Cláusula de preaviso: 30 días. ACCIÓN NECESARIA HOY."

**Ejemplo de uso:** *Antonio, director financiero de una empresa de 60 personas, ve en su dashboard de CENTINELA: "Próximos 90 días: 4 contratos requieren atención. 🔴 Vodafone (renovación auto en 28 días, €14.400/año — ¿quieres renegociar?). 🟡 Seguro RC (vence en 60 días, pedir 3 presupuestos). 🟢 Alquiler oficina (sin acción, siguiente revisión en 11 meses)."*

**Ingredientes:** Copilot SDK + Work IQ MCP (SharePoint, OneDrive, Mail) + NLP extracción de contratos + Motor de alertas + Dashboard/email semanal

**Revenue:** €39-79/empresa/mes  
**Tamaño de mercado:** España: ~500K PYMES con contratos activos. Europa: ~8M  
**Competencia:** Ironclad, Evisort, Concord son enterprise (€500+/mes, implementación de semanas). CENTINELA es plug-and-play para PYMES: apuntas a tu SharePoint y empieza a funcionar.  
**Quick win?** ⚠️ 2-3 semanas — MVP con extracción de fechas + alertas. Análisis de cláusulas es fase 2.

---

### 4.2 — CUMPLE: Compliance y Normativa Simplificada

**Nombre:** CUMPLE  
**¿Para quién?** Responsables de calidad, DPOs (Data Protection Officers), directores de PYMES en sectores regulados

**El dolor:** GDPR, Ley de Protección de Datos, normativa sectorial, ISO 27001... El responsable de compliance dedica horas semanales a verificar si la empresa cumple, a documentar evidencias, y a preparar auditorías. En PYMES, esta persona es normalmente "alguien que también hace otras cosas."

**La solución:** CUMPLE monitoriza las comunicaciones y documentos de la empresa para detectar posibles incumplimientos: datos personales compartidos por email sin cifrar, contratos sin cláusula GDPR, políticas de seguridad desactualizadas en SharePoint. Genera un informe de compliance mensual y sugiere acciones correctivas.

**Ejemplo de uso:** *Elena, office manager que "también es la DPO", recibe el informe mensual de CUMPLE: "3 emails este mes contenían datos de clientes (DNI, cuenta bancaria) enviados sin cifrado. 1 contrato de proveedor en SharePoint no tiene cláusula de protección de datos. La política de contraseñas del documento IT tiene 18 meses sin actualizar."*

**Ingredientes:** Copilot SDK + Work IQ MCP (Mail, SharePoint, OneDrive) + Reglas de compliance configurables + Motor de detección + Informes

**Revenue:** €49-99/empresa/mes  
**Tamaño de mercado:** España: ~300K empresas en sectores regulados. Europa: ~5M  
**Competencia:** OneTrust, Securiti.ai, BigID son enterprise (€1.000+/mes). Vanta ($10K+/año) es para startups tech. Nadie sirve a la PYME española de 30 personas que necesita GDPR básico.  
**Quick win?** ⚠️ 3-4 semanas — detección de patrones de datos sensibles requiere fine-tuning.

---

## Categoría 5: Finanzas y Admin

### 5.1 — PULPO: Control de Gastos y Suscripciones

**Nombre:** PULPO  
**¿Para quién?** Directores financieros, controllers, office managers de PYMES

**El dolor:** La empresa tiene 47 suscripciones SaaS (Slack, Zoom, Adobe, HubSpot, Salesforce...). Nadie sabe exactamente cuáles son, cuánto cuestan en total, cuáles se usan realmente, y cuáles se renuevan automáticamente. Estudio de Gartner: el 25% del gasto en SaaS de las PYMES es desperdicio (licencias no usadas o duplicadas).

**La solución:** PULPO escanea emails de facturas, confirmaciones de suscripción, y documentos en SharePoint/OneDrive para crear un inventario completo de suscripciones: qué servicio, cuánto cuesta, cuándo renueva, quién lo pidió. Genera alertas antes de renovaciones y recomendaciones: "Tenéis Zoom Business (€160/mes) y Microsoft Teams (incluido en M365). ¿Realmente necesitáis ambos?"

**Ejemplo de uso:** *Roberto, CFO, recibe el informe mensual de PULPO: "Total suscripciones detectadas: 34. Gasto mensual total: €4.780. 🔴 3 suscripciones sin uso en 60 días (Miro, Canva Pro cuenta extra, Typeform) = €127/mes ahorrables. 🟡 Adobe Creative Cloud tiene 12 licencias pero solo 7 personas lo usaron este mes. 🟢 Próxima renovación: HubSpot en 15 días — ¿negociar descuento?"*

**Ingredientes:** Copilot SDK + Work IQ MCP (Mail, SharePoint, OneDrive) + Parser de facturas/emails de suscripción + Dashboard financiero

**Revenue:** €29-59/empresa/mes (se paga solo con 1 suscripción cancelada)  
**Tamaño de mercado:** España: ~400K PYMES con gasto SaaS significativo. Europa: ~6M  
**Competencia:** Zylo, Productiv, Torii (~$3-8/empleado/mes) son enterprise. Ninguno funciona leyendo emails — requieren integración SSO/SAML que PYMES no tienen.  
**Quick win?** ✅ Sí — MVP en 2 semanas. Buscar emails de "receipt", "invoice", "your subscription" + extraer datos.

---

### 5.2 — VISIÓN: Informes Financieros que se Hacen Solos

**Nombre:** VISIÓN  
**¿Para quién?** Controllers, directores financieros, CEOs de PYMES

**El dolor:** Cada mes, el controller dedica 2-3 días a preparar el informe financiero: recoger datos de diferentes fuentes, Excel con macros que se rompen, formato diferente cada vez porque el CEO quiere "este mes con gráficos", y siempre hay alguien que dice "pero estos números no cuadran con lo que me dijiste por email."

**La solución:** VISIÓN conecta los datos financieros que ya circulan por M365 (excels compartidos en SharePoint, emails con presupuestos aprobados, reuniones de budget review) y genera informes mensuales consistentes, siempre en el mismo formato, con comparativas automáticas vs. mes anterior y vs. presupuesto.

**Ejemplo de uso:** *Isabel, controller de una empresa de 90 personas, configura VISIÓN una vez: "Estos 3 excels de SharePoint son mis fuentes. Este es el formato del informe." Cada mes, VISIÓN genera el informe automáticamente, detecta anomalías ("El gasto en marketing subió un 45% vs. presupuesto — ¿error o aprobado?"), y lo envía al CEO y CFO.*

**Ingredientes:** Copilot SDK + Work IQ MCP (SharePoint, OneDrive, Mail) + Excel parsing + Template engine + Detección de anomalías

**Revenue:** €49-99/empresa/mes  
**Tamaño de mercado:** España: ~300K empresas con reporting financiero mensual. Europa: ~5M  
**Competencia:** Datarails, Vena Solutions (~$1.000+/mes) son FP&A enterprise. Las PYMES usan Excel + emails. Nadie automatiza el "Excel de SharePoint → informe bonito."  
**Quick win?** ⚠️ 3-4 semanas — parsing de Excel + generación de documentos es complejo.

---

## Categoría 6: Pequeño Negocio / Autónomo

### 6.1 — PILOTO: El Copiloto del Pequeño Empresario

**Nombre:** PILOTO  
**¿Para quién?** Autónomos y microempresas (1-5 personas) con M365 Business Basic

**El dolor:** El autónomo hace TODO: vende, factura, atiende clientes, gestiona proveedores, lleva la contabilidad... y usa su email como "sistema de gestión." Pierde facturas en la bandeja de entrada, olvida follow-ups con clientes, y no tiene tiempo para ser organizado. El 45% de PYMES españolas dice que falta de recursos financieros es su principal barrera, pero realmente es falta de TIEMPO.

**La solución:** PILOTO es un asistente diario que analiza tu email y calendario y te dice: "Hoy: 1) Enviar factura a Restaurante La Mar (prometiste por email hace 5 días). 2) Llamar a proveedor de material (llevas 3 emails sin cerrar precio). 3) La reunión de las 16:00 con el arquitecto — te recuerdo que la última vez hablasteis de cambiar el plazo a septiembre."

**Ejemplo de uso:** *Diego, electricista autónomo con 3 empleados, mira PILOTO a las 8:00: "🔴 Factura pendiente: obra Calle Mayor — terminada hace 8 días, no has enviado factura (último email al cliente: 'te mando la factura esta semana'). 🟡 Presupuesto para obra nueva: el cliente respondió ayer pidiendo descuento del 10%. 🟢 Proveedor de cable: el pedido llega mañana (confirmación por email del jueves)."*

**Ingredientes:** Copilot SDK + Work IQ MCP (Mail, Calendar) + Motor de detección de compromisos + Notificaciones push

**Revenue:** €9-15/mes por autónomo  
**Tamaño de mercado:** España: ~3.4M autónomos. 500K con M365 = target inmediato. Europa: ~30M  
**Competencia:** Todoist, Notion, Trello son herramientas de gestión manual — el autónomo tiene que meter los datos. PILOTO lee tu email y SABE qué tienes pendiente sin que hagas nada.  
**Quick win?** ✅ Sí — MVP en 1-2 semanas. Detección de compromisos en emails + resumen diario.

---

### 6.2 — COBRADOR: El que Asegura que te Paguen

**Nombre:** COBRADOR  
**¿Para quién?** Autónomos, pequeños empresarios, freelancers

**El dolor:** El 52% de las facturas a autónomos españoles se pagan tarde. El autónomo envía la factura y luego "se le olvida" hacer seguimiento. O le da vergüenza reclamar. O no sabe si la factura se recibió. Resultado: cash flow roto y estrés.

**La solución:** COBRADOR rastrea tus emails de facturas enviadas, detecta cuáles no han sido confirmadas/pagadas, y gestiona el seguimiento automático: primer recordatorio amable a los 7 días, segundo recordatorio firme a los 15, y alerta al autónomo a los 30 con un borrador de reclamación formal.

**Ejemplo de uso:** *Marta, diseñadora freelance, envió 4 facturas este mes. COBRADOR le dice: "✅ 2 facturas pagadas (Empresa A confirmó por email, Empresa B hizo transferencia). ⚠️ 1 factura sin confirmar desde hace 12 días (Empresa C — te he preparado un recordatorio amable). 🔴 1 factura de 45 días (Empresa D — borrador de reclamación formal listo para enviar)."*

**Ingredientes:** Copilot SDK + Work IQ MCP (Mail) + Parser de facturas + Templates de recordatorio/reclamación + Automatización de envíos

**Revenue:** €9-15/mes (o 1% del cobro recuperado — performance model)  
**Tamaño de mercado:** España: ~3.4M autónomos. Europa: ~30M  
**Competencia:** Holded, Quaderno, Factura Directa hacen facturación. NINGUNO hace seguimiento de cobros automático leyendo tu email.  
**Quick win?** ✅ Sí — MVP en 1-2 semanas. Pattern matching en emails + timers + drafts.

---

## Categoría 7: Sector Específico (Wild Cards)

### 7.1 — INMOBILIARIA: Matching Inteligente Cliente-Propiedad

**Nombre:** INMOBILIARIA  
**¿Para quién?** Agentes inmobiliarios, pequeñas agencias inmobiliarias (1-20 agentes)

**El dolor:** El agente inmobiliario recibe emails de clientes con sus preferencias ("busco un piso de 3 habitaciones en Chamberí, máximo 400K"), tiene propiedades listadas en portales y documentos internos, y hace el matching MENTAL. Cuando llega una propiedad nueva, no recuerda qué clientes la querrían. Cuando un cliente llama, no recuerda qué tiene disponible para él.

**La solución:** INMOBILIARIA analiza todos los emails con clientes, extrae sus preferencias (zona, precio, tamaño, características), las cruza con las propiedades disponibles (documentos en SharePoint, emails de propietarios), y genera matchings automáticos: "Nueva propiedad en Chamberí, 3 hab, 380K — match con 3 clientes: Juan (98% match), Ana (85%), Pedro (72%)."

**Ejemplo de uso:** *Carlos, agente inmobiliario, recibe email de un propietario con un nuevo piso. INMOBILIARIA automáticamente: 1) Extrae datos del piso. 2) Cruza con preferencias de 45 clientes activos (extraídas de emails). 3) Genera email personalizado para los 5 mejores matches: "Hola Juan, acaba de salir un piso que encaja con lo que me pediste — 3 hab, Chamberí, 380K."*

**Ingredientes:** Copilot SDK + Work IQ MCP (Mail, OneDrive) + NLP extracción de preferencias + Motor de matching + Templates de email

**Revenue:** €49-99/agente/mes (o €199-399/agencia)  
**Tamaño de mercado:** España: ~80K agentes inmobiliarios. Europa: ~1.2M  
**Competencia:** CRMs inmobiliarios (Inmovilla, Witei, ~€30-60/mes) gestionan propiedades pero NO leen emails de clientes para extraer preferencias automáticamente. El matching es manual.  
**Quick win?** ⚠️ 2-3 semanas — extracción de preferencias es el reto principal.

---

### 7.2 — CLÍNICA: Gestión de Comunicación con Pacientes

**Nombre:** CLÍNICA  
**¿Para quién?** Recepcionistas y gerentes de clínicas privadas (dental, oftalmología, estética, fisioterapia)

**El dolor:** La clínica de 3-5 médicos tiene 200 pacientes activos. La recepcionista dedica 2-3 horas/día a: recordar citas por email/teléfono, responder "¿puedo cambiar mi cita?", gestionar cancelaciones y huecos, y seguimiento de pacientes que no han vuelto. Todo manual.

**La solución:** CLÍNICA automatiza la comunicación con pacientes: envía recordatorios de cita personalizados (no SMS genéricos — "María, recuerda tu limpieza dental el jueves a las 10:00 con el Dr. López"), detecta cancelaciones y sugiere pacientes de lista de espera para rellenar huecos, y genera seguimiento para pacientes que llevan +6 meses sin visita.

**Ejemplo de uso:** *La clínica dental de la Dra. Pérez tiene 15 citas mañana. CLÍNICA envía recordatorios personalizados a las 15 personas. Cuando el paciente 7 cancela por email a las 20:00, CLÍNICA detecta el hueco, busca en lista de espera, y envía email a 3 pacientes: "Hola Pablo, ha quedado disponible un hueco para mañana a las 11:30. ¿Te interesa?"*

**Ingredientes:** Copilot SDK + Work IQ MCP (Mail, Calendar) + Motor de scheduling + Templates médicas + Listas de espera

**Revenue:** €99-199/clínica/mes  
**Tamaño de mercado:** España: ~50K clínicas privadas. Europa: ~800K  
**Competencia:** Doctoralia, Docplanner (~€100-300/mes) hacen agenda online pero NO gestionan comunicación activa con pacientes basada en emails.  
**Quick win?** ⚠️ 2-3 semanas — requiere cuidado con datos de salud (RGPD reforzado).

---

### 7.3 — PROFE: Asistente para Profesores

**Nombre:** PROFE  
**¿Para quién?** Profesores de secundaria/universidad, jefes de estudio, coordinadores académicos

**El dolor:** El profesor de 4 grupos con 30 alumnos cada uno recibe 80-120 emails de padres/alumnos a la semana. Muchos preguntan lo mismo ("¿cuándo es el examen?", "¿qué entró?"). El tutor dedica 3-4 horas/semana a responder emails repetitivos y a preparar informes para familias.

**La solución:** PROFE analiza los emails entrantes, clasifica las preguntas (académica, administrativa, personal), genera borradores de respuesta basados en la información que el profesor ya tiene en su calendario y documentos compartidos, e identifica patrones: "5 padres han preguntado por las notas del segundo trimestre esta semana — ¿quieres enviar un comunicado general?"

**Ejemplo de uso:** *Ana, tutora de 2º ESO, recibe 15 emails el martes. PROFE los clasifica: "5 preguntan por la fecha del examen (está en tu calendario: 18 de julio). 3 piden tutoría. 2 preguntan por notas. 5 son circulares." PROFE genera 5 borradores de respuesta idénticos para la fecha del examen, y sugiere: "¿Envío un email general al grupo con las fechas de exámenes?"*

**Ingredientes:** Copilot SDK + Work IQ MCP (Mail, Calendar, OneDrive) + Clasificador de preguntas + Templates educativas

**Revenue:** €9-15/profesor/mes (o €99-199/centro educativo)  
**Tamaño de mercado:** España: ~700K profesores. Europa: ~8M  
**Competencia:** Google Classroom, Microsoft Teams for Education gestionan contenido pero NO automatizan respuesta a emails de familias.  
**Quick win?** ✅ Sí — MVP en 2 semanas. Clasificación de emails + borradores de respuesta.

---

### 7.4 — DESPACHO: Asistente para Despachos Profesionales

**Nombre:** DESPACHO  
**¿Para quién?** Gestorías, asesorías fiscales/laborales, despachos de abogados pequeños (2-15 personas)

**El dolor:** El gestor/asesor tiene 80-150 clientes. Cada trimestre tiene que recordarles que envíen sus facturas para la declaración. Cada año, recordar el impuesto de sociedades, las cuentas anuales, los modelos fiscales. Todo por email, uno por uno. Y cuando el cliente pregunta "¿qué me falta por presentar?", el asesor tiene que buscarlo en 5 sitios diferentes.

**La solución:** DESPACHO gestiona el calendario fiscal de todos tus clientes, envía recordatorios automatizados y personalizados ("Hola Juan, recuerda que necesito tus facturas del Q2 antes del 15 de julio para el modelo 303"), y cuando un cliente escribe preguntando, genera una respuesta con el estado de todas sus obligaciones pendientes.

**Ejemplo de uso:** *La gestoría de Luis tiene 120 clientes. Es 1 de julio. DESPACHO envía automáticamente recordatorios a los 120 clientes sobre el modelo 303 del Q2 (personalizado con el nombre de cada cliente y su referencia). Cuando el cliente Antonio responde "ya te envié las facturas la semana pasada", DESPACHO cruza con los emails y confirma: "Sí, recibidas el 28/06 — 4 facturas por total de €12.340."*

**Ingredientes:** Copilot SDK + Work IQ MCP (Mail, Calendar, OneDrive) + Calendario fiscal español + Templates regulatorias + Motor de seguimiento

**Revenue:** €29-49/usuario/mes (asesor) o €199-399/despacho/mes  
**Tamaño de mercado:** España: ~90K gestorías/asesorías. Europa: ~1.5M  
**Competencia:** A3, Sage Despachos, Wolters Kluwer (~€50-200/mes) son software de gestión fiscal. Ninguno automatiza la COMUNICACIÓN con clientes por email.  
**Quick win?** ✅ Sí — MVP en 2 semanas. Calendario fiscal + templates + envío automático.

---

### 7.5 — CAMPUS: Coordinador Académico Inteligente

**Nombre:** CAMPUS  
**¿Para quién?** Coordinadores de máster/grado, secretarías académicas de universidades privadas y escuelas de negocio

**El dolor:** El coordinador de un máster con 30 alumnos y 15 profesores gestiona cambios de horario, sustituciones, entrega de notas, y comunicación entre profesores-alumnos-dirección. Todo por email. Cuando un profesor cancela clase a las 22:00, el coordinador tiene que notificar a 30 alumnos, buscar sustituto, y reorganizar. Caos.

**La solución:** CAMPUS monitoriza los emails del programa, detecta cambios (cancelaciones, retrasos, conflictos de horario), notifica automáticamente a los afectados, y sugiere soluciones: "El profesor García canceló mañana. El profesor López tiene hueco el jueves de 16-18h. ¿Reorganizo?"

**Ejemplo de uso:** *El profesor de Contabilidad envía email a las 21:00: "No puedo dar clase mañana." CAMPUS detecta, identifica a los 28 alumnos matriculados, envía notificación personalizada, busca en el calendario de los otros 14 profesores huecos compatibles, y sugiere al coordinador 2 opciones de reprogramación.*

**Ingredientes:** Copilot SDK + Work IQ MCP (Mail, Calendar, People) + Motor de scheduling + Notificaciones masivas personalizadas

**Revenue:** €199-499/programa/mes  
**Tamaño de mercado:** España: ~2.000 programas de máster/posgrado privados. Europa: ~30K  
**Competencia:** Moodle, Canvas, Blackboard son LMS (contenido). Ninguno gestiona la logística humana (emails, cambios, comunicación).  
**Quick win?** ⚠️ 2-3 semanas — detección de cambios en emails + scheduling.

---

## Matriz de Priorización

| # | Producto | Revenue/mes | Quick Win? | Mercado España | Competencia | Pain Level | Score |
|---|----------|-------------|------------|----------------|-------------|------------|-------|
| 1 | **LUNES** | €15-25/usr | ✅ 1-2 sem | 800K | Baja | 🔴🔴🔴 | ⭐⭐⭐⭐⭐ |
| 2 | **CERRADOR** | €29-49/usr | ✅ 2 sem | 1.2M | Media | 🔴🔴🔴 | ⭐⭐⭐⭐⭐ |
| 3 | **PILOTO** | €9-15/usr | ✅ 1-2 sem | 500K | Baja | 🔴🔴🔴 | ⭐⭐⭐⭐⭐ |
| 4 | **COBRADOR** | €9-15/usr | ✅ 1-2 sem | 3.4M | Baja | 🔴🔴🔴 | ⭐⭐⭐⭐⭐ |
| 5 | **CENTINELA LEGAL** | €39-79/emp | ⚠️ 2-3 sem | 500K | Media | 🔴🔴 | ⭐⭐⭐⭐ |
| 6 | **PULPO** | €29-59/emp | ✅ 2 sem | 400K | Media | 🔴🔴 | ⭐⭐⭐⭐ |
| 7 | **BRÚJULA** | €29-49/usr | ✅ 1-2 sem | 200K | Baja | 🔴🔴 | ⭐⭐⭐⭐ |
| 8 | **DESPACHO** | €29-49/usr | ✅ 2 sem | 90K | Media | 🔴🔴🔴 | ⭐⭐⭐⭐ |
| 9 | **PROFE** | €9-15/usr | ✅ 2 sem | 700K | Baja | 🔴🔴 | ⭐⭐⭐⭐ |
| 10 | **PROPUESTA** | €39-79/usr | ⚠️ 2-3 sem | 600K | Media | 🔴🔴🔴 | ⭐⭐⭐ |
| 11 | **INMOBILIARIA** | €49-99/agente | ⚠️ 2-3 sem | 80K | Media | 🔴🔴 | ⭐⭐⭐ |
| 12 | **RADAR** | €19-39/usr | ⚠️ 2-3 sem | 400K | Baja | 🔴🔴 | ⭐⭐⭐ |
| 13 | **SHERPA** | €5-10/emp | ⚠️ 3-4 sem | 200K | Media | 🔴🔴 | ⭐⭐⭐ |
| 14 | **CLÍNICA** | €99-199/clínica | ⚠️ 2-3 sem | 50K | Media | 🔴🔴 | ⭐⭐⭐ |
| 15 | **VISIÓN** | €49-99/emp | ⚠️ 3-4 sem | 300K | Alta | 🔴🔴 | ⭐⭐ |
| 16 | **PULSO HUMANO** | €3-8/emp | ⚠️ 3-4 sem | 150K | Alta | 🔴 | ⭐⭐ |
| 17 | **CUMPLE** | €49-99/emp | ⚠️ 3-4 sem | 300K | Alta | 🔴🔴 | ⭐⭐ |
| 18 | **CAMPUS** | €199-499/prog | ⚠️ 2-3 sem | 2K | Baja | 🔴🔴 | ⭐⭐ |

**Criterios de scoring:**
- ⭐⭐⭐⭐⭐ = Quick win + mercado grande + competencia baja + dolor alto
- ⭐⭐⭐⭐ = Fuerte en 3 de 4 criterios
- ⭐⭐⭐ = Fuerte en 2 de 4 criterios
- ⭐⭐ = Potencial pero requiere más desarrollo o tiene competencia fuerte

---

## El Patrón Común: MCP + Work IQ = Superpoder

Todos estos productos comparten la MISMA infraestructura técnica:

```
┌─────────────────────────────────────────────────┐
│                 Copilot SDK                      │
│          (orquestación agéntica)                 │
└──────────┬─────────────┬────────────────────────┘
           │             │
    ┌──────▼──────┐  ┌──▼────────────────────┐
    │  Work IQ    │  │  MCP Custom Server    │
    │  MCP Server │  │  (dominio específico) │
    │             │  │                       │
    │  • Mail     │  │  • Fiscal (DESPACHO)  │
    │  • Calendar │  │  • Inmobiliario       │
    │  • Teams    │  │  • Clínico            │
    │  • SharePt  │  │  • Educativo          │
    │  • OneDrive │  │  • Legal              │
    │  • People   │  │  • CRM sync           │
    └─────────────┘  └───────────────────────┘
```

**Implicación estratégica:** Construir 1 producto = construir la plataforma. El segundo producto es 70% más rápido. El tercero, 90%. SS debería empezar con LUNES o PILOTO (quick win máximo), validar el mercado, y luego expandir rápidamente.

---

## Próximos Pasos

### Fase 1: Validación (Semanas 1-2)
1. **Elegir 2 productos para MVP** — recomendación: LUNES (B2B) + PILOTO (B2C/autónomos)
2. **Construir infraestructura compartida** — Work IQ MCP + Copilot SDK base + Azure Functions
3. **MVP funcional** — email semanal (LUNES) o diario (PILOTO) con resumen generado

### Fase 2: Mercado (Semanas 3-4)
4. **Landing page** — "¿Cuántas horas pierdes preparando informes? Deja que LUNES lo haga."
5. **Beta cerrada** — 10-20 usuarios reales con M365
6. **Pricing test** — A/B test €15 vs €25/mes

### Fase 3: Escala (Mes 2-3)
7. **Segundo producto** — CERRADOR o COBRADOR según tracción
8. **Kit Digital** — subvención española de hasta €12.000 para digitalización PYME → canal de adquisición
9. **Partner con distribuidores M365** — los partners de Microsoft buscan valor añadido para vender M365

### Decisión Necesaria
joperezd: **¿Cuáles te hacen decir "SHUT UP AND TAKE MY MONEY"?** Elige 2-3 y construimos MVPs esta semana.

---

## Investigación de Mercado — Datos Clave

### Dolores de productividad (2025-2026)
- 31 horas/mes en reuniones improductivas
- 28% del tiempo laboral = gestionar email
- Solo 2h53min productivas reales al día
- $1.7T pérdidas anuales por ineficiencias en EEUU

### Limitaciones de M365 Copilot (nuestro hueco)
- Sin memoria entre sesiones
- No cruza datos entre apps (resume en cada app por separado)
- Caro para PYMES (€28.10/usuario/mes + licencia M365)
- No genera acciones automáticas — solo responde cuando le preguntas
- Integración débil fuera del ecosistema Microsoft

### PYMES España
- 3.4M autónomos
- Solo 21% usa factura electrónica
- 61% tiene digitalización básica
- 45% dice que la falta de recursos es la barrera principal
- Kit Digital: hasta €12.000 en subvenciones disponibles
- Solo 10-22% ha adoptado IA

### Mercado AI Agents
- $7.63B globales en 2025
- CAGR 49.6% hasta 2033
- 70% de Fortune 500 ya usa M365 Copilot
- Mercado de asistentes de reuniones AI: $3-4B en 2025 → $15.2B en 2032

---

*Oracle ve el patrón: el dinero no está en vender a developers, está en resolver los problemas que TODOS tienen pero nadie automatiza. El email es el sistema de gestión del 90% de las empresas. Quien sepa leerlo y actuar sobre él, gana.*
