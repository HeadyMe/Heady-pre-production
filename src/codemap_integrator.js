/**
 * CODEMAP INTEGRATOR
 * 
 * Scans all codemap files across all workspaces and integrates beneficial data
 * into a unified knowledge base for HeadyMaid and the checkpoint system.
 */

const fs = require('fs').promises;
const path = require('path');

class CodemapIntegrator {
  constructor(config = {}) {
    this.config = {
      workspaces: config.workspaces || [
        'c:\\Users\\erich\\Heady',
        'c:\\Users\\erich\\Projects',
        'c:\\Users\\erich\\CascadeProjects',
        'f:\\Heady',
        'f:\\HeadyConnection'
      ],
      outputPath: config.outputPath || 'c:\\Users\\erich\\Heady\\.heady-context',
      ...config
    };

    this.integratedData = {
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      sources: [],
      concepts: {},
      services: {},
      tools: {},
      agents: {},
      infrastructure: {},
      security: {
        critical: [],
        moderate: [],
        low: []
      },
      performance: [],
      gaps: [],
      files: new Map(),
      metadata: {}
    };
  }

  async integrate() {
    console.log('[CODEMAP INTEGRATOR] Starting comprehensive scan...');
    
    await this.scanCodemaps();
    await this.scanConceptRegistries();
    await this.scanProjectContexts();
    await this.scanHeadyRegistries();
    await this.extractBeneficialData();
    await this.saveIntegratedData();
    
    console.log('[CODEMAP INTEGRATOR] Integration complete');
    return this.integratedData;
  }

  async scanCodemaps() {
    console.log('[CODEMAP INTEGRATOR] Scanning codemap files...');
    
    const codemapPaths = [
      'c:\\Users\\erich\\Heady\\.heady-context\\codemap.json',
      'c:\\Users\\erich\\Projects\\packages\\shared\\state\\codemap.json',
      'c:\\Users\\erich\\Projects\\_archive\\shared_legacy\\state\\codemap.json'
    ];

    for (const codemapPath of codemapPaths) {
      try {
        const data = await fs.readFile(codemapPath, 'utf8');
        const codemap = JSON.parse(data);
        
        this.integratedData.sources.push({
          type: 'codemap',
          path: codemapPath,
          timestamp: codemap.generated_at || codemap.timestamp,
          version: codemap.version
        });

        // Extract services
        if (codemap.codemap?.mcp_services) {
          Object.assign(this.integratedData.services, codemap.codemap.mcp_services);
        }

        // Extract infrastructure
        if (codemap.codemap?.infrastructure) {
          Object.assign(this.integratedData.infrastructure, codemap.codemap.infrastructure);
        }

        // Extract security issues
        if (codemap.security_audit) {
          if (codemap.security_audit.critical) {
            this.integratedData.security.critical.push(...codemap.security_audit.critical);
          }
          if (codemap.security_audit.moderate) {
            this.integratedData.security.moderate.push(...codemap.security_audit.moderate);
          }
        }

        // Extract performance issues
        if (codemap.performance_issues) {
          this.integratedData.performance.push(...codemap.performance_issues);
        }

        // Extract gaps
        if (codemap.functionality_gaps) {
          this.integratedData.gaps.push(...codemap.functionality_gaps);
        }

        console.log(`[CODEMAP INTEGRATOR] Loaded: ${codemapPath}`);
      } catch (err) {
        console.log(`[CODEMAP INTEGRATOR] Skipped ${codemapPath}: ${err.message}`);
      }
    }
  }

  async scanConceptRegistries() {
    console.log('[CODEMAP INTEGRATOR] Scanning concept registries...');
    
    const registryPaths = [
      'c:\\Users\\erich\\CascadeProjects\\heady_concept_registry.json'
    ];

    for (const registryPath of registryPaths) {
      try {
        const data = await fs.readFile(registryPath, 'utf8');
        const registry = JSON.parse(data);
        
        this.integratedData.sources.push({
          type: 'concept_registry',
          path: registryPath
        });

        if (registry.concepts) {
          for (const [name, concept] of Object.entries(registry.concepts)) {
            this.integratedData.concepts[name] = {
              name: concept.name,
              files: concept.files || [],
              score: concept.score || 0,
              status: concept.status || 'unknown',
              totalScore: concept.total_score || 0
            };
          }
        }

        console.log(`[CODEMAP INTEGRATOR] Loaded ${Object.keys(registry.concepts || {}).length} concepts`);
      } catch (err) {
        console.log(`[CODEMAP INTEGRATOR] Skipped ${registryPath}: ${err.message}`);
      }
    }
  }

