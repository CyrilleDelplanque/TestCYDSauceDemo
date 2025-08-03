import { Page, Locator, expect}   from '@playwright/test'
import { BasePage } from './BasePage';
import { readFileSync } from "fs";
import { extractCurrencyAndPrices } from '../utils/utilscyd';



/**
 * Products Page Object
 *
 * @export
 * @class ProductsPage
 * @typedef {ProductsPage}
 * @extends {BasePage}
 */
export class ProductsPage extends BasePage {
    readonly fileForRef: string ="./ref_for_test/products.json";
    readonly fileItems: string ="./ref_for_test/simulated_items_bdd_datas.json"; //use to simulate data from a database
    //All Locator Definition
    readonly buttonBurgerMenu: Locator;
    readonly logoutSelection: Locator;
    readonly productsPageHeader: Locator;
    readonly headerMainTitle: Locator;
    readonly pageTitle: Locator;
    readonly burgerMenu: Locator;
    readonly buttonBurgerMenuClose: Locator;
    readonly burgerItemList:Locator;
    readonly buttonSorting:Locator;
    readonly sortOption:Locator; 
    readonly buttonBasket:Locator;
    readonly inventoryList:Locator;
    readonly inventoryItem:Locator;
    readonly shoppingCart:Locator;
    readonly cartNumberOfItem:Locator;
   
    //Object catch from JSON  definition
    readonly refProductsPageData:any;
    readonly itemsData:any;

    constructor(page: Page) {
        super(page);
        const fileContent = readFileSync(this.fileForRef, this.jsonEncodingType); //read the file for the parameter
        this.refProductsPageData= JSON.parse(fileContent);
        this.itemsData = JSON.parse(readFileSync(this.fileItems, this.jsonEncodingType)); 
        this.buttonBurgerMenu = this.page.locator(this.refProductsPageData.buttonBurgerMenu);
        this.productsPageHeader = this.page.locator(this.refProductsPageData.productsPageHeader);
        this.headerMainTitle = this.productsPageHeader.locator(this.refProductsPageData.headerMainTitle);
        this.pageTitle = this.productsPageHeader.locator(this.refProductsPageData.pageTitle);
        this.burgerMenu = this.page.locator(this.refProductsPageData.burgerMenu);
        this.burgerItemList = this.burgerMenu.locator(this.refProductsPageData.burgerItemList);
        this.logoutSelection = this.burgerMenu.locator(this.refProductsPageData.logoutSelection);
        this.buttonBurgerMenuClose = this.burgerMenu.locator(this.refProductsPageData.buttonBurgerMenuClose);
        this.buttonSorting= this.page.locator(this.refProductsPageData.buttonSorting);
        this.sortOption= this.page.locator(this.refProductsPageData.sortOption.listDisplayed); 
        this.buttonBasket= this.productsPageHeader.locator(this.refProductsPageData.buttonBasket);
        this.inventoryList= this.page.locator(this.refProductsPageData.inventoryList);
        this.inventoryItem= this.page.locator(this.refProductsPageData.inventoryItem);
        this.shoppingCart= this.productsPageHeader.locator(this.refProductsPageData.shoppingCart);
        this.cartNumberOfItem= this.productsPageHeader.locator(this.refProductsPageData.cartNumberOfItem);
    }


    /**
     * control the Main Header text
     *
     * @async
     * @returns {Promise<void>} 
     */
    async controlMainHeader():Promise<void>
    {
        await expect(this.headerMainTitle).toBeVisible();

        const headerMainTitleDisplayed = await this.headerMainTitle.textContent();
        try
        {
            expect(headerMainTitleDisplayed).toStrictEqual(this.refProductsPageData.headerMainTitleTextReference);
        }
        catch (error)
        {
            throw new Error(`❌ The Message ${headerMainTitleDisplayed} is not conform as it must be ${this.refProductsPageData.headerMainTitleTextReference}. ${error}`);
        }
        console.log("Control Main Header Done");
    }

    
    /**
     * control the page title text
     *
     * @async
     * @returns {Promise<void>} 
     */
    async controlPageTitle():Promise<void>
    {
        console.log("Start Page Title Control");
        const pageTitleDisplayed = await this.pageTitle.textContent();
        console.log(`Title Display captured: ${pageTitleDisplayed}`)
        try
        {
            expect(pageTitleDisplayed).toStrictEqual(this.refProductsPageData.pageTitleTextReference);
        }
        catch (error)
        {
            throw new Error(`❌ The Message ${pageTitleDisplayed} is not conform as it must be ${this.refProductsPageData.pageTitleTextReference}. ${error}`);
        }
    }

    
    /**
     * Open the Burger Menu after control if is not already opened
     *
     * @async
     * @returns {Promise<void>} 
     */
    async openBurgerMenu():Promise<void>
    {
        try
        {
        await expect(this.burgerMenu).toBeHidden();
        }
        catch(error)
        {
            throw new Error(`❌ The Burger Menu is already Open. ${error}`);
        }
        try
        {
        await this.buttonBurgerMenu.click({timeout: 2000});
        }
        catch(error)
        {
            throw new Error(`❌ The Burger Menu Click to open not Ok. ${error}`);
        }
    }

    
    /**
     * Close the Burger Menu if open
     *
     * @async
     * @returns {Promise<void>} 
     */
    async closeBurgerMenu():Promise<void>
    {
        try
        {
        await expect(this.burgerMenu).not.toBeHidden();
        }
        catch(error)
        {
            throw new Error(`❌ The Burger Menu is already close. ${error}`);
        }
        try{
        await this.buttonBurgerMenuClose.click({timeout: 2000});
        }
        catch(error)
        {
            throw new Error(`❌ The Burger Menu Click to close not Ok. ${error}`);
        }
    }

    
    /**
     * Logout
     *
     * @async
     * @returns {Promise<void>} 
     */
    async logout():Promise<void>
    {
        await this.openBurgerMenu();
        try{
        await this.logoutSelection.click({timeout: 2000});
        }
        catch(error)
        {
            throw new Error(`❌ The Logout Click not Ok. ${error}`);
        }
    }

    
    /**
     * Control is Login by check Logout is existing in burger Menu
     *
     * @async
     * @returns {Promise<void>} 
     */
    async controlIsLogin():Promise<void>
    {
        await this.openBurgerMenu();
        const listOfMenu= await this.burgerItemList.allTextContents();
        try{
        expect (listOfMenu).toContain(this.refProductsPageData.logoutText);
        }
        catch (error)
        {
            throw new Error(`❌ The Menu does not contain Logout. ${error}`);
        }
        finally
        {
            await this.closeBurgerMenu();
        }
    }

    
    /**
     * Control the number of Item Displayed
     *
     * @async
     * @param {number} expectedNumber Number of Item expected to be displayed. Example: 6
     * @returns {Promise<void>} 
     */
    async controlNumberItem(expectedNumber: number):Promise<void>
    {
        const numberOfItemDisplayed= await this.inventoryItem.count();
        try{
        expect (numberOfItemDisplayed).toStrictEqual(expectedNumber);
        }
        catch (error)
        {
            throw new Error(`❌ The Number of item ${numberOfItemDisplayed} is not correct. It must be ${expectedNumber}. ${error}`);
        }
    }

    
    /**
     * Get the list of title of all items
     *
     * @async
     * @returns {Promise<Locator[]>} 
     */
    async getListOfTitleOfItemDisplayed():Promise<string[]>
    {
        return await this.inventoryItem.locator(this.refProductsPageData.inventoryItemTitle).allTextContents();
    }

