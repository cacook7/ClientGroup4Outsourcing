// https://outsourcinggroup4client.herokuapp.com/

// var loginBusinessURL = "https://localhost:11001/api/BusinessLogin/GetFirms";
var loginBusinessURL = "https://outsourcinggroup4client.herokuapp.com/api/BusinessLogin/GetFirms";
// var loginEmployeeURL = "https://localhost:11001/api/EmployeeLogin/GetEmps";
var loginEmployeeURL = "https://outsourcinggroup4client.herokuapp.com/api/EmployeeLogin/GetEmps";
// var registerBusinessURL = "https://localhost:11001/api/BusinessLogin";
var registerBusinessURL = "https://outsourcinggroup4client.herokuapp.com/api/BusinessLogin";
var loggedIn = sessionStorage.getItem('LoggedIn');
if(loggedIn === null){
    loggedIn = "false";
}
var loggedInUser;
if(sessionStorage.getItem('LoggedInUser') == undefined){
    loggedInUser = {};
}else{
    loggedInUser = JSON.parse(sessionStorage.getItem('LoggedInUser'));
}
var businesses = [];
var employees = [];


function handleOnLoad(){
    console.log(loggedIn);
    console.log(loggedInUser);
    handleNavbar();

}

function handleLogout(){
    loggedIn = "false";
    loggedInUser = {};
    sessionStorage.setItem('LoggedIn',loggedIn);
    sessionStorage.setItem('LoggedInUser',JSON.stringify(loggedInUser));
}

function handleRegister(){
    //fetching all businesses then employees
    fetch(loginBusinessURL).then(function(response){
        return response.json();
    }).then(function(json){
        console.log(json);
        businesses = json;
        fetch(loginEmployeeURL).then(function(response){ //fetching employees as soon as business finishes
            return response.json();
        }).then(function(json){
            console.log(json);
            employees = json;
            registerSearch(); //searching to check for duplicate usernames once fetches are done
        }).catch(function(error){
            console.log(error);
        });
    }).catch(function(error){
        console.log(error);
    });
}

function registerSearch(){
    var searchUsername = document.getElementById("uname").value;
    var searchPassword = document.getElementById("psw").value;
    var searchEmail = document.getElementById("registeremail").value;
    var searchFirmName = document.getElementById("firmname").value;
    var searchRepFName = document.getElementById("repfirstname").value;
    var searchRepLName = document.getElementById("replastname").value;
    var searchIndex = -1;
    businesses.forEach(business => {
        //searching firms
        if(business.username == searchUsername){
            searchIndex = business.firmID
        }
    }); //slight issue, if businesses have same username and password as employee they will be logged in first
    //can be avoided if we prevent users from signing up with existing username
    if(searchIndex == -1){
        //seaching employees if it wasnt found in firms
        employees.forEach(employee => {
            if(employee.username == searchUsername){
                searchIndex = employee.empID
            }
        });
    }
    if(searchIndex != -1){
        console.log("failed register");
        var html = 'Error, username already taken. Please try again.';
        document.getElementById("failedregister").innerHTML = html;
    }
    else{
        value = {
            username: searchUsername,
            password: searchPassword,
            repfName: searchRepFName,
            replName: searchRepLName,
            firmName: searchFirmName,
            email: searchEmail
        }
        console.log(JSON.stringify(value));
        fetch(registerBusinessURL, {
            method: "POST",
            headers: {
                "Accept": 'application/json',
                "Content-Type": 'application/json',
            },
            body: JSON.stringify(value)
        }).then(function(){
            fetch(registerBusinessURL + "/GetFirmByUsername/" + searchUsername, {
                method: "GET",
                headers: {
                    "Accept": 'application/json',
                    "Content-Type": 'application/json',
                }
            }).then(function(response){
                return response.json();
            }).then(function(json){
                console.log(json);
                tempBusiness = json;
                loggedInUser = {
                    username: searchUsername,
                    password: searchPassword,
                    fName: searchRepFName,
                    lName: searchRepLName,
                    userID: tempBusiness.firmID,
                    userType: "Business",
                    admin: 0
                }
                loggedIn = "true";
                sessionStorage.setItem('LoggedIn',loggedIn);
                sessionStorage.setItem('LoggedInUser',JSON.stringify(loggedInUser));
                console.log(loggedInUser);
                handleOnLoad();
                document.getElementById("uname").value = "";
                document.getElementById("psw").value = "";
                // window.location.replace(`../client/index.html`);
                window.location.replace(`https://outsourcinggroup4client.herokuapp.com/index.html`);
            }).catch(function(error){
                console.log(error);
            });
        });
    }

}

function handleLogin(){
    //fetching all businesses then employees
    fetch(loginBusinessURL).then(function(response){
        return response.json();
    }).then(function(json){
        console.log(json);
        businesses = json;
        fetch(loginEmployeeURL).then(function(response){ //fetching employees as soon as business finishes
            return response.json();
        }).then(function(json){
            console.log(json);
            employees = json;
            loginSearch(); //searching to find the user once fetches are done
        }).catch(function(error){
            console.log(error);
        });
    }).catch(function(error){
        console.log(error);
    });
}

