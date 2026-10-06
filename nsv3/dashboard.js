"use strict";

/* =========================================================
   DASHBOARD AUTHENTICATION
========================================================= */

const user = window.nsGetCurrentUser
    ? window.nsGetCurrentUser()
    : null;


/* =========================================================
   NO ACTIVE SESSION
========================================================= */

if (!user) {

    window.location.replace("./index.html");

    throw new Error(
        "User session not found."
    );

}


/* =========================================================
   USERNAME
========================================================= */

const loggedUser =
    document.getElementById("loggedUser");

if (loggedUser) {

    loggedUser.textContent =
        user.username;

}


/* =========================================================
   WELCOME
========================================================= */

const welcome =
    document.getElementById("welcome");

if (welcome) {

    welcome.textContent =
        `Welcome, ${user.username}`;

}


/* =========================================================
   TEAM
========================================================= */

const team =
    document.getElementById("team");

if (team) {

    team.textContent =
        `Team: ${user.team || "No team assigned"}`;

}


/* =========================================================
   PERFORMANCE DATA
========================================================= */

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

    const quality =
        document.getElementById("quality");

    const productivity =
        document.getElementById("productivity");

    const attendance =
        document.getElementById("attendance");

    const callouts =
        document.getElementById("callouts");


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


/* =========================================================
   LOGOUT
========================================================= */

const logoutButton =
    document.getElementById("logoutButton");


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            if (typeof window.nsLogout === "function") {

                window.nsLogout();

            } else {

                console.error(
                    "nsLogout() is not available."
                );

                window.location.replace(
                    "./index.html"
                );

            }

        }
    );

}


/* =========================================================
   CHANGE PIN
========================================================= */

const changePinButton =
    document.getElementById("changePinButton");

const pinMessage =
    document.getElementById("pinMessage");


if (changePinButton) {

    changePinButton.addEventListener(
        "click",
        async function () {

            const currentPinInput =
                document.getElementById("currentPin");

            const newPinInput =
                document.getElementById("newPin");

            const confirmPinInput =
                document.getElementById("confirmPin");


            if (
                !currentPinInput ||
                !newPinInput ||
                !confirmPinInput
            ) {

                return;

            }


            const currentPin =
                currentPinInput.value.trim();

            const newPin =
                newPinInput.value.trim();

            const confirmPin =
                confirmPinInput.value.trim();


            if (pinMessage) {

                pinMessage.textContent =
                    "";

            }


            changePinButton.disabled =
                true;

            changePinButton.textContent =
                "Changing PIN...";


            try {

                if (
                    typeof window.nsChangePin !==
                    "function"
                ) {

                    throw new Error(
                        "PIN change function is not available."
                    );

                }


                await window.nsChangePin(

                    currentPin,

                    newPin,

                    confirmPin

                );


                if (pinMessage) {

                    pinMessage.textContent =
                        "PIN changed successfully.";

                    pinMessage.style.color =
                        "#22c55e";

                }


                currentPinInput.value =
                    "";

                newPinInput.value =
                    "";

                confirmPinInput.value =
                    "";


            } catch (error) {

                console.error(
                    "PIN CHANGE ERROR:",
                    error
                );


                if (pinMessage) {

                    pinMessage.textContent =
                        error.message ||
                        "Unable to change PIN.";

                    pinMessage.style.color =
                        "#ef4444";

                }

            } finally {

                changePinButton.disabled =
                    false;

                changePinButton.textContent =
                    "Change PIN";

            }

        }
    );

}
