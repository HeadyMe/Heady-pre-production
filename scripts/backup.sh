#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════╗
# ║  ∞ SACRED GEOMETRY ∞  Backup Script — System Data Preservation     ║
# ╚══════════════════════════════════════════════════════════════════╝

set -e

# Configuration
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
CONTAINER_DATA_DIR="/data"
CONFIG_DIR="./configs"

echo "🔄 Starting Heady Systems Backup..."
echo "📁 Backup Directory: $BACKUP_DIR"

# Create backup directory
mkdir -p "$BACKUP_DIR"
echo "✅ Created backup directory"

# Function to backup container data
backup_container() {
    local container_name=$1
    local backup_file=$2
    
    echo "📦 Backing up $container_name..."
    
    if podman ps --format "table {{.Names}}" | grep -q "^$container_name$"; then
        # Create tar backup inside container
        podman exec "$container_name" tar czf "/tmp/data.tar.gz" -C "$CONTAINER_DATA_DIR" . 2>/dev/null || {
            echo "⚠️  No data directory found in $container_name"
            return 0
        }
        
        # Copy backup to host
        podman cp "$container_name:/tmp/data.tar.gz" "$BACKUP_DIR/$backup_file.tar.gz"
        
        # Cleanup temporary file
        podman exec "$container_name" rm -f "/tmp/data.tar.gz"
        
        echo "✅ Backed up $container_name"
    else
        echo "⚠️  Container $container_name not running"
    fi
}

# Function to backup configurations
backup_configs() {
    echo "📋 Backing up configurations..."
    
    if [ -d "$CONFIG_DIR" ]; then
        tar czf "$BACKUP_DIR/configs.tar.gz" -C "$CONFIG_DIR" .
        echo "✅ Backed up configurations"
    else
        echo "⚠️  No configs directory found"
    fi
}

# Function to backup Docker/Podman images
backup_images() {
    echo "🖼️  Backing up container images..."
    
    # Save image list
    podman images --format "table {{.Repository}}:{{.Tag}}" | grep -E "(headysoul|jules|observer|atlas)" > "$BACKUP_DIR/images.txt"
    
    # Export images
    while read -r image; do
        if [ -n "$image" ] && [ "$image" != "REPOSITORY:TAG" ]; then
            echo "📦 Exporting $image..."
            safe_name=$(echo "$image" | tr '/:' '_')
            podman save "$image" -o "$BACKUP_DIR/image_${safe_name}.tar" 2>/dev/null || echo "⚠️  Failed to export $image"
        fi
    done < "$BACKUP_DIR/images.txt"
    
    echo "✅ Backed up container images"
}

# Function to backup environment files
backup_env() {
    echo "🔧 Backing up environment files..."
    
    # Backup .env file
    if [ -f ".env" ]; then
        cp ".env" "$BACKUP_DIR/.env"
        echo "✅ Backed up .env file"
    fi
    
    # Backup docker-compose.yml
    if [ -f "docker-compose.yml" ]; then
        cp "docker-compose.yml" "$BACKUP_DIR/docker-compose.yml"
        echo "✅ Backed up docker-compose.yml"
    fi
}

# Function to create backup metadata
create_metadata() {
    echo "📝 Creating backup metadata..."
    
    cat > "$BACKUP_DIR/metadata.json" << EOF
{
    "backup_timestamp": "$(date -Iseconds)",
    "backup_directory": "$BACKUP_DIR",
    "containers": {
        "headysoul": $(podman ps --format "json" | jq -r '.[] | select(.Names=="headysoul") | .Status' | sed 's/"/\\"/g' || echo "not_running"),
        "jules": $(podman ps --format "json" | jq -r '.[] | select(.Names=="jules") | .Status' | sed 's/"/\\"/g' || echo "not_running"),
        "observer": $(podman ps --format "json" | jq -r '.[] | select(.Names=="observer") | .Status' | sed 's/"/\\"/g' || echo "not_running"),
        "atlas": $(podman ps --format "json" | jq -r '.[] | select(.Names=="atlas") | .Status' | sed 's/"/\\"/g' || echo "not_running")
    },
    "system_info": {
        "hostname": "$(hostname)",
        "kernel": "$(uname -r)",
        "podman_version": "$(podman --version)",
        "total_containers": $(podman ps --format "json" | jq length),
        "running_containers": $(podman ps --format "json" | jq 'select(.State=="running") | length')
    },
    "backup_files": $(ls -la "$BACKUP_DIR" | awk 'NR>1 {print "\""$9"\","}' | sed 's/$/"/' | sed '$s/,$//' | tr '\n' ' ' | sed 's/^/[/;s/$/]/')
}
EOF
    
    echo "✅ Created backup metadata"
}