function loginSearch(){
    var searchUsername = document.getElementById("uname").value;
    var searchPassword = document.getElementById("psw").value;
    var searchIndex = -1;
    businesses.forEach(business => {
        //searching firms
        if(business.username == searchUsername){
            if(business.password == searchPassword){
                searchIndex = business.firmID;
                loggedInUser = {
                    username: business.username,
                    password: business.password,
                    fName: business.repFName,
                    lName: business.repLName,
                    userID: business.firmID,
                    userType: "Business",
                    admin: 0
                }
            }
        }
    }); //slight issue, if businesses have same username and password as employee they will be logged in first
    //can be avoided if we prevent users from signing up with existing username
    if(searchIndex == -1){
        //seaching employees if it wasnt found in firms
        employees.forEach(employee => {
            console.log(employee.username);
            console.log(employee.password);
            if(employee.username == searchUsername){
                if(employee.password == searchPassword){
                    searchIndex = employee.empID;
                    loggedInUser = {
                        username: employee.username,
                        password: employee.password,
                        fName: employee.fName,
                        lName: employee.lName,
                        userID: employee.empID,
                        userType: "Employee",
                        admin: employee.isAdmin
                    }
                }
            }
        });
    }
    if(searchIndex == -1){
        console.log("failed login");
        var html = 'Log in failed, incorrect username or password';
        document.getElementById("failedlogin").innerHTML = html;
    }
    else{
        loggedIn = "true";
        sessionStorage.setItem('LoggedIn',loggedIn);
        sessionStorage.setItem('LoggedInUser',JSON.stringify(loggedInUser));
        console.log(loggedInUser);
        handleOnLoad();
        document.getElementById("uname").value = "";
        document.getElementById("psw").value = "";
        // window.location.replace(`../client/index.html`);
        window.location.replace(`https://outsourcinggroup4client.herokuapp.com/index.html`);
    }
}

function handleNavbar(){
    // let html = '<ul>';
    // html += '<li><a href="./index.html"><h5>Tide Market - Outsourcing</h5></a></li>';
    // html += '</ul>';
    // html += '<ul class = "navbar-2">';
    // html += '<li><a href="./index.html"> Home</a></li>';
    // html += '<li><a href="./ViewAllRentals.html"> View All Rentals</a></li>';
    // html += '<li><a href="./Login.html"> Log In</a></li>';
    // html += '<li><a href="./Register.html"> Register</a></li>';
    // html += '<li><a class="display-right" href="./userAccountPage.html"><div class="_167wsvl"><button type="button" class="_8bn4ek6" aria-expanded="false" aria-label="Main navigation menu" data-testid="cypress-headernav-profile"><div class="_3hmsj"><svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style="display: block; fill: none; height: 16px; width: 16px; stroke: currentcolor; stroke-width: 3; overflow: visible;"><g fill="none" fill-rule="nonzero"><path d="m2 16h28"></path><path d="m2 24h28"></path><path d="m2 8h28"></path></g></svg></div><div class="_1xp7o8n"><img class="_1wzp0xs" src="https://a0.muscache.com/defaults/user_pic-50x50.png?v=3" alt=""></div></button></div></a></li>';
    // html += '</ul>';
    if(loggedIn == "false"){
        var html = '<ul>';
        html += '<li><a href="./index.html"><h5>Tide Market - Outsourcing</h5></a></li>';
        html += '</ul>';
        html += '<ul class = "navbar-2">';
        html += '<li><a href="./index.html"> Home</a></li>';
        html += '<li><a href="./ViewCurrentRentals.html"> Current Businesses</a></li>';
        html += '<li><a href="./Login.html"> Log In</a></li>';
        html += '<li><a href="./Register.html"> Register</a></li>';
        html += '</ul>';
    }else if(loggedInUser.userType == "Business"){
        var html = '<ul>';
        html += '<li><a href="./index.html"><h5>Tide Market - Outsourcing</h5></a></li>';
        html += '</ul>';
        html += '<ul class = "navbar-2">';
        html += '<li><a href="./index.html"> Home</a></li>';
        html += '<li><a href="./ViewCurrentRentals.html"> Current Businesses</a></li>';
        html += '<li><a href="./ViewAllRentals.html"> View All Rentals</a></li>';
        html += '<li><a class="display-right" href="./userAccountPage.html"><div class="_167wsvl"><button type="button" class="_8bn4ek6" aria-expanded="false" aria-label="Main navigation menu" data-testid="cypress-headernav-profile"><div class="_3hmsj"><svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style="display: block; fill: none; height: 16px; width: 16px; stroke: currentcolor; stroke-width: 3; overflow: visible;"><g fill="none" fill-rule="nonzero"><path d="m2 16h28"></path><path d="m2 24h28"></path><path d="m2 8h28"></path></g></svg></div><div class="_1xp7o8n"><img class="_1wzp0xs" src="https://a0.muscache.com/defaults/user_pic-50x50.png?v=3" alt=""></div></button></div></a></li>';
        html += '</ul>';
    }else if(loggedInUser.userType =="Employee" && loggedInUser.admin == 0){
        var html = '<ul>';
        html += '<li><a href="./index.html"><h5>Tide Market - Outsourcing</h5></a></li>';
        html += '</ul>';
        html += '<ul class = "navbar-2">';
        html += '<li><a href="./index.html"> Home</a></li>';
        html += '<li><a href="./ViewCurrentRentals.html"> Current Businesses</a></li>';
        html += '<li><a href="./AdminViewRentals.html"> View All Rentals</a></li>';
        html += '<li><a href="./AdminViewRentalApps.html">View All Rental Applications</a></li>';
        html += '<li><a class="display-right" href="./userAccountPage.html"><div class="_167wsvl"><button type="button" class="_8bn4ek6" aria-expanded="false" aria-label="Main navigation menu" data-testid="cypress-headernav-profile"><div class="_3hmsj"><svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style="display: block; fill: none; height: 16px; width: 16px; stroke: currentcolor; stroke-width: 3; overflow: visible;"><g fill="none" fill-rule="nonzero"><path d="m2 16h28"></path><path d="m2 24h28"></path><path d="m2 8h28"></path></g></svg></div><div class="_1xp7o8n"><img class="_1wzp0xs" src="https://a0.muscache.com/defaults/user_pic-50x50.png?v=3" alt=""></div></button></div></a></li>';
        html += '</ul>';
    }else{
        var html = '<ul>';
        html += '<li><a href="./index.html"><h5>Tide Market - Outsourcing</h5></a></li>';
        html += '</ul>';
        html += '<ul class = "navbar-2">';
        html += '<li><a href="./index.html"> Home</a></li>';
        html += '<li><a href="./ViewCurrentRentals.html"> Current Businesses</a></li>';
        html += '<li><a href="./AdminViewRentals.html">View All Rentals</a></li>';
        html += '<li><a href="./AdminViewRentalApps.html">View All Rental Applications</a></li>';
        // html += '<li><a href="./ViewAllAdmins.html">View All Admins</a></li>';
        // html += '<li><a href="./ViewAllEmployees.html">View All Employees</a></li>';
        // html += '<li><a href="./ViewAllBusinesses.html">View All Businesses</a></li>';
        html += '<li><a class="display-right" href="./userAccountPage.html"><div class="_167wsvl"><button type="button" class="_8bn4ek6" aria-expanded="false" aria-label="Main navigation menu" data-testid="cypress-headernav-profile"><div class="_3hmsj"><svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style="display: block; fill: none; height: 16px; width: 16px; stroke: currentcolor; stroke-width: 3; overflow: visible;"><g fill="none" fill-rule="nonzero"><path d="m2 16h28"></path><path d="m2 24h28"></path><path d="m2 8h28"></path></g></svg></div><div class="_1xp7o8n"><img class="_1wzp0xs" src="https://a0.muscache.com/defaults/user_pic-50x50.png?v=3" alt=""></div></button></div></a></li>';
        html += '</ul>';
    }
    document.getElementById("mainnavbar").innerHTML = html;
}

