// Gráfico de Barra Única ===================================================
const ctxBarraUnica = document.getElementById('grafico-barraunica_facili');
const graficoBarraUnica = new Chart(ctxBarraUnica, {
    type: 'bar',
    data: {
        
        datasets: [
            {
                label: '1ª vez',
                data: [totalBarraUnica1Vez],
                backgroundColor: '#36b6ff',
                stack: 'stack1'
            },
            {
                label: 'Retorno',
                data: [totalBarraUnicaRetorno],
                backgroundColor: '#00ff0d',
                stack: 'stack1'
            }
        ],
        labels: ['d'],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: 0,
        },
        plugins: {
            legend: {
                display: false
            },
            datalabels: {
                color: '#01071d',
                backgroundColor: "white",
                borderRadius: 50,
                anchor: 'center',
                align: 'center',
                font: {
                    weight: 'bold',
                    size: 18
                },
                formatter: value => value
            }
        },
        scales: {
            x: {
                stacked: true,
                ticks: {
                    color: '#ffffff',
                    maxRotation: 0,
                    minRotation: 0,
                    display: false,
                },
                grid:{
                    display: false,
                },
                categoryPercentage: 1.0,
                barPercentage: 0.5,  
            },
            y: {
                stacked: true,
                beginAtZero: true,
                display: false // Oculta a escala do eixo Y
            }
        }
    },
    plugins: [ChartDataLabels]
});



// Gráfico de Barras ===================================================
const ctx2 = document.getElementById('grafico-barras_facili');
const graficoFacilitadores = new Chart(ctx2, {
    type: 'bar',
    data: {
        labels: labelsFacilitadores,
        datasets: [
            {
                label: '1ª vez',
                data: valores1Vez,
                backgroundColor: '#36b6ff',
            },
            {
                label: 'Retorno',
                data: valoresRetorno,
                backgroundColor: '#00ff0d'
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        layout: {
            padding: {
                top: 25 // esse é o espaço entre a legenda e o gráfico de barras
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                display: false,
            },
            x: {
                ticks: {
                    color: '#ffffff',
                    marginBottom: 10,
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            datalabels: {
                color: '#01071d',
                backgroundColor: "white",
                borderRadius: 50,
                anchor: 'end',
                align: 'top',
                offset: 2,
                clip: false,
                font: {
                    weight: 'bold',
                    size: 12
                },
                formatter: value => value
            }
        }
    },
    plugins: [ChartDataLabels]
});

// Gráfico de Pizza ===========================================
const ctxPizza = document.getElementById('grafico-pizza_facili');
const graficoPizza = new Chart(ctxPizza, {
    type: 'pie',
    data: {
        labels: totalPizzaLabels,
        datasets: [{
            label: 'Total',
            data: totalPizzaValores,
            backgroundColor: ['#36b6ff', '#00ff0d']
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        plugins: {
            legend: {
                display: false,
                position: 'top',
                labels: {
                    color: '#ffffff'
                }
            },
            datalabels: {
                color: '#01071d',
                backgroundColor: "white",
                borderRadius: 50,
                formatter: (value, context) => {
                    const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                    const percent = total > 0 ? (value / total) * 100 : 0;
                    return `${percent.toFixed(1)}%`;
                },
                font: {
                    weight: 'bold',
                    size: 18
                }
            }
        }
    },
    plugins: [ChartDataLabels]
});

// Filtro Checkbox Data===========================================
    const chk7 = document.getElementById('chk7dias');
    const chk15 = document.getElementById('chk15dias');
    const dataInicio = document.getElementById('filtro-data_inicio_dash_atf');
    const dataFim = document.getElementById('filtro-data_fim_dash_atf');

    function formatDate(date) {
        const ano = date.getFullYear();
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const dia = String(date.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    }

    function atualizarDatas(dias) {
        const hoje = new Date();
        const inicio = new Date();
        inicio.setDate(hoje.getDate() - dias);
        dataInicio.value = formatDate(inicio);
        dataFim.value = formatDate(hoje);
    }

    chk7.addEventListener('change', function () {
        if (chk7.checked) {
            chk15.checked = false;
            atualizarDatas(7);
        }
    });

    chk15.addEventListener('change', function () {
        if (chk15.checked) {
            chk7.checked = false;
            atualizarDatas(15);
        }
    });

    // 👇 Quando o usuário muda manualmente as datas, desmarcar os checkboxes
    dataInicio.addEventListener('change', () => {
        chk7.checked = false;
        chk15.checked = false;
    });

    dataFim.addEventListener('change', () => {
        chk7.checked = false;
        chk15.checked = false;
    });