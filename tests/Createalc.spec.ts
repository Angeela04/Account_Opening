import { test, expect } from '@playwright/test';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { login } from './utils/login';
import { checkMessage } from './utils/checkMessage';

const csvPath = path.join(__dirname, 'data', 'login-data.csv');
const fileContent = fs.readFileSync(csvPath, 'utf-8');

const records: { testCaseId: string; module: string; username: string; password: string; expectedMessage: string }[] =
  parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

const accountRows = records.filter(r => r.module === 'account');

for (const row of accountRows) {
  test(`${row.testCaseId} - ${row.expectedMessage}`, async ({ page }) => {
    await login(page, 'p01', 'Cbb@2015');

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

    await checkMessage(page, row.testCaseId, row.expectedMessage);

    await page.waitForURL(/CreateAccount\/List\.xhtml/);
    const closeBtn = page.getByRole('button', { name: 'Close' });
    await closeBtn.waitFor({ state: 'visible' });
    await closeBtn.click();
  });
}
