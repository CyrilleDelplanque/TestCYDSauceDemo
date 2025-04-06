var reporter = require('cucumber-html-reporter');
var fs = require('fs');
var path = require('path');
const { chromium, firefox, webkit } = require('playwright');

// Time stamp creation for report
var date = new Date();
var currentDate = date.getDate() + '_' + (date.getMonth() + 1) + '_' + date.getFullYear() + '_'
  + date.getHours() + '_' + date.getMinutes() + '_' + date.getSeconds() + '_' + date.getMilliseconds();

const reportsDir = 'reports/';

// Get browser version
const getBrowserVersion = async (browserName) => {
  let browser;
  switch (browserName) {
    case 'chromium':
      browser = await chromium.launch();
      break;
    case 'firefox':
      browser = await firefox.launch();
      break;
    case 'webkit':
      browser = await webkit.launch();
      break;
    default:
      return null;
  }
  const version = await browser.version();  
  await browser.close();
  return version;
};

//Get Os
let osName = 'unknown';
            if (process.platform === 'win32') {
            osName = 'windows';
            } else if (process.platform === 'darwin') {
            osName = 'macos';
            } else if (process.platform === 'linux') {
            osName = 'linux';
            }

// Generate the report in each browser
module.exports = async function(browser) {
  const jsonFilePath = path.join(reportsDir, `cucumber_report_${browser}.json`);
  
  // Verify if JSON test done ref file exist before making the html file
  fs.access(jsonFilePath, fs.constants.F_OK, async (err) => {
    try {
      if (err) {
        console.error(`${jsonFilePath} does not exist. Issue cucumber.js.`);
        return;
      } else {
        console.log(`${jsonFilePath} exist. HTML report generation on going for ${browser}...`);

        const version = await getBrowserVersion(browser);

        // Option for report generation & Metadata inside
        const options = {
          theme: 'bootstrap',
          jsonFile: jsonFilePath,
          output: path.join(reportsDir, `cucumber_report_${osName}_${browser}_${currentDate}.html`),
          reportSuiteAsScenarios: true,
          expandAllSteps: true, // to expend data in report
          scenarioTimestamp: true,
          screenshotsDirectory: 'screenshots/',
          storeScreenshots: true,
          disableAttachments: false,
          showStepDetails: true,
          launchReport: true, //to launch the report to be display in a browser automatically
          metadata: {
            "Comment": "Test for Vertuoza of SauceDemo",
            "Test Environnement": "Production Original Website",
            "Video": "yes",
            "Browser": browser,
            "Browser Version": version, 
          },
          outputStyle: 'inline'
        };

        reporter.generate(options);
        console.log(` HTML report for ${browser} generated : cucumber_report_${osName}_${browser}_${currentDate}.html`);
      }
    } catch (error) {
      console.error('Issue while generating HTML report :', error);
    }
  });
};