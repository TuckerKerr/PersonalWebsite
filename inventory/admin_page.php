<!DOCTYPE html>
<html lang="en">
    <head>
    <title>Inventory Management</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.3/dist/umd/popper.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700&display=swap%27">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="prefetch" href="main.php">
    <link rel="stylesheet" href="style.css">

    <script>
        /*
    document.addEventListener('DOMContentLoaded', function(){

    // Check if the user is logged in
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html'; // Redirect to login page if not logged in
    } else {
        const username = sessionStorage.getItem('userName');
        const admin = sessionStorage.getItem('is_staff');
        
        if (username) {
            const capitalizedUsername = username.charAt(0).toUpperCase() + username.slice(1);
            document.getElementById('usernameDisplay').textContent = capitalizedUsername;
            //const firstLetter = username.charAt(0).toUpperCase();
            //document.getElementById('profileIcon').textContent = firstLetter;
            //console.log(firstLetter);
        }

        // Check if the user is staff and hide/show the button
        const staffButton = document.getElementById('menu'); // Get the button by its ID
        if (staffButton) {
            if (admin === 'true') {
                staffButton.style.display = 'block'; // Show the button if the user is staff
            } else {
                staffButton.style.display = 'none'; // Hide the button if the user is not staff
                window.location.href = 'main.php';
            }
        } else {
            console.log("staffButton element not found");
        }
 

    }
    });
*/
    document.addEventListener('DOMContentLoaded', function(){
        RetrievedTableLoader();
        OpenTableLoader();
        getChart('Downcity');
        totalCount('Downcity');
    });


    let idleTime = 0;
    let idleLimit = 2 * 60 * 1000;
    let sessionTimeout; 

    const resetIdleTimer = () =>{
        idleTimer = 0;
    };
/*
    const trackIdleTime = () => {
        idleTime += 1000;
        if(idleTime >= idleLimit){
            logout();
        }
    };
*/
    document.onmousemove = resetIdleTimer;
    document.onkeypress = resetIdleTimer;
    document.onclick = resetIdleTimer;
    document.onscroll = resetIdleTimer;

    setInterval(trackIdleTime, 1000);

        function logout() {
        sessionStorage.removeItem('isLoggedIn'); // Clear login status

        sessionStorage.removeItem('username'); // Clear username
        sessionStorage.removeItem('is_staff'); // Clear username
        window.location.href = 'index.html'; // Redirect to login page
        }
    </script>
</head>

<body>
<!-- Top Navigation Bar -->
<div class="topnav">
        <div class="profile" id="profile">
            <div class="profile-icon" id="profileIcon"><i class="fa-solid fa-user"></i></div>
            <div class="dropdown" id="dropdown">
                <div class="username">
                    <h2 id="usernameDisplay"></h2>
                </div>
                <a href="../schedule/INDEX-HTML/schedule_integration.html" class="dropdown-item">Schedule <i class="fa-solid fa-calendar-days"></i></a>
                <a href="../sts/INDEX-HTML/main.html" class="dropdown-item">STS <i class="fa-solid fa-building"></i></a>
                <a href="#" onclick="logout()" class="dropdown-item">Sign Out <i class="fa-solid fa-right-from-bracket"></i></a>
            </div>
        </div>
        <div class="menu" id="menu">
            <div class="menu-icon" id="menuIcon"><i class="fa-solid fa-folder-open"></i></div>
                <div class="menudropdown" id="menudropdown">
                    <div class="username">
                        <h2>Menu</h2>
                    </div>
                    <a href="main.php" class="dropdown-item">Main Page<i class="fa-solid fa-bars"></i></a>
                    <a onclick="showModelAdd()" class="dropdown-item">Add Model <i class="fa-solid fa-gear"></i></a>
                    <div class="theme-toggle">
                        <span>DC</span>
                        <label class="toggle-switch">
                            <input type="checkbox" id="campusToggle" onchange="checkFunction(this)">
                            <span class="toggle-slider"></span>
                        </label>
                        <span>HS</span>
                    </div>
                    <div class="theme-toggle">
                        <span>Gray</span>
                        <label class="toggle-switch">
                            <input type="checkbox" id="themeToggle" onchange="loadTheme(this)">
                            <span class="toggle-slider"></span>
                        </label>
                        <span>Blue</span>
                    </div>
                </div>
        </div>
    </div>

