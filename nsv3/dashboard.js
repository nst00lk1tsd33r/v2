"use strict";


// ========================================
// AUTHENTICATION CHECK
// ========================================

const user =
    window.nsGetCurrentUser
        ? window.nsGetCurrentUser()
        : null;


if (!user) {

    window.location.href =
        "./index.html";

    throw new Error(
        "Authentication required."
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
        `Team: ${user.team || "No team assigned"}`;

}


// ========================================
// PERFORMANCE DATA
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

            if (
                window.nsLogout
            ) {

                window.nsLogout();

            }

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


            // --------------------------------
            // Clear old message
            // --------------------------------

            pinMessage.textContent =
                "";

            pinMessage.style.color =
                "";


            // --------------------------------
            // Disable button
            // --------------------------------

            changePinButton.disabled =
                true;

            changePinButton.textContent =
                "Changing PIN...";


            try {

                // --------------------------------
                // Check auth.js
                // --------------------------------

                if (
                    !window.nsChangePin
                ) {

                    throw new Error(
                        "PIN change system is not loaded. Please check auth.js."
                    );

                }


                // --------------------------------
                // Change PIN
                // --------------------------------

                await window.nsChangePin(

                    currentPin,

                    newPin,

                    confirmPin

                );


                // --------------------------------
                // Success
                // --------------------------------

                pinMessage.textContent =
                    "PIN changed successfully.";

                pinMessage.style.color =
                    "#22c55e";


                // --------------------------------
                // Clear inputs
                // --------------------------------

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
                    error.message ||
                    "Unable to change PIN.";


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
