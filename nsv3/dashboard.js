"use strict";


// ========================================
// REQUIRE LOGIN
// ========================================

if (!window.requireLogin()) {

    throw new Error(
        "Authentication required."
    );

}


// ========================================
// GET CURRENT USER
// ========================================

const user =
    window.nsGetCurrentUser();


if (!user) {

    window.location.href =
        "./index.html";

    throw new Error(
        "User session not found."
    );

}


// ========================================
// USERNAME
// ========================================

const loggedUser =
    document.getElementById(
        "loggedUser"
    );


if (loggedUser) {

    loggedUser.textContent =
        user.username;

}


// ========================================
// WELCOME
// ========================================

const welcome =
    document.getElementById(
        "welcome"
    );


if (welcome) {

    welcome.textContent =
        `Welcome, ${user.username}`;

}


// ========================================
// TEAM
// ========================================

const team =
    document.getElementById(
        "team"
    );


if (team) {

    team.textContent =
        `Team: ${user.team || "No team assigned"}`;

}


// ========================================
// PERFORMANCE
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
    PERFORMANCE[
        user.username
    ];


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


// ========================================
// LOGOUT
// ========================================

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            window.nsLogout();

        }
    );

}


// ========================================
// CHANGE PIN
// ========================================

const changePinButton =
    document.getElementById(
        "changePinButton"
    );


const pinMessage =
    document.getElementById(
        "pinMessage"
    );


if (changePinButton) {

    changePinButton.addEventListener(
        "click",
        async function () {

            const currentPin =
                document.getElementById(
                    "currentPin"
                ).value.trim();


            const newPin =
                document.getElementById(
                    "newPin"
                ).value.trim();


            const confirmPin =
                document.getElementById(
                    "confirmPin"
                ).value.trim();


            pinMessage.textContent =
                "";


            changePinButton.disabled =
                true;


            changePinButton.textContent =
                "Changing PIN...";


            try {

                await window.nsChangePin(

                    currentPin,

                    newPin,

                    confirmPin

                );


                pinMessage.textContent =
                    "PIN changed successfully.";

                pinMessage.style.color =
                    "#22c55e";


                document.getElementById(
                    "currentPin"
                ).value = "";


                document.getElementById(
                    "newPin"
                ).value = "";


                document.getElementById(
                    "confirmPin"
                ).value = "";


            } catch (error) {

                console.error(
                    "PIN CHANGE ERROR:",
                    error
                );


                pinMessage.textContent =
                    error.message;


                pinMessage.style.color =
                    "#ef4444";


            } finally {

                changePinButton.disabled =
                    false;


                changePinButton.textContent =
                    "Change PIN";

            }

        }
    );

}