function delay(time){
    return new Promise(resolve => setTimeout(resolve, time));
}

function handleOnUserAccLoad(){
    console.log(loggedIn);
    console.log(loggedInUser);
    routeUser();
    handleNavbar();
    var html = "Current user: " + loggedInUser.fName + " " + loggedInUser.lName;
    document.getElementById("loggedinuser").innerHTML = html;
}


function handleAdminOnLoad(){
    // const adminUrl = "https://localhost:11001/api/EmployeeLogin/GetEmp/";
    const adminUrl = "https://outsourcinggroup4client.herokuapp.com/api/EmployeeLogin/GetEmp/";
    handleNavbar();
    fetch(adminUrl + loggedInUser.userID).then(function(response){
        return response.json();
    }).then(function(json){
        console.log(json);//this is the part that changes
        displayAdmin(json);
    }).catch(function(error){
        console.log(error);
    })
}
//Won't work till admin controller and datahandler are complete
function displayAdmin(json){
    var admindataTable = document.getElementById("admindataTable");
    // we can use this code for the view all employees
    // var html = "<table class='table table-hover table-bordered'><tr><th>Delete</th><th>Vendor ID </th><th>Attendee Name </th><th>Vendor Email</th><th>Admin Phone Number</th><th>Admin Description</th></tr>";
    // var admin = json;
    // html+=`<tr><td><button type="button" id="delete" class="btn btn-secondary btn-sm" onclick="DeleteAdmin(${admin.adminID})">Delete</button></td>`;
    // html+=`<td>${admin.empID}</td><td>${admin.fName}</td><td>${admin.email}</td>`;
    // //<td>${admin.adminPhoneNumber}</td><td>${admin.adminDescription}</td></tr>`
    // html+="</table>";
    var admin = json;
    var html = `<table class="table table-hover table-bordered">`
    html += `<tr><th>Username: </th><th><input class="form-control" type="text" name="post" id="AdminUsername" value="${admin.username}" required readonly></input></th></tr>`
    html += `<tr><th>Password: </th><th><input class="form-control" type="text" name="post" id="AdminPassword" value="${admin.password}" required></input></th></tr>`
    html += `<tr><th>First Name: </th><th><input class="form-control" type="text" name="post" id="AdminFName" value="${admin.fName}" required></input></th></tr>`
    html += `<tr><th>Last Name: </th><th><input class="form-control" type="text" name="post" id="AdminLName" value="${admin.lName}" required></input></th></tr>`
    html += `<tr><th>Email: </th><th><input class="form-control" type="email" name="post" id="AdminEmail" value="${admin.email}" required></input></th></tr>`
    html += `<tr><th>Phone Number: </th><th><input class="form-control" type="tel" name="post" id="AdminPhoneNumber" value="${admin.phoneNumber1}" required></input></th></tr>`
    html += `<tr><th>Phone Number 2: </th><th><input class="form-control" type="tel" name="post" id="AdminPhoneNumber2" value="${admin.phoneNumber2}" required></input></th></tr>`
    html += `</table>`
    html += `<table>`
    html += `<tr><button href="./AdminAccountPage.html" type="button" class="btn btn-secondary btn-md" onclick = "putAdmin()">Update</button></tr>`
    html += `</table>`

    admindataTable.innerHTML = html;
}

function putAdmin(){
    // const updateURL = "https://localhost:11001/api/EmployeeLogin/UpdateEmployee";
    const updateURL = "https://outsourcinggroup4client.herokuapp.com/api/EmployeeLogin/UpdateEmployee";
    var value = {
        fName: document.getElementById("AdminFName").value,
        lName: document.getElementById("AdminLName").value,
        email: document.getElementById("AdminEmail").value,
        username: document.getElementById("AdminUsername").value,
        password: document.getElementById("AdminPassword").value,
        phoneNumber1: document.getElementById("AdminPhoneNumber").value,
        phoneNumber2: document.getElementById("AdminPhoneNumber2").value
    }
    console.log(JSON.stringify(value));
    fetch(updateURL, {
        method: "PUT",
        headers: {
            "Accept": 'application/json',
            "Content-Type": 'application/json',
        },
        body: JSON.stringify(value)
    })
}


