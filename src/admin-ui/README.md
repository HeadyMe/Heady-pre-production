# Heady Admin Control Center - Drupal 11 Module

A comprehensive, highly customizable admin interface for Heady services built as a Drupal 11 module with rich visual effects, extensive customization options, and full service configuration capabilities.

## Features

### 🎨 **Rich Visual Design**
- **Multiple Themes**: Cosmic, Ocean, Sunset, Aurora, Matrix
- **Animated Backgrounds**: Gradient shifts, floating particles, flowing waves
- **Watermark Effects**: Slow-flowing branded watermarks with customizable intensity
- **Glassmorphism UI**: Modern frosted glass effects
- **Smooth Animations**: Hover effects, transitions, micro-interactions

### 📊 **Comprehensive Dashboard**
- **System Health**: Real-time health monitoring with visual indicators
- **Service Management**: 76+ services across 5 categories
- **Performance Metrics**: Response times, throughput, uptime
- **Activity Feed**: Real-time system events and notifications
- **Monte Carlo Analysis**: Probabilistic intelligence scoring
- **Domain Status**: 9 branded domains monitoring

### ⚙️ **Full Service Configuration**
- **AI Nodes**: 20 configurable AI services (BRIDGE, BRAIN, CONDUCTOR, etc.)
- **Intelligence Engines**: 6 specialized engines (Sacred Geometry, Monte Carlo, etc.)
- **Core Services**: Essential system services
- **External Services**: Third-party integrations
- **Domain Services**: Web domain management

### 🎛️ **Customization Studio**
- **Theme Editor**: Color customization with live preview
- **Layout Options**: Grid, Masonry, Circular, Hexagonal layouts
- **Font Selection**: Multiple font families
- **Logo & Branding**: Choose from 3 logo variants
- **Animation Controls**: Speed and intensity adjustments
- **Watermark Settings**: Opacity and positioning

### 🔒 **Security Center**
- **Security Logs**: Comprehensive audit trail
- **Threat Intelligence**: Real-time threat monitoring
- **Access Control**: Role-based permissions
- **SSL Management**: Certificate monitoring
- **Firewall Settings**: IP allowlists and rate limiting

### 🌐 **Domain Management**
- **DNS Configuration**: A, AAAA, CNAME, MX, TXT, NS records
- **SSL Certificates**: Automated monitoring and renewal
- **Domain Health**: Response time and availability tracking
- **Cloudflare Integration**: CDN and security features

## Installation

### Prerequisites
- Drupal 11.0+
- PHP 8.2+
- Composer
- Heady services infrastructure

### Steps

1. **Install Module**
   ```bash
   cd /path/to/drupal/modules/custom
   git clone <repository-url> heady_admin
   ```

2. **Install Dependencies**
   ```bash
   cd heady_admin
   composer install
   ```

3. **Enable Module**
   ```bash
   drush en heady_admin -y
   ```

4. **Set Permissions**
   ```bash
   drush role:perm 'administrator' 'administer heady services'
   drush role:perm 'administrator' 'access heady dashboard'
   ```

5. **Clear Caches**
   ```bash
   drush cr
   ```

## Configuration

### Basic Settings
Visit `/admin/config/heady` to configure:
- API endpoints
- Refresh intervals
- Default themes
- Notification preferences

### Service Configuration
Each service can be configured at `/admin/heady/service/{service_id}/config`:
- Basic settings (enabled, debug mode, log level)
- Performance settings (caching, TTL, performance mode)
- Connection limits (max connections, timeout, retries)
- Security settings (authentication, rate limiting, SSL)
- Service-specific options (model parameters, engine settings)

### Theme Customization
Visit `/admin/heady/customization` to:
- Select color themes
- Adjust animation speeds
- Configure watermarks
- Choose layouts and fonts
- Upload custom assets

## API Endpoints

### System Status
```
GET /admin/heady/api/status
```
Returns comprehensive system health and performance data.

### Services
```
GET /admin/heady/api/services
```
Returns all services with status, health, and configuration.

### Service Actions
```
POST /admin/heady/api/service/{service_id}/{action}
```
Perform actions: start, stop, restart, configure

## Architecture

