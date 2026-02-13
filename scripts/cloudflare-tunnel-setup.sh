#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════╗
# ║  ∞ SACRED GEOMETRY ∞  Cloudflare Tunnel Setup — Secure Communication  ║
# ╚══════════════════════════════════════════════════════════════════╝

set -e

# Configuration
TUNNEL_NAME="heady-secure-tunnel"
CONFIG_DIR="$HOME/.cloudflared"
CONFIG_FILE="$CONFIG_DIR/config.yml"
CREDENTIALS_FILE="$CONFIG_DIR/$TUNNEL_NAME.json"

# Domains to route through tunnel
DOMAINS=(
    "api-dev.headysystems.com"
    "app-dev.headysystems.com" 
    "ssh-dev.headysystems.com"
    "builder-dev.headysystems.com"
)

# Local services to route
LOCAL_SERVICES=(
    "http://localhost:3300"  # HeadyManager API
    "http://localhost:3000"  # HeadyManager UI
    "ssh://localhost:22"     # SSH
    "http://localhost:8787"  # Jupyter/Colab proxy
)

echo "🚀 Setting up Cloudflare Tunnel for Heady Systems..."

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared not found. Installing..."
    
    # Detect OS and install
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install cloudflared
        else
            echo "❌ Please install Homebrew first: https://brew.sh/"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
        sudo dpkg -i cloudflared-linux-amd64.deb
        rm cloudflared-linux-amd64.deb
    else
        echo "❌ Unsupported OS. Please install cloudflared manually: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
        exit 1
    fi
fi

echo "✅ cloudflared installed"

# Create config directory
mkdir -p "$CONFIG_DIR"

# Authenticate with Cloudflare
echo "🔐 Authenticating with Cloudflare..."
cloudflared tunnel login

# Create tunnel
echo "🌐 Creating tunnel: $TUNNEL_NAME"
TUNNEL_OUTPUT=$(cloudflared tunnel create "$TUNNEL_NAME")
TUNNEL_UUID=$(echo "$TUNNEL_OUTPUT" | grep -o '[a-f0-9-]\{36\}')

echo "✅ Tunnel created with UUID: $TUNNEL_UUID"

# Generate credentials file path
CREDENTIALS_FILE="$CONFIG_DIR/$TUNNEL_UUID.json"

# Create configuration file
echo "⚙️ Creating tunnel configuration..."
cat > "$CONFIG_FILE" << EOF
tunnel: $TUNNEL_UUID
credentials-file: $CREDENTIALS_FILE

ingress:
EOF

# Add ingress rules
for i in "${!DOMAINS[@]}"; do
    domain="${DOMAINS[$i]}"
    service="${LOCAL_SERVICES[$i]}"
    
    echo "  - hostname: $domain" >> "$CONFIG_FILE"
    echo "    service: $service" >> "$CONFIG_FILE"
    echo "" >> "$CONFIG_FILE"
done

# Add catch-all rule
cat >> "$CONFIG_FILE" << EOF
  - service: http_status:404

warp-routing:
  enabled: true
EOF

echo "✅ Configuration created: $CONFIG_FILE"

# Route DNS for each domain
echo "🌐 Routing DNS for domains..."
for domain in "${DOMAINS[@]}"; do
    echo "  Routing $domain -> tunnel"
    cloudflared tunnel route dns "$TUNNEL_NAME" "$domain"
done

echo "✅ DNS routing configured"

# Create systemd service for auto-start
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🔧 Creating systemd service..."
    
    sudo tee /etc/systemd/system/cloudflared-$TUNNEL_NAME.service > /dev/null << EOF
[Unit]
Description=Cloudflare Tunnel ($TUNNEL_NAME)
After=network.target