function handleEmployeeOnLoad(){
    // const adminUrl = "https://localhost:11001/api/EmployeeLogin/GetEmp/";
    const adminUrl = "https://outsourcinggroup4client.herokuapp.com/api/EmployeeLogin/GetEmp/";
    handleNavbar();
    fetch(adminUrl + loggedInUser.userID).then(function(response){
        return response.json();
    }).then(function(json){
        console.log(json);//this is the part that changes
        displayEmployee(json);
        setAdminRentals(json);
    }).catch(function(error){
        console.log(error);
    })
}
//Won't work till admin controller and datahandler are complete
function displayEmployee(json){
    var empDataTable = document.getElementById("empDataTable");
    // we can use this code for the view all employees
    // var html = "<table class='table table-hover table-bordered'><tr><th>Delete</th><th>Vendor ID </th><th>Attendee Name </th><th>Vendor Email</th><th>Admin Phone Number</th><th>Admin Description</th></tr>";
    // var admin = json;
    // html+=`<tr><td><button type="button" id="delete" class="btn btn-secondary btn-sm" onclick="DeleteAdmin(${admin.adminID})">Delete</button></td>`;
    // html+=`<td>${admin.empID}</td><td>${admin.fName}</td><td>${admin.email}</td>`;
    // //<td>${admin.adminPhoneNumber}</td><td>${admin.adminDescription}</td></tr>`
    // html+="</table>";
    var emp = json;
    var html = `<table class="table table-hover table-bordered">`
    html += `<tr><th>Username: </th><th><input class="form-control" type="text" name="post" id="EmpUsername" value="${emp.username}" required readonly></input></th></tr>`
    html += `<tr><th>Password: </th><th><input class="form-control" type="text" name="post" id="EmpPassword" value="${emp.password}" required></input></th></tr>`
    html += `<tr><th>First Name: </th><th><input class="form-control" type="text" name="post" id="EmpFName" value="${emp.fName}" required></input></th></tr>`
    html += `<tr><th>Last Name: </th><th><input class="form-control" type="text" name="post" id="EmpLName" value="${emp.lName}" required></input></th></tr>`
    html += `<tr><th>Email: </th><th><input class="form-control" type="email" name="post" id="EmpEmail" value="${emp.email}" required></input></th></tr>`
    html += `<tr><th>Phone Number: </th><th><input class="form-control" type="tel" name="post" id="EmpPhoneNumber" value="${emp.phoneNumber1}" required></input></th></tr>`
    html += `<tr><th>Phone Number 2: </th><th><input class="form-control" type="tel" name="post" id="EmpPhoneNumber2" value="${emp.phoneNumber2}" required></input></th></tr>`
    html += `</table>`
    html += `<table>`
    html += `<tr><button href="./AdminAccountPage.html" type="button" class="btn btn-secondary btn-md" onclick = "putEmployee()">Update</button></tr>`
    html += `</table>`

    empDataTable.innerHTML = html;
}

function putEmployee(){
    // const updateURL = "https://localhost:11001/api/EmployeeLogin/UpdateEmployee";
    const updateURL = "https://outsourcinggroup4client.herokuapp.com/api/EmployeeLogin/UpdateEmployee";
    var value = {
        fName: document.getElementById("EmpFName").value,
        lName: document.getElementById("EmpLName").value,
        email: document.getElementById("EmpEmail").value,
        username: document.getElementById("EmpUsername").value,
        password: document.getElementById("EmpPassword").value,
        phoneNumber1: document.getElementById("EmpPhoneNumber").value,
        phoneNumber2: document.getElementById("EmpPhoneNumber2").value
    }
    console.log(JSON.stringify(value));
    fetch(updateURL, {
        method: "PUT",
        headers: {
            "Accept": 'application/json',
            "Content-Type": 'application/json',
        },
        body: JSON.stringify(value)
    })
}

function handleBusinessOnLoad(){
    // const businessURL = "https://localhost:11001/api/BusinessLogin/GetFirm/";
    const businessURL = "https://outsourcinggroup4client.herokuapp.com/api/BusinessLogin/GetFirm/";
    handleNavbar();
    fetch(businessURL + loggedInUser.userID).then(function(response){
        return response.json();
    }).then(function(json){
        console.log(json);//this is the part that changes
        displayBusiness(json);
    }).catch(function(error){
        console.log(error);
    })
}


function displayBusiness(json){
    var firmDataTable = document.getElementById("firmDataTable");
    // we can use this code for the view all employees
    // var html = "<table class='table table-hover table-bordered'><tr><th>Delete</th><th>Vendor ID </th><th>Attendee Name </th><th>Vendor Email</th><th>Admin Phone Number</th><th>Admin Description</th></tr>";
    // var admin = json;
    // html+=`<tr><td><button type="button" id="delete" class="btn btn-secondary btn-sm" onclick="DeleteAdmin(${admin.adminID})">Delete</button></td>`;
    // html+=`<td>${admin.empID}</td><td>${admin.fName}</td><td>${admin.email}</td>`;
    // //<td>${admin.adminPhoneNumber}</td><td>${admin.adminDescription}</td></tr>`
    // html+="</table>";
    var firm = json;
    var html = `<table class="table table-hover table-bordered">`;
    html += `<tr><th>Username: </th><th><input class="form-control" type="text" name="post" id="FirmUsername" value="${firm.username}" required readonly></input></th></tr>`;
    html += `<tr><th>Password: </th><th><input class="form-control" type="text" name="post" id="FirmPassword" value="${firm.password}" required></input></th></tr>`;
    html += `<tr><th>Firm Name: </th><th><input class="form-control" type="text" name="post" id="FirmName" value="${firm.firmName}" required></input></th></tr>`;
    html += `<tr><th>First Name: </th><th><input class="form-control" type="text" name="post" id="FirmRepFName" value="${firm.repFName}" required></input></th></tr>`;
    html += `<tr><th>Last Name: </th><th><input class="form-control" type="text" name="post" id="FirmRepLName" value="${firm.repLName}" required></input></th></tr>`;
    html += `<tr><th>Email: </th><th><input class="form-control" type="email" name="post" id="FirmEmail" value="${firm.email}" required></input></th></tr>`;
    html += `<tr><th>Phone Number: </th><th><input class="form-control" type="tel" name="post" id="FirmPhoneNumber" value="${firm.phoneNumber1}" required></input></th></tr>`;
    html += `<tr><th>Phone Number 2: </th><th><input class="form-control" type="tel" name="post" id="FirmPhoneNumber2" value="${firm.phoneNumber2}" required></input></th></tr>`;
    html += `<tr><th>Business Description (Optional): </th><th>`;
    html += `<textarea rows = "5" cols = "60" name = "description" id="FirmDescription" placeholder="(Optional) Enter description here...">${firm.firmDescription}`;
    html+= `</textarea></th></tr>`;
    html += `</table>`;
    html += `<table>`;
    html += `<tr><button href="./AdminAccountPage.html" type="button" class="btn btn-secondary btn-md" onclick = "putBusiness()">Update</button></tr>`;
    html += `</table>`;

    firmDataTable.innerHTML = html;
}

