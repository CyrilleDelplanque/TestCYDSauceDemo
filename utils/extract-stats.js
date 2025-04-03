const fs = require('fs');
const glob = require('glob');
const cheerio = require('cheerio');

// Recherche tous les fichiers de rapport HTML
const reportFiles = glob.sync('./reports/cucumber_report_*.html');

// Prépare le HTML avec CSS intégré pour la mise en forme
let combinedStats = `
<style>
  .stats-container {
    font-family: Arial, sans-serif;
    margin: 20px;
  }
  .browser-section {
    margin-bottom: 30px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 15px;
    background-color: #f9f9f9;
  }
  .browser-title {
    color: #2c3e50;
    border-bottom: 2px solid #3498db;
    padding-bottom: 10px;
    margin-bottom: 15px;
  }
  .stat-section {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin: 15px 0;
  }
  .count-wrapper {
    margin: 10px;
    text-align: center;
    flex: 1;
    min-width: 150px;
  }
  .count {
    font-size: 24px;
    font-weight: bold;
  }
  .feature-stats, .scenario-stats {
    margin-top: 20px;
    padding: 15px;
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  .status-passed { color: #2ecc71; }
  .status-failed { color: #e74c3c; }
  .status-skipped { color: #f39c12; }
  .status-pending { color: #3498db; }
  .status-undefined { color: #95a5a6; }
</style>
<div class="stats-container">
`;

// Pour chaque fichier de rapport
reportFiles.forEach(file => {
  try {
    const browser = file.match(/cucumber_report_(.+)\.html/)[1];
    const htmlContent = fs.readFileSync(file, 'utf8');
    
    // Utilise cheerio pour analyser le HTML
    const $ = cheerio.load(htmlContent);
    
    combinedStats += `<div class="browser-section">`;
    combinedStats += `<h2 class="browser-title">Statistiques pour ${browser}</h2>`;
    
    // Extraire les statistiques des count-wrapper
    const countWrappers = $('div[class^="count-wrapper"]');
    if (countWrappers.length > 0) {
      combinedStats += `<div class="stat-section">`;
      countWrappers.each((i, el) => {
        // Extraction de la classe de statut pour la couleur
        const statusClass = $(el).find('.count').attr('class') || '';
        const statusMatch = statusClass.match(/status-(\w+)/);
        const statusColor = statusMatch ? `status-${statusMatch[1]}` : '';
        
        // Ajout de la classe pour le styling
        const html = $(el).html().replace('<div class="count', `<div class="count ${statusColor}`);
        combinedStats += `<div class="count-wrapper">${html}</div>`;
      });
      combinedStats += `</div>`;
    }
    
    // Extraire les statistiques des features
    const featureStats = $('#piechart-features');
    if (featureStats.length > 0) {
      combinedStats += `<div class="feature-stats">`;
      combinedStats += `<h3>Statistiques des Features</h3>`;
      combinedStats += featureStats.html();
      combinedStats += `</div>`;
    }
    
    // Extraire les statistiques des scénarios
    const scenarioStats = $('#piechart-scenarios');
    if (scenarioStats.length > 0) {
      combinedStats += `<div class="scenario-stats">`;
      combinedStats += `<h3>Statistiques des Scénarios</h3>`;
      combinedStats += scenarioStats.html();
      combinedStats += `</div>`;
    }
    
    combinedStats += `</div>`;
  } catch (error) {
    console.error(`Erreur avec le fichier ${file}: ${error}`);
  }
});

combinedStats += `</div>`;

// Écrit les statistiques dans un fichier
fs.writeFileSync('./reports/stats-summary.html', combinedStats || '<p>Aucune statistique trouvée</p>');

// Pour GitHub Actions
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `stats<<STATSEOF\n${combinedStats || '<p>Aucune statistique trouvée</p>'}\nSTATSEOF\n`);
}