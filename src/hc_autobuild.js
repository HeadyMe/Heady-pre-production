// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  █╗  █╗███████╗ █████╗ ██████╗ █╗   █╗                     ║
// ║  █║  █║█╔════╝█╔══█╗█╔══█╗╚█╗ █╔╝                     ║
// ║  ███████║█████╗  ███████║█║  █║ ╚████╔╝                      ║
// ║  █╔══█║█╔══╝  █╔══█║█║  █║  ╚█╔╝                       ║
// ║  █║  █║███████╗█║  █║██████╔╝   █║                        ║
// ║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                        ║
// ║                                                                  ║
// ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
// ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
// ║  FILE: src/hc_autobuild.js                                        ║
// ║  LAYER: backend/src                                               ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('\n🔨 Heady AutoBuild - Sacred Geometry Build System with Codemap Optimization\n');

const WORKTREE_BASE = (() => {
  const explicit = process.env.WINDSURF_WORKTREES || process.env.HEADY_WORKTREES;
  if (explicit && typeof explicit === 'string' && explicit.trim()) return explicit.trim();

  const userProfile = process.env.USERPROFILE || process.env.HOME;
  if (!userProfile) return null;
  return path.join(userProfile, '.windsurf', 'worktrees');
})();

function discoverWorktrees() {
  const roots = [process.cwd()];

  if (WORKTREE_BASE && fs.existsSync(WORKTREE_BASE)) {
    const namespaces = fs.readdirSync(WORKTREE_BASE, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => path.join(WORKTREE_BASE, d.name));

    namespaces.forEach(nsPath => {
      let children = [];
      try {
        children = fs.readdirSync(nsPath, { withFileTypes: true })
          .filter(d => d.isDirectory())
          .map(d => path.join(nsPath, d.name));
      } catch {
        children = [];
      }

      children.forEach(childPath => {
        const base = path.basename(childPath);
        if (base.includes('-') || fs.existsSync(path.join(childPath, '.git'))) {
          roots.push(childPath);
        }
      });
    });
  }

  return [...new Set(roots.filter(p => {
    try {
      return fs.existsSync(p) && fs.statSync(p).isDirectory();
    } catch {
      return false;
    }
  }))];
}

function findBuildableProjects(baseDir, depth = 2) {
  const projects = [];
  
  function scan(dir, currentDepth) {
    if (currentDepth > depth) return;
    
    const packageJson = path.join(dir, 'package.json');
    if (fs.existsSync(packageJson)) {
      projects.push(dir);
    }
    
    // Scan subdirectories
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      entries.forEach(entry => {
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          scan(path.join(dir, entry.name), currentDepth + 1);
        }
      });
    } catch (err) {
      // Skip inaccessible directories
    }
  }
  scan(baseDir, 0);
  return projects;
}

function buildProject(projectPath) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return { success: false, reason: 'No package.json' };
  }
  
  console.log(`📦 Building: ${projectPath}`);
  
  try {
    // Read package.json to check for build scripts
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Install dependencies
    execSync('pnpm install --frozen-lockfile 2>nul || pnpm install', { 
      cwd: projectPath, 
      stdio: 'inherit',
      shell: true
    });
    
    // Run build if available
    if (pkg.scripts && pkg.scripts.build) {
      console.log(`  🔧 Running build script...`);
      execSync('pnpm run build', { cwd: projectPath, stdio: 'inherit' });
    }
    
    console.log(`✅ ${path.basename(projectPath)} - Build complete\n`);
    return { success: true };
  } catch (error) {
    console.log(`⚠️  ${path.basename(projectPath)} - Build failed: ${error.message}\n`);
    return { success: false, reason: error.message };
  }
}

// Main execution
const worktrees = discoverWorktrees();
console.log(`🔍 Discovered ${worktrees.length} worktrees:\n`);
worktrees.forEach(wt => console.log(`   • ${wt}`));
console.log('');

const allProjects = [];
worktrees.forEach(wt => {
  const projects = findBuildableProjects(wt);
  allProjects.push(...projects);
});

const uniqueProjects = [...new Set(allProjects)];
console.log(`📋 Found ${uniqueProjects.length} buildable projects\n`);

const results = { success: 0, failed: 0 };
uniqueProjects.forEach(project => {
  const result = buildProject(project);
  if (result.success) results.success++;
  else results.failed++;
});

console.log('═'.repeat(60));
console.log('✅ Heady AutoBuild Complete!');
console.log(`   Success: ${results.success} | Failed: ${results.failed}`);
console.log('═'.repeat(60) + '\n');
