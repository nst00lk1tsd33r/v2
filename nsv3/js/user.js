if (!requireLogin()) {

    throw new Error(
        "Authentication required."
    );

}


const currentUser =
    getCurrentUser();


const params =
    new URLSearchParams(
        window.location.search
    );


const requestedUser =
    params.get("user");


const username =
    requestedUser ||
    currentUser.username;


document.getElementById(
    "username"
).textContent =
    username;


// Temporary performance data

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

    }

};


const data =
    PERFORMANCE[username];


if (data) {

    document.getElementById(
        "quality"
    ).textContent =
        data.quality;


    document.getElementById(
        "productivity"
    ).textContent =
        data.productivity;


    document.getElementById(
        "attendance"
    ).textContent =
        data.attendance;


    document.getElementById(
        "callouts"
    ).textContent =
        data.callouts;

}