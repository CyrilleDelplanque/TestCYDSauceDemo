const { spawn } = require('child_process');
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

    // Command and arguments preparation
    let command = isWindows ? 'cross-env' : 'cucumber-js';
    let args = [];
    
    if (isWindows) {
      args.push(`BROWSER=${browser}`);
      args.push('cucumber-js');
    } else {
      // Set environment variable for non-Windows
      process.env.BROWSER = browser;
    }
    
    args.push('--format', `json:reports/cucumber_report_${browser}.json`);
    args.push('--format', 'progress');
    args.push('--publish');
    
    // Add the tag to command
    if (tagFilter) {
      args.push('--tags', tagFilter);
    }

    console.log(`Executing: ${command} ${args.join(' ')}`);

    // Use spawn instead of exec to pipe output in real-time
    const childProcess = spawn(command, args, { 
      stdio: 'inherit', // This is key to see logs in real-time
      shell: true,
      env: { ...process.env }
    });

    childProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ Process for ${browser} exited with code ${code}`);
        reject(`Error on ${browser}: Process exited with code ${code}`);
      } else {
        console.log(`✅ Tests completed successfully on ${browser}`);
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
          const index = runningTests.indexOf(testPromise);
          if (index !== -1) {
            runningTests.splice(index, 1);
          }
        });

      runningTests.push(testPromise);
    }

    // Wait until a running test is finished before launching a new one
    if (runningTests.length > 0) {
      await Promise.race(runningTests);
    }
  }
};

// Launch Test
runTests();