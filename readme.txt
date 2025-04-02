Informations & Generality for Playwright automation on saucedempo

Disclaimer: Saucedemo has no versioning

1.Command to launch test
	Launch all tests on all browsers in headless mode: $env:HEADLESS="true"; npm test
	Launch all tests on all browsers in visual(not headless) mode: $env:HEADLESS="false"; npm test
	Launch all tests on chromium in visual(not headless) mode: $env:HEADLESS="false"; npm run test:chromium -- "tags" "@testcyd"
	Launch all tests on firefox in visual(not headless) mode: $env:HEADLESS="false"; npm run test:firefox -- "tags" "@testcyd"
	Launch all tests on webkit in visual(not headless) mode:$env:HEADLESS="false"; npm run test:webkit -- "tags" "@testcyd"
	Launch 1 ou more scenario link to a tag (example tag @demo) on all browsers in headless mode: $env:HEADLESS="true"; npm test -- "tags" "@demo"

	A the end of the test, report is automatically open. (base on index.js file launchReport: true)
	If you want not to open the report automatically, you must put in index.js file launchReport: false
	
	The configuration of the report is made in the options of the index.js file
	The running of the test & launch the report generation is made by the runTest.js file
	The link to the runTest.js file is made in the package.json in scripts.
	
	Reports are store in reports directory at the root of the playwright project. 5.

2. Configuration

=> url name use for the test is configure in basepage.json in the ref_for_test directory
=> screenshot path configure in basepage.json in the ref_for_test directory

Note: json files for configuration must be in utf-8


3. Generate fonction documentation
A each code fix ,to make a update of documentation please launch: npx typedoc --out docs --entryPointStrategy expand pages/

4. Documentations of fonction use in the Page Object Model 
Documentations are in docs directory

5. Reference image for comparison
Reference image for comparison are stored in logo_ref directory

6. Installation needed
If Playwright was not install before please uninstall Node following microsoft recommandation: https://stackoverflow.com/questions/20711 240/how-to-completely-remove-node-js-from-windows
Please ensure you use a node version manager (I use nvm:  https://github.com/coreybutler /nvm-windows#installation--up grades/)
Please ensure you use the Latest Stable version (use nvm list available choose the LTS and select it (if 22.14.0 is the LTS)nvm install 22.14.0 then nvm use 22.14.0 )
initialise playwright in the directory: npm init playwright@latest
install cucumber for playwright: npm install @cucumber/cucumber
install cucumber html reporter: npm install cucumber-html-reporter (in cas of vulnerabilities, please solve them)
install pixel & pngjs: npm install pixelmatch pngjs
install cross-env: npm install cross-env
install typescript: npm install ts-node typescript

7. Structure Informations
Directory 
docs => store the documents of the Page Object Model file
features => cucumber gherkin feature file
node_modules => the node modules to be able to run
pages => the code of the Page Object Model
screenshots => screenshot taken for the report
reports => all cucumber report generated
steps => implementation of the gherkin
SauceDemoTest_Vertuoza => file for implementation 
videos => video stored for the report

File 
cucumber.json => use for cucumber configuration


