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
  tagline: string;
}

export function getTeamRoster(): TeamMember[] {
  return [
    { name: 'Morpheus', role: 'Lead/Architect', emoji: '🕶️', status: '✅ Active', tagline: 'I can only show you the door' },
    { name: 'Trinity', role: 'Full-Stack Developer', emoji: '⚡', status: '✅ Active', tagline: 'Full-stack, full-speed' },
    { name: 'Tank', role: 'Cloud Engineer', emoji: '☁️', status: '✅ Active', tagline: 'Infrastructure is the matrix' },
    { name: 'Switch', role: 'Tester/QA', emoji: '🔧', status: '✅ Active', tagline: 'Every line deserves a test' },
    { name: 'Oracle', role: 'Product & Docs', emoji: '📋', status: '✅ Active', tagline: 'You already know the answer' },
    { name: 'Mouse', role: 'UI/UX Designer', emoji: '🎨', status: '✅ Active', tagline: 'If it looks good, it works' },
    { name: '@copilot', role: 'Coding Agent', emoji: '🤖', status: '🤖 Autonomous', tagline: 'Always coding, never sleeping' },
    { name: 'Ralph', role: 'Work Monitor', emoji: '👁️', status: '🔄 Monitor', tagline: 'Nothing escapes the watcher' },
  ];
}

export interface ConstellationRepo {
  name: string;
  fullName: string;
  description: string;
  url: string;
  type: 'hub' | 'downstream' | 'game' | 'tool';
  stars?: number;
  openIssues?: number;
  lastPush?: string;
}

const repoMeta: Record<string, { description: string; type: ConstellationRepo['type'] }> = {
  'Syntax-Sorcery': { description: 'Hub — Autonomous software company HQ', type: 'hub' },
  'FirstFrameStudios': { description: 'Downstream — Indie game studio', type: 'downstream' },
  'flora': { description: 'Game — A botanical adventure', type: 'game' },
  'ComeRosquillas': { description: 'Game — Arcade donut runner', type: 'game' },
  'pixel-bounce': { description: 'Game — Pixel art bouncer', type: 'game' },
  'ffs-squad-monitor': { description: 'Tool — Ops monitoring dashboard', type: 'tool' },
};

function loadConstellationRepos(): string[] {
  try {
    const constellationPath = path.join(process.cwd(), '../.squad/constellation.json');
    const content = fs.readFileSync(constellationPath, 'utf-8');
    return JSON.parse(content).repos || [];
  } catch {
    return [];
  }
}

export function getConstellation(): ConstellationRepo[] {
  return loadConstellationRepos().map((repo: string) => {
    const name = repo.split('/')[1] || repo;
    const meta = repoMeta[name] || { description: 'Repository', type: 'downstream' as const };
    return { name, fullName: repo, description: meta.description, url: `https://github.com/${repo}`, type: meta.type };
  });
}

/** Fetch live stats from GitHub API at build time. Falls back to static data on failure. */
export async function getConstellationWithStats(): Promise<ConstellationRepo[]> {
  const repos = loadConstellationRepos();
  const results: ConstellationRepo[] = [];

  for (const repo of repos) {
    const name = repo.split('/')[1] || repo;
    const meta = repoMeta[name] || { description: 'Repository', type: 'downstream' as const };
    const base: ConstellationRepo = { name, fullName: repo, description: meta.description, url: `https://github.com/${repo}`, type: meta.type };

    try {
      const res = await fetch(`https://api.github.com/repos/${repo}`, {
        headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'SyntaxSorcery-Site' },
      });
      if (res.ok) {
        const data = await res.json();
        base.stars = data.stargazers_count ?? 0;
        base.openIssues = data.open_issues_count ?? 0;
        base.lastPush = data.pushed_at ?? '';
      }
    } catch {
      // Graceful fallback — stats stay undefined
    }

    results.push(base);
  }

  return results;
}
