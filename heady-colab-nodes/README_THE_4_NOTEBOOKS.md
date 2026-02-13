# ╔══════════════════════════════════════════════════════════════════╗
# ║  ∞ SACRED GEOMETRY ∞  2 COMBINED GPU COLAB NOTEBOOKS               ║
# ╚══════════════════════════════════════════════════════════════════╝

## 2 GPU Node Notebooks (Combined from 4 originals)

These 2 notebooks + 2 project notebooks in `cloud-deploy/notebooks/` = 4 total runtimes.

### 1. HeadySoul + ATLAS
**File**: `heady_soul_atlas.ipynb`
**Port**: 5000 | **Runtime**: GPU (T4+)
**Purpose**: Mission alignment scoring + semantic search + embeddings + docs
**Models**: all-MiniLM-L6-v2, all-mpnet-base-v2, all-MiniLM-L12-v2, bart-large-cnn

### 2. JULES + PYTHIA
**File**: `heady_jules_pythia.ipynb`
**Port**: 5001 | **Runtime**: GPU (T4+)
**Purpose**: Code analysis + text generation + reasoning + sentiment + classification
**Models**: CodeBERT, TinyLlama-1.1B-Chat (shared), bart-large-cnn, distilbert-sst2, bart-large-mnli

## Upload Instructions
1. Go to: https://colab.research.google.com/
2. Upload these 2 `.ipynb` files
3. Set Runtime > Change runtime type > GPU for each
4. Run all cells — they auto-register with all 3 cloud layers via branded domains

## 4-Runtime Budget
- 2 GPU node notebooks (this folder)
- 2 project notebooks (`cloud-deploy/notebooks/`)
- TOTAL: 4 active Colab runtimes

All communication via branded domains only. Zero local references.
