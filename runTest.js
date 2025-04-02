const { exec } = require('child_process');
const isWindows = process.platform === "win32";

// Browser List
const browsers = ['chromium', 'firefox', 'webkit'];

// If Browser is defined, we launch specified browser else we launch all browser
const browserEnv = process.env.BROWSER;
const browsersToTest = browserEnv ? [browserEnv] : browsers;


const args = process.argv.slice(2);  //  catch arguments
const tagArgIndex = args.indexOf('tags');
const tagFilter = tagArgIndex !== -1 ? args[tagArgIndex + 1] : null;  //catch the tags arguments

/**
 * Launch in a specified browser
 *
 * @param {*} browser 
 * @returns {*} 
 */
const runTestsForBrowser = (browser) => {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Launch test on ${browser}...`);

    // Command to launch 
    let command = isWindows 
      ? `cross-env BROWSER=${browser} cucumber-js --format json:reports/cucumber_report_${browser}.json --format progress`
      : `BROWSER=${browser} cucumber-js --format json:reports/cucumber_report_${browser}.json --format progress`;

    // Add the tag to command
    if (tagFilter) {
      command += ` --tags ${tagFilter}`;
    }


    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error on ${browser}: ${stderr}`);
        reject(`Error on ${browser}: ${stderr}`);
      } else {
        console.log(stdout);
        resolve(browser);
      }
    });
  });
};


/**
 * Generate the report
 *
 * @param {*} browser 
 * @param {*} isTestPassed 
 */
const generateReports = (browser, isTestPassed) => {
  console.log(`📊 Report Generation for ${browser}...`);
  const reportGenerator = require('./index.js');
  reportGenerator(browser, isTestPassed);
};



/**
 * To execute Test
 *
 * @async
 * @returns {*} 
 */
const runTests = async () => {
  const queue = [...browsersToTest]; // Browser list to test
  const runningTests = []; // Test List on going
  const max_number_of_browser_in_parallel = 1;
  while (queue.length > 0 || runningTests.length > 0) {
    while (runningTests.length < max_number_of_browser_in_parallel && queue.length > 0) {
      const browser = queue.shift();
      console.log(`🕒 Starting Test on ${browser}`);
      
      const testPromise = runTestsForBrowser(browser)
        .then(() => generateReports(browser, true))
        .catch((error) => {
          console.error(`❌ Test Failed on ${browser}: ${error}`);
          generateReports(browser, false);
        })
        .finally(() => {
          runningTests.splice(runningTests.indexOf(testPromise), 1);
        });

      runningTests.push(testPromise);
    }

    // Wait a running test is finished before launch a new one
    await Promise.race(runningTests);
  }

};

// Launch Test
runTests();