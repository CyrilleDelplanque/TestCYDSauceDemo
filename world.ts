import { setWorldConstructor, World } from "@cucumber/cucumber";
import { Page, Browser, BrowserContext } from "@playwright/test";

class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  
  consoleLogs: string[] =[];
}

// Custom World constructor
setWorldConstructor(CustomWorld);