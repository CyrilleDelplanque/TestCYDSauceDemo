import {Page, Locator, expect}   from '@playwright/test' //use for playwright
import { World,ITestCaseHookParameter } from '@cucumber/cucumber'; //use by cucumber
import {PNG} from 'pngjs'; //use for image comparison
import pixelmatch from 'pixelmatch'; //use for image comparison
import { existsSync,readFileSync } from 'fs'; //use for file management


/**
 * Generic Class for all pages
 *
 * @export
 * @class BasePage
 * @typedef {BasePage}
 */
export class BasePage {
    // General Declaration
    readonly page: Page;
    readonly jsonEncodingType: BufferEncoding = "utf8";
    readonly fileForRef: string ="./ref_for_test/basepage.json";
    readonly urlDefault: string;
    readonly screenshotPath: string;
    readonly screenshotExtn: string;
    readonly delayBetweenKeyPress: number;
    
    /**
     * Constructor for all Page to have the page reference in object
     *
     * @constructor
     * @param {Page} page 
     */
    constructor (page: Page)
        {
            this.page = page;
            const fileContent = readFileSync(this.fileForRef, this.jsonEncodingType); //read the file from the parameter of object
            const basePageJson= JSON.parse(fileContent); //create a object to be used with data from the json read in the file
            this.urlDefault = basePageJson.urlDefault; //set the url
            this.screenshotPath = basePageJson.screenshotPath; //set the screenshot path
            this.screenshotExtn = basePageJson.screenshotExtn;// set the image extension of screenshot
            this.delayBetweenKeyPress = basePageJson.delayBetweenKeyPress; //set the delay between key press when inputing data
        }

    
    /**
     * Return the title of the page
     *
     * @async
     * @returns {Promise<string>} 
     */
    async getTitle(): Promise<string> 
        {
            return await this.page.title();
        }
    
    /**
     * Navigate to the specified URL
     * If not url specified, go to default url
     * @async
     * @param {string} [urlToNavigate=this.urlDefault] 
     * @returns {Promise <void>} 
     */
    async navigateTo (urlToNavigate: string=this.urlDefault):Promise <void> 
        {
            try {
                //Control if Page Tab on Browser is still alive
                if (this.page.isClosed()) 
                  {
                    throw new Error("❌ Page has been closed!");
                  }
                //if page is alive then goto url and wait until page is completely loaded
                await this.page.goto(urlToNavigate, { waitUntil: 'load' });
                await this.page.waitForLoadState('load');
                } catch (error) 
                  {
                  console.error('❌ Error during open of the url: ', error);
                  throw error;  // Send the error
                  }
        }
           
    /**
     * compare reference image to a screenshot taken of a locator
     * 
     * @async
     * @param {string} expectedImagePath 
     * @param {(Locator | Page)} objectToScreenshot 
     * @returns {Promise<number>} 
     */
    async getPixelDiff(expectedImagePath: string, objectToScreenshot:Locator | Page): Promise<number> 
        {
          const actualImage = PNG.sync.read(await objectToScreenshot.screenshot()); //take the screenshot of the locator
          const expectedImage = PNG.sync.read(readFileSync(expectedImagePath)); //read the reference image
          const { width, height } = actualImage; //read the height and width from the screenshot taken
          const diff = new PNG({ height, width }); //create a empty png file with height of height and width of width
          return pixelmatch(actualImage.data, expectedImage.data, diff.data, width, height); //launch function pixelmatch
        }
   
    /**
     * take a screenshot of the page
     *
     * @async
     * @param {World} world 
     * @param {ITestCaseHookParameter} scenario 
     * @param {(Locator | Page)} toScreenshot 
     * @returns {Promise<void>} 
     */
    async takeScreenShot(world: World, scenario: ITestCaseHookParameter,toScreenshot:Locator|Page): Promise<void> 
        {

          const screenShot = await toScreenshot?.screenshot( //take the screenshot 
            {
                path: this.screenshotPath + scenario.pickle.name + this.screenshotExtn, //parameter of the screenshot
                fullPage: true, //parameter of the screenshot
            });
          // attach the screenshot to report using World's attach()
            if (screenShot) world.attach(screenShot, 'image/png');
        };

    /**
     * attach a video to the cucumber report
     *
     * @async
     * @param {*} videoPath 
     * @param {World} world 
     * @returns {Promise<void>} 
     */
    async attach_videoworld(videoPath: any, world: World): Promise<void> 
        {
            if (videoPath && existsSync(videoPath)) { //if file videoPath exist, while checking name of file is not null before
                // Generate a clickable link to the video
                const videoHtml = `
                <p><strong>❌ Test Fail:</strong></p>
                <video controls width="600">
                    <source src="file://${videoPath}" type="video/webm">
                    Your browser does not support video playing.
                </video>
            `;
            world.attach(videoHtml, 'text/html'); // Add the video player
            }
          }

    
    /**
     * take a Aria snapshot of all the page in the console => to use for debug
     *
     * @async
     * @returns {Promise <void>} 
     */
    async takeSnapshotAllpage():Promise <void>
      {
      console.log(await this.page.locator('body').ariaSnapshot());
      }

      

      /**
      * Input data to a text field by simulate keypress
      *
      * @async
      * @param {Locator} locator 
      * @param {string} data_to_input 
      * @returns {Promise<void>} 
      */
     async inputDataTo(locator: Locator,data_to_input:string):Promise<void>
     {
        await locator.pressSequentially(data_to_input, { delay: this.delayBetweenKeyPress });
     }



}