### Module Structure
```
heady_admin/
├── heady_admin.info.yml          # Module info
├── heady_admin.routing.yml       # Route definitions
├── heady_admin.permissions.yml   # Permission definitions
├── heady_admin.libraries.yml     # Library definitions
├── src/
│   ├── Controller/
│   │   ├── HeadyAdminController.php    # Main controller
│   │   └── HeadyApiController.php      # API controller
│   └── Form/
│       ├── ServiceConfigForm.php       # Service configuration
│       └── HeadySettingsForm.php       # Module settings
├── templates/
│   ├── heady-admin-dashboard.html.twig # Dashboard template
│   ├── heady-admin-services.html.twig # Services template
│   └── ...                           # Other templates
├── css/
│   ├── admin-ui.css               # Main styles
│   ├── themes.css                 # Theme variations
│   └── components.css             # Component styles
├── js/
│   ├── admin-ui.js                # Main JavaScript
│   ├── dashboard.js               # Dashboard functionality
│   └── ...                        # Other scripts
└── assets/
    ├── logos/                     # Logo assets
    ├── icons/                     # Icon assets
    └── favicon/                   # Favicon assets
```

### Service Integration
The module integrates with Heady services through:
- **REST API**: Service status and configuration
- **WebSocket**: Real-time updates
- **Webhooks**: Event notifications
- **Database**: Configuration storage

### Theme System
Dynamic theming with:
- **CSS Variables**: Runtime theme switching
- **Gradient Generators**: Dynamic color schemes
- **Animation Controllers**: Configurable animations
- **Asset Pipeline**: Optimized resource loading

## Development

### Adding New Services
1. Update service data in `HeadyAdminController::getServicesData()`
2. Add configuration fields in `ServiceConfigForm::addServiceSpecificFields()`
3. Update templates for new service categories
4. Add API endpoints in `HeadyApiController`

### Creating New Themes
1. Add theme variables to `admin-ui.css`
2. Update theme presets in controller
3. Add theme button to dashboard template
4. Test theme switching functionality

### Extending Functionality
- **Hooks**: Use Drupal hooks for integration
- **Plugins**: Create plugin types for extensibility
- **Events**: Use Symfony Event Dispatcher
- **Services**: Use Drupal Service Container

## Security

### Permissions
- `administer heady services`: Full administrative access
- `access heady dashboard`: View dashboard only
- `manage heady services`: Service management
- `customize heady ui`: Theme customization
- `access heady security`: Security center access

### Security Features
- **CSRF Protection**: Built-in Drupal CSRF tokens
- **Input Validation**: Form API validation
- **Access Control**: Role-based permissions
- **Rate Limiting**: API endpoint protection
- **Audit Logging**: Comprehensive activity tracking

## Performance

### Optimization
- **Lazy Loading**: Components loaded on demand
- **Caching**: Drupal cache integration
- **Asset Optimization**: CSS/JS aggregation
- **Database Queries**: Optimized queries with indexing
- **Real-time Updates**: Efficient WebSocket usage

### Monitoring
- **Performance Metrics**: Built-in performance tracking
- **Database Monitoring**: Query performance analysis
- **Cache Hit Rates**: Cache effectiveness tracking
- **Resource Usage**: Memory and CPU monitoring

## Troubleshooting

### Common Issues

**Module not appearing**
- Check Drupal version compatibility
- Ensure proper file permissions
- Clear Drupal caches
- Check for dependency conflicts

**Services not loading**
- Verify API endpoint configuration
- Check network connectivity
- Review service logs
- Validate authentication

**Theme switching not working**
- Clear browser cache
- Check CSS file permissions
- Verify JavaScript loading
- Check browser console for errors

### Debug Mode
Enable debug mode in service configuration:
- Detailed error messages
- Extended logging
- Performance profiling
- Development toolbar

## Contributing

### Code Standards
- Follow Drupal coding standards
- Use PSR-4 autoloading
- Include comprehensive documentation
- Add unit tests for new features

### Pull Request Process
1. Fork the repository
2. Create feature branch
3. Add tests and documentation
4. Submit pull request
5. Code review and merge

## Support

### Documentation
- **API Documentation**: `/admin/heady/api/docs`
- **User Guide**: `/admin/heady/help`
- **Developer Guide**: `docs/` directory

### Community
- **Issue Tracker**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Chat**: Heady Discord server

## License

This module is licensed under the GPL v2.0 license. See LICENSE file for details.

## Credits

- **Developed by**: Heady Development Team
- **Designed by**: Heady UX Team
- **Maintained by**: Heady Infrastructure Team

---

*Heady Admin Control Center - Intelligence Management Reimagined*
