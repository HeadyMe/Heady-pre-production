// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
// ║  FILE: value_weights.js                                          ║
// ║  LAYER: soul                                                     ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

/**
 * Value Weights — configurable mission dimensions
 * Loads from heady-soul.yaml, provides runtime access + hot-reload
 */

const fs = require("fs");
const path = require("path");

let jsYaml;
try { jsYaml = require("js-yaml"); } catch (_) { jsYaml = null; }

const DEFAULT_WEIGHTS = {
  access: 0.30,
  fairness: 0.25,
  intelligence: 0.20,
  happiness: 0.15,
  redistribution: 0.10,
};

const DEFAULT_THRESHOLDS = {
  veto: 15,
  escalate: 60,
  auto_approve: 75,
  critical_override: 90,
};

class ValueWeights {
  constructor(configPath) {
    this.configPath = configPath || path.join(__dirname, "..", "..", "configs", "heady-soul.yaml");
    this.weights = { ...DEFAULT_WEIGHTS };
    this.thresholds = { ...DEFAULT_THRESHOLDS };
    this.hardVetoes = [];
    this.sacredGeometry = { principles: [], coherence_weight: 0.15 };
    this.tiers = {};
    this.escalation = {};
    this.drift = { window_size: 20, threshold: 10.0 };
    this.learning = { enabled: true, min_overrides_to_train: 20 };
    this.load();
  }

  load() {
    try {
      const raw = fs.readFileSync(this.configPath, "utf8");
      let config;

      if (jsYaml) {
        config = jsYaml.load(raw);
      } else {
        // Minimal YAML parser for key fields
        config = this._parseSimpleYaml(raw);
      }

      if (config.value_weights) {
        const w = config.value_weights;
        const sum = Object.values(w).reduce((s, v) => s + v, 0);
        if (Math.abs(sum - 1.0) < 0.01) {
          this.weights = w;
        } else {
          console.warn(`[HeadySoul] Value weights sum to ${sum}, normalizing to 1.0`);
          const factor = 1.0 / sum;
          for (const k of Object.keys(w)) w[k] *= factor;
          this.weights = w;
        }
      }

      if (config.thresholds) this.thresholds = { ...DEFAULT_THRESHOLDS, ...config.thresholds };
      if (config.hard_vetoes) this.hardVetoes = config.hard_vetoes;
      if (config.sacred_geometry) this.sacredGeometry = config.sacred_geometry;
      if (config.tiers) this.tiers = config.tiers;
      if (config.escalation) this.escalation = config.escalation;
      if (config.drift) this.drift = config.drift;
      if (config.learning) this.learning = config.learning;

      console.log(`[HeadySoul] Values loaded: ${Object.entries(this.weights).map(([k, v]) => `${k}=${v}`).join(", ")}`);
    } catch (err) {
      console.warn(`[HeadySoul] Config not found at ${this.configPath}, using defaults`);
    }
  }

  getWeights() { return { ...this.weights }; }
  getThresholds() { return { ...this.thresholds }; }
  getDimensions() { return Object.keys(this.weights); }

  _parseSimpleYaml(raw) {
    const config = {};
    const lines = raw.split("\n");
    let currentSection = null;
    let currentSubSection = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      if (!line.startsWith(" ") && trimmed.endsWith(":")) {
        currentSection = trimmed.slice(0, -1);
        config[currentSection] = {};
        currentSubSection = null;
      } else if (line.startsWith("  ") && !line.startsWith("    ") && trimmed.includes(":")) {
        const [key, ...valParts] = trimmed.split(":");
        const val = valParts.join(":").trim().replace(/^["']|["']$/g, "");
        if (currentSection) {
          if (val) {
            const num = parseFloat(val);
            config[currentSection][key.trim()] = isNaN(num) ? val : num;
          } else {
            currentSubSection = key.trim();
            config[currentSection][currentSubSection] = {};
          }
        }
      }
    }
    return config;
  }
}

module.exports = ValueWeights;
