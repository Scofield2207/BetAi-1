import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from './chart.jsx';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function ProfitChart({ simulationData }) {
  if (!simulationData || !simulationData.rounds) {
    return (
      <div className="chart-container">
        <p className="no-data">Aucune donnée de simulation disponible</p>
      </div>
    );
  }

  const rounds = simulationData.rounds;
  const labels = rounds.map((_, index) => `Tour ${index + 1}`);
  
  const profitData = rounds.map(round => round.total_profit);
  const betData = rounds.map(round => round.bet);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Profit Cumulé (€)',
        data: profitData,
        borderColor: profitData[profitData.length - 1] >= 0 ? '#10b981' : '#ef4444',
        backgroundColor: profitData[profitData.length - 1] >= 0 
          ? 'rgba(16, 185, 129, 0.1)' 
          : 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: profitData.map(profit => 
          profit >= 0 ? '#10b981' : '#ef4444'
        ),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Mise Actuelle (€)',
        data: betData,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderDash: [5, 5],
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#f8fafc',
          font: {
            size: 12,
            weight: '600'
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: 'Évolution des Gains et Mises',
        color: '#f8fafc',
        font: {
          size: 16,
          weight: '700'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#475569',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(0)} FCFA`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Tours',
          color: '#cbd5e1',
          font: {
            size: 12,
            weight: '600'
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#cbd5e1',
          maxTicksLimit: 10
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Montant (€)',
          color: '#cbd5e1',
          font: {
            size: 12,
            weight: '600'
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        },
                 ticks: {
           color: '#cbd5e1',
           callback: function(value) {
             return value.toFixed(0) + ' FCFA';
           }
         }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      point: {
        hoverBackgroundColor: '#ffffff',
        hoverBorderColor: '#6366f1',
        hoverBorderWidth: 3
      }
    }
  };

  // Calcul des statistiques pour l'affichage
  const finalProfit = profitData[profitData.length - 1];
  const maxProfit = Math.max(...profitData);
  const minProfit = Math.min(...profitData);
  const isProfitable = finalProfit >= 0;

  return (
    <div className="profit-chart">
      <div className="chart-header">
        <h3>Graphique des Gains</h3>
        <div className="chart-stats">
          <div className={`stat-item ${isProfitable ? 'positive' : 'negative'}`}>
            <span className="stat-label">Profit Final:</span>
            <span className="stat-value">{finalProfit.toFixed(0)} FCFA</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Gain Max:</span>
                         <span className="stat-value positive">{maxProfit.toFixed(0)} FCFA</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Perte Max:</span>
                         <span className="stat-value negative">{minProfit.toFixed(0)} FCFA</span>
          </div>
        </div>
      </div>
      
      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>
      
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color positive"></div>
          <span>Profit cumulé</span>
        </div>
        <div className="legend-item">
          <div className="legend-color bet"></div>
          <span>Mise actuelle</span>
        </div>
      </div>
    </div>
  );
}

export default ProfitChart;