function putBusiness(){
    // const updateURL = "https://localhost:11001/api/BusinessLogin/UpdateByUsername";
    const updateURL = "https://outsourcinggroup4client.herokuapp.com/api/BusinessLogin/UpdateByUsername";
    var value = {
        firmName: document.getElementById("FirmName").value,
        repFName: document.getElementById("FirmRepFName").value,
        repLName: document.getElementById("FirmRepLName").value,
        email: document.getElementById("FirmEmail").value,
        username: document.getElementById("FirmUsername").value,
        password: document.getElementById("FirmPassword").value,
        phoneNumber1: document.getElementById("FirmPhoneNumber").value,
        phoneNumber2: document.getElementById("FirmPhoneNumber2").value,
        firmDescription: document.getElementById("FirmDescription").value
    }
    console.log(value.repFName);
    console.log(value.repLName);
    console.log(JSON.stringify(value));
    fetch(updateURL, {
        method: "PUT",
        headers: {
            "Accept": 'application/json',
            "Content-Type": 'application/json',
        },
        body: JSON.stringify(value)
    })
}

// Attempt to try and get each of the account pages to work
function routeUser(){
    if(loggedInUser.userType == "Business")
    {
        //full heroku path will go after replace after we deploy-->
        // window.location.replace(`../client/businessaccountpage.html`);
        window.location.replace(`https://outsourcinggroup4client.herokuapp.com/businessaccountpage.html`);
    }
    else if(loggedInUser.userType == "Employee" && loggedInUser.admin == 0)
    {
        // window.location.replace(`../client/employeeaccountpage.html`);
        window.location.replace(`https://outsourcinggroup4client.herokuapp.com/employeeaccountpage.html`);
    }
    else if(loggedInUser.userType == "Employee" && loggedInUser.admin == 1)
    {
        // window.location.replace(`../client/adminaccountpage.html`);
        window.location.replace(`https://outsourcinggroup4client.herokuapp.com/adminaccountpage.html`);
    }
    // else
    // {
    //     window.location.replace(`../client/login.html`);
    // }
}


function handleRentalOnLoad(){
    // const rentalUrl = "https://localhost:11001/api/Rental";
    const rentalUrl = "https://outsourcinggroup4client.herokuapp.com/api/Rental";
    handleNavbar();

    fetch(rentalUrl).then(function(response){
        return response.json();
    }).then(function(json){
        console.log(json);
        setRentals(json);
        
    }).catch(function(error){
        console.log(error);
    });
}

setRentals = function(rentals){
    var html = ``;
    rentals.forEach((rental)=>{
        html += `<div class="card col-md-4 bg-dark text-white">`;
			html += `<img src="./resources/images/spaceplaceholder.png" class="card-img" alt="...">`;
			html += `<div class="card-img-overlay">`;
			html += `<h5 class="card-title"><spann>`+"Size(Square ft.) = "+rental.size+`<spann></h5>`;
            html += `<h5 class="card-title"><spann>`+"Monthly Price($) = "+rental.monthlyPrice+`<spann></h5>`;
            html += `<form action="./RentalApplication.html"><button onclick ="applyForRental(${rental.spaceID})"class="btn btn-dark">Apply</</button></form>`;
            html += `</div>`;
            html += `</div>`;       
    })
    document.getElementById("rentals").innerHTML = html;
}

function applyForRental(spaceID){
    sessionStorage.setItem('SpaceIDForApp',spaceID);
}

function handleRentalAppOnLoad(){
    var spaceIDForApp = sessionStorage.getItem('SpaceIDForApp');
    console.log(spaceIDForApp);
}

function postApplication(){
    var value = {
        firmID: loggedInUser.userID,
        spaceID: sessionStorage.getItem('SpaceIDForApp'),
        appStartDate: document.getElementById("AppStartDate").value,
        appEndDate: document.getElementById("AppEndDate").value
    }
    // const appURL = "https://localhost:11001/api/RentalApplication/PostApplication";
    const appURL = "https://outsourcinggroup4client.herokuapp.com/api/RentalApplication/PostApplication";
    fetch(appURL, {
        method: "POST",
        headers: {
            "Accept": 'application/json',
            "Content-Type": 'application/json',
        },
        body: JSON.stringify(value)
    }).then(function(){
        // window.location.replace("../client/BusinessViewRentalApps.html")
        window.location.replace(`https://outsourcinggroup4client.herokuapp.com/BusinessViewRentalApps.html`)
        
    });
}

function handleAdminRentalOnLoad(){
    // const rentalUrl = "https://localhost:11001/api/Rental";
    const rentalUrl = "https://outsourcinggroup4client.herokuapp.com/api/Rental";
    handleNavbar();

    fetch(rentalUrl).then(function(response){
        return response.json();
    }).then(function(json){
        console.log(json);
        setAdminRentals(json);
        
    }).catch(function(error){
        console.log(error);
    });
}

