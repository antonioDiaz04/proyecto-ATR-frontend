import { Component } from '@angular/core';

@Component({
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html'
})
export class HeatmapComponent {
 currentView = 'scatter';

  // Datos para el scatter plot (clustering)
  scatterData = {
    datasets: [
      {
        label: 'Cluster 1 (Frecuentes)',
        data: [
          { x: -98.34, y: 21.02 }, { x: -98.33, y: 21.01 }, // Atlapexco
          { x: -98.53, y: 21.13 }, { x: -98.52, y: 21.14 }, // Jaltocan
          { x: -98.41, y: 21.13 }, { x: -98.42, y: 21.14 }  // Huejutla
        ],
        backgroundColor: '#4E79A7',
        borderColor: '#2C3E50',
        pointRadius: 8,
        pointHoverRadius: 10
      },
      {
        label: 'Cluster 2 (Ocasionales)',
        data: [
          { x: -98.35, y: 21.00 }, { x: -98.32, y: 21.03 },
          { x: -98.54, y: 21.12 }, { x: -98.51, y: 21.15 },
          { x: -98.40, y: 21.12 }, { x: -98.43, y: 21.15 }
        ],
        backgroundColor: '#F28E2B',
        borderColor: '#D35400',
        pointRadius: 8,
        pointHoverRadius: 10
      },
      {
        label: 'Cluster 3 (Nuevos)',
        data: [
          { x: -98.345, y: 21.015 }, { x: -98.335, y: 21.025 },
          { x: -98.525, y: 21.135 }, { x: -98.515, y: 21.145 },
          { x: -98.415, y: 21.125 }, { x: -98.425, y: 21.135 }
        ],
        backgroundColor: '#E15759',
        borderColor: '#C0392B',
        pointRadius: 8,
        pointHoverRadius: 10
      }
    ]
  };

  scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        min: -98.6,
        max: -98.3,
        title: {
          display: true,
          text: 'Longitud',
          color: '#2C3E50'
        },
        grid: { color: '#e0e0e0' },
        ticks: { color: '#2C3E50' }
      },
      y: {
        min: 20.9,
        max: 21.2,
        title: {
          display: true,
          text: 'Latitud',
          color: '#2C3E50'
        },
        grid: { color: '#e0e0e0' },
        ticks: { color: '#2C3E50' }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#2C3E50',
          font: {
            weight: 'bold',
            size: 12
          },
          padding: 20,
          boxWidth: 12
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const x = context.raw.x.toFixed(4);
            const y = context.raw.y.toFixed(4);
            return `${label}: (${x}, ${y})`;
          }
        }
      }
    }
  };

  // Datos para el heatmap (bubble chart)
  heatmapData = {
    datasets: [
      {
        label: 'Atlapexco - Frecuentes',
        data: [{ x: -98.34, y: 21.02, r: 25 }],
        backgroundColor: '#4E79A7',
        borderColor: '#2C3E50'
      },
      {
        label: 'Atlapexco - Ocasionales',
        data: [{ x: -98.35, y: 21.00, r: 18 }],
        backgroundColor: '#F28E2B',
        borderColor: '#D35400'
      },
      {
        label: 'Atlapexco - Nuevos',
        data: [{ x: -98.345, y: 21.015, r: 10 }],
        backgroundColor: '#E15759',
        borderColor: '#C0392B'
      },
      {
        label: 'Jaltocan - Frecuentes',
        data: [{ x: -98.53, y: 21.13, r: 20 }],
        backgroundColor: '#76B7B2',
        borderColor: '#16A085'
      },
      {
        label: 'Jaltocan - Ocasionales',
        data: [{ x: -98.54, y: 21.12, r: 15 }],
        backgroundColor: '#59A14F',
        borderColor: '#27AE60'
      },
      {
        label: 'Jaltocan - Nuevos',
        data: [{ x: -98.525, y: 21.135, r: 8 }],
        backgroundColor: '#EDC948',
        borderColor: '#F39C12'
      },
      {
        label: 'Huejutla - Frecuentes',
        data: [{ x: -98.41, y: 21.13, r: 30 }],
        backgroundColor: '#B07AA1',
        borderColor: '#8E44AD'
      },
      {
        label: 'Huejutla - Ocasionales',
        data: [{ x: -98.40, y: 21.12, r: 22 }],
        backgroundColor: '#FF9DA7',
        borderColor: '#E74C3C'
      },
      {
        label: 'Huejutla - Nuevos',
        data: [{ x: -98.415, y: 21.125, r: 12 }],
        backgroundColor: '#9C755F',
        borderColor: '#D35400'
      }
    ]
  };

  heatmapOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        min: -98.6,
        max: -98.3,
        title: {
          display: true,
          text: 'Longitud',
          color: '#2C3E50'
        },
        grid: { color: '#e0e0e0' },
        ticks: { color: '#2C3E50' }
      },
      y: {
        min: 20.9,
        max: 21.2,
        title: {
          display: true,
          text: 'Latitud',
          color: '#2C3E50'
        },
        grid: { color: '#e0e0e0' },
        ticks: { color: '#2C3E50' }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#2C3E50',
          font: {
            weight: 'bold',
            size: 12
          },
          padding: 20,
          boxWidth: 12
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const size = context.raw.r;
            return `${label}: ${size} clientes`;
          }
        }
      }
    }
  };

  // Datos para el gráfico de barras
  categoryData = {
    labels: ['Atlapexco', 'Jaltocan', 'Huejutla'],
    datasets: [
      {
        label: 'Cluster 1 (Frecuentes)',
        data: [120, 80, 150],
        backgroundColor: '#4E79A7',
        borderColor: '#2C3E50'
      },
      {
        label: 'Cluster 2 (Ocasionales)',
        data: [90, 70, 120],
        backgroundColor: '#F28E2B',
        borderColor: '#D35400'
      },
      {
        label: 'Cluster 3 (Nuevos)',
        data: [50, 30, 80],
        backgroundColor: '#E15759',
        borderColor: '#C0392B'
      }
    ]
  };

  categoryOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: '#2C3E50' }
      },
      y: {
        stacked: true,
        grid: { color: '#e0e0e0' },
        ticks: { color: '#2C3E50' },
        title: {
          display: true,
          text: 'Número de Clientes',
          color: '#2C3E50'
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#2C3E50',
          font: { weight: 'bold' }
        }
      }
    }
  };

  // Estadísticas de clusters
  clusterStats = [
    {
      cluster: 1,
      clientes: 350,
      frecuencia: 3.8,
      ticket: 1450,
      municipio: 'Huejutla'
    },
    {
      cluster: 2,
      clientes: 280,
      frecuencia: 1.5,
      ticket: 850,
      municipio: 'Atlapexco'
    },
    {
      cluster: 3,
      clientes: 160,
      frecuencia: 0.5,
      ticket: 650,
      municipio: 'Jaltocan'
    }
  ];

  // Datos de ejemplo de clientes
  sampleCustomers = [
    { id: 1001, municipio: 'Atlapexco', frecuencia: 4, ticket: 1200, cluster: 1 },
    { id: 1002, municipio: 'Atlapexco', frecuencia: 2, ticket: 800, cluster: 2 },
    { id: 1003, municipio: 'Jaltocan', frecuencia: 3, ticket: 1100, cluster: 1 },
    { id: 1004, municipio: 'Jaltocan', frecuencia: 1, ticket: 600, cluster: 3 },
    { id: 1005, municipio: 'Huejutla', frecuencia: 5, ticket: 1500, cluster: 1 },
    { id: 1006, municipio: 'Huejutla', frecuencia: 2, ticket: 900, cluster: 2 },
    { id: 1007, municipio: 'Atlapexco', frecuencia: 1, ticket: 700, cluster: 3 },
    { id: 1008, municipio: 'Jaltocan', frecuencia: 4, ticket: 1300, cluster: 1 },
    { id: 1009, municipio: 'Huejutla', frecuencia: 3, ticket: 1000, cluster: 1 },
    { id: 1010, municipio: 'Huejutla', frecuencia: 1, ticket: 500, cluster: 3 }
  ];

  // Función para obtener colores de cluster
  getClusterColor(cluster: number): string {
    const colors = ['#4E79A7', '#F28E2B', '#E15759'];
    return colors[cluster - 1] || '#999999';
  }

}