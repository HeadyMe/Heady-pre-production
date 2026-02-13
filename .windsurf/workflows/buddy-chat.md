---
description: Send a message to HeadyBuddy via cloud endpoint
---

# HeadyBuddy Cloud Chat

1. Send message
```bash
curl -sf -X POST https://headybot.com/api/v1/chat/resolve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"message":"YOUR_MESSAGE_HERE","userId":"heady-cloud-user"}'
```

2. Check chat stats
// turbo
```bash
curl -sf https://headybot.com/api/v1/chat/stats \
  -H "Authorization: Bearer $HEADY_API_KEY"
```

3. Check cloud health
// turbo
```bash
curl -sf https://headybot.com/api/health --max-time 15 || curl -sf https://headysystems.com/api/health --max-time 15
```