setAdminRentals = function(adminrentals){
    var html = ``;
    adminrentals.forEach((adminrental)=>{
        html += `<div class="card col-md-4 bg-dark text-white">`;
			html += `<img src="./resources/images/spaceplaceholder.png" class="card-img" alt="...">`;
			html += `<div class="card-img-overlay">`;
            html += `<h5 class="card-title"><spann>`+"ID = "+adminrental.spaceID+`<spann></h5>`;
			html += `<h5 class="card-title"><spann>`+"Size(Square ft.) = "+adminrental.size+`<spann></h5>`;
            html += `<h5 class="card-title"><spann>`+"Monthly Price($) = "+adminrental.monthlyPrice+`<spann></h5>`;
            html += `<button onclick ="removeRental(${adminrental.spaceID})"class="btn btn-dark">Delete</</button>`;
            html += `</div>`;
            html += `</div>`;       
    })
    document.getElementById("rentals").innerHTML = html;
}

function removeRental(id){
    // const deleteRentalUrl = "https://localhost:11001/api/Rental/"+id;
    const deleteRentalUrl = "https://outsourcinggroup4client.herokuapp.com/api/Rental/"+id;

    fetch(deleteRentalUrl,{
        method: "DELETE",
        headers: {
            "Accept": 'application/json',
            "Content-Type": 'application/json',
        },
    })
    .then((response)=>{
        console.log(response);
        handleRentalOnLoad();
    })
    
}

function handleViewBusinessOnLoad(){
    // const businessUrl = "https://localhost:11001/api/BusinessLogin/GetFirms";
    const businessUrl = "https://outsourcinggroup4client.herokuapp.com/api/BusinessLogin/GetFirms";
    handleNavbar();

    fetch(businessUrl).then(function(response){
        return response.json();
    }).then(function(json){
        console.log(json);
        displayBusinessDeleteTable(json)
        
    }).catch(function(error){
        console.log(error);
    });
}

function displayBusinessDeleteTable(json){
    var businessdataTable = document.getElementById("businessdataTable");

    var html = "<table class='table table-hover table-bordered'><tr><th>Delete</th><th>Username</th><th>Password</th><th>Email</th><th>Firm Name</th><th>Rep First Name</th><th>Rep Last Name</th></tr>";
    json.forEach(business => {
        html+=`<tr><td><button type="button" id="delete" class="btn btn-secondary btn-sm" onclick="DeleteBusiness(${business.firmID})">Delete</button></td>`;
        html+=`<td>${business.username}</td><td>${business.password}</td><td>${business.email}</td><td>${business.firmName}</td><td>${business.repFName}</td><td>${business.repLName}</td></tr>`;
    });
    html+="</table>";
    businessdataTable.innerHTML = html;
}

function handleviewAdminsOnLoad(){
    // const adminsUrl = "https://localhost:11001/api/EmployeeLogin/GetEmps";
    const adminsUrl = "https://outsourcinggroup4client.herokuapp.com/api/EmployeeLogin/GetEmps";
    handleNavbar();

    fetch(adminsUrl).then(function(response){
        return response.json();
    }).then(function(json){
        console.log(json);
        displayAdminViewTable(json)
        
    }).catch(function(error){
        console.log(error);
    });
}
 
//Needs to be fixed so it only shows the admins and not all employees
function displayAdminViewTable(json){
    var adminsdataTable = document.getElementById("adminsdataTable");

    var html = "<table class='table table-hover table-bordered'><tr><th>Delete</th><th>Username</th><th>Password</th><th>First Name</th><th>Last Name</th><th>Email</th><th>Phone Number</th><th>Phone Number 2</th></tr>";
    json.forEach(admin => {
        if(admin.isAdmin == 1){
            html+=`<tr><td><button type="button" id="delete" class="btn btn-secondary btn-sm" onclick="DeleteBusiness(${admin.empID})">Delete</button></td>`;
            html+=`<td>${admin.username}</td><td>${admin.password}</td><td>${admin.fName}</td><td>${admin.lName}</td><td>${admin.email}</td><td>${admin.phoneNumber1}</td><td>${admin.phoneNumber2}</td></tr>`;
        }
    });
    html+="</table>";
    adminsdataTable.innerHTML = html;
}

function handleviewEmployeesOnLoad(){
    // const employeesUrl = "https://localhost:11001/api/EmployeeLogin/GetEmps";
    const employeesUrl = "https://outsourcinggroup4client.herokuapp.com/api/EmployeeLogin/GetEmps";
    handleNavbar();

    fetch(employeesUrl).then(function(response){
        return response.json();
    }).then(function(json){
        console.log(json);
        displayEmployeeViewTable(json)
        
    }).catch(function(error){
        console.log(error);
    });
}

function displayEmployeeViewTable(json){
    var employeesdataTable = document.getElementById("employeesdataTable");

    var html = "<table class='table table-hover table-bordered'><tr><th>Delete</th><th>Username</th><th>Password</th><th>First Name</th><th>Last Name</th><th>Email</th><th>Phone Number</th><th>Phone Number 2</th></tr>";
    json.forEach(employee => {
        html+=`<tr><td><button type="button" id="delete" class="btn btn-secondary btn-sm" onclick="DeleteBusiness(${employee.empID})">Delete</button></td>`;
        html+=`<td>${employee.username}</td><td>${employee.password}</td><td>${employee.fName}</td><td>${employee.lName}</td><td>${employee.email}</td><td>${employee.phoneNumber1}</td><td>${employee.phoneNumber2}</td></tr>`;
    });
    html+="</table>";
    employeesdataTable.innerHTML = html;
}

