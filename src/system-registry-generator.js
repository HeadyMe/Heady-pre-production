/**
 * System Registry Generator
 * Produces system-registry.json — the canonical machine-readable registry
 * of all Heady ecosystem verticals, domains, relationships, and URLs.
 * 
 * Served at: https://headysystems.com/system-registry.json
 */

const { ECOSYSTEM, DOMAIN_THEMES, SYSTEM_VERTICALS, CROSS_DOMAIN_MAP, WEBSITE_CLASSES, SITES } = require('./site-generator');

function generateSystemRegistry() {
  const registry = {
    $schema: 'https://headysystems.com/schemas/system-registry.json',
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    description: 'Canonical registry of the Heady ecosystem — verticals, domains, relationships, and URLs',

    verticals: Object.fromEntries(
      Object.entries(SYSTEM_VERTICALS).map(([key, v]) => [key, {
        label: v.label,
        icon: v.icon,
        primaryDomain: ECOSYSTEM.find(e => e.key === v.primary)?.domain || null,
        description: v.desc,
      }])
    ),

    domains: ECOSYSTEM.map(e => {
      const theme = DOMAIN_THEMES[e.key] || {};
      const siteDef = SITES[e.key] || {};
      const vertical = Object.entries(SYSTEM_VERTICALS).find(([, v]) => v.primary === e.key);
      const wClass = Object.entries(WEBSITE_CLASSES).find(([, wc]) => wc.members.includes(e.key));

      return {
        key: e.key,
        domain: e.domain,
        url: `https://${e.domain}`,
        name: e.name,
        shortName: e.short,
        icon: e.icon,
        vertical: vertical ? vertical[0] : siteDef.vertical || null,
        websiteClass: wClass ? wClass[0] : null,
        role: theme.role || null,
        audience: theme.audience || null,
        organization: theme.org || null,
        accent: theme.accent || null,
        tagline: siteDef.tagline || null,
        tags: siteDef.tags || [],
      };
    }),

    relationships: [],

    websiteClasses: Object.fromEntries(
      Object.entries(WEBSITE_CLASSES).map(([key, wc]) => [key, {
        label: wc.label,
        members: wc.members.map(m => ECOSYSTEM.find(e => e.key === m)?.domain || m),
        pattern: wc.pattern,
      }])
    ),

    endpoints: {
      systemStatus: 'https://headysystems.com/api/system/status',
      health: 'https://headysystems.com/api/health',
      chat: 'https://headysystems.com/api/v1/chat/resolve',
      orchestrator: 'https://headysystems.com/api/v1/orchestrator/execute',
      drift: 'https://headysystems.com/api/v1/drift/latest',
      monteCarlo: 'https://headysystems.com/api/monte-carlo/status',
      mcpConnectors: 'https://headysystems.com/api/v1/mcp/connectors',
      soul: 'https://headysystems.com/api/soul/state',
      intelligence: 'https://headysystems.com/api/intelligence/state',
      cluster: 'https://headysystems.com/api/cluster/state',
      registry: 'https://headysystems.com/system-registry.json',
    },
  };

  // Build relationships from CROSS_DOMAIN_MAP
  for (const [sourceKey, targets] of Object.entries(CROSS_DOMAIN_MAP)) {
    const sourceDomain = ECOSYSTEM.find(e => e.key === sourceKey)?.domain;
    for (const [targetKey, rel] of Object.entries(targets)) {
      const targetDomain = ECOSYSTEM.find(e => e.key === targetKey)?.domain;
      if (sourceDomain && targetDomain) {
        registry.relationships.push({
          from: sourceDomain,
          to: targetDomain,
          fromLabel: rel.outLabel,
          toLabel: rel.inLabel,
          fromVerb: rel.outVerb,
          toVerb: rel.inVerb,
        });
      }
    }
  }

  return registry;
}

module.exports = { generateSystemRegistry };