  async scanProjectContexts() {
    console.log('[CODEMAP INTEGRATOR] Scanning project contexts...');
    
    const contextPaths = [
      'c:\\Users\\erich\\Heady\\.heady-context\\project-context.json'
    ];

    for (const contextPath of contextPaths) {
      try {
        const data = await fs.readFile(contextPath, 'utf8');
        const context = JSON.parse(data);
        
        this.integratedData.sources.push({
          type: 'project_context',
          path: contextPath,
          timestamp: context.timestamp
        });

        if (context.project) {
          this.integratedData.metadata.project = context.project;
        }

        if (context.intelligence) {
          this.integratedData.metadata.intelligence = context.intelligence;
        }

        console.log(`[CODEMAP INTEGRATOR] Loaded: ${contextPath}`);
      } catch (err) {
        console.log(`[CODEMAP INTEGRATOR] Skipped ${contextPath}: ${err.message}`);
      }
    }
  }

  async scanHeadyRegistries() {
    console.log('[CODEMAP INTEGRATOR] Scanning Heady registries...');
    
    const registryPaths = [
      'c:\\Users\\erich\\Heady\\.heady-memory\\heady-registry.json'
    ];

    for (const registryPath of registryPaths) {
      try {
        const data = await fs.readFile(registryPath, 'utf8');
        const registry = JSON.parse(data);
        
        this.integratedData.sources.push({
          type: 'heady_registry',
          path: registryPath
        });

        if (registry.agents) {
          Object.assign(this.integratedData.agents, registry.agents);
        }

        if (registry.tools) {
          Object.assign(this.integratedData.tools, registry.tools);
        }

        console.log(`[CODEMAP INTEGRATOR] Loaded: ${registryPath}`);
      } catch (err) {
        console.log(`[CODEMAP INTEGRATOR] Skipped ${registryPath}: ${err.message}`);
      }
    }
  }

  async extractBeneficialData() {
    console.log('[CODEMAP INTEGRATOR] Extracting beneficial data...');
    
    // Deduplicate security issues
    this.integratedData.security.critical = this.deduplicateIssues(this.integratedData.security.critical);
    this.integratedData.security.moderate = this.deduplicateIssues(this.integratedData.security.moderate);
    
    // Deduplicate performance issues
    this.integratedData.performance = this.deduplicateIssues(this.integratedData.performance);
    
    // Deduplicate gaps
    this.integratedData.gaps = this.deduplicateIssues(this.integratedData.gaps);
    
    // Extract unique file paths from concepts
    for (const concept of Object.values(this.integratedData.concepts)) {
      for (const filePath of concept.files || []) {
        if (!this.integratedData.files.has(filePath)) {
          this.integratedData.files.set(filePath, {
            path: filePath,
            concepts: [concept.name],
            exists: await this.fileExists(filePath)
          });
        } else {
          const existing = this.integratedData.files.get(filePath);
          if (!existing.concepts.includes(concept.name)) {
            existing.concepts.push(concept.name);
          }
        }
      }
    }

    console.log(`[CODEMAP INTEGRATOR] Extracted ${this.integratedData.files.size} unique files`);
  }

  deduplicateIssues(issues) {
    const seen = new Set();
    const unique = [];
    
    for (const issue of issues) {
      const key = JSON.stringify(issue);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(issue);
      }
    }
    
