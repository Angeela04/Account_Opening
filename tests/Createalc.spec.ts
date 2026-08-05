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
  test(`${row.testCaseId} - ${row.expectedMessage}`, async ({ page }) => {

    if (row.testCaseId === 'TC003') {
      // Account creation flow — login with fixed valid user, then create account
      await page.goto('http://localhost:8080/synergy/faces/login.xhtml');
      await page.getByRole('textbox', { name: 'Username' }).fill('p01');
      await page.getByRole('textbox', { name: 'Password' }).fill('Cbb@2015');
      await page.getByRole('button', { name: 'Login' }).click();
      await page.waitForURL(/index\.xhtml/);

      await page.getByRole('link', { name: 'Client', exact: true }).click();
      await page.getByRole('link', { name: 'Client', exact: true }).click();
      await page.getByRole('link', { name: 'Client', exact: true }).click();
      await page.getByRole('link', { name: 'Client', exact: true }).click();
      await page.getByRole('link', { name: 'Member', exact: true }).click();
      await page.getByRole('gridcell').filter({ hasText: /^$/ }).nth(3).click();
      await page.getByRole('button', { name: ' Accounts' }).click();
      await page.getByRole('button', { name: 'ui-button', description: 'Create [Alt+c]' }).click();

      await page.locator('[id="createForm:savingProduct_label"]').click();
      await page.locator('[id="createForm:savingProduct_filter"]').fill('eds');
      await page.locator('[id="createForm:savingProduct_12"]').click();

      await page.locator('[id="createForm:sourceOfIncomeInp_label"]').click();
      await page.locator('[id="createForm:sourceOfIncomeInp_1"]').click();

      await page.getByRole('textbox', { name: 'Yearly Income (approx.)*' }).fill('0');
      await page.getByRole('textbox', { name: 'Max. Amount Per Trans. (' }).fill('0');
      await page.getByRole('textbox', { name: 'Yearly Txn. Amount (approx' }).fill('0');
      await page.locator('[id="createForm:inp_num_annual_txn_no_input"]').fill('0');
      await page.getByRole('textbox', { name: 'Monthly Txn. Amount (approx.)*' }).fill('0');
      await page.locator('[id="createForm:inp_num_mon_txn_no_input"]').fill('0');

      await page.getByRole('button', { name: 'Save' }).click();

      const actualMsg = (await page.locator('.ui-growl-title').textContent())?.trim() ?? '';
      const passed = actualMsg === row.expectedMessage;

      console.log(
        `${row.testCaseId}:${passed ? 'Pass' : 'Fail'}\n` +
        `Expected : ${row.expectedMessage}\n` +
        `Actual: "${actualMsg}"\n`
      );

      expect(actualMsg, `${row.testCaseId} message mismatch`).toBe(row.expectedMessage);

      await page.waitForURL(/CreateAccount\/List\.xhtml/);
      const closeBtn = page.getByRole('button', { name: 'Close' });
      await closeBtn.waitFor({ state: 'visible' });
      await closeBtn.click();

    } else {
      // Login test cases (TC001, TC002)
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
    }
  });
}