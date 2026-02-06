# HEADY_BRAND:BEGIN
# ╔══════════════════════════════════════════════════════════════════╗
# ║  █╗  █╗███████╗ █████╗ ██████╗ █╗   █╗                     ║
# ║  █║  █║█╔════╝█╔══█╗█╔══█╗╚█╗ █╔╝                     ║
# ║  ███████║█████╗  ███████║█║  █║ ╚████╔╝                      ║
# ║  █╔══█║█╔══╝  █╔══█║█║  █║  ╚█╔╝                       ║
# ║  █║  █║███████╗█║  █║██████╔╝   █║                        ║
# ║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                        ║
# ║                                                                  ║
# ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
# ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
# ║  FILE: HeadyAcademy/Tools/Heady_Chain.py                          ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

import os, sys, json, hashlib, base64, datetime
LEDGER_DIR = "./Logs/Ledger"
class Block:
    def __init__(self, idx, ts, data, ph):
        self.index, self.timestamp, self.data, self.prev_hash, self.nonce = idx, ts, data, ph, 0
        self.hash = self.calc()
    def calc(self): return hashlib.sha256(f"{self.index}{self.timestamp}{self.data}{self.prev_hash}{self.nonce}".encode()).hexdigest()
    def mine(self):
        while self.hash[:2] != "00": self.nonce+=1; self.hash=self.calc()
class HeadyChain:
    def __init__(self):
        self.chain = []
        if not os.path.exists(LEDGER_DIR): os.makedirs(LEDGER_DIR); self.gen()
        else: self.load()
    def gen(self): self.chain.append(Block(0,str(datetime.datetime.now()),"Genesis","0")); self.save()
    def save(self):
        with open(f"{LEDGER_DIR}/chain_head.json",'w') as f: json.dump([vars(b) for b in self.chain],f,indent=4)
    def load(self):
        with open(f"{LEDGER_DIR}/chain_head.json",'r') as f: self.chain=[Block(b['index'],b['timestamp'],b['data'],b['prev_hash']) for b in json.load(f)]
    def add(self, r, u):
        p=self.chain[-1]
        b=Block(p.index+1,str(datetime.datetime.now()),f"{r}:{u}",p.hash)
        b.mine(); self.chain.append(b); self.save(); print(f"Mined: {b.hash}")
    def verify(self, r, u):
        for b in reversed(self.chain):
            if f"{r}:{u}" in b.data: return True
        return False
if __name__ == "__main__":
    hc=HeadyChain()
    if sys.argv[1]=="grant": hc.add(sys.argv[2],sys.argv[3])
    if sys.argv[1]=="verify": print("ACCESS GRANTED" if hc.verify(sys.argv[2],sys.argv[3]) else "DENIED")
