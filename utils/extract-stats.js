const fs = require('fs');
const glob = require('glob');
const cheerio = require('cheerio');

// Recherche tous les fichiers de rapport HTML
const reportFiles = glob.sync('./reports/cucumber_report_*.html');

let combinedStats = '';

// Pour chaque fichier de rapport
reportFiles.forEach(file => {
  try {
    const browser = file.match(/cucumber_report_(.+)\.html/)[1];
    const htmlContent = fs.readFileSync(file, 'utf8');
    
    // Utilise cheerio pour analyser le HTML
    const $ = cheerio.load(htmlContent);
    
    // Trouve toutes les divs dont la classe commence par count-wrapper
    const countWrappers = $('div[class^="count-wrapper"]');
    
    if (countWrappers.length > 0) {
      combinedStats += `<h2>Statistiques pour ${browser}</h2>`;
      countWrappers.each((i, el) => {
        combinedStats += `<div>${$(el).html()}</div>`;
      });
    }
  } catch (error) {
    console.error(`Erreur avec le fichier ${file}: ${error}`);
  }
});

// Écrit les statistiques dans un fichier
fs.writeFileSync('./reports/stats-summary.html', combinedStats || '<p>Aucune statistique trouvée</p>');

// Pour GitHub Actions
if (process.env.GITHUB_OUTPUT) {
  const stats = combinedStats || '<p>Aucune statistique trouvée</p>';
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `stats<<STATSEOF\n${stats}\nSTATSEOF\n`);
}