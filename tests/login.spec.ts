import { test, expect } from '@playwright/test';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { checkMessage } from './utils/checkMessage';

const csvPath = path.join(__dirname, 'data', 'login-data.csv');
const fileContent = fs.readFileSync(csvPath, 'utf-8');

const records: { testCaseId: string; module: string; testCaseName: string; username: string; password: string; expectedMessage: string }[] =
  parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

const loginRows = records.filter(r => r.module === 'login');

for (const row of loginRows) {
  test(`${row.testCaseId} - Login - ${row.username} / ${row.password}`, async ({ page }) => {
    await page.goto('faces/login.xhtml');

    await page.getByRole('textbox', { name: 'Username' }).fill(row.username);
    await page.getByRole('textbox', { name: 'Password' }).fill(row.password);
    await page.getByRole('button', { name: 'Login' }).click();

    await checkMessage(page, row.testCaseId, row.testCaseName, row.expectedMessage);

    if (row.expectedMessage === 'Sucessfully logged in') {
      await page.waitForURL(/index\.xhtml/);
      await expect(page).toHaveURL(/index\.xhtml/);
    } else {
      await expect(page).toHaveURL(/login\.xhtml/);
    }
  });
}