<div class="main-content">
    <div class="title">Inventory Management</div>
<!-- These are all of the boxes for the inventory charts to populate to
    If you need to add more, simply create or add a new container
-->
<div class="box-container">
    <div class="admin-left-column">
        <div class="box top-box">
            <div class="box-header">
                <h2>Bar chart</h2>
            </div>
            <div class="box-content" style="height:90%;">
                <div class="tablewrapper-bar">
                    <canvas id="generalBar" style="height:800px;"></canvas>
              </div>
            </div>
        </div>
    </div>

    <div class="admin-middle-left-column">
        <div class="box top-box">
            <div class="box-header">
                <h2>Monitors</h2>
            </div>
            <div class="box-content">
                <div class="tablewrapper-chart">
                    <canvas id="monitorsPie" width="450" height="300"></canvas>
            </div>
        </div>
    </div>

        <div class="box bottom-box">
            <div class="box-header">
                <h2>Laptops</h2>
            </div>
            <div class="box-content">
                <div class="tablewrapper-chart">
                    <canvas id="laptopsPie" width="450" height="300"></canvas>
            </div>
        </div>
        </div>
    </div>

    <div class="admin-middle-right-column">
        <div class="box top-box">
            <div class="box-header">
                <h2>Desktops</h2>
            </div>
            <div class="box-content">
                <div class="tablewrapper-chart">
                    <canvas id="desktopsPie" width="450" height="300"></canvas>
            </div>
        </div>
        </div>

        <div class="box bottom-box">
            <div class="box-header">
                <h2>Printers</h2>
            </div>
            <div class="box-content">
                <div class="tablewrapper-chart">
                    <canvas id="printersPie" width="450" height="300"></canvas>
            </div>
        </div>
        </div>
    </div>

    <div class="admin-right-column">
        <div class="box top-box">
            <div class="box-header">
                <h2>Total Quantity</h2>
                <button id="export" class="action-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"></path>
                </svg>Export to CSV</button>
            </div>
            <div class="box-content">
                <div class="tablewrapper-toner" style="height: 700px;">
                    <table id="allTable" border = "1">
                        <thead id="eqHead">
                            <tr>
                                <th>
                                    <label class="sortButtons">
                                    Hardware Type
                                    </label>
                                </th>
                                <th>
                                    <label class="sortButtons">
                                    Quantity
                                    </label>
                                </th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

</div>

<div class="bottom-box-container">
    <div class="tonerBottom-left">
        <div class="table-header">
                <h2>Last Used</h2>
            </div>
            <div class="box-content">
            <div class="tablewrapper-admin">
                <table id="lastTable" border = "1">
                    <thead id="eqHead">
                        <tr>
                            <th>
                                <label class="sortButtons">
                                   Quantity
                                </label>
                            </th>
                            <th>
                                <label class="sortButtons">
                                   Hardware Type
                                </label>
                            </th>
                            <th>
                                <label class="sortButtons">
                                   Model Type
                                </label>
                            </th>  
                            <th>
                                <label class="sortButtons">
                                   Transfer Date
                                </label>
                            </th>    
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="tonerBottom-right">
        <div class="table-header">
                <h2>Open Equipment Counts</h2>
            </div>
            <div class="box-content">
                <div class="tablewrapper-admin">
                <table id="openTable" border = "1">
                    <thead id="eqHead">
                        <tr>
                            <th>
                                <label class="sortButtons">
                                   Quantity
                                </label>
                            </th>
                            <th>
                                <label class="sortButtons">
                                  Model Type
                                </label>
                            </th>
                            <th>
                                <label class="sortButtons">
                                    Hardware Type
                                </label>
                            </th>   
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    </div>
<!-- This is the end of all of the boxes that you see when you load the page-->

