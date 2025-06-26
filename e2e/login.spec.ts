
import { test, expect } from '@playwright/test';

// Mock the AuthService for testing
const mockAuthService = {
  login: async (data: { email: string; password: string }) => {
    if (data.email === 'test@example.com' && data.password === 'password123') {
      return Promise.resolve({ success: true });
    }
    throw new Error('Invalid credentials');
  },
  signup: async (data: { name: string; email: string; password: string; confirmPassword: string }) => {
    if (data.email === 'test@example.com' && data.password === data.confirmPassword) {
      return Promise.resolve({ success: true });
    }
    throw new Error('Signup failed');
  },
  error: () => null,
  getIsLoading: () => false,
};

test.describe('Login Component Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses for login and signup
    await page.route('**/api/login', (route) => {
      const body = JSON.parse(route.request().postData() || '{}');
      if (body.email === 'test@example.com' && body.password === 'password123') {
        route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
      } else {
        route.fulfill({ status: 401, body: JSON.stringify({ error: 'Invalid credentials' }) });
      }
    });

    await page.route('**/api/signup', (route) => {
      const body = JSON.parse(route.request().postData() || '{}');
      if (body.email === 'test@example.com' && body.password === body.confirmPassword) {
        route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
      } else {
        route.fulfill({ status: 400, body: JSON.stringify({ error: 'Signup failed' }) });
      }
    });

    // Mock the auth service in the browser context
    await page.addInitScript(() => {
      window['authService'] = {
        login: async (data) => {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          if (!response.ok) throw new Error('Invalid credentials');
          return response.json();
        },
        signup: async (data) => {
          const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          if (!response.ok) throw new Error('Signup failed');
          return response.json();
        },
        error: () => null,
        getIsLoading: () => false,
      };
    });

    // Navigate to the login page
    await page.goto('http://localhost:4200/login');
  });

  test('should display login form by default', async ({ page }) => {
    await expect(page.locator('#auth-heading')).toHaveText('Welcome,please authorize');
    await expect(page.locator('#login-button')).toHaveClass(/bg-\[#1E88E5\]/);
    await expect(page.locator('#signup-button')).not.toHaveClass(/bg-\[#1E88E5\]/);
    await expect(page.locator('#name-input')).not.toBeVisible();
    await expect(page.locator('#confirm-password-input')).not.toBeVisible();
    await expect(page.locator('#remember-me-checkbox')).toBeVisible();
    await expect(page.locator('#forgot-password-link')).toBeVisible();
  });

  test('should switch to signup mode when clicking Sign Up button', async ({ page }) => {
    await page.locator('#signup-button').click();
    await expect(page.locator('#signup-button')).toHaveClass(/bg-\[#1E88E5\]/);
    await expect(page.locator('#login-button')).not.toHaveClass(/bg-\[#1E88E5\]/);
    await expect(page.locator('#name-input')).toBeVisible();
    await expect(page.locator('#confirm-password-input')).toBeVisible();
    await expect(page.locator('#agree-terms-checkbox')).toBeVisible();
    await expect(page.locator('#remember-me-checkbox')).not.toBeVisible();
  });

  test('should show email validation errors', async ({ page }) => {
    await page.locator('#email-input').fill('');
    await page.locator('#email-input').blur();
    await expect(page.locator('#email-required-error')).toHaveText('Email is required');

    await page.locator('#email-input').fill('invalid-email');
    await page.locator('#email-input').blur();
    await expect(page.locator('#email-invalid-error')).toHaveText('Valid email is required');
  });

  test('should show password validation errors', async ({ page }) => {
    await page.locator('#password-input').fill('');
    await page.locator('#password-input').blur();
    await expect(page.locator('#password-required-error')).toHaveText('Password is required');

    await page.locator('#password-input').fill('short');
    await page.locator('#password-input').blur();
    await expect(page.locator('#password-minlength-error')).toHaveText('Password must be at least 6 characters');
  });

  test('should show signup-specific validation errors', async ({ page }) => {
    await page.locator('#signup-button').click();

    await page.locator('#name-input').fill('');
    await page.locator('#name-input').blur();
    await expect(page.locator('#name-error')).toHaveText('Name is required');

    await page.locator('#confirm-password-input').fill('');
    await page.locator('#confirm-password-input').blur();
    await expect(page.locator('#confirm-password-required-error')).toHaveText('Confirm Password is required');

    await page.locator('#password-input').fill('password123');
    await page.locator('#confirm-password-input').fill('different');
    await page.locator('#confirm-password-input').blur();
    await expect(page.locator('#confirm-password-mismatch-error')).toHaveText('Passwords must match');
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.locator('#password-input').fill('password123');
    await expect(page.locator('#password-input')).toHaveAttribute('type', 'password');
    await page.locator('#toggle-password-visibility').click();
    await expect(page.locator('#password-input')).toHaveAttribute('type', 'text');
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.locator('#email-input').fill('test@example.com');
    await page.locator('#password-input').fill('password123');
    await Promise.all([
      page.locator('#login-button').click(),
    ]);
    await expect(page).toHaveURL(/dashboard-selector/);
  });

  test('should fail login with invalid credentials', async ({ page }) => {
    await page.locator('#email-input').fill('wrong@example.com');
    await page.locator('#password-input').fill('wrongpassword');
    await page.locator('#login-button').click();
    await expect(page.locator('#error-message')).toBeVisible();
  });

  test('should successfully signup with valid data', async ({ page }) => {
    await page.locator('#signup-button').click();
    await page.locator('#name-input').fill('Test User');
    await page.locator('#email-input').fill('test@example.com');
    await page.locator('#password-input').fill('password123');
    await page.locator('#confirm-password-input').fill('password123');
    await page.locator('#agree-terms-checkbox').click(); // Click instead of check
    await Promise.all([
      page.waitForNavigation({ url: /dashboard-selector/ }),
      page.locator('#signup-button').click(),
    ]);
    await expect(page).toHaveURL(/dashboard-selector/);
  });

  test('should show error if terms not agreed in signup', async ({ page }) => {
    await page.locator('#signup-button').click();
    await page.locator('#name-input').fill('Test User');
    await page.locator('#email-input').fill('test@example.com');
    await page.locator('#password-input').fill('password123');
    await page.locator('#confirm-password-input').fill('password123');
    await page.locator('#signup-button').click();
    await expect(page.locator('#agree-terms-checkbox')).toHaveClass(/ng-invalid/);
  });
});
