import { Page, Locator, expect}   from '@playwright/test'
import { BasePage } from './BasePage';
import { readFileSync,existsSync } from "fs";


/**
 * Login Page
 *
 * @export
 * @class LoginPage
 * @typedef {LoginPage}
 * @extends {BasePage}
 */
export class LoginPage extends BasePage {
    readonly fileForRef: string ="./ref_for_test/login.json";
    readonly fileForLogin: string="./ref_for_test/user_login.json";  
    //All Locator Definition
    readonly loginPageUsername: Locator;
    readonly loginPagePassword: Locator;
    readonly loginButton: Locator;
    readonly loginErrorMessage: Locator;
    readonly loginErrorFrame: Locator;
    
    //Object catch from JSON  definition
    readonly refLoginPageData:any;

    constructor(page: Page) {
        super(page);
        const fileContent = readFileSync(this.fileForRef, this.jsonEncodingType); //read the file for the parameter
        this.refLoginPageData= JSON.parse(fileContent);
        this.loginPageUsername = this.page.locator(this.refLoginPageData.loginPageUsername);
        this.loginPagePassword = this.page.locator(this.refLoginPageData.loginPagePassword);
        this.loginButton = this.page.locator(this.refLoginPageData.loginButton);
        this.loginErrorFrame = this.page.locator(this.refLoginPageData.loginErrorFrame);
        this.loginErrorMessage = this.loginErrorFrame.locator(this.refLoginPageData.loginErrorMessage);
    }


        /**
         * Control Page Screenshot is identical to reference screenshot
         *
         * @async
         * @param {number} numberOfDiffPixelRatio - is the ratio of accepted bad pixel versus image reference
         * @returns {Promise<void>} 
         */
        async controlEntirePage(numberOfDiffPixelRatio:number, world?: any):Promise<void>{
            await this.loginButton.waitFor(); //wait button is displayed
            let osName = 'unknown';
            if (process.platform === 'win32') {
            osName = 'windows';
            } else if (process.platform === 'darwin') {
            osName = 'macos';
            } else if (process.platform === 'linux') {
            osName = 'linux';
            }
            const browserName = process.env.BROWSER; //catch the browser name as image may vary versus browser
            const headless = process.env.HEADLESS;
            const imagePath = `./logo_ref/Login_page_${osName}_${browserName}_headless_${headless}.png`; //path to the image reference
        
            const fileNameLive = `diff_image_${new Date().getTime()}.png`;
    const diffOutputPath = `./output/${fileNameLive}`;
    console.log(`Chemin de sortie de l'image diff: ${diffOutputPath}`);
    
    console.log("Avant getPixelDiff");
    const pixelDiff = await this.getPixelDiff(imagePath, this.page, diffOutputPath);
    console.log(`Après getPixelDiff: diffCount=${pixelDiff.diffCount}, diffImagePath=${pixelDiff.diffImagePath}`);
    
    try {
        console.log(`Vérification: ${pixelDiff.diffCount} <= ${numberOfDiffPixelRatio}`);
        expect(pixelDiff.diffCount).toBeLessThanOrEqual(numberOfDiffPixelRatio);
        console.log("Test réussi - pas de différence");
    } catch (error) {
        console.log("Test échoué - différence détectée");
        console.log(`World existe: ${!!world}`);
        console.log(`DiffImagePath existe: ${!!pixelDiff.diffImagePath}`);
        
        if (pixelDiff.diffImagePath) {
            console.log(`Fichier existe: ${existsSync(pixelDiff.diffImagePath)}`);
        }
        
        if (world && pixelDiff.diffImagePath && existsSync(pixelDiff.diffImagePath)) {
            console.log("Conditions remplies pour attacher l'image");
            try {
                const diffImageBuffer = readFileSync(pixelDiff.diffImagePath);
                console.log("Image lue avec succès");
                
                // Vérifier si world.attach est une fonction
                console.log(`world.attach est une fonction: ${typeof world.attach === 'function'}`);
                
                const base64Image = diffImageBuffer.toString('base64');
                world.attach(base64Image, 'image/png;base64');
                // world.attach(diffImageBuffer, {contentType: 'image/png', fileName: fileNameLive});
                console.log("Image attachée avec succès");
            } catch (attachError) {
                console.error(`Erreur lors de l'attachement de l'image: ${attachError}`);
            }
        } else {
            console.log("Conditions non remplies pour attacher l'image");
        }
        
        throw new Error(`❌ Image ${imagePath} is not conform to reference. Pixel différence: ${pixelDiff.diffCount} over the target of ${numberOfDiffPixelRatio}. ${error}`);
    }
        }

        
        /**
         * login with userReference
         * @param {string} userReference example Martine
         */
        async loginForUserReference(userReference:string):Promise <void>{
            const fileContent = readFileSync(this.fileForLogin, this.jsonEncodingType); //read the file for the parameter
            const userData= JSON.parse(fileContent); //catch the json object
            await this.loginWithNameAndPassword(userData[userReference].name,userData[userReference].password);           
        }

        async loginWithNameAndPassword(name:string,password:string):Promise<void>
        {
            await this.inputDataTo(this.loginPageUsername,name);
            await this.inputDataTo(this.loginPagePassword,password);

            var displayLoginButtonText:any;
            try{
            displayLoginButtonText = await this.loginButton.getAttribute('value');
            }
            catch(error)
            {
                throw new Error(`❌ The not possible to get the Text of the button. ${error}`);
            }
            try {
                expect(displayLoginButtonText).toStrictEqual(this.refLoginPageData.loginTextOfLoginButton)
                } catch (error) {
                    throw new Error(`❌ The text of the Button is not conform to reference. ${displayLoginButtonText} is display instead of ${this.refLoginPageData.loginTextOfLoginButton}. ${error}`);
                  }
            try{
            await this.loginButton.click({timeout: 2000});
            }
            catch (error) {
                throw new Error(`❌ Login do not work. ${error}`);
              }
        }

        async controlLoginErrorMessageBackgroundcolor():Promise<void>
        {
            await this.loginErrorFrame.waitFor({state:"visible"});
            const color_reference = 'rgb(226, 35, 26)';
            try{
            await expect(this.loginErrorFrame).toHaveCSS("background-color",color_reference);
            }
            catch (error)
            {
                throw new Error(`❌ The background color is not as expected. ${error}`);
            }
        }

        async controlLoginErrorMessage(expectedErrorMessage: string):Promise<void>
        {
            const loginErrorMessageDisplay = await this.loginErrorMessage.textContent();
            try{
                expect(loginErrorMessageDisplay).toStrictEqual(expectedErrorMessage);
            }
            catch (error)
            {
                throw new Error(`❌ The Message ${loginErrorMessageDisplay} is not conform as it must be ${expectedErrorMessage}. ${error}`);
            }
            await this.controlLoginErrorMessageBackgroundcolor();
        }


        
}