function handleFirmViewAppsOnLoad(){
    // const appURL = "https://localhost:11001/api/RentalApplication/GetAppByFirm/";
    const appURL = "https://outsourcinggroup4client.herokuapp.com/api/RentalApplication/GetAppByFirm/";
    handleNavbar();
    fetch(appURL + loggedInUser.userID).then(function(response){
        return response.json();
    }).then(function(json){
        console.log(json);
        var apps = json;
        var html = "<table class='table table-hover table-bordered'><tr><th>Application ID</th><th>Rented Space ID</th><th>Start Date</th><th>End Date</th><th>Submission Date</th><th>Approved</th></tr>";
        html += `<h4>Your Applications</h4>`;
        apps.forEach(app => {
            if(app.approved == "n"){
                app.approved = "No";
            }else{
                app.approved = "Yes";
            }
            var startDate = new Date(app.appStartDate);
            console.log(startDate.getMonth());
            var formatStartDate = (startDate.getMonth()+1) + "/" + startDate.getDate() + "/" + startDate.getFullYear();
            var endDate = new Date(app.appEndDate);
            var formatEndDate = (endDate.getMonth()+1) + "/" + endDate.getDate() + "/" + endDate.getFullYear();
            var submitDate = new Date(app.appSubmitDate);
            var formatSubmitDate = (submitDate.getMonth()+1) + "/" + submitDate.getDate() + "/" + submitDate.getFullYear();
            html+=`<tr>`;
            html+=`<td>${app.appID}</td><td>${app.spaceID}</td><td>${formatStartDate}</td><td>${formatEndDate}</td><td>${formatSubmitDate}</td><td>${app.approved}</td></tr>`;
        });
        html+="</table>";
        document.getElementById("apps").innerHTML = html;
    }).catch(function(error){
        console.log(error);
    });
}

function deleteApp(firmID){

}

function handleCurrentRentalOnLoad(){
    // const currRentalUrl = "https://localhost:11001/api/BusinessLogin/GetCurrentRenters";
    const currRentalUrl = "https://outsourcinggroup4client.herokuapp.com/api/BusinessLogin/GetCurrentRenters";
    handleNavbar();
    fetch(currRentalUrl).then(function(response){
        return response.json();
    }).then(function(json){
        console.log(json);
        var currRenters = json;
        var html = ``;
        currRenters.forEach((currRenter)=>{
        html += `<div class="card col-md-4 bg-dark text-white">`;
			html += `<img src="./resources/images/spaceplaceholder.png" class="card-img" alt="...">`;
			html += `<div class="card-img-overlay">`;
			html += `<h5 class="card-title"><spann>`+currRenter.firmName+`<spann></h5>`;
            html += `<h5 class="card-title"><spann>`+currRenter.email+`<spann></h5>`;
            html += `<h5 class="card-title"><spann>`+currRenter.phoneNumber1+`<spann></h5>`;
            html += `<h5 class="card-title"><spann>`+currRenter.phoneNumber2+`<spann></h5>`;
            html += `<h5 class="card-title" id="firmDescription"><spann>`+currRenter.firmDescription+`<spann></h5>`;
            html += `</div>`;
            html += `</div>`;       
        })
        document.getElementById("currentrentals").innerHTML = html;  
    }).catch(function(error){
        console.log(error);
    });
}

function handleFirmViewTransactions(){
    // const transURL = "https://localhost:11001/api/Rental/GetTransactionsByFirm/";
    const transURL = "https://outsourcinggroup4client.herokuapp.com/api/Rental/GetTransactionsByFirm/";
    handleNavbar();
    fetch(transURL + loggedInUser.userID).then(function(response){
        return response.json();
    }).then(function(json){
        console.log(json);
        var transactions = json;
        var html = "<table class='table table-hover table-bordered'><tr><th>Application ID</th><th>Rented Space ID</th><th>Start Date</th><th>End Date</th><th>Approval Date</th></tr>";
        html += `<h4>Your Transactions</h4>`;
        transactions.forEach(transaction => {
            var startDate = new Date(transaction.startDate);
            var formatStartDate = (startDate.getMonth()+1) + "/" + startDate.getDate() + "/" + startDate.getFullYear();
            var endDate = new Date(transaction.endDate);
            var formatEndDate = (endDate.getMonth()+1) + "/" + endDate.getDate() + "/" + endDate.getFullYear();
            var approvalDate = new Date(transaction.approvalDate);
            var formatApprovalDate = (approvalDate.getMonth()+1) + "/" + approvalDate.getDate() + "/" + approvalDate.getFullYear();
            html+=`<tr>`;
            html+=`<td>${transaction.appID}</td><td>${transaction.spaceID}</td><td>${formatStartDate}</td><td>${formatEndDate}</td><td>${formatApprovalDate}</td></tr>`;
        });
        html+="</table>";
        document.getElementById("transactions").innerHTML = html;
    }).catch(function(error){
        console.log(error);
    });
}


function updateRentalAppApproval(appID, spaceID){
    // const updateRentalAppApprovalUrl = "https://localhost:11001/api/RentalApplication/"+appID+"/"+loggedInUser.userID;
    const updateRentalAppApprovalUrl = "https://outsourcinggroup4client.herokuapp.com/api/RentalApplication/"+appID+"/"+loggedInUser.userID;
    fetch(updateRentalAppApprovalUrl,{
        method: "DELETE",
        headers: {
            "Accept": 'application/json',
            "Content-Type": 'application/json',
        },
    })
    .then((response)=>{
        console.log(response);
        removeRental(spaceID);
        handleRentalApplicationUpdateOnLoad();
    })
    
}


