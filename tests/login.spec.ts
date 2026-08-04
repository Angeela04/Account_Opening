import { test, expect } from '@playwright/test';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

const csvPath = path.join(__dirname, 'data', 'login-data.csv');
const fileContent = fs.readFileSync(csvPath, 'utf-8');

const records: { testCaseId: string; username: string; password: string; expectedMessage: string }[] =
  parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

for (const row of records) {
  test(`${row.testCaseId} - Login - ${row.username} / ${row.password}`, async ({ page }) => {
    await page.goto('http://localhost:8080/synergy/faces/login.xhtml');

    await page.getByRole('textbox', { name: 'Username' }).fill(row.username);
    await page.getByRole('textbox', { name: 'Password' }).fill(row.password);
    await page.getByRole('button', { name: 'Login' }).click();

    const actualMsg = (await page.locator('.ui-growl-title').textContent())?.trim() ?? '';
    const passed = actualMsg === row.expectedMessage;

    console.log(
      `${row.testCaseId}:${passed ? 'Pass' : 'Fail'}\n` +
      `Expected : ${row.expectedMessage}\n` +
      `Actual: "${actualMsg}"\n`
    );

    expect(actualMsg, `${row.testCaseId} message mismatch`).toBe(row.expectedMessage);

    if (row.expectedMessage === 'Sucessfully logged in') {
      await page.waitForURL(/index\.xhtml/);
      await expect(page).toHaveURL(/index\.xhtml/);
    } else {
      await expect(page).toHaveURL(/login\.xhtml/);
    }
  });
}