import { test, expect } from '@playwright/test';

import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';

test('Login Dev', async ({ page }) => {
  page.setViewportSize({ width: 1280, height: 720 });
  const loginPage = new LoginPage(page);
  await loginPage.navigateTo();
  // page.screenshot({ path: 'test.png' });
  await loginPage.controlEntirePage(0);
  // await loginPage.loginWithNameAndPassword("","");
  await loginPage.loginForUserReference("Martine");
  const productsPage = new ProductsPage(page);
  await productsPage.controlMainHeader();
  await productsPage.controlIsLogin();
  await productsPage.controlNumberItem(6);
  console.log (await productsPage.getListOfTitleOfItemDisplayed());
  console.log (await productsPage.getListOfPriceOfItemDisplayed());
  await productsPage.addProductToCartByTitle('Sauce Labs Backpack');
  await productsPage.confirmListOfProductTitle();
  await productsPage.confirmItemIsCorrect('Sauce Labs Bike Light');
});

 