<!-- Here is the popup to add models from the admin page if they are not on the main page but still has to do admin tasks-->
    <div id="ModelAdd" class="popup">
        <div class="popup-content-input">
            <button class="close-popup" onclick="closeModelAdd()"><i class="fa-solid fa-xmark"></i></button>
            <h2>Add/Remove Model</h2>
                <form id="ModelForm" style="display: flex; flex-direction: column;">

                <input type="text" id="Model-Tag" class="form-inputs" name="model-tag" placeholder="Model" maxlength="255" required>

                <select id="Type-of-Delivery" name="type-of-delivery" class="form-inputs" required>
                <option value="" disabled selected>Select the Type of Equipment</option>
                <option value="Laptops">Laptop</option>
                <option value="Desktops">Desktops</option>
                <option value="Monitors">Monitors</option>
                <option value="Macs">Macs</option>
                <option value="Printers">Printers</option>
                <option value="Peripherals">Consumable</option>
                <option value="AV">Audio/Visual</option>
                </select>  

                <select id="Campus" name="campus" class="form-inputs" required>
                    <option value="" disabled selected>Enter Campus</option>
                    <option value="Downcity">Downcity</option>
                    <option value="Harborside">Harborside</option>
                </select>
                
                <button type="submit"name="action" value="add"
                class="action-btn" style="margin-left:0px; margin-bottom: 10px;">Add</button>

                <button type="submit" name="action" value="remove"
                class="action-btn" style="margin-left:0px; margin-top: 10px;">Remove</button>
                </form>
        </div>
     </div>

</div>

<!-- End of the popup code-->
    