function handleRentalApplicationUpdateOnLoad(){
    // const updateRentalAppApprovalUrl = "https://localhost:11001/api/RentalApplication/";
    const updateRentalAppApprovalUrl = "https://outsourcinggroup4client.herokuapp.com/api/RentalApplication/";
    handleNavbar();
    fetch(updateRentalAppApprovalUrl).then(function(response){
        return response.json();
    }).then(function(json){
        console.log(json);
        var rentalapps = json;
        var html = "<table class='table table-hover table-bordered'><tr><th>Firm Name</th><th>Application ID</th><th>Rented Space ID</th><th>Start Date</th><th>End Date</th><th>Submission Date</th><th>Approved</th><th>Approve Here</th></tr>";
        rentalapps.forEach(rentalapp => {
            if(rentalapp.approved == "n"){
                rentalapp.approved = "No";
            }else{
                rentalapp.approved = "Yes";
            }
            var startDate = new Date(rentalapp.appStartDate);
            var formatStartDate = (startDate.getMonth()+1) + "/" + startDate.getDate() + "/" + startDate.getFullYear();
            var endDate = new Date(rentalapp.appEndDate);
            var formatEndDate = (endDate.getMonth()+1) + "/" + endDate.getDate() + "/" + endDate.getFullYear();
            var submitDate = new Date(rentalapp.appSubmitDate);
            var formatSubmitDate = (submitDate.getMonth()+1) + "/" + submitDate.getDate() + "/" + submitDate.getFullYear();
            if(rentalapp.approved == "No"){
                html+=`<tr>`;
                html+=`<td>${rentalapp.firmName}</td><td>${rentalapp.appID}</td><td>${rentalapp.spaceID}</td><td>${formatStartDate}</td><td>${formatEndDate}</td><td>${formatSubmitDate}</td><td>${rentalapp.approved}</td><td><button type="button" id="delete" class="btn btn-secondary btn-sm" onclick="updateRentalAppApproval(${rentalapp.appID}, ${rentalapp.spaceID})">Approve</button></td></tr>`;
            }
        });
        html+="</table>";
        document.getElementById("unapprovedrentalapps").innerHTML = html;
        html = "<table class='table table-hover table-bordered'><tr><th>Firm Name</th><th>Application ID</th><th>Rented Space ID</th><th>Start Date</th><th>End Date</th><th>Submission Date</th><th>Approved</th></tr>";
        rentalapps.forEach(rentalapp => {
            var startDate = new Date(rentalapp.appStartDate);
            var formatStartDate = (startDate.getMonth()+1) + "/" + startDate.getDate() + "/" + startDate.getFullYear();
            var endDate = new Date(rentalapp.appEndDate);
            var formatEndDate = (endDate.getMonth()+1) + "/" + endDate.getDate() + "/" + endDate.getFullYear();
            var submitDate = new Date(rentalapp.appSubmitDate);
            var formatSubmitDate = (submitDate.getMonth()+1) + "/" + submitDate.getDate() + "/" + submitDate.getFullYear();
            html+=`<tr>`;
            html+=`<td>${rentalapp.firmName}</td><td>${rentalapp.appID}</td><td>${rentalapp.spaceID}</td><td>${formatStartDate}</td><td>${formatEndDate}</td><td>${formatSubmitDate}</td><td>${rentalapp.approved}</td></tr>`;
        });
        html+="</table>";
        document.getElementById("rentalapps").innerHTML = html;
    }).catch(function(error){
        console.log(error);
    });
}

function handleadminFirmViewTransactions(){
    // const admintransURL = "https://localhost:11001/api/Rental/GetTransactions";
    const admintransURL = "https://outsourcinggroup4client.herokuapp.com/api/Rental/GetTransactions";
    handleNavbar();
    // const employeesUrl = "https://localhost:11001/api/EmployeeLogin/GetEmps";
    const employeesUrl = "https://outsourcinggroup4client.herokuapp.com/api/EmployeeLogin/GetEmps";

    fetch(employeesUrl).then(function(response){
        return response.json();
    }).then(function(json){
        console.log(json);
        employees = json; 
    }).catch(function(error){
        console.log(error);
    });
    fetch(admintransURL).then(function(response){
        return response.json();
    }).then(function(json){
        console.log(json);
        var admintransactions = json;
        var html = "<table class='table table-hover table-bordered'><tr><th>Firm Name</th><th>Application ID</th><th>Rented Space ID</th><th>Start Date</th><th>End Date</th><th>Approval Date</th><th>Approved By</th></tr>";
        html += `<h4>All Transactions</h4>`;
        admintransactions.forEach(transaction => {
            employees.forEach(emp => {
                if(emp.empID == transaction.empID){
                    approveName = emp.fName + " " + emp.lName;
                }
            });
            var startDate = new Date(transaction.startDate);
            var formatStartDate = (startDate.getMonth()+1) + "/" + startDate.getDate() + "/" + startDate.getFullYear();
            var endDate = new Date(transaction.endDate);
            var formatEndDate = (endDate.getMonth()+1) + "/" + endDate.getDate() + "/" + endDate.getFullYear();
            var approvalDate = new Date(transaction.approvalDate);
            var formatApprovalDate = (approvalDate.getMonth()+1) + "/" + approvalDate.getDate() + "/" + approvalDate.getFullYear();
            html+=`<tr>`;
            html+=`<td>${transaction.firmName}</td><td>${transaction.appID}</td><td>${transaction.spaceID}</td><td>${formatStartDate}</td><td>${formatEndDate}</td><td>${formatApprovalDate}</td><td>${approveName}</td></tr>`;
        });
        html+="</table>";
        document.getElementById("admintransactions").innerHTML = html;
    }).catch(function(error){
        console.log(error);
    });
}

function postSpace(){
    var value = {
        size: document.getElementById("SpaceSize").value,
        monthlyPrice: document.getElementById("Price").value
    }
    // const appURL = "https://localhost:11001/api/Rental";
    const appURL = "https://outsourcinggroup4client.herokuapp.com/api/Rental";
    fetch(appURL, {
        method: "POST",
        headers: {
            "Accept": 'application/json',
            "Content-Type": 'application/json',
        },
        body: JSON.stringify(value)
    }).then(function(){
        // window.location.replace("../client/AdminViewRentals.html")
        window.location.replace(`https://outsourcinggroup4client.herokuapp.com/AdminViewRentals.html`)
    });
}