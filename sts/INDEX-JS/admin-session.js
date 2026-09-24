// Check if the user is logged in (i.e., if 'userName' exists in sessionStorage)
    if (STSDemo.session.getItem('userName') === null || STSDemo.session.getItem('userName') === undefined) {
        // If user is undefined, redirect or show a message
        window.location.href = '../login.html';  // Redirect to the login page or display a message
    } else {
        // Proceed with the application logic if user is defined
        console.log('User is logged in:', STSDemo.session.getItem('userName'));
        username = STSDemo.session.getItem('userName');
    }
    // Check if the user is logged in
    if (STSDemo.session.getItem('isLoggedIn') !== 'true') {
        window.location.href = '../index.html'; // Redirect to login page if not logged in
    } 

    if(STSDemo.session.getItem('is_staff') !== 'true'){
        window.location.href = 'main.html';
    }

    let idleTime = 0;
    let refreshTime = 0;
    let idleLimit = 10 * 60 * 1000;

    const resetIdleTimer = () =>{
        idleTimer = 0;
    };

    const trackIdleTime = () => {
        idleTime += 1000;
        if(idleTime >= idleLimit){
            logout();
        }
    };

    document.addEventListener('DOMContentLoaded', async function(){
        AnnouncementLoader();
        checkDate();
        binSelection();
        await checkBin();
    });
