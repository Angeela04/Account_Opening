import { Page, expect } from '@playwright/test';

export async function login(page: Page, username: string, password: string) {
  await page.goto('http://localhost:8080/synergy/faces/login.xhtml');
  await page.getByRole('textbox', { name: 'Username' }).fill(username);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL(/index\.xhtml/);
  await expect(page).toHaveURL(/index\.xhtml/);
}