    /**
     * Get the list of Price of all items
     *
     * @async
     * @returns {Promise<Locator[]>} 
     */
        async getListOfPriceOfItemDisplayed():Promise<{ currency: string, priceValues: number[] }>
        {
            return extractCurrencyAndPrices(await this.inventoryItem.locator(this.refProductsPageData.inventoryItemPrice).allTextContents());
        }

    /**
     * Select the locator of the item by title
     *
     * @async
     * @param {string} title 
     * @returns {Promise<Locator>} 
     */
    async selectProductByTitle(title:string):Promise<Locator>
    {
    const index = (await this.getListOfTitleOfItemDisplayed()).indexOf(title);
    if (index !== -1) {
    console.log(`Article "${title}" found in position ${index}`);
    } else {
    console.log(`Article "${title}" not found.`);
    throw new Error(`❌ Article "${title}" not found.`);
    }
      return this.inventoryItem.nth(index);
    }


    async addProductToCartByTitle(title:string):Promise<void>
    {
        const itemSelected = await this.selectProductByTitle(title);
        await itemSelected.locator(this.refProductsPageData.buttonItemAddToCart).click({timeout:2000});
    }


    getOriginItemTitle(): string[]{
        return Object.keys(this.itemsData)
        .filter(key => key !== 'currency') // On filtre la clé 'currency'
        .map(key => this.itemsData[key].name);   // On retourne le nom du produit
    }


    getOriginItemPrice(): string[]{
        return Object.keys(this.itemsData)
        .filter(key => key !== 'currency') // On filtre la clé 'currency'
        .map(key => this.itemsData[key].price);   // On retourne le nom du produit
    }


    async controlNumberOfItemsInCart(referenceNumber: number):Promise<void>
    {
        if (referenceNumber == 0)
        {
            try{
                expect (await this.cartNumberOfItem).not.toBeVisible();
                }
                catch (error)
                {
                    throw new Error(`❌ There is article in the cart. ${error}`);
                }
        }
        else{
        try{
            const itemDisplayed = parseInt(await this.cartNumberOfItem.textContent());
            expect (itemDisplayed).toStrictEqual(referenceNumber);
            }
            catch (error)
            {
                throw new Error(`❌ The Number of article is not correct. It must be ${referenceNumber}. ${error}`);
            }
        }
    }


    async confirmListOfProductTitle():Promise<void>
    {
        try{
            expect (await this.getListOfTitleOfItemDisplayed()).toEqual(this.getOriginItemTitle());
            }
            catch (error)
            {
                throw new Error(`❌ The List of Title Displayed is not Correct. ${error}`);
            }
        
    }

    async confirmItemIsCorrect(itemTitle: string):Promise<void>
    {
        const item = await this.selectProductByTitle(itemTitle);
        console.log("Product selected by title")
        try
        {
            expect (this.itemsData[itemTitle].deScription).toStrictEqual(await item.locator(this.refProductsPageData.inventoryItemDescription).textContent())
        }
        catch (error)
        {
            throw new Error(`❌ The Article Description Displayed is not Correct. ${error}`);
        }
        try
        {
            const priceDisplayedAll = await item.locator(this.refProductsPageData.inventoryItemPrice).textContent();
            const {currency,priceValues} = extractCurrencyAndPrices([priceDisplayedAll]);
            expect (this.itemsData[itemTitle].price).toStrictEqual(priceValues[0]);
            expect (this.itemsData.currency).toStrictEqual(currency);
        }
        catch (error)
        {
            throw new Error(`❌ The Article Price Displayed is not Correct. ${error}`);
        }
        try
        {
            expect (await item.locator(this.refProductsPageData.inventoryImg).getAttribute('src')).toStrictEqual(this.itemsData[itemTitle].imgLink);
        }
        catch (error)
        {
            throw new Error(`❌ The Image Displayed is not Correct. ${error}`);
        }
        
    }
        
}