<?php

namespace Drupal\heady_admin\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Configuration form for individual services.
 */
class ServiceConfigForm extends FormBase {

  /**
   * The service ID.
   */
  protected $serviceId;

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'heady_admin_service_config';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state, $service_id = NULL) {
    $this->serviceId = $service_id;
    
    // Get service data
    $service_data = $this->getServiceData($service_id);
    
    $form['#attached']['library'][] = 'heady_admin/service_config';
    
    // Service header
    $form['service_header'] = [
      '#theme' => 'service_config_header',
      '#service' => $service_data,
    ];

    // Basic settings
    $form['basic_settings'] = [
      '#type' => 'details',
      '#title' => $this->t('Basic Settings'),
      '#open' => TRUE,
    ];

    $form['basic_settings']['enabled'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable Service'),
      '#description' => $this->t('Enable or disable this service.'),
      '#default_value' => $service_data['config']['enabled'] ?? TRUE,
    ];

    $form['basic_settings']['debug_mode'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Debug Mode'),
      '#description' => $this->t('Enable debug logging and verbose output.'),
      '#default_value' => $service_data['config']['debug_mode'] ?? FALSE,
    ];

    $form['basic_settings']['log_level'] = [
      '#type' => 'select',
      '#title' => $this->t('Log Level'),
      '#description' => $this->t('Set the logging verbosity level.'),
      '#options' => [
        'debug' => $this->t('Debug'),
        'info' => $this->t('Info'),
        'warning' => $this->t('Warning'),
        'error' => $this->t('Error'),
        'critical' => $this->t('Critical'),
      ],
      '#default_value' => $service_data['config']['log_level'] ?? 'info',
    ];

    // Performance settings
    $form['performance'] = [
      '#type' => 'details',
      '#title' => $this->t('Performance Settings'),
      '#open' => FALSE,
    ];

    $form['performance']['cache_enabled'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable Caching'),
      '#description' => $this->t('Enable response caching for better performance.'),
      '#default_value' => $service_data['config']['cache_enabled'] ?? TRUE,
    ];

    $form['performance']['cache_ttl'] = [
      '#type' => 'number',
      '#title' => $this->t('Cache TTL (seconds)'),
      '#description' => $this->t('Time-to-live for cached responses.'),
      '#default_value' => $service_data['config']['cache_ttl'] ?? 300,
      '#min' => 0,
      '#max' => 3600,
      '#states' => [
        'visible' => [
          ':input[name="cache_enabled"]' => ['checked' => TRUE],
        ],
      ],
    ];

    $form['performance']['performance_mode'] = [
      '#type' => 'select',
      '#title' => $this->t('Performance Mode'),
      '#description' => $this->t('Balance between speed and resource usage.'),
      '#options' => [
        'minimal' => $this->t('Minimal - Lowest resource usage'),
        'balanced' => $this->t('Balanced - Default'),
        'maximum' => $this->t('Maximum - Fastest response'),
      ],
      '#default_value' => $service_data['config']['performance_mode'] ?? 'balanced',
    ];

    // Connection limits
    $form['limits'] = [
      '#type' => 'details',
      '#title' => $this->t('Connection Limits'),
      '#open' => FALSE,
    ];

    $form['limits']['max_connections'] = [
      '#type' => 'number',
      '#title' => $this->t('Max Connections'),
      '#description' => $this->t('Maximum concurrent connections.'),
      '#default_value' => $service_data['config']['max_connections'] ?? 1000,
      '#min' => 1,
      '#max' => 10000,
    ];

    $form['limits']['timeout'] = [
      '#type' => 'number',
      '#title' => $this->t('Timeout (seconds)'),
      '#description' => $this->t('Request timeout in seconds.'),
      '#default_value' => $service_data['config']['timeout'] ?? 30,
      '#min' => 1,
      '#max' => 300,
    ];

    $form['limits']['retry_attempts'] = [
      '#type' => 'number',
      '#title' => $this->t('Retry Attempts'),
      '#description' => $this->t('Number of retry attempts on failure.'),
      '#default_value' => $service_data['config']['retry_attempts'] ?? 3,
      '#min' => 0,
      '#max' => 10,
    ];

    // Security settings
    $form['security'] = [
      '#type' => 'details',
      '#title' => $this->t('Security Settings'),
      '#open' => FALSE,
    ];

    $form['security']['require_auth'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Require Authentication'),
      '#description' => $this->t('Require authentication for all requests.'),
      '#default_value' => $service_data['config']['require_auth'] ?? TRUE,
    ];

    $form['security']['rate_limit'] = [
      '#type' => 'number',
      '#title' => $this->t('Rate Limit (requests/minute)'),
      '#description' => $this->t('Maximum requests per minute per IP.'),
      '#default_value' => $service_data['config']['rate_limit'] ?? 1000,
      '#min' => 1,
      '#max' => 10000,
    ];

    $form['security']['allowed_ips'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Allowed IPs'),
      '#description' => $this->t('Enter allowed IP addresses, one per line. Use * for all IPs.'),
      '#default_value' => implode("\n", $service_data['config']['allowed_ips'] ?? ['*']),
      '#rows' => 5,
    ];

    $form['security']['ssl_required'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Require SSL/TLS'),
      '#description' => $this->t('Require HTTPS connections only.'),
      '#default_value' => $service_data['config']['ssl_required'] ?? TRUE,
    ];

    // Service-specific settings
    $form['service_specific'] = [
      '#type' => 'details',
      '#title' => $this->t('Service-Specific Settings'),
      '#open' => FALSE,
    ];

    // Add service-specific fields based on service type
    $this->addServiceSpecificFields($form['service_specific'], $service_data);

    // Actions
    $form['actions'] = [
      '#type' => 'actions',
    ];

    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save Configuration'),
      '#button_type' => 'primary',
    ];

    $form['actions']['reset'] = [
      '#type' => 'submit',
      '#value' => $this->t('Reset to Defaults'),
      '#submit' => ['::resetForm'],
    ];

    $form['actions']['test'] = [
      '#type' => 'button',
      '#value' => $this->t('Test Connection'),
      '#attributes' => [
        'class' => ['button', 'test-connection'],
        'data-service-id' => $service_id,
      ],
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $values = $form_state->getValues();
    
    // Process allowed IPs
    $allowed_ips = array_filter(array_map('trim', explode("\n", $values['allowed_ips'])));
    
    // Build configuration array
    $config = [
      'enabled' => (bool) $values['enabled'],
      'debug_mode' => (bool) $values['debug_mode'],
      'log_level' => $values['log_level'],
      'cache_enabled' => (bool) $values['cache_enabled'],
      'cache_ttl' => (int) $values['cache_ttl'],
      'performance_mode' => $values['performance_mode'],
      'max_connections' => (int) $values['max_connections'],
      'timeout' => (int) $values['timeout'],
      'retry_attempts' => (int) $values['retry_attempts'],
      'require_auth' => (bool) $values['require_auth'],
      'rate_limit' => (int) $values['rate_limit'],
      'allowed_ips' => $allowed_ips,
      'ssl_required' => (bool) $values['ssl_required'],
    ];

    // Add service-specific configuration
    $this->processServiceSpecificConfig($config, $values);

    // Save configuration (in real implementation, this would save to database/config file)
    $this->saveServiceConfig($this->serviceId, $config);

    $this->messenger()->addStatus($this->t('Configuration saved for @service.', ['@service' => $this->serviceId]));
  }

  /**
   * Resets form to default values.
   */
  public function resetForm(array &$form, FormStateInterface $form_state) {
    $form_state->setRedirect('heady_admin.service_config', ['service_id' => $this->serviceId]);
    $this->messenger()->addStatus($this->t('Configuration reset to defaults.'));
  }

  /**
   * Gets service data.
   */
  protected function getServiceData($service_id) {
    // In real implementation, this would fetch from service manager
    return [
      'id' => $service_id,
      'name' => strtoupper($service_id),
      'type' => 'ai_node',
      'status' => 'active',
      'health' => 95,
      'config' => [
        'enabled' => true,
        'debug_mode' => false,
        'log_level' => 'info',
        'cache_enabled' => true,
        'cache_ttl' => 300,
        'performance_mode' => 'balanced',
        'max_connections' => 1000,
        'timeout' => 30,
        'retry_attempts' => 3,
        'require_auth' => true,
        'rate_limit' => 1000,
        'allowed_ips' => ['*'],
        'ssl_required' => true,
      ],
    ];
  }

  /**
   * Adds service-specific fields.
   */
  protected function addServiceSpecificFields(&$form, $service_data) {
    switch ($service_data['type']) {
      case 'ai_node':
        $form['model_settings'] = [
          '#type' => 'fieldset',
          '#title' => $this->t('Model Settings'),
        ];

        $form['model_settings']['temperature'] = [
          '#type' => 'range',
          '#title' => $this->t('Temperature'),
          '#description' => $this->t('Controls randomness in responses (0.0 - 2.0).'),
          '#default_value' => $service_data['config']['temperature'] ?? 0.7,
          '#min' => 0,
          '#max' => 2,
          '#step' => 0.1,
        ];

        $form['model_settings']['max_tokens'] = [
          '#type' => 'number',
          '#title' => $this->t('Max Tokens'),
          '#description' => $this->t('Maximum tokens in response.'),
          '#default_value' => $service_data['config']['max_tokens'] ?? 2048,
          '#min' => 1,
          '#max' => 8192,
        ];
        break;

      case 'engine':
        $form['engine_settings'] = [
          '#type' => 'fieldset',
          '#title' => $this->t('Engine Settings'),
        ];

        $form['engine_settings']['precision'] = [
          '#type' => 'select',
          '#title' => $this->t('Precision'),
          '#options' => [
            'low' => $this->t('Low'),
            'medium' => $this->t('Medium'),
            'high' => $this->t('High'),
            'ultra' => $this->t('Ultra'),
          ],
          '#default_value' => $service_data['config']['precision'] ?? 'high',
        ];
        break;
    }
  }

  /**
   * Processes service-specific configuration.
   */
  protected function processServiceSpecificConfig(&$config, $values) {
    if (isset($values['temperature'])) {
      $config['temperature'] = (float) $values['temperature'];
    }
    if (isset($values['max_tokens'])) {
      $config['max_tokens'] = (int) $values['max_tokens'];
    }
    if (isset($values['precision'])) {
      $config['precision'] = $values['precision'];
    }
  }

  /**
   * Saves service configuration.
   */
  protected function saveServiceConfig($service_id, $config) {
    // In real implementation, this would save to database or config file
    \Drupal::logger('heady_admin')->info('Configuration saved for service @service', ['@service' => $service_id]);
  }

}
