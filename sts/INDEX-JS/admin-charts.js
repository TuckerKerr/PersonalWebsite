function fetchExistingUsers(){
        STSDemo.request('../INDEX-PHP/getExistingUsers.php',{
            })
        .then(response => response.text())
        .then(data =>{
            document.getElementById("existingUsers").innerHTML = data;
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }


    function createPieChart(ctx, label, data) {
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Checked', 'Not Checked'],
                datasets: [{
                    label: label,
                    data: data,
                    backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(255, 99, 132, 0.5)'],
                    borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    async function fetchLineGraphData() {
    try {
        const response = await STSDemo.request('../INDEX-PHP/TicketGraph.php'); // Update the path to your PHP script
        const data = await response.json();

        if (!data || !data.labels || !data.datasets) {
            console.error("Invalid data format:", data);
            return;
        }

        const ctx = document.getElementById("weeklyRecapChart").getContext("2d");
        new Chart(ctx, {
            type: "line",
            data: {
                labels: data.labels,
                datasets: data.datasets
            },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Last 7 Days"
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Total Work Done"
                        },
                        beginAtZero: true
                    }
                }
            }
        });

    } catch (error) {
        console.error("Fetch error:", error);
    }
}

fetchLineGraphData();


    async function fetchChartData() {
    try {
        const response = await STSDemo.request('../INDEX-PHP/percentDone.php'); // Replace with actual PHP script path
        const data = await response.json();
        
        console.log("Fetched Data:", data); // Debugging output
        
        if (!data || !data.labels || !data.values) {
            console.error("Invalid data format:", data);
            return;
        }

        // Render the chart
        const ctx = document.getElementById("PrinterCheck").getContext("2d");
        new Chart(ctx, {
            type: "pie",
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: ["rgba(54, 162, 235, 0.6)", "rgba(255, 99, 132, 0.6)"],
                    borderColor: "#fff",
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

    } catch (error) {
        console.error("Fetch error:", error);
    }
}

fetchChartData();

async function fetchRoomData() {
    try {
        const response = await STSDemo.request('../INDEX-PHP/roomChart.php'); // Update with actual path
        const data = await response.json();

        console.log("Fetched Data:", data); // Debugging output

        if (!data || !data.labels || !data.values) {
            console.error("Invalid data format:", data);
            return;
        }

        const ctx = document.getElementById("roomChart").getContext("2d");
        new Chart(ctx, {
            type: "pie",
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 159, 64, 0.6)"],
                    borderColor: "#fff",
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

    } catch (error) {
        console.error("Fetch error:", error);
    }
}

fetchRoomData();
