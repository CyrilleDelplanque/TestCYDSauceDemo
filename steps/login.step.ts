const { Given, When, Then, Before, After, AfterStep, setDefaultTimeout,Status,world} = require("@cucumber/cucumber");
import { ITestCaseHookParameter, IWorld } from '@cucumber/cucumber';

import {Page, Browser, expect, chromium,firefox,webkit,LaunchOptions, BrowserContext}   from '@playwright/test'

import { BasePage } from '../pages/BasePage';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';

// page: are declared and use by this.page thanks to world.ts
// browser: are declared and use by this.browser thanks to world.ts
// context: are declared and use by this.context thanks to world.ts

setDefaultTimeout(10000);
//First Action before any action
Before(async function (this: IWorld, scenario:any) {
    this.testCase = scenario;
    let browser: Browser;

    const headless = process.env.HEADLESS === "true"; //false except if headless is true
    const options: LaunchOptions = { headless};
    const browserName = process.env.BROWSER || 'chromium';

    console.log(`🚀 Browser launch: ${browserName}`);

    if (browserName === 'chromium') {
        browser = await chromium.launch(options);
    } else if (browserName === 'firefox') {
        browser = await firefox.launch(options);
    } else if (browserName === 'webkit') {
        browser = await webkit.launch(options);
    } else {
        throw new Error(`❌ Unknown Browser: ${browserName}`);
    }

    this.browser = browser;

    let featureName = scenario.gherkinDocument.feature.name;
    let scenarioName = scenario.pickle.name;

    this.context = await this.browser.newContext({ 
        recordVideo: { dir: `videos/${featureName}/${scenarioName}` } 
    });

    this.page = await this.context.newPage();
    this.consoleLogs = []; // Init logs

    console.log = ((originalLog) => (...args) => {
        this.consoleLogs.push(args.join(' ')); // Store log
        originalLog.apply(console, args); //display log
    })(console.log);

    if (this.page) {
        console.log('✅ Playwright console listener activated');

        this.page.on('console', (message) => {
            const text = message.text();
            const type = message.type();

            if (text.includes('W1024 - The client-side export is enabled')) {
                console.log(`⚠️ Ignoré : ${text}`);
                return;
            }

            if (['log', 'info', 'error', 'warn'].includes(type)) {
                console.log(`✅ Console Log Captured: [${type}] ${text}`);
                this.consoleLogs.push(`[${type}] ${text}`);
            }
        });
    }

    console.log = ((originalLog) => (...args) => {
        this.consoleLogs.push(args.join(' ')); // Stocker le log dans this.consoleLogs
        originalLog.apply(console, args); // Afficher le log dans le terminal
    })(console.log);

    this.page.setViewportSize({ width: 1280, height: 720 });
});

Given("I am on saucedemo website", async function (){
    const loginPage = new LoginPage(this.page as Page);
    await loginPage.navigateTo();
    await loginPage.controlEntirePage(0,this);

});


Given("I am connected as {string}", async function (user:string) {
    const loginPage = new LoginPage(this.page as Page);
    await loginPage.loginForUserReference(user);
    const productsPage = new ProductsPage(this.page as Page);
    await productsPage.controlMainHeader();
    await productsPage.controlPageTitle();
});

When("I try to Login with my {string} and {string}", async function (name:string, password:string) {
    const loginPage = new LoginPage(this.page as Page);
    await loginPage.loginWithNameAndPassword(name,password);
});

When("I try to Login as {string}", async function (user:string) {
    const loginPage = new LoginPage(this.page as Page);
    await loginPage.loginForUserReference(user);
});

When("I logout", async function () {
    const productsPage = new ProductsPage(this.page as Page);
    await productsPage.logout();
});


Then("A Error message {string} is displayed over a Red frame",async function (errorMessage:string){
    const loginPage = new LoginPage(this.page as Page);
    await loginPage.controlLoginErrorMessage(errorMessage);
});

Then("I am logged as {string}", async function (user:string) {
    const productsPage = new ProductsPage(this.page as Page);
    await productsPage.controlMainHeader();
    await productsPage.controlIsLogin();
});

Then("I am back to Login Page", async function () {
    await this.page.waitForLoadState('load');
    const loginPage = new LoginPage(this.page as Page);
    await loginPage.controlEntirePage(0,this);
});

AfterStep(async function (step: ITestCaseHookParameter) {
    const basepage= new BasePage(this.page as Page);
    if (step.result?.status === Status.FAILED) { // if Issue while doing the step
        await basepage.takeScreenShot(world, step,this.page);
        const videoPath = await this.page.video()?.path();
        basepage.attach_videoworld(videoPath,world);
        }
    if (this.attach && this.consoleLogs.length > 0) {
            // this.attach(this.consoleLogs.join('\n'), 'text/plain');
            const filteredLogs = this.consoleLogs.filter(log => !log.includes('For additional information')); 
            this.attach(filteredLogs.join('\n'), 'text/plain'); // Bring the log to the report
        }
    });


After(async function(this: IWorld,scenario: ITestCaseHookParameter) {
    const basepage= new BasePage(this.page as Page);
    if (scenario.result?.status == Status.PASSED) {
        this.page.video().delete();
    }
    const filteredLogs = this.consoleLogs.filter(log => !log.includes('For additional information')); 
        if (filteredLogs.length > 0) {
            this.attach('📜 Logs complets:\n' + filteredLogs.join('\n'), 'text/plain');
        }

    // await context.tracing.stop({ path: 'trace.zip' });
    await this.context.close();
    await this.browser.close();
  });