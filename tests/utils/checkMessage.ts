import { Page, expect } from '@playwright/test';

export async function checkMessage(page: Page, testCaseId: string, expectedMessage: string) {
  const actualMsg = (await page.locator('.ui-growl-title').textContent())?.trim() ?? '';
  const passed = actualMsg === expectedMessage;

  console.log(
    `${testCaseId}:${passed ? 'Pass' : 'Fail'}\n` +
    `Expected : ${expectedMessage}\n` +
    `Actual: "${actualMsg}"\n`
  );

  expect(actualMsg, `${testCaseId} message mismatch`).toBe(expectedMessage);
}
