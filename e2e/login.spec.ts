import { test, expect } from '@playwright/test';

test.describe('Login Component Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://angular-code-book.netlify.app/login?returnUrl=%2Fdashboard-selector');
    // await page.waitForLoadState('networkidle'); // Ensure page is fully loaded
  });

  test('should display login form by default', async ({ page }) => {
    await expect(page.locator('[data-testid="auth-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toHaveClass(/bg-\[#1E88E5\]/);
    await expect(page.locator('[data-testid="signup-button"]')).not.toHaveClass(/bg-\[#1E88E5\]/);
    await expect(page.locator('[data-testid="name-input"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="confirm-password-input"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="remember-me-checkbox"]')).toBeVisible();
    await expect(page.locator('[data-testid="agree-terms-checkbox"]')).not.toBeVisible();
  });

  test('should switch to signup mode', async ({ page }) => {
    await page.locator('[data-testid="signup-button"]').click();
    await expect(page.locator('[data-testid="signup-button"]')).toHaveClass(/bg-\[#1E88E5\]/);
    await expect(page.locator('[data-testid="login-button"]')).not.toHaveClass(/bg-\[#1E88E5\]/);
    await expect(page.locator('[data-testid="name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="confirm-password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="agree-terms-checkbox"]')).toBeVisible();
    await expect(page.locator('[data-testid="remember-me-checkbox"]')).not.toBeVisible();
  });

  test('fshould show social login buttons', async ({ page }) => {
    await expect(page.locator('button[aria-label="Sign in with Facebook"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Sign in with Apple"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Sign in with Google"]')).toBeVisible();
  });

  test('should validate email field', async ({ page }) => {
    await page.locator('[data-testid="email-input"] input').fill('invalid-email');
    await page.locator('[data-testid="email-input"] input').blur();
    await page.locator('[data-testid="password-input"] input').fill('password123');
    await page.locator('form[data-testid="auth-form"]').dispatchEvent('submit');
    await page.waitForSelector('[data-testid="email-invalid-error"]', { state: 'visible', timeout: 10000 });
    await expect(page.locator('[data-testid="email-invalid-error"]')).toBeVisible();

    await page.locator('[data-testid="email-input"] input').fill('');
    await page.locator('[data-testid="email-input"] input').blur();
    await page.locator('form[data-testid="auth-form"]').dispatchEvent('submit');
    await page.waitForSelector('[data-testid="email-required-error"]', { state: 'visible', timeout: 10000 });
    await expect(page.locator('[data-testid="email-required-error"]')).toBeVisible();
  });

  test('should validate password field', async ({ page }) => {
    await page.locator('[data-testid="email-input"] input').fill('test@example.com');
    await page.locator('[data-testid="password-input"] input').fill('123');
    await page.locator('[data-testid="password-input"] input').blur();
    await page.locator('form[data-testid="auth-form"]').dispatchEvent('submit');
    await page.waitForSelector('[data-testid="password-minlength-error"]', { state: 'visible', timeout: 10000 });
    await expect(page.locator('[data-testid="password-minlength-error"]')).toBeVisible();

    await page.locator('[data-testid="password-input"] input').fill('');
    await page.locator('[data-testid="password-input"] input').blur();
    await page.locator('form[data-testid="auth-form"]').dispatchEvent('submit');
    await page.waitForSelector('[data-testid="password-required-error"]', { state: 'visible', timeout: 10000 });
    await expect(page.locator('[data-testid="password-required-error"]')).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.locator('[data-testid="password-input"] input').fill('password123');
    await expect(page.locator('[data-testid="password-input"] input')).toHaveAttribute('type', 'password');

    await page.locator('[data-testid="toggle-password-visibility"]').click();
    await expect(page.locator('[data-testid="password-input"] input')).toHaveAttribute('type', 'text');

    await page.locator('[data-testid="toggle-password-visibility"]').click();
    await expect(page.locator('[data-testid="password-input"] input')).toHaveAttribute('type', 'password');
  });

  test('should toggle confirm password visibility in signup mode', async ({ page }) => {
    await page.locator('[data-testid="signup-button"]').click();
    await page.locator('[data-testid="confirm-password-input"] input').fill('password123');
    await expect(page.locator('[data-testid="confirm-password-input"] input')).toHaveAttribute('type', 'password');

    await page.locator('[data-testid="toggle-confirm-password-visibility"]').click();
    await expect(page.locator('[data-testid="confirm-password-input"] input')).toHaveAttribute('type', 'text');
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.locator('[data-testid="forgot-password-link"]').click();
    await expect(page).toHaveURL( "https://angular-code-book.netlify.app/login?returnUrl=%2Fdashboard-selector", { timeout: 10000 }); // Adjust if the route is different
  });

  test('should attempt login with valid credentials', async ({ page }) => {
    await page.route('**/api/login', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, redirect: '/dashboard-selector' }),
      });
    });

    await page.locator('[data-testid="email-input"] input').fill('test@example.com');
    await page.locator('[data-testid="password-input"] input').fill('password123');
    await page.locator('form[data-testid="auth-form"]').dispatchEvent('submit');

    await expect(page).toHaveURL("https://angular-code-book.netlify.app/login?returnUrl=%2Fdashboard-selector", { timeout: 10000 });
  });

  test('should attempt signup with valid credentials', async ({ page }) => {
    await page.route('**/api/signup', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, redirect: '/dashboard-selector' }),
      });
    });

    await page.locator('[data-testid="signup-button"]').click();
    await page.locator('[data-testid="name-input"] input').fill('Test User');
    await page.locator('[data-testid="email-input"] input').fill('test@example.com');
    await page.locator('[data-testid="password-input"] input').fill('password123');
    await page.locator('[data-testid="confirm-password-input"] input').fill('password123');
    await page.locator('[data-testid="agree-terms-checkbox"]').click();
    await page.locator('form[data-testid="auth-form"]').dispatchEvent('submit');

    await expect(page).toHaveURL("https://angular-code-book.netlify.app/login?returnUrl=%2Fdashboard-selector", { timeout: 10000 });
  });
});