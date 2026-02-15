/**
 * Heady Admin UI - Main JavaScript
 * Rich, colorful admin interface with extensive customization
 */

(function (Drupal, drupalSettings, $) {
  'use strict';

  /**
   * Heady Admin namespace.
   */
  Drupal.headyAdmin = {
    
    /**
     * Initialize the admin interface.
     */
    init: function() {
      this.setupThemeSelector();
      this.setupFabMenu();
      this.setupRealTimeUpdates();
      this.setupAnimations();
      this.setupWatermarkAnimation();
      this.setupParticleEffects();
      this.setupWaveAnimation();
      this.loadUserPreferences();
    },

    /**
     * Setup theme selector.
     */
    setupThemeSelector: function() {
      $('.theme-btn').on('click', function(e) {
        e.preventDefault();
        const theme = $(this).data('theme');
        Drupal.headyAdmin.setTheme(theme);
      });
    },

    /**
     * Set active theme.
     */
    setTheme: function(theme) {
      // Remove all theme classes
      $('body').removeClass('theme-cosmic theme-ocean theme-sunset theme-aurora theme-matrix');
      
      // Add new theme class
      $('body').addClass('theme-' + theme);
      
      // Update active button
      $('.theme-btn').removeClass('active');
      $(`.theme-btn[data-theme="${theme}"]`).addClass('active');
      
      // Save preference
      localStorage.setItem('headyAdminTheme', theme);
      
      // Trigger theme change event
      $(document).trigger('headyAdmin:themeChanged', [theme]);
    },

    /**
     * Setup floating action button menu.
     */
    setupFabMenu: function() {
      $('.main-fab').on('click', function(e) {
        e.preventDefault();
        $(this).toggleClass('active');
        $('.fab-menu').toggleClass('active');
      });

      // Close menu when clicking outside
      $(document).on('click', function(e) {
        if (!$(e.target).closest('.fab-container').length) {
          $('.main-fab').removeClass('active');
          $('.fab-menu').removeClass('active');
        }
      });
    },

    /**
     * Setup real-time updates.
     */
    setupRealTimeUpdates: function() {
      const refreshInterval = drupalSettings.headyAdmin?.refreshInterval || 5000;
      
      setInterval(function() {
        Drupal.headyAdmin.updateSystemStatus();
      }, refreshInterval);
    },

    /**
     * Update system status.
     */
    updateSystemStatus: function() {
      const apiEndpoint = drupalSettings.headyAdmin?.apiEndpoint || '/admin/heady/api';
      
      $.get(apiEndpoint + '/status')
        .done(function(data) {
          Drupal.headyAdmin.updateDashboard(data);
        })
        .fail(function() {
          console.warn('Failed to fetch system status');
        });
    },

    /**
     * Update dashboard with new data.
     */
    updateDashboard: function(data) {
      // Update health score
      if (data.system_health) {
        const healthScore = data.system_health.overall || 0;
        $('.score-text').text(healthScore + '%');
        
        // Update progress ring
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (healthScore / 100) * circumference;
        $('.progress-ring').css('stroke-dashoffset', offset);
      }

      // Update service counts
      if (data.services) {
        const totalServices = data.services.total || 0;
        const activeServices = data.services.active || 0;
        $('.service-count .count').text(totalServices);
        $('.health-metrics .metric:first-child .value').text(`${activeServices}/${totalServices} Active`);
      }

      // Update domain status
      if (data.domains) {
        const healthyDomains = data.domains.healthy || 0;
        const totalDomains = data.domains.total || 0;
        $('.health-metrics .metric:nth-child(2) .value').text(`${healthyDomains}/${totalDomains} Healthy`);
      }

      // Update performance metrics
      if (data.performance) {
        $('.performance-stats .stat:first-child .value').text(data.performance.response_time + 'ms');
        $('.performance-stats .stat:nth-child(2) .value').text(data.performance.throughput + '/s');
      }

      // Update activity feed
      this.updateActivityFeed();
    },

    /**
     * Update activity feed.
     */
    updateActivityFeed: function() {
      // Simulate new activity
      const activities = [
        { type: 'success', title: 'Health Check Completed', time: 'Just now' },
        { type: 'info', title: 'Cache Cleared', time: '1 minute ago' },
        { type: 'warning', title: 'High Memory Usage', time: '3 minutes ago' },
        { type: 'success', title: 'Backup Completed', time: '5 minutes ago' }
      ];

      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      
      const activityHtml = `
        <div class="activity-item new">
          <div class="activity-icon ${randomActivity.type}">
            <i class="fas fa-${this.getActivityIcon(randomActivity.type)}"></i>
          </div>
          <div class="activity-details">
            <span class="activity-title">${randomActivity.title}</span>
            <span class="activity-time">${randomActivity.time}</span>
          </div>
        </div>
      `;

      const $feed = $('#activityFeed');
      $feed.prepend(activityHtml);
      
      // Remove old items and limit to 5
      $('.activity-item').slice(5).remove();
      
      // Animate new item
      $('.activity-item.new').hide().fadeIn(500).removeClass('new');
    },

    /**
     * Get activity icon.
     */
    getActivityIcon: function(type) {
      const icons = {
        success: 'check',
        info: 'info-circle',
        warning: 'exclamation-triangle',
        error: 'times-circle'
      };
      return icons[type] || 'info-circle';
    },

    /**
     * Setup animations.
     */
    setupAnimations: function() {
      // Animate metric cards on hover
      $('.metric-card').on('mouseenter', function() {
        $(this).addClass('hovered');
      }).on('mouseleave', function() {
        $(this).removeClass('hovered');
      });

      // Animate navigation items
      $('.nav-item').on('click', function(e) {
        $('.nav-item').removeClass('active');
        $(this).addClass('active');
      });

      // Setup smooth scrolling
      $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        const target = $($(this).attr('href'));
        if (target.length) {
          $('html, body').animate({
            scrollTop: target.offset().top - 100
          }, 500);
        }
      });
    },

    /**
     * Setup watermark animation.
     */
    setupWatermarkAnimation: function() {
      $('.watermark').each(function(index) {
        const $watermark = $(this);
        const duration = 15 + (index * 5); // Stagger animations
        const delay = index * 2;
        
        $watermark.css({
          'animation-duration': duration + 's',
          'animation-delay': delay + 's'
        });
      });
    },

    /**
     * Setup particle effects.
     */
    setupParticleEffects: function() {
      const $particles = $('.floating-particles');
      
      // Create multiple particles
      for (let i = 0; i < 20; i++) {
        const particle = $('<div class="particle"></div>');
        particle.css({
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
          animationDelay: Math.random() * 10 + 's',
          animationDuration: (10 + Math.random() * 10) + 's'
        });
        $particles.append(particle);
      }
    },

    /**
     * Setup wave animation.
     */
    setupWaveAnimation: function() {
      const $wave = $('.wave-animation');
      
      // Create multiple wave layers
      for (let i = 0; i < 3; i++) {
        const wave = $('<div class="wave-layer"></div>');
        wave.css({
          animationDelay: i * 2 + 's',
          opacity: 0.1 - (i * 0.03)
        });
        $wave.append(wave);
      }
    },

    /**
     * Load user preferences.
     */
    loadUserPreferences: function() {
      // Load theme preference
      const savedTheme = localStorage.getItem('headyAdminTheme');
      if (savedTheme) {
        this.setTheme(savedTheme);
      }

      // Load other preferences
      const preferences = localStorage.getItem('headyAdminPreferences');
      if (preferences) {
        try {
          const prefs = JSON.parse(preferences);
          this.applyPreferences(prefs);
        } catch (e) {
          console.warn('Failed to load user preferences');
        }
      }
    },

    /**
     * Apply user preferences.
     */
    applyPreferences: function(preferences) {
      if (preferences.animationSpeed) {
        $(':root').css('--transition-normal', preferences.animationSpeed + 's');
      }
      
      if (preferences.watermarkIntensity) {
        $('.watermark').css('opacity', preferences.watermarkIntensity / 100);
      }
    },

    /**
     * Save user preferences.
     */
    savePreferences: function(preferences) {
      localStorage.setItem('headyAdminPreferences', JSON.stringify(preferences));
    },

    /**
     * Export configuration.
     */
    exportConfig: function() {
      const config = {
        theme: localStorage.getItem('headyAdminTheme'),
        preferences: localStorage.getItem('headyAdminPreferences'),
        timestamp: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'heady-admin-config.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    /**
     * Toggle fullscreen.
     */
    toggleFullscreen: function() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    },

    /**
     * Show notification.
     */
    showNotification: function(message, type = 'info') {
      const notification = $(`
        <div class="notification ${type}">
          <i class="fas fa-${this.getActivityIcon(type)}"></i>
          <span>${message}</span>
          <button class="close-btn"><i class="fas fa-times"></i></button>
        </div>
      `);

      $('body').append(notification);
      
      // Auto remove after 5 seconds
      setTimeout(function() {
        notification.addClass('removing');
        setTimeout(function() {
          notification.remove();
        }, 300);
      }, 5000);

      // Manual close
      notification.find('.close-btn').on('click', function() {
        notification.addClass('removing');
        setTimeout(function() {
          notification.remove();
        }, 300);
      });
    }

  };

  /**
   * Behavior initialization.
   */
  Drupal.behaviors.headyAdmin = {
    attach: function (context, settings) {
      Drupal.headyAdmin.init();
    }
  };

  /**
   * Global functions for template usage.
   */
  window.refreshDashboard = function() {
    Drupal.headyAdmin.updateSystemStatus();
    Drupal.headyAdmin.showNotification('Dashboard refreshed', 'success');
  };

  window.exportReport = function() {
    Drupal.headyAdmin.exportConfig();
  };

  window.toggleFabMenu = function() {
    $('.main-fab').click();
  };

  window.openCustomization = function() {
    window.location.href = '/admin/heady/customization';
  };

  window.exportConfig = function() {
    Drupal.headyAdmin.exportConfig();
  };

  window.toggleFullscreen = function() {
    Drupal.headyAdmin.toggleFullscreen();
  };

  window.openSettings = function() {
    window.location.href = '/admin/config/heady';
  };

}) (Drupal, drupalSettings, jQuery);
