import fs from 'fs';
import path from 'path';

export interface Decision {
  date: string;
  title: string;
  by: string;
  tier: string;
  summary: string;
}

export function getRecentDecisions(count: number = 5): Decision[] {
  try {
    const decisionsPath = path.join(process.cwd(), '../.squad/decisions.md');
    const content = fs.readFileSync(decisionsPath, 'utf-8');
    
    const decisions: Decision[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('### 2026-')) {
        const dateMatch = line.match(/### (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z): (.+)/);
        if (!dateMatch) continue;
        
        const date = dateMatch[1];
        const title = dateMatch[2];
        
        let by = '';
        let tier = '';
        let summary = '';
        
        for (let j = i + 1; j < lines.length && j < i + 10; j++) {
          if (lines[j].startsWith('**By:**')) {
            by = lines[j].replace('**By:**', '').trim();
          }
          if (lines[j].startsWith('**Tier:**')) {
            tier = lines[j].replace('**Tier:**', '').trim();
          }
          if (lines[j].startsWith('**What:**')) {
            summary = lines[j].replace('**What:**', '').trim();
          }
          if (lines[j].startsWith('###')) break;
        }
        
        if (by && title) {
          decisions.push({ date, title, by, tier, summary });
        }
        
        if (decisions.length >= count) break;
      }
    }
    
    return decisions;
  } catch (error) {
    console.error('Error reading decisions:', error);
    return [];
  }
}

export interface TeamMember {
  name: string;
  role: string;
  emoji: string;
  status: string;
}

export function getTeamRoster(): TeamMember[] {
  return [
    { name: 'Morpheus', role: 'Lead/Architect', emoji: '🕶️', status: '✅ Active' },
    { name: 'Trinity', role: 'Full-Stack Developer', emoji: '⚡', status: '✅ Active' },
    { name: 'Tank', role: 'Cloud Engineer', emoji: '☁️', status: '✅ Active' },
    { name: 'Switch', role: 'Tester/QA', emoji: '🔧', status: '✅ Active' },
    { name: 'Oracle', role: 'Product & Docs', emoji: '📋', status: '✅ Active' },
    { name: '@copilot', role: 'Coding Agent', emoji: '🤖', status: '🤖 Autonomous' },
    { name: 'Scribe', role: 'Session Logger', emoji: '📝', status: '📋 Silent' },
    { name: 'Ralph', role: 'Work Monitor', emoji: '👁️', status: '🔄 Monitor' },
  ];
}
