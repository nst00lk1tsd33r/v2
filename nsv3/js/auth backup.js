(function () {

    "use strict";


    // =========================================
    // USERS
    // Loaded from ./data/users.js
    // =========================================

    const USERS =
        window.NS_USERS || [];



    // =========================================
    // SESSION SETTINGS
    // =========================================

    const SESSION_KEY =
        "nsToolkitUser";

    const SESSION_DURATION =
        10 * 60 * 60 * 1000; // 10 HOURS



    // =========================================
    // SHA-256
    // =========================================

    async function sha256(value) {

        const buffer =
            new TextEncoder().encode(value);


        const hash =
            await crypto.subtle.digest(
                "SHA-256",
                buffer
            );


        return Array
            .from(
                new Uint8Array(hash)
            )
            .map(
                byte =>
                    byte
                        .toString(16)
                        .padStart(2, "0")
            )
            .join("");

    }



    // =========================================
    // GET CURRENT USER / SESSION
    // =========================================

    function getCurrentUser() {

        const saved =
            localStorage.getItem(
                SESSION_KEY
            );


        // -------------------------------------
        // No existing session
        // -------------------------------------

        if (!saved) {

            return null;

        }


        try {

            const session =
                JSON.parse(saved);


            // ---------------------------------
            // Invalid session
            // ---------------------------------

            if (
                !session ||
                !session.username ||
                !session.loginTime ||
                !session.expirationTime
            ) {

                localStorage.removeItem(
                    SESSION_KEY
                );

                return null;

            }


            // ---------------------------------
            // Check 10-hour expiration
            // ---------------------------------

            if (
                Date.now() >=
                Number(
                    session.expirationTime
                )
            ) {

                console.log(
                    "NS Toolkit session expired."
                );


                localStorage.removeItem(
                    SESSION_KEY
                );


                return null;

            }


            // ---------------------------------
            // Session still valid
            // ---------------------------------

            return session;


        } catch (error) {

            console.error(
                "Invalid session data:",
                error
            );


            localStorage.removeItem(
                SESSION_KEY
            );


            return null;

        }

    }



    // =========================================
    // LOGIN
    // =========================================

    async function login() {

        const username =
            document
                .getElementById(
                    "nsUsername"
                )
                .value
                .trim()
                .toLowerCase();


        const pin =
            document
                .getElementById(
                    "nsPin"
                )
                .value
                .trim();


        const error =
            document.getElementById(
                "nsLoginError"
            );


        error.textContent = "";



        // =====================================
        // VALIDATE USERNAME
        // =====================================

        if (!username) {

            error.textContent =
                "Enter your username.";

            return;

        }



        // =====================================
        // VALIDATE PIN
        // =====================================

        if (!pin) {

            error.textContent =
                "Enter your PIN.";

            return;

        }



        try {

            // =================================
            // HASH PIN
            // =================================

            const hash =
                await sha256(pin);



            console.log(
                "Entered username:",
                username
            );


            console.log(
                "Entered PIN hash:",
                hash
            );


            console.log(
                "Available users:",
                USERS
            );



            // =================================
            // FIND USER
            // =================================

            const user =
                USERS.find(
                    account =>
                        account.username
                            .toLowerCase() ===
                        username
                        &&
                        account.pinHash ===
                        hash
                );



            // =================================
            // INVALID LOGIN
            // =================================

            if (!user) {

                error.textContent =
                    "Invalid username or PIN.";

                return;

            }



            // =================================
            // CREATE 10-HOUR SESSION
            // =================================

            const now =
                Date.now();


            const session = {

                username:
                    user.username,

                team:
                    user.team,

                role:
                    user.role,

                loginTime:
                    now,

                expirationTime:
                    now +
                    SESSION_DURATION

            };



            // =================================
            // SAVE SESSION
            // =================================

            localStorage.setItem(
                SESSION_KEY,
                JSON.stringify(
                    session
                )
            );


            console.log(
                "LOGIN SUCCESS",
                session
            );



            // =================================
            // HIDE LOGIN
            // =================================

            const overlay =
                document.getElementById(
                    "nsLoginOverlay"
                );


            if (overlay) {

                overlay.classList.add(
                    "ns-login-hidden"
                );

            }



            // =================================
            // CLEAR PIN
            // =================================

            const pinInput =
                document.getElementById(
                    "nsPin"
                );


            if (pinInput) {

                pinInput.value = "";

            }



            // =================================
            // LOGIN SUCCESS EVENT
            // =================================

            document.dispatchEvent(
                new CustomEvent(
                    "nsLoginSuccess",
                    {
                        detail: session
                    }
                )
            );


        } catch (err) {

            console.error(
                "LOGIN ERROR:",
                err
            );


            error.textContent =
                "Login error: " +
                err.message;

        }

    }



    // =========================================
    // LOGOUT
    // =========================================

    function logout() {

        localStorage.removeItem(
            SESSION_KEY
        );


        console.log(
            "NS Toolkit user logged out."
        );


        window.location.href =
            "./index.html";

    }



    // =========================================
    // START
    // =========================================

    document.addEventListener(
        "DOMContentLoaded",
        function () {


            // =================================
            // CHECK EXISTING SESSION
            // =================================

            const currentUser =
                getCurrentUser();


            if (currentUser) {

                console.log(
                    "Existing session found:",
                    currentUser
                );


                // -----------------------------
                // User is already logged in
                // -----------------------------

                const overlay =
                    document.getElementById(
                        "nsLoginOverlay"
                    );


                if (overlay) {

                    overlay.classList.add(
                        "ns-login-hidden"
                    );

                }

            }



            // =================================
            // LOGIN BUTTON
            // =================================

            const button =
                document.getElementById(
                    "nsLoginButton"
                );


            if (!button) {

                console.error(
                    "nsLoginButton was not found."
                );

                return;

            }


            button.addEventListener(
                "click",
                login
            );



            // =================================
            // ENTER KEY - USERNAME
            // =================================

            document
                .getElementById(
                    "nsUsername"
                )
                ?.addEventListener(
                    "keydown",
                    event => {

                        if (
                            event.key ===
                            "Enter"
                        ) {

                            login();

                        }

                    }
                );



            // =================================
            // ENTER KEY - PIN
            // =================================

            document
                .getElementById(
                    "nsPin"
                )
                ?.addEventListener(
                    "keydown",
                    event => {

                        if (
                            event.key ===
                            "Enter"
                        ) {

                            login();

                        }

                    }
                );

        }
    );



    // =========================================
    // GLOBAL FUNCTIONS
    // =========================================

    window.nsGetCurrentUser =
        getCurrentUser;


    window.nsLogout =
        logout;


    window.nsLogin =
        login;


})();
