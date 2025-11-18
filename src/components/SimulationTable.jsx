import React, { useState } from 'react';

function SimulationTable({ simulationData }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  if (!simulationData || !simulationData.rounds) {
    return (
      <div className="simulation-table">
        <p className="no-data">Aucune donnée de simulation disponible</p>
      </div>
    );
  }

  const rounds = simulationData.rounds;
  const totalPages = Math.ceil(rounds.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRounds = rounds.slice(startIndex, endIndex);

  const getResultIcon = (result) => {
    return result === 'WIN' ? '' : '';
  };

  const getResultClass = (result) => {
    return result === 'WIN' ? 'win' : 'loss';
  };

  const formatCurrency = (amount) => {
    return `${amount >= 0 ? '+' : ''}${amount.toFixed(0)} FCFA`;
  };

  return (
    <div className="simulation-table">
      <div className="table-header">
        <h3>Détail des Tours</h3>
        <div className="table-controls">
          <span className="page-info">
            Page {currentPage} sur {totalPages} ({rounds.length} tours)
          </span>
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="btn-page"
            >
              ← Précédent
            </button>
            <span className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`btn-page ${currentPage === page ? 'active' : ''}`}
                >
                  {page}
                </button>
              ))}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="btn-page"
            >
              Suivant →
            </button>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Tour</th>
              <th>Crash</th>
              <th>Mise</th>
              <th>Cible</th>
              <th>Résultat</th>
              <th>Profit Tour</th>
              <th>Profit Total</th>
            </tr>
          </thead>
          <tbody>
            {currentRounds.map((round, index) => (
              <tr key={round.round} className={getResultClass(round.result)}>
                <td className="tour-number">{round.round}</td>
                <td className="crash-value">{round.crash}x</td>
                                 <td className="bet-amount">{round.bet} FCFA</td>
                <td className="target-value">{round.target}x</td>
                <td className="result">
                  <span className={`result-badge ${getResultClass(round.result)}`}>{round.result}</span>
                </td>
                <td className={`profit-amount ${round.profit >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(round.profit)}
                </td>
                <td className={`total-profit ${round.total_profit >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(round.total_profit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-summary">
        <div className="summary-stats">
          <div className="summary-item">
            <span className="summary-label">Tours Gagnés:</span>
            <span className="summary-value win">
              {rounds.filter(r => r.result === 'WIN').length}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Tours Perdus:</span>
            <span className="summary-value loss">
              {rounds.filter(r => r.result === 'LOSS').length}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Taux de Réussite:</span>
            <span className="summary-value">
              {((rounds.filter(r => r.result === 'WIN').length / rounds.length) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Profit Final:</span>
            <span className={`summary-value ${rounds[rounds.length - 1].total_profit >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(rounds[rounds.length - 1].total_profit)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimulationTable;