[Service]
Type=simple
User=$USER
ExecStart=$(which cloudflared) tunnel run --config $CONFIG_FILE $TUNNEL_NAME
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable "cloudflared-$TUNNEL_NAME"
    sudo systemctl start "cloudflared-$TUNNEL_NAME"
    
    echo "✅ Systemd service created and started"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🔧 Creating macOS launch agent..."
    
    PLIST_FILE="$HOME/Library/LaunchAgents/com.heady.cloudflared.$TUNNEL_NAME.plist"
    
    cat > "$PLIST_FILE" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.heady.cloudflared.$TUNNEL_NAME</string>
    <key>ProgramArguments</key>
    <array>
        <string>$(which cloudflared)</string>
        <string>tunnel</string>
        <string>run</string>
        <string>--config</string>
        <string>$CONFIG_FILE</string>
        <string>$TUNNEL_NAME</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/cloudflared-$TUNNEL_NAME.out.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/cloudflared-$TUNNEL_NAME.err.log</string>
</dict>
</plist>
EOF

    launchctl load "$PLIST_FILE"
    echo "✅ Launch agent created and started"
fi

# Test tunnel connectivity
echo "🧪 Testing tunnel connectivity..."
sleep 5

for domain in "${DOMAINS[@]}"; do
    if curl -s "https://$domain" > /dev/null; then
        echo "✅ $domain - reachable"
    else
        echo "⚠️ $domain - not yet reachable (may take a few minutes to propagate)"
    fi
done

# SSH configuration
echo "🔑 Configuring SSH access through tunnel..."

SSH_CONFIG="$HOME/.ssh/config"
SSH_KEY="$HOME/.ssh/id_ed25519_heady"

# Generate SSH key if it doesn't exist
if [[ ! -f "$SSH_KEY" ]]; then
    echo "🔐 Generating SSH key for Heady access..."
    ssh-keygen -t ed25519 -f "$SSH_KEY" -C "heady-dev-$(hostname)" -N ""
    echo "✅ SSH key generated: $SSH_KEY"
    echo "📋 Public key (add to GitHub and authorized_keys):"
    cat "${SSH_KEY}.pub"
fi

# Add SSH configuration
mkdir -p "$(dirname "$SSH_CONFIG")"

if ! grep -q "Host heady-dev" "$SSH_CONFIG" 2>/dev/null; then
    cat >> "$SSH_CONFIG" << EOF

# Heady Development Tunnel
Host heady-dev
    HostName ssh-dev.headysystems.com
    User heady
    IdentityFile $SSH_KEY
    Port 22
    ProxyCommand $(which cloudflared) access ssh --hostname %h
    ServerAliveInterval 60
    ServerAliveCountMax 3
    StrictHostKeyChecking no
EOF
    echo "✅ SSH configuration added"
fi

echo ""
echo "🎉 Cloudflare Tunnel setup complete!"
echo ""
echo "📋 Summary:"
echo "  Tunnel name: $TUNNEL_NAME"
echo "  Config file: $CONFIG_FILE"
echo "  Credentials: $CREDENTIALS_FILE"
echo ""
echo "🌐 Mapped domains:"
for i in "${!DOMAINS[@]}"; do
    echo "  ${DOMAINS[$i]} -> ${LOCAL_SERVICES[$i]}"
done
echo ""
echo "🔑 SSH access:"
echo "  ssh heady-dev"
echo ""
echo "📊 Tunnel status:"
cloudflared tunnel info "$TUNNEL_NAME"
echo ""
echo "🚀 To start/stop tunnel:"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "  sudo systemctl start cloudflared-$TUNNEL_NAME"
    echo "  sudo systemctl stop cloudflared-$TUNNEL_NAME"
    echo "  sudo systemctl status cloudflared-$TUNNEL_NAME"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "  launchctl start com.heady.cloudflared.$TUNNEL_NAME"
    echo "  launchctl stop com.heady.cloudflared.$TUNNEL_NAME"
    echo "  launchctl list | grep cloudflared"
fi
echo ""
echo "⚠️  Note: DNS propagation may take a few minutes. Test connectivity after setup."