# Function to verify backup integrity
verify_backup() {
    echo "🔍 Verifying backup integrity..."
    
    local errors=0
    
    # Check if all expected files exist
    local expected_files=("headysoul.tar.gz" "jules.tar.gz" "observer.tar.gz" "atlas.tar.gz" "metadata.json")
    
    for file in "${expected_files[@]}"; do
        if [ -f "$BACKUP_DIR/$file" ]; then
            # Check if file is not empty
            if [ -s "$BACKUP_DIR/$file" ]; then
                echo "✅ $file - OK"
            else
                echo "❌ $file - EMPTY"
                ((errors++))
            fi
        else
            echo "⚠️  $file - MISSING"
        fi
    done
    
    # Verify tar files can be read
    for tar_file in "$BACKUP_DIR"/*.tar.gz; do
        if [ -f "$tar_file" ]; then
            if tar -tzf "$tar_file" >/dev/null 2>&1; then
                echo "✅ $(basename "$tar_file") - VALID"
            else
                echo "❌ $(basename "$tar_file") - CORRUPT"
                ((errors++))
            fi
        fi
    done
    
    if [ $errors -eq 0 ]; then
        echo "✅ Backup verification completed successfully"
        return 0
    else
        echo "❌ Backup verification failed with $errors errors"
        return 1
    fi
}

# Function to cleanup old backups
cleanup_old_backups() {
    echo "🧹 Cleaning up old backups..."
    
    # Keep last 7 backups
    find ./backups -maxdepth 1 -type d -name "????????_??????" | sort -r | tail -n +8 | while read -r old_backup; do
        echo "🗑️  Removing old backup: $old_backup"
        rm -rf "$old_backup"
    done
    
    echo "✅ Cleanup completed"
}

# Main backup execution
main() {
    echo "🚀 Starting backup process..."
    
    # Backup container data
    backup_container "headysoul" "headysoul"
    backup_container "jules" "jules"
    backup_container "observer" "observer"
    backup_container "atlas" "atlas"
    
    # Backup configurations
    backup_configs
    
    # Backup environment files
    backup_env
    
    # Backup container images (optional, can be large)
    if [ "$1" = "--include-images" ]; then
        backup_images
    fi
    
    # Create metadata
    create_metadata
    
    # Verify backup
    if verify_backup; then
        echo "✅ Backup completed successfully"
        
        # Cleanup old backups
        cleanup_old_backups
        
        # Display summary
        echo ""
        echo "📊 Backup Summary:"
        echo "📁 Location: $BACKUP_DIR"
        echo "📦 Size: $(du -sh "$BACKUP_DIR" | cut -f1)"
        echo "📋 Files: $(find "$BACKUP_DIR" -type f | wc -l)"
        echo "✅ Status: SUCCESS"
        
        exit 0
    else
        echo "❌ Backup failed verification"
        exit 1
    fi
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [--include-images] [--verify-only]"
        echo ""
        echo "Options:"
        echo "  --include-images  Include container images in backup"
        echo "  --verify-only    Only verify existing backup"
        echo "  --help, -h       Show this help message"
        exit 0
        ;;
    --verify-only)
        if [ -d "$BACKUP_DIR" ]; then
            verify_backup
        else
            echo "❌ No backup directory found: $BACKUP_DIR"
            exit 1
        fi
        ;;
    *)
        main "$@"
        ;;
esac