<footer>
    <p>© Johnson & Wales University 2025</p>
 </footer>
    <div class="decorative-line"></div>
    <div class = "search-header"></div>

    <script>
    //Dropdown Code for profile icon
    const profileIcon = document.getElementById("profileIcon");
    const dropdown = document.getElementById("dropdown");

  profileIcon.addEventListener("click", function (e) {
    e.stopPropagation(); // Prevents the document click from immediately hiding the dropdown

    dropdown.classList.toggle("show");
  });

  // Close dropdown when clicking outside of it
  document.addEventListener("click", function (e) {
    if (!document.getElementById("profile").contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });

    //Dropdown Code for menu icon and items within it
    const menuIcon = document.getElementById("menuIcon");
    const menudropdown = document.getElementById("menudropdown");
    const themeToggle = document.getElementById('themeToggle');

    //Export for the csv file
    const exportButton = document.getElementById('export');

  menuIcon.addEventListener("click", function (e) {
    e.stopPropagation(); // Prevents the document click from immediately hiding the dropdown

    menudropdown.classList.toggle("show");
  });

    // Close dropdown when clicking outside of it
    document.addEventListener("click", function (e) {
    if (!document.getElementById("profile").contains(e.target)) {
        menudropdown.classList.remove("show");
    }
    });

    //End of Dropdown Code

    //These allow for the charts to be created and deletes when the page is switched from downcity to harborside 
    let barChart;
    let lapPie;
    let monPie;
    let deskPie;
    let priPie;

    //code for bar chart data
function getChart(value){
    const campus = value;
    console.log(campus);
    fetch(`query/chartData.php?campus=${campus}`)
        .then(response => response.json())
        .then(data => {
            //get data in an array based on the values passed along with them
            const allLabels = data.labels;
            const allValues = data.values;
            const allTypes = data.type;

            const monitorsLabels = [];
            const monitorsValues = [];

            const laptopsLabels = [];
            const laptopsValues = [];

            const desktopsLabels = [];
            const desktopsValues = [];

            const printersLabels = [];
            const printersValues = [];

            const backgroundColors = ['#8B9556 ', '#6B7F5C ', '#9CAF88 ', 
            '#4A5240 ', '#9CAF88', '#6B7F5C', 
            '#333', '#424033ff', '#4b4e41ff'];

            const bar = document.getElementById('generalBar').getContext('2d');
            barChart = new Chart(bar, {
                type: 'bar',
                data: {
                    labels: allLabels,
                    datasets: [{
                        label: '',
                        backgroundColor: backgroundColors,
                        hoverBackgroundColor: 'black',
                        data: allValues,
                    }]
                },
            options: {
                plugins: {
                    legend: {
                        display: false
                    }
                },
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false
            }
            })
            

            allLabels.forEach((label1, index) => {
                if (allTypes[index] === 'Monitors') {
                    monitorsLabels.push(allLabels[index]);
                    monitorsValues.push(allValues[index]);
                }
            });

            monPie = new Chart(document.getElementById('monitorsPie'),{
                type: 'pie',
                data: {
                    labels: monitorsLabels,
                    datasets: [{
                        label1: 'Monitors',
                        data: monitorsValues,
                        backgroundColor: backgroundColors
                    }]
                },
                options:{
                    plugins:{ 
                        tooltip: {
                            callbacks: {
                                label: function(context){
                                    //Code for the percentages of each model type in pie charts
                                    const dataset= context.dataset;
                                    const total = dataset.data.reduce((sum, val) => sum + val, 0);
                                    const value = dataset.data[context.dataIndex];
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${context.label}: ${percentage}%`;
                                }
                            }
                        },
                    legend: {
                        position: 'right'
                    }
                }
            }
            })

            allLabels.forEach((label1, index) => {
                if (allTypes[index] === 'Laptops') {
                    laptopsLabels.push(allLabels[index]);
                    laptopsValues.push(allValues[index]);
                }
            });

            lapPie = new Chart(document.getElementById('laptopsPie'),{
                type: 'pie',
                data: {
                    labels: laptopsLabels,
                    datasets: [{
                        label1: 'Laptops',
                        data: laptopsValues,
                        backgroundColor: backgroundColors
                    }]
                },
                 options:{
                    plugins:{ 
                        tooltip: {
                            callbacks: {
                                label: function(context){
                                    const dataset= context.dataset;
                                    const total = dataset.data.reduce((sum, val) => sum + val, 0);
                                    const value = dataset.data[context.dataIndex];
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${context.label}: ${percentage}%`;
                                }
                            }
                         },
                    legend: {
                        position: 'right'
                    }
                }
            }
            })

            allLabels.forEach((label1, index) => {
                if (allTypes[index] === 'Desktops') {
                    desktopsLabels.push(allLabels[index]);
                    desktopsValues.push(allValues[index]);
                }
            });

            deskPie = new Chart(document.getElementById('desktopsPie'),{
                type: 'pie',
                data: {
                    labels: desktopsLabels,
                    datasets: [{
                        label1: 'Desktops',
                        data: desktopsValues,
                        backgroundColor: backgroundColors
                    }]
                },
                 options:{
                    plugins:{ 
                        tooltip: {
                            callbacks: {
                                label: function(context){
                                    const dataset= context.dataset;
                                    const total = dataset.data.reduce((sum, val) => sum + val, 0);
                                    const value = dataset.data[context.dataIndex];
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${context.label}: ${percentage}%`;
                                }
                            }
                        },
                    legend: {
                        position: 'right'
                    }
                }
            }
            })

            allLabels.forEach((label1, index) => {
                if (allTypes[index] === 'Printers') {
                    printersLabels.push(allLabels[index]);
                    printersValues.push(allValues[index]);
                }
            });

            priPie = new Chart(document.getElementById('printersPie'),{
                type: 'pie',
                data: {
                    labels: printersLabels,
                    datasets: [{
                        label1: 'Printers',
                        data: printersValues,
                        backgroundColor: backgroundColors
                    }]
                },
                 options:{
                    plugins:{ 
                        tooltip: {
                            callbacks: {
                                label: function(context){
                                    const dataset= context.dataset;
                                    const total = dataset.data.reduce((sum, val) => sum + val, 0);
                                    const value = dataset.data[context.dataIndex];
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${context.label}: ${percentage}%`;
                                }
                            }
                         },
                    legend: {
                        position: 'right'
                    }
                }
            }
            })
        })

}
    //Searches the campus for all of their data and puts it in the total quantity table
    function totalCount(event){
        const campus = event;
        fetch(`query/chartData.php?campus=${campus}`)
            .then(response=> response.json())
            .then(result=> {
                const allLabels = result.labels;
                const allValues = result.values;
                const tbody = document.querySelector(`#allTable tbody`);
                tbody.innerHTML=''
                allLabels.forEach((label, index)=> {
                    const value = allValues[index];

                    const tr=document.createElement('tr');
                    tr.innerHTML = 
                        `<td class="tonerRows">${label}</td>
                        <td class="tonerRows">${value}</td>`;
                    
                    tbody.appendChild(tr);
                    });
            })
                .catch(error => console.error('Error fetching data:', error));
            }

    //Searches and retrieves the data for the table that holds the last 10 orders taken out of the system
    function RetrievedTableLoader(){
        fetch(`query/expand.php?view=lastRetrieved`)
            .then(response=> response.json())
            .then(result=> {
                if(result.success && Array.isArray(result.data)){
                const tbody = document.querySelector(`#lastTable tbody`);
                tbody.innerHTML=''
                result.data.forEach(row=> {
                    const tr=document.createElement('tr');
                    tr.innerHTML = Object.values(row).map(val => {
                        return `<td class="tonerRows">${val}</td>`;
                    }).join('');
                    tbody.appendChild(tr);
                    });
                }
            else{
                    console.error('Unexpected Response Format: ', result);
                }
            })
                .catch(error => console.error('Error fetching data:', error));
            }

    //This will fetch and show the quantity of all of the open items in the department
    function OpenTableLoader(){
        fetch(`query/openCount.php`)
            .then(response=> response.json())
            .then(result=> {
                if(result.success && Array.isArray(result.data)){
                const tbody = document.querySelector(`#openTable tbody`);
                tbody.innerHTML = '';

                result.data.forEach(row=> {
                    if(row.Quantity > 0){
                        const tr=document.createElement('tr');
                        tr.innerHTML = Object.values(row).map(val => {
                            return `<td class="tonerRows">${val}</td>`;
                        }).join('');
                        tbody.appendChild(tr);
                    }
                });
            }
            else{
                    console.error('Unexpected Response Format: ', result);
                }
            })
                .catch(error => console.error('Error fetching data:', error));
            }

        //creating an instance for the form to open the form and close it
        const modelAR = document.getElementById('ModelAdd');
        const modelForm = document.getElementById('ModelForm');

        function showModelAdd(){
            modelAR.style.display = "flex";
            document.body.classList.add('modal-open');
        }

        // Close the popup
        function closeModelAdd(){
            modelAR.style.display = "none";
            document.body.classList.remove('modal-open');
            modelForm.reset();
        }

        //if the form is submitted add or remove it the model then reset all the charts and data
        modelForm.addEventListener('submit',function(event){
        event.preventDefault();

        const formData = new FormData(modelForm);

        const actionValue = event.submitter.value;
        formData.set('action', actionValue);

        fetch('query/ModelAR.php', {
                method: 'POST',
                body: formData
            })
                .then(response => response.text())
                .then(data => {
                    closeModelAdd();
                    totalCount();
                    checkFunction();
                    modelForm.reset();
                })
                .catch(error => {
                    console.error('Error:', error);
                });
    });

    //gets called when the campus is changed to destroy the other campus' charts to create the current campus'
    function checkFunction(checkbox){
        const isChecked = checkbox.checked ? 'Harborside' : 'Downcity';
        console.log(isChecked);
        barChart.destroy();
        priPie.destroy();
        lapPie.destroy();
        monPie.destroy();
        deskPie.destroy();

        getChart(isChecked);
        totalCount(isChecked);
    }

    //code for the export csv file
    document.getElementById('export').addEventListener('click', () => {
        const table = document.getElementById('allTable');
        let csv = [];

        // Loop through rows
        for (let row of table.rows) {
            let rowData = [];
            for (let cell of row.cells) {
            // Escape double quotes and commas
            let text = cell.textContent.replace(/"/g, '""');
            rowData.push(`"${text}"`);
            }
            csv.push(rowData.join(','));
        }

        // Create and trigger CSV download
        const csvBlob = new Blob([csv.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(csvBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Inventory.csv';
        link.click();
        URL.revokeObjectURL(url); // clean up
        });

        function loadTheme(checkbox) {
            const currentTheme = checkbox.checked ? 'light' : 'dark';
            if (currentTheme === 'light') {
                document.body.classList.add('dark-theme');
                themeToggle.checked = true;
                console.log(currentTheme);
            } else {
                document.body.classList.remove('dark-theme');
                themeToggle.checked = false;
                console.log(currentTheme);
            }
        }
        </script>
    </body>
</html>