    return unique;
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch (err) {
      return false;
    }
  }

  async saveIntegratedData() {
    console.log('[CODEMAP INTEGRATOR] Saving integrated data...');
    
    // Update codemap.json
    const codemapPath = path.join(this.config.outputPath, 'codemap.json');
    const codemap = {
      version: this.integratedData.version,
      timestamp: this.integratedData.timestamp,
      rootDir: 'c:\\Users\\erich\\Heady',
      files: Array.from(this.integratedData.files.values()),
      directories: [],
      dependencies: {},
      metadata: {
        sources: this.integratedData.sources,
        services: this.integratedData.services,
        infrastructure: this.integratedData.infrastructure,
        concepts: Object.keys(this.integratedData.concepts).length,
        agents: Object.keys(this.integratedData.agents).length,
        tools: Object.keys(this.integratedData.tools).length
      }
    };
    
    await fs.writeFile(codemapPath, JSON.stringify(codemap, null, 2), 'utf8');
    console.log(`[CODEMAP INTEGRATOR] Saved: ${codemapPath}`);

    // Update project-context.json
    const contextPath = path.join(this.config.outputPath, 'project-context.json');
    const context = {
      version: this.integratedData.version,
      timestamp: this.integratedData.timestamp,
      project: this.integratedData.metadata.project || {
        name: 'Heady Unified',
        type: 'hybrid',
        languages: ['javascript', 'python', 'powershell'],
        frameworks: ['express', 'react', 'mcp']
      },
      intelligence: this.integratedData.metadata.intelligence || {
        registry: true,
        checkpoints: true,
        routing: true,
        squashMerge: true,
        headyMaid: true,
        mcpInterceptor: true
      },
      services: this.integratedData.services,
      concepts: this.integratedData.concepts,
      agents: this.integratedData.agents,
      tools: this.integratedData.tools,
      infrastructure: this.integratedData.infrastructure,
      security: this.integratedData.security,
      performance: this.integratedData.performance,
      gaps: this.integratedData.gaps,
      lastOperation: {
        type: 'codemap_integration',
        timestamp: this.integratedData.timestamp,
        sources: this.integratedData.sources.length,
        filesIntegrated: this.integratedData.files.size
      },
      operationHistory: []
    };
    
    await fs.writeFile(contextPath, JSON.stringify(context, null, 2), 'utf8');
    console.log(`[CODEMAP INTEGRATOR] Saved: ${contextPath}`);

    // Save comprehensive integration report
    const reportPath = path.join(this.config.outputPath, 'integration_report.json');
    await fs.writeFile(reportPath, JSON.stringify(this.integratedData, null, 2), 'utf8');
    console.log(`[CODEMAP INTEGRATOR] Saved: ${reportPath}`);
  }

  generateSummary() {
    return {
      sources: this.integratedData.sources.length,
      concepts: Object.keys(this.integratedData.concepts).length,
      services: Object.keys(this.integratedData.services).length,
      agents: Object.keys(this.integratedData.agents).length,
      tools: Object.keys(this.integratedData.tools).length,
      files: this.integratedData.files.size,
      security: {
        critical: this.integratedData.security.critical.length,
        moderate: this.integratedData.security.moderate.length
      },
      performance: this.integratedData.performance.length,
      gaps: this.integratedData.gaps.length
    };
  }
}

// CLI execution
if (require.main === module) {
  const integrator = new CodemapIntegrator();
  integrator.integrate()
    .then(() => {
      const summary = integrator.generateSummary();
      console.log('\n[INTEGRATION SUMMARY]');
      console.log(`  Sources scanned: ${summary.sources}`);
      console.log(`  Concepts: ${summary.concepts}`);
      console.log(`  Services: ${summary.services}`);
      console.log(`  Agents: ${summary.agents}`);
      console.log(`  Tools: ${summary.tools}`);
      console.log(`  Files tracked: ${summary.files}`);
      console.log(`  Security issues: ${summary.security.critical} critical, ${summary.security.moderate} moderate`);
      console.log(`  Performance issues: ${summary.performance}`);
      console.log(`  Functionality gaps: ${summary.gaps}`);
      process.exit(0);
    })
    .catch(err => {
      console.error('[CODEMAP INTEGRATOR] Error:', err);
      process.exit(1);
    });
}

module.exports = CodemapIntegrator;
