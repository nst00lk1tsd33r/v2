if (!requireLogin()) {

    throw new Error(
        "Authentication required."
    );

}


const user =
    getCurrentUser();


document.getElementById(
    "loggedUser"
).textContent =
    user.username;


document.getElementById(
    "welcome"
).textContent =
    `Welcome, ${user.username}`;


document.getElementById(
    "team"
).textContent =
    `Team: ${user.team}`;


// ========================================
// TEMPORARY DATA
// ========================================

const PERFORMANCE = {

    rosa01: {

        quality: "88.50%",

        productivity: "3.80",

        attendance: "100%",

        callouts: 2

    },


    rafael01: {

        quality: "82.00%",

        productivity: "3.60",

        attendance: "100%",

        callouts: 3

    },


    andrea01: {

        quality: "84.50%",

        productivity: "3.40",

        attendance: "100%",

        callouts: 1

    },


    ehren01: {

        quality: "79.50%",

        productivity: "3.20",

        attendance: "95%",

        callouts: 4

    }

};


const performance =
    PERFORMANCE[user.username];


if (performance) {

    document.getElementById(
        "quality"
    ).textContent =
        performance.quality;


    document.getElementById(
        "productivity"
    ).textContent =
        performance.productivity;


    document.getElementById(
        "attendance"
    ).textContent =
        performance.attendance;


    document.getElementById(
        "callouts"
    ).textContent =
        performance.callouts;

}