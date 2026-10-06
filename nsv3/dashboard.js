"use strict";


// ========================================
// AUTHENTICATION CHECK
// ========================================

if (!requireLogin()) {

    throw new Error(
        "Authentication required."
    );

}


// ========================================
// CURRENT USER
// ========================================

const user =
    getCurrentUser();


if (!user) {

    throw new Error(
        "No authenticated user found."
    );

}


// ========================================
// USER INFORMATION
// ========================================

const loggedUser =
    document.getElementById(
        "loggedUser"
    );


const welcome =
    document.getElementById(
        "welcome"
    );


const team =
    document.getElementById(
        "team"
    );


if (loggedUser) {

    loggedUser.textContent =
        user.username;

}


if (welcome) {

    welcome.textContent =
        `Welcome, ${user.username}`;

}


if (team) {

    team.textContent =
        `Team: ${user.team}`;

}


// ========================================
// PERFORMANCE DATA
// ========================================
//
// TEMPORARY DATA
//
// Replace this later with your actual
// performance data source.
//
// IMPORTANT:
// There is NO ?user= parameter here.
// The dashboard always uses the
// authenticated account.
// ========================================

const PERFORMANCE = {

    rosa01: {

        quality:
            "88.50%",

        productivity:
            "3.80",

        attendance:
            "100%",

        callouts:
            2

    },


    rafael01: {

        quality:
            "82.00%",

        productivity:
            "3.60",

        attendance:
            "100%",

        callouts:
            3

    },


    andrea01: {

        quality:
            "84.50%",

        productivity:
            "3.40",

        attendance:
            "100%",

        callouts:
            1

    },


    ehren01: {

        quality:
            "79.50%",

        productivity:
            "3.20",

        attendance:
            "95%",

        callouts:
            4

    }

};


// ========================================
// GET CURRENT USER PERFORMANCE
// ========================================

const performance =
    PERFORMANCE[
        user.username
    ];


// ========================================
// DISPLAY PERFORMANCE
// ========================================

if (performance) {


    const quality =
        document.getElementById(
            "quality"
        );


    const productivity =
        document.getElementById(
            "productivity"
        );


    const attendance =
        document.getElementById(
            "attendance"
        );


    const callouts =
        document.getElementById(
            "callouts"
        );


    if (quality) {

        quality.textContent =
            performance.quality;

    }


    if (productivity) {

        productivity.textContent =
            performance.productivity;

    }


    if (attendance) {

        attendance.textContent =
            performance.attendance;

    }


    if (callouts) {

        callouts.textContent =
            performance.callouts;

    }


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
                ).value;


            const newPin =
                document.getElementById(
                    "newPin"
                ).value;


            const confirmPin =
                document.getElementById(
                    "confirmPin"
                ).value;


            // Clear previous message

            pinMessage.textContent =
                "";


            // Disable button

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


                // Success

                pinMessage.textContent =
                    "PIN changed successfully.";

                pinMessage.style.color =
                    "#22c55e";


                // Clear inputs

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
