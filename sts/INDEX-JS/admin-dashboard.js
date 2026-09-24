const feedContainer = document.getElementById('requestFeedCarousel');
        let currentIndex = 0;
        let requests = [];
        const announcementForms = document.getElementById("announcementForm");
        const userPopup = document.getElementById('userPopup');
        const userForms = document.getElementById("userForm");
        const semesterForm = document.getElementById("semesterForm");
        const semUpdateButton = document.getElementById('semesterUpdate');
        const binForm = document.getElementById("binForm");
        const binUpdateButton = document.getElementById('binUpdate');

        

        // Escape untrusted text before inserting it into innerHTML
        function escapeHtml(value) {
          const div = document.createElement('div');
          div.textContent = value ?? '';
          return div.innerHTML;
        }

        //Create the field work submission card
        function createCardHTML(request) {
          return `
            <div class="carousel-card show" id="card-${request.id}">
              <h3>Ticket: ${escapeHtml(request.ticket)}</h3>
              <p><strong>Submitted by:</strong> ${escapeHtml(request.name)}</p>
              <p><strong>Work Description:</strong> ${escapeHtml(request.description)}</p>
              <p><strong>Difficulty:</strong> <span class="difficulty-rating">${'★'.repeat(request.difficulty)}</span></p>
              <p><strong>Time:</strong> ${escapeHtml(request.time)}</p>
              <div class="action-buttons" style="margin-top: 10px;">
                <button class="btn approve-btn" onclick="updateStatus(${request.id}, 'approved')">Approve</button>
                <button class="btn deny-btn" onclick="updateStatus(${request.id}, 'denied')">Deny</button>
              </div>
            </div>
          `;
        }
        
        function showCurrentCard() {
            if (!feedContainer) return;
          if (requests.length === 0 || currentIndex >= requests.length) {
            feedContainer.innerHTML = '<div class="carousel-card show">No pending requests</div>';
            return;
          }
          feedContainer.innerHTML = createCardHTML(requests[currentIndex]);
        }
      
        function updateStatus(id, status) {
          const card = document.getElementById(`card-${id}`);
          const approveBtn = card.querySelector('.approve-btn');
          const denyBtn = card.querySelector('.deny-btn');
      
          // Disable buttons
          approveBtn.disabled = true;
          denyBtn.disabled = true;
      
          STSDemo.request('../INDEX-PHP/update_status.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'X-CSRF-Token': STSDemo.session.getItem('csrfToken') || ''
            },
            body: `id=${id}&status=${status}`
          })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              card.classList.remove('show');
              setTimeout(() => {
                currentIndex++;
                showCurrentCard();
              }, 600); // Match transition duration
            } else {
              alert('Failed to update status');
              approveBtn.disabled = false;
              denyBtn.disabled = false;
            }
          })
          .catch(() => {
            alert('Request failed');
            approveBtn.disabled = false;
            denyBtn.disabled = false;
          });
        }
      
        STSDemo.request('../INDEX-PHP/admin.php')
          .then(res => res.json())
          .then(data => {
            requests = data;
            showCurrentCard();
          });

        //Create the announcements load into the announcement box
        function AnnouncementLoader(){
            STSDemo.request(`../INDEX-PHP/AcView.php?view=announcement`)
                .then(response=> response.json())
                .then(result=> {
                    if(result.success && Array.isArray(result.data)){
                    const container = document.getElementById('chat-container');

                    result.data.forEach(msg => {
                        const bubble = document.createElement('div');
                        bubble.className = 'bubble.user';
                        bubble.dataset.text = msg.text;
                        bubble.dataset.timeCreated = msg.time_created;

                        bubble.innerHTML = `
                            <div class="subject">${escapeHtml(msg.subject)}<span class="time" style="justify-content: flex-end;">${escapeHtml(msg.time_created)} &nbsp;&nbsp;&nbsp; <a style="cursor: pointer;" type="submit" data-action="delete">
                            <i class="fa-solid fa-square-minus"></i></a></span></div>
                            <div class="message">${escapeHtml(msg.text)}</div>

                            <div class="time"><span style="display: flex; justify-content: flex-start;" id="likes${msg.id}"> <a data-role="thumbsUp" style="cursor: pointer;" data-action="like"><i class="fa-solid fa-thumbs-up"></i></a>&nbsp;&nbsp;&nbsp; Liked:  ${escapeHtml(msg.likes)}</span></div>

                            <div class="time"><span style="display: flex; justify-content: flex-start;" id="dislikes${msg.id}"> <a data-role="thumbsDown" style="cursor: pointer;" data-action="dislike"><i class="fa-solid fa-thumbs-down"></i></a>&nbsp;&nbsp;&nbsp;Disliked:  ${escapeHtml(msg.dislikes)}</span></div>
                            <br>
                        `;

                        bubble.querySelector('[data-action="delete"]').addEventListener('click', () => {
                            deleteAnnouncement(msg.text, msg.time_created);
                        });
                        bubble.querySelector('[data-action="like"]').addEventListener('click', function(){
                            messageInteraction('thumbsUp', msg.text);
                        });
                        bubble.querySelector('[data-action="dislike"]').addEventListener('click', function(){
                            messageInteraction('thumbsDown', msg.text);
                        });

                        container.appendChild(bubble);
                    });
                }
            })
                .catch(error => {
                console.error('Error loading announcements:', error);
            });
        }
        
        function messageInteraction(action, text){
            const formData = new FormData();
            formData.append('action', action);
            formData.append('text', text);

           STSDemo.request('../INDEX-PHP/AcInteraction.php', {
                    method: 'POST',
                    headers: { 'X-CSRF-Token': STSDemo.session.getItem('csrfToken') || '' },
                    body: formData
                })
                    .then(response => response.text())
                    .then(data => {
                        document.getElementById('chat-container').innerHTML='';
                        AnnouncementLoader();
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
        }


        function deleteAnnouncement(text, time){
            const formData = new FormData();
            formData.append('time', time);
            formData.append('text', text);

            STSDemo.request('../INDEX-PHP/AcDelete.php', {
                method: 'POST',
                headers: { 'X-CSRF-Token': STSDemo.session.getItem('csrfToken') || '' },
                body: formData
            })
                .then(response => response.text())
                .then(data => {
                    document.getElementById('chat-container').innerHTML='';
                    AnnouncementLoader();
                    announcementForms.reset();
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
            
        //submit an announcement
        announcementForms.addEventListener('submit',function(event){
            event.preventDefault();

            const formData = new FormData(announcementForms);
            console.log(formData);

            STSDemo.request('../INDEX-PHP/AcSubmit.php', {
                    method: 'POST',
                    headers: { 'X-CSRF-Token': STSDemo.session.getItem('csrfToken') || '' },
                    body: formData
                })
                    .then(response => response.text())
                    .then(data => {
                        document.getElementById('chat-container').innerHTML='';
                        AnnouncementLoader();
                        announcementForms.reset();
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    }); 
            });

        
        userForms.addEventListener('submit',function(event){
            event.preventDefault();

            const formData = new FormData(userForms);
            formData.set('activeRadio', document.getElementById('activeUser').checked ? '1' : '0');
            formData.set('accountRadio', document.getElementById('staffAccount').checked ? 'Staff' : 'Student');
            const Dataform = Object.fromEntries(formData.entries());
            console.log(Dataform);
            
            STSDemo.request('../INDEX-PHP/usersForm.php', {
                    method: 'POST',
                    headers: { 'X-CSRF-Token': STSDemo.session.getItem('csrfToken') || '' },
                    body: formData
                })
                    .then(response => response.text())
                    .then(data => {
                        //clear all data from the form
                        closeUser();
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    }); 
            });

        document.getElementById("existingUsers").addEventListener('change', function(event) {
            document.querySelectorAll('input[name="campusRadio"]').forEach(radio => radio.checked = false);
            document.getElementById("activeUser").checked = false;
            document.getElementById("staffAccount").checked = false;

            const user = document.getElementById("existingUsers");
            const userIndex = user.options[user.selectedIndex];
            const userCampus = userIndex.dataset.campus;
            const userActive = userIndex.dataset.active;

            console.log(userIndex, userCampus, userActive);
            if(userActive === '1'){
                document.getElementById("activeUser").checked = true;
            }
            if(userCampus === "Staff"){
                document.getElementById("staffAccount").checked = true;
                document.getElementById("downcityCampus").checked = true;
            }
            else{
                console.log((userCampus.toLowerCase() + "Campus"))
                document.getElementById(userCampus.toLowerCase() + "Campus").checked = true;
            }

        });
            

        document.getElementById('staffAccount').addEventListener('click', () => {
            if(document.getElementById('staffAccount').value === "Staff"){
                document.getElementById('staffAccount').value = "Student";
            }
            else if(document.getElementById('staffAccount').value === "Student"){
                document.getElementById('staffAccount').value = "Staff";
               
            }
             console.log(document.getElementById('staffAccount').value);
        });

        document.getElementById('activeUser').addEventListener('click', () => {
            if(document.getElementById('activeUser').value === "1"){
                document.getElementById('activeUser').value = "0";
            }
            else if(document.getElementById('activeUser').value === "0"){
                document.getElementById('activeUser').value = "1";
               
            }
             console.log(document.getElementById('activeUser').value);
        });

        function addUser(){
            userPopup.style.display = "flex";
            document.body.style.overflow = 'hidden';
        }

        function closeUser(){
            userPopup.style.display = "none";
            document.body.style.overflow = '';

            document.getElementById('existingUsers').style.display = "none";
            document.getElementById('existingUsers').value = "";
            document.getElementById("usersType").value = "";
            document.getElementById('usersName').value = "";
            document.getElementById('usersName').style.display = "block";
            document.querySelectorAll('input[name="campusRadio"]').forEach(radio => radio.checked = false);
            document.getElementById("activeUser").checked = false;
            document.getElementById("staffAccount").checked = false;
            document.getElementById('newUser').checked = true;
            document.getElementById('oldUser').checked = false;
        }
        

        function changeUsers(){
            const usersType = document.getElementById("usersType");
            if(usersType.value === "newUser"){
                document.getElementById('existingUsers').style.display = "none";
                document.getElementById('existingUsers').value = "";
                document.getElementById('usersName').style.display = "block";
                document.getElementById('resetPasswordButton').style.display = "none";
                document.querySelectorAll('input[name="campusRadio"]').forEach(radio => radio.checked = false);
                document.querySelectorAll('input[name="accountRadio"]').forEach(radio => radio.checked = false);
                document.querySelectorAll('input[name="activeRadio"]').forEach(radio => radio.checked = false);
                document.getElementById('newUser').checked = true;
                document.getElementById('oldUser').checked = false;
            }
            if(usersType.value === "existingUser"){
                document.getElementById('usersName').style.display = "none";
                document.getElementById('usersName').value = "";
                document.getElementById('existingUsers').style.display = "block";
                document.getElementById('resetPasswordButton').style.display = "inline-block";
                document.querySelectorAll('input[name="campusRadio"]').forEach(radio => radio.checked = false);
                document.querySelectorAll('input[name="accountRadio"]').forEach(radio => radio.checked = false);
                document.querySelectorAll('input[name="activeRadio"]').forEach(radio => radio.checked = false);
                document.getElementById('oldUser').checked = true;
                document.getElementById('newUser').checked = false;
                fetchExistingUsers();
            }
        }

        document.getElementById('resetPasswordButton').addEventListener('click', function(){
            const usersName = document.getElementById('existingUsers').value;
            if(!usersName){
                alert('Select a user first.');
                return;
            }
            if(!confirm(`Generate a temporary password for ${usersName}?`)){
                return;
            }

            const formData = new FormData();
            formData.append('submitType', 'resetPassword');
            formData.append('existingUsers', usersName);

            STSDemo.request('../INDEX-PHP/usersForm.php', {
                method: 'POST',
                headers: { 'X-CSRF-Token': STSDemo.session.getItem('csrfToken') || '' },
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert(`Temporary password for ${usersName}: ${data.tempPassword}\n\nShare this with the user directly. They will be required to change it on next login.`);
                    } else {
                        alert(data.message || 'Failed to reset password.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Request failed.');
                });
        });
        

        //Form to be submitted that determines the last of the semester
        semesterForm.addEventListener('submit', function(event){
            event.preventDefault();

            const formData = new FormData(semesterForm);
            const date = (formData.get('endOfSemester'));

            STSDemo.request('../FORM-PHP/semDateSubmit.php?action=submit', {
                    method: 'POST',
                    headers: { 'X-CSRF-Token': STSDemo.session.getItem('csrfToken') || '' },
                    body: formData
                })
                    .then(response => response.text())
                    .then(data => {
                        document.getElementById('endOfSemester').value= date;
                        document.getElementById('endOfSemester').disabled = true;
                        document.getElementById('semesterButton').style.display = "none";
                        document.getElementById('semesterUpdate').style.display = "";
                        document.getElementById('semesterUpdate').disabled = false;
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    }); 
            });

        semUpdateButton.addEventListener('click', function(event){
            event.preventDefault();

            console.log("Button Pressed");
            document.getElementById('endOfSemester').disabled = false;
            document.getElementById('semesterUpdate').disabled = true;
            document.getElementById('semesterButton').style.display = "";
            document.getElementById('semesterUpdate').style.display = "none";
        });

        async function checkDate(){
            const response = await STSDemo.request('../FORM-PHP/semDateSubmit.php?action=check'); // Update the path to your PHP script
            const data = await response.json();
    
            if(data){
                document.getElementById('endOfSemester').value= data.errormessage;
                document.getElementById('endOfSemester').disabled = true;
                document.getElementById('semesterButton').style.display = "none";
                document.getElementById('semesterUpdate').style.display = "";     
                document.getElementById('semesterUpdate').disabled = false;
            }
        }

        //Form to be submitted that determines the last of the semester
        binForm.addEventListener('submit', async function(event){
            event.preventDefault();
            const campus = document.getElementById("campusSelect").value;
            const formData = new FormData(binForm);
            formData.append('campus', campus);


            STSDemo.request('../FORM-PHP/Ewaste_bin.php?action=submit', {
                    method: 'POST',
                    headers: { 'X-CSRF-Token': STSDemo.session.getItem('csrfToken') || '' },
                    body: formData
                })
                    .then(response => response.text())
                    .then(data => {
                        checkBin();
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    }); 
            });

        binUpdateButton.addEventListener('click', function(event){
            event.preventDefault();

            console.log("Button Pressed");
            document.getElementById('bin_num').disabled = false;
            document.getElementById('bin_start').disabled = false;
            document.getElementById('binButton').disabled = false;
            document.getElementById('binButton').style.display = "";
            document.getElementById('binUpdate').style.display = "none";
            document.getElementById('campusSelect').disabled = true;
        });

        document.getElementById("campusSelect").addEventListener('change', async function(event){
            event.preventDefault();
            await binSelection();
            await checkBin();
        });

        //add a change check for the actual bin switches then call to the db for the date
        document.getElementById("bin_num").addEventListener('change', async function(event) {
            event.preventDefault();
            await checkBinDate();
        })

        async function checkBinDate(){
            const bin = document.getElementById("bin_num").value;
            await STSDemo.request('../FORM-PHP/Ewaste_bin.php?action=getDate', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRF-Token': STSDemo.session.getItem('csrfToken') || ''
                    },
                    body: `bin_id=${bin}`
                })
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('bin_start').value= data.errormessage;
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    }); 
        }

        async function checkBin(){
            const campus = document.getElementById("campusSelect").value;
            console.log(campus);
            await STSDemo.request('../FORM-PHP/Ewaste_bin.php?action=check', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRF-Token': STSDemo.session.getItem('csrfToken') || ''
                    },
                    body: `bin_campus=${campus}`
                })
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('bin_num').value= data.bin_num;
                        document.getElementById('bin_num').disabled = true;
                        document.getElementById('bin_start').value= data.errormessage;
                        document.getElementById('bin_start').disabled = true;
                        document.getElementById('binButton').style.display = "none";
                        document.getElementById('binUpdate').style.display = "";     
                        document.getElementById('binUpdate').disabled = false;
                        document.getElementById('campusSelect').disabled = false;
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    }); 
        }

    async function printBins(event, campus) {
    if (event) event.preventDefault();
        try {
            const response = await STSDemo.request(`../INDEX-PHP/printBins.php?action=check&campus=${campus}`);
            if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);

            let dataJSON = await response.json();
            console.log(dataJSON);

            // Filter to the selected campus
            if (campus) {
                dataJSON = dataJSON.filter(item =>
                    (item.campus ?? '').toLowerCase() === campus.toLowerCase()
                );
            }

            if (!Array.isArray(dataJSON) || dataJSON.length === 0) {
                alert(`No data to print for ${campus ?? 'selected campus'}.`);
                return;
            }

            const escapeHtml = (str) =>
                String(str ?? '').replace(/[&<>"']/g, (c) => ({
                    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
                }[c]));

            // Group rows by bin (within the already-filtered campus)
            const binsMap = new Map();
            dataJSON.forEach(item => {
                if (!binsMap.has(item.bin)) binsMap.set(item.bin, []);
                binsMap.get(item.bin).push(item);
            });

            // Build one page-section per bin
            const pagesHtml = Array.from(binsMap.entries()).map(([binName, items]) => {
                const rowsHtml = items.map(element => `
                    <tr>
                        <td>${escapeHtml(element.asset)}</td>
                        <td>${escapeHtml(element.device)}</td>
                        <td>${escapeHtml(element.model)}</td>
                        <td>${escapeHtml(element.tag)}</td>
                    </tr>
                `).join('');

                return `
                    <section class="bin-page">
                        <h1>${escapeHtml(campus ?? '')} &mdash; Bin: ${escapeHtml(binName)}</h1>
                        <table>
                            <thead>
                                <tr><th>Asset Tag</th><th>Device</th><th>Model</th><th>Tag</th></tr>
                            </thead>
                            <tbody>${rowsHtml}</tbody>
                        </table>
                        <div class="page-footer">
                        <p>By signing below, I confirm that I have looked at the items in this bin and can assure that all are present.</p>
                        <span class="sig-blank">Signature: _____________________________________</span>
                        <span class="sig-label">Date: ____/____/____</span>
                    </div>
                    </section>
                `;
            }).join('');

            const printWindow = window.open('', '', 'width=800,height=600');

            printWindow.document.write(`
                <html>
                <head>
                    <title>Print Bins - ${escapeHtml(campus ?? '')}</title>
                    <style>
                        @page { margin: 20px 20px 90px 20px; } /* extra bottom margin so content clears the footer */
                        body { font-family: Arial, sans-serif; font-size: 14px; }
                        h1 { font-size: 18px; text-align: center; margin-bottom: 12px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; }
                        th { background: #f0f0f0; }

                        .bin-page {
                            page-break-after: auto;
                            break-after: page;
                        }

                        /* Repeats on every printed page */
                        .page-footer {
                            position: fixed;
                            bottom: 0;
                            left: 0;
                            right: 0;
                            border-top: 1px solid #333;
                            padding-top: 8px;
                            font-size: 11px;
                        }
                        .page-footer p {
                            margin: 0 0 10px 0;
                            font-style: italic;
                        }
                        .sig-blank {
                            margin-top: 4px;
                            font-size: .95em;
                        }
                        .sig-label {
                            margin-left: 20px;
                            font-size: .95em;
                        }

                        #confirmBar { margin-top: 20px; text-align: center; }
                        #confirmBar button { font-size: 14px; padding: 8px 16px; margin: 0 6px; cursor: pointer; }
                        @media print { #confirmBar { display: none; } }
                    </style>
                </head>
                <body>
                    ${pagesHtml}
                </body>
                </html>
            `);

            printWindow.document.close();
                printWindow.onload = function () {
                printWindow.focus();
                printWindow.print();
            };

            printWindow.onafterprint = function () {
                setTimeout(function () {
                    printWindow.close();
                }, 1000);
            };

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    async function binSelection(){
        const campus = document.getElementById("campusSelect").value;
        await STSDemo.request('../FORM-PHP/Ewaste_bin.php?action=select',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRF-Token': STSDemo.session.getItem('csrfToken') || ''
                },
            body: `bin_campus=${campus}`
        })
            .then(response => response.text())
            .then(data =>{
                document.getElementById("bin_num").innerHTML = data;
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }


        //End of semester code

        let refreshTables = 5 * 60 * 1000;

        const trackRefreshTime = () => {
            refreshTime += 1000;
            if(refreshTime >= refreshTables){
            showCurrentCard();
            }
        };

