
const fs = require('fs');
const glob = require('glob');
const cheerio = require('cheerio');

// Recherche tous les fichiers de rapport HTML
const reportFiles = glob.sync('./reports/cucumber_report_*.html');

// Création d'un document HTML complet avec en-tête approprié
let combinedStats = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport de Test Cucumber - Résumé</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .browser-section {
      margin-bottom: 40px;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .browser-title {
      background-color: #2c3e50;
      color: white;
      padding: 15px;
      margin: 0;
      font-size: 1.5em;
    }
    .stats-container {
      display: flex;
      flex-wrap: wrap;
      padding: 20px;
      background-color: #f8f9fa;
    }
    .count-wrapper {
      flex: 1;
      min-width: 200px;
      margin: 10px;
      padding: 15px;
      background-color: white;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      text-align: center;
    }
    .count {
      font-size: 36px;
      font-weight: bold;
      margin: 10px 0;
    }
    .status-passed, .passed {
      color: #27ae60;
    }
    .status-failed, .failed {
      color: #e74c3c;
    }
    .status-skipped, .skipped {
      color: #f39c12;
    }
    .status-pending, .pending {
      color: #3498db;
    }
    .status-undefined, .undefined {
      color: #95a5a6;
    }
    .stat-title {
      font-size: 16px;
      font-weight: normal;
      margin-bottom: 5px;
    }
    .feature-stats, .scenario-stats {
      margin-top: 20px;
      padding: 20px;
      background-color: white;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .feature-stats h3, .scenario-stats h3 {
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
      margin-top: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
    }
    .chart-container {
      margin: 20px 0;
      max-width: 600px;
      height: 300px;
    }
    .summary-bar {
      display: flex;
      height: 30px;
      border-radius: 4px;
      overflow: hidden;
      margin: 15px 0;
    }
    .summary-segment {
      height: 100%;
    }
  </style>
</head>
<body>
  <h1>Rapport de Test Cucumber - Résumé</h1>
`;

// Pour chaque fichier de rapport
reportFiles.forEach(file => {
  try {
    const browser = file.match(/cucumber_report_(.+)\.html/)[1];
    const htmlContent = fs.readFileSync(file, 'utf8');
    
    // Utilise cheerio pour analyser le HTML
    const $ = cheerio.load(htmlContent);
    
    combinedStats += `
      <div class="browser-section">
        <h2 class="browser-title">Statistiques pour ${browser}</h2>
        <div class="stats-container">
    `;
    
    // Extraire manuellement les statistiques principales
    let allScenariosCount = 0;
    let passedScenariosCount = 0;
    let failedScenariosCount = 0;
    let skippedScenariosCount = 0;
    
    // Essayer de trouver les compteurs à partir des div.count-wrapper
    $('div[class^="count-wrapper"]').each((i, el) => {
      const title = $(el).find('.stat-title').text().trim();
      const count = parseInt($(el).find('.count').text().trim()) || 0;
      
      if (title.includes('All Scenarios')) {
        allScenariosCount = count;
      } else if (title.includes('Passed Scenarios')) {
        passedScenariosCount = count;
      } else if (title.includes('Failed Scenarios')) {
        failedScenariosCount = count;
      } else if (title.includes('Skipped Scenarios')) {
        skippedScenariosCount = count;
      }
    });
    
    // Si on n'a pas trouvé les compteurs, essayer une autre approche
    if (allScenariosCount === 0) {
      // Les données pourraient être dans un format différent, essayons de trouver des éléments avec des textes spécifiques
      $('*:contains("All Scenarios")').each((i, el) => {
        // Vérifier si cet élément ou le suivant contient un nombre
        const numberText = $(el).next().text().trim() || $(el).parent().find('*').last().text().trim();
        const number = parseInt(numberText);
        if (!isNaN(number)) {
          allScenariosCount = number;
        }
      });
      
      $('*:contains("Passed Scenarios")').each((i, el) => {
        const numberText = $(el).next().text().trim() || $(el).parent().find('*').last().text().trim();
        const number = parseInt(numberText);
        if (!isNaN(number)) {
          passedScenariosCount = number;
        }
      });
      
      $('*:contains("Failed Scenarios")').each((i, el) => {
        const numberText = $(el).next().text().trim() || $(el).parent().find('*').last().text().trim();
        const number = parseInt(numberText);
        if (!isNaN(number)) {
          failedScenariosCount = number;
        }
      });
    }
    
    // Ajouter les statistiques avec notre propre mise en forme
    combinedStats += `
      <div class="count-wrapper">
        <div class="stat-title">All Scenarios</div>
        <div class="count">${allScenariosCount}</div>
      </div>
      
      <div class="count-wrapper">
        <div class="stat-title">Passed Scenarios</div>
        <div class="count status-passed">${passedScenariosCount}</div>
      </div>
      
      <div class="count-wrapper">
        <div class="stat-title">Failed Scenarios</div>
        <div class="count status-failed">${failedScenariosCount}</div>
      </div>
    `;
    
    if (skippedScenariosCount > 0) {
      combinedStats += `
        <div class="count-wrapper">
          <div class="stat-title">Skipped Scenarios</div>
          <div class="count status-skipped">${skippedScenariosCount}</div>
        </div>
      `;
    }
    
    combinedStats += `</div>`;  // Fermeture de stats-container
    
    // Ajouter une représentation visuelle des résultats
    const passedPercentage = allScenariosCount > 0 ? (passedScenariosCount / allScenariosCount * 100) : 0;
    const failedPercentage = allScenariosCount > 0 ? (failedScenariosCount / allScenariosCount * 100) : 0;
    const skippedPercentage = allScenariosCount > 0 ? (skippedScenariosCount / allScenariosCount * 100) : 0;
    
    combinedStats += `
      <div style="padding: 0 20px 20px 20px;">
        <h3>Résumé des tests</h3>
        <div class="summary-bar">
          <div class="summary-segment status-passed" style="width: ${passedPercentage}%;" title="${passedScenariosCount} Passed (${passedPercentage.toFixed(1)}%)"></div>
          <div class="summary-segment status-failed" style="width: ${failedPercentage}%;" title="${failedScenariosCount} Failed (${failedPercentage.toFixed(1)}%)"></div>
          <div class="summary-segment status-skipped" style="width: ${skippedPercentage}%;" title="${skippedScenariosCount} Skipped (${skippedPercentage.toFixed(1)}%)"></div>
        </div>
        <div style="display: flex; gap: 20px; margin-top: 10px;">
          <div><span style="display: inline-block; width: 12px; height: 12px; background-color: #27ae60; margin-right: 5px;"></span> Passés: ${passedScenariosCount} (${passedPercentage.toFixed(1)}%)</div>
          <div><span style="display: inline-block; width: 12px; height: 12px; background-color: #e74c3c; margin-right: 5px;"></span> Échoués: ${failedScenariosCount} (${failedPercentage.toFixed(1)}%)</div>
          <div><span style="display: inline-block; width: 12px; height: 12px; background-color: #f39c12; margin-right: 5px;"></span> Ignorés: ${skippedScenariosCount} (${skippedPercentage.toFixed(1)}%)</div>
        </div>
      </div>
    `;
    
    // Extraire les statistiques des features
    const featureStats = $('#stat-feat');
    if (featureStats.length > 0) {
      combinedStats += `
        <div class="feature-stats">
          <h3>Statistiques des Features</h3>
          ${featureStats.html()}
        </div>
      `;
    } else {
      // Si l'élément #stat-feat n'est pas trouvé, essayons de construire notre propre tableau
      const featureRows = $('table tr').filter(function() {
        return $(this).find('td').text().includes('Feature:');
      });
      
      if (featureRows.length > 0) {
        combinedStats += `
          <div class="feature-stats">
            <h3>Statistiques des Features</h3>
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Statut</th>
                  <th>Durée</th>
                </tr>
              </thead>
              <tbody>
        `;
        
        featureRows.each((i, row) => {
          const cells = $(row).find('td');
          const featureName = cells.eq(0).text().trim();
          const status = cells.eq(1).text().trim();
          const duration = cells.eq(2).text().trim();
          
          combinedStats += `
            <tr>
              <td>${featureName}</td>
              <td class="${status.toLowerCase()}">${status}</td>
              <td>${duration}</td>
            </tr>
          `;
        });
        
        combinedStats += `
              </tbody>
            </table>
          </div>
        `;
      }
    }
    
    // Extraire les statistiques des scénarios
    const scenarioStats = $('#stat-scen');
    if (scenarioStats.length > 0) {
      combinedStats += `
        <div class="scenario-stats">
          <h3>Statistiques des Scénarios</h3>
          ${scenarioStats.html()}
        </div>
      `;
    } else {
      // Si l'élément #stat-scen n'est pas trouvé, essayons de construire notre propre tableau
      const scenarioRows = $('table tr').filter(function() {
        return $(this).find('td').text().includes('Scenario:');
      });
      
      if (scenarioRows.length > 0) {
        combinedStats += `
          <div class="scenario-stats">
            <h3>Statistiques des Scénarios</h3>
            <table>
              <thead>
                <tr>
                  <th>Scénario</th>
                  <th>Statut</th>
                  <th>Durée</th>
                </tr>
              </thead>
              <tbody>
        `;
        
        scenarioRows.each((i, row) => {
          const cells = $(row).find('td');
          const scenarioName = cells.eq(0).text().trim();
          const status = cells.eq(1).text().trim();
          const duration = cells.eq(2).text().trim();
          
          combinedStats += `
            <tr>
              <td>${scenarioName}</td>
              <td class="${status.toLowerCase()}">${status}</td>
              <td>${duration}</td>
            </tr>
          `;
        });
        
        combinedStats += `
              </tbody>
            </table>
          </div>
        `;
      }
    }
    
    combinedStats += `
      </div>  <!-- Fermeture de browser-section -->
    `;
    
  } catch (error) {
    console.error(`Erreur avec le fichier ${file}: ${error}`);
  }
});

// Finaliser le document HTML
combinedStats += `
  </body>
</html>
`;

// Écrit les statistiques dans un fichier
fs.writeFileSync('./reports/stats-summary.html', combinedStats || '<p>Aucune statistique trouvée</p>');

// Pour GitHub Actions
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `stats<<STATSEOF\n${combinedStats || '<p>Aucune statistique trouvée</p>'}\nSTATSEOF\n`);
}

console.log('Rapport généré avec succès : ./reports/stats-summary.html');