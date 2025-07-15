import { logger } from './logger';

/**
 * Analytics tracking service that provides structured logging for user events
 * 
 * This service wraps the logger to provide semantic tracking of user interactions,
 * authentication events, feature usage, and performance metrics. All events are
 * automatically logged with appropriate context and metadata.
 * 
 * @example
 * ```typescript
 * import { analytics } from '$lib/analytics';
 * 
 * // Track authentication
 * analytics.auth.loginAttempt('user@example.com');
 * analytics.auth.loginSuccess('user123');
 * 
 * // Track UI interactions
 * analytics.ui.buttonClicked('submit', 'ContactForm', 'user123');
 * analytics.ui.pageViewed('dashboard', 'user123');
 * 
 * // Track feature usage
 * analytics.features.featureUsed('export-data', 'user123', { format: 'csv' });
 * 
 * // Track performance issues
 * analytics.performance.slowOperation('database-query', 2500, 'UserService');
 * ```
 */
export const analytics = {
  /**
   * Authentication-related events
   */
  auth: {
    /**
     * Track login attempt with anonymized email
     * @param email - User's email address (will be anonymized in logs)
     */
    loginAttempt: (email: string) => {
      logger.info('Login attempt', { 
        action: 'login_attempt', 
        metadata: { email: email.split('@')[0] + '@***' },
        component: 'LoginForm'
      });
    },
    
    /**
     * Track successful login
     * @param userId - User ID who successfully logged in
     */
    loginSuccess: (userId: string) => {
      logger.info('Login successful', { 
        action: 'login_success', 
        userId, 
        component: 'LoginForm'
      });
    },
    
    /**
     * Track failed login attempt
     * @param email - User's email address (will be anonymized in logs)
     * @param reason - Reason for login failure
     */
    loginFailure: (email: string, reason: string) => {
      logger.warn('Login failed', { 
        action: 'login_failure', 
        metadata: { 
          email: email.split('@')[0] + '@***',
          reason
        },
        component: 'LoginForm'
      });
    },
    
    /**
     * Track user signup
     * @param userId - ID of the newly created user
     */
    signup: (userId: string) => {
      logger.info('User signed up', { 
        action: 'signup', 
        userId, 
        component: 'SignupForm'
      });
    },
    
    /**
     * Track user logout
     * @param userId - ID of the user who logged out
     */
    logout: (userId: string) => {
      logger.info('User logged out', { 
        action: 'logout', 
        userId, 
        component: 'Navigation'
      });
    }
  },

  /**
   * User interface interaction events
   */
  ui: {
    /**
     * Track component mounting (development only)
     * @param componentName - Name of the component being mounted
     * @param props - Optional props passed to the component
     */
    componentMounted: (componentName: string, props?: Record<string, any>) => {
      logger.debug('Component mounted', { 
        action: 'component_mounted', 
        component: componentName,
        metadata: props ? { propKeys: Object.keys(props) } : undefined
      });
    },
    
    /**
     * Track button click events
     * @param buttonName - Name or identifier of the button clicked
     * @param component - Component containing the button
     * @param userId - Optional user ID if user is authenticated
     */
    buttonClicked: (buttonName: string, component: string, userId?: string) => {
      logger.info('Button clicked', { 
        action: 'button_click', 
        userId,
        component,
        metadata: { buttonName }
      });
    },
    
    /**
     * Track form submission events
     * @param formName - Name or identifier of the form submitted
     * @param component - Component containing the form
     * @param userId - Optional user ID if user is authenticated
     */
    formSubmitted: (formName: string, component: string, userId?: string) => {
      logger.info('Form submitted', { 
        action: 'form_submit', 
        userId,
        component,
        metadata: { formName }
      });
    },
    
    /**
     * Track page view events
     * @param pageName - Name or path of the page viewed
     * @param userId - Optional user ID if user is authenticated
     */
    pageViewed: (pageName: string, userId?: string) => {
      logger.info('Page viewed', { 
        action: 'page_view', 
        userId,
        component: 'Router',
        metadata: { pageName }
      });
    }
  },

  /**
   * Feature usage tracking
   */
  features: {
    /**
     * Track feature usage
     * @param featureName - Name of the feature being used
     * @param userId - Optional user ID if user is authenticated
     * @param metadata - Optional additional metadata about feature usage
     */
    featureUsed: (featureName: string, userId?: string, metadata?: Record<string, any>) => {
      logger.info('Feature used', { 
        action: 'feature_usage', 
        userId,
        component: 'Feature',
        metadata: { featureName, ...metadata }
      });
    }
  },

  /**
   * Performance monitoring and error tracking
   */
  performance: {
    /**
     * Track slow operations for performance monitoring
     * @param operation - Name of the slow operation
     * @param duration - Duration in milliseconds
     * @param component - Component where the slow operation occurred
     */
    slowOperation: (operation: string, duration: number, component: string) => {
      logger.warn('Slow operation detected', { 
        action: 'performance_warning', 
        component,
        metadata: { operation, duration }
      });
    },
    
    /**
     * Track component errors for debugging and monitoring
     * @param component - Component where the error occurred
     * @param error - Error object
     * @param context - Optional additional context about the error
     */
    componentError: (component: string, error: Error, context?: Record<string, any>) => {
      logger.error('Component error', { 
        action: 'component_error', 
        component,
        error,
        metadata: context
      });
    }
  }
};