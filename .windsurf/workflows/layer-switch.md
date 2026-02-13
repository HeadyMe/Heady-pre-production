---
description: Switch between cloud layers using branded domain APIs
---

# Heady Cloud Layer Switch

1. Check current active layer
// turbo
```bash
curl -sf https://headycloud.com/api/layer \
  -H "Authorization: Bearer $HEADY_API_KEY"
```

2. Switch to HeadyMe layer
```bash
curl -sf -X POST https://headycloud.com/api/layer/switch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"layer":"cloud-me"}'
```

3. OR switch to HeadySystems layer
```bash
curl -sf -X POST https://headycloud.com/api/layer/switch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"layer":"cloud-sys"}'
```

4. Verify layer + pulse
// turbo
```bash
curl -sf https://headycloud.com/api/layer -H "Authorization: Bearer $HEADY_API_KEY"
curl -sf https://headycloud.com/api/pulse -H "Authorization: Bearer $HEADY_API_KEY"
```
