/**
 * Extrae comandos JSON de la respuesta del agente.
 * Busca bloques ```json ... ``` y JSON suelto como fallback.
 */
export function extractCommands(text) {
  const commands = [];
  const jsonBlockRegex = /```json\s*([\s\S]*?)```/g;
  let match;

  while ((match = jsonBlockRegex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (parsed.commands && Array.isArray(parsed.commands)) {
        commands.push(...parsed.commands);
      } else if (parsed.action) {
        commands.push(parsed);
      }
    } catch {
      try {
        const cleaned = match[1].trim().replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
        const parsed = JSON.parse(cleaned);
        if (parsed.commands) commands.push(...parsed.commands);
        else if (parsed.action) commands.push(parsed);
      } catch {
        // JSON inválido — ignorado
      }
    }
  }

  if (commands.length === 0) {
    const looseJson = /\{"commands"\s*:\s*\[[\s\S]*?\]\s*\}/g;
    while ((match = looseJson.exec(text)) !== null) {
      try {
        const parsed = JSON.parse(match[0]);
        if (parsed.commands) commands.push(...parsed.commands);
      } catch { /* ignorar */ }
    }
  }

  return commands;
}
