(function () {

    "use strict";


    // ==================================================
    // SETTINGS
    // ==================================================

    const SESSION_KEY =
        "nsToolkitUser";

    const SESSION_DURATION =
        10 * 60 * 60 * 1000; // 10 HOURS

    const DEVICE_KEY =
        "nsToolkitDevice";

    const DEVICE_OWNER_KEY =
        "nsToolkitDeviceOwner";

    const PIN_OVERRIDES_KEY =
        "nsToolkitPinOverrides";


    // ==================================================
    // SHA-256
    // ==================================================

    async function sha256(text) {

        const data =
            new TextEncoder().encode(text);

        const hashBuffer =
            await window.crypto.subtle.digest(
                "SHA-256",
                data
            );

        const hashArray =
            new Uint8Array(hashBuffer);

        let hash = "";

        for (
            let i = 0;
            i < hashArray.length;
            i++
        ) {

            hash +=
                hashArray[i]
                    .toString(16)
                    .padStart(2, "0");

        }

        return hash;

    }


    // ==================================================
    // DEVICE ID
    // ==================================================

    function getDeviceId() {

        let deviceId =
            localStorage.getItem(
                DEVICE_KEY
            );


        if (!deviceId) {

            if (
                window.crypto &&
                crypto.randomUUID
            ) {

                deviceId =
                    crypto.randomUUID();

            } else {

                deviceId =
                    "NS-" +
                    Date.now() +
                    "-" +
                    Math.random()
                        .toString(36)
                        .substring(2);

            }


            localStorage.setItem(
                DEVICE_KEY,
                deviceId
            );

        }


        return deviceId;

    }


    // ==================================================
    // DEVICE OWNER
    // ==================================================

    function getDeviceOwner() {

        return localStorage.getItem(
            DEVICE_OWNER_KEY
        );

    }


    function setDeviceOwner(username) {

        localStorage.setItem(
            DEVICE_OWNER_KEY,
            username
        );

    }


    // ==================================================
    // PIN OVERRIDES
    // ==================================================

    function getPinOverrides() {

        try {

            const saved =
                localStorage.getItem(
                    PIN_OVERRIDES_KEY
                );


            if (!saved) {

                return {};

            }


            return JSON.parse(saved) || {};

        } catch (error) {

            console.error(
                "PIN override error:",
                error
            );

            return {};

        }

    }


    function savePinOverrides(data) {

        localStorage.setItem(
            PIN_OVERRIDES_KEY,
            JSON.stringify(data)
        );

    }


    // ==================================================
    // FIND USER
    // ==================================================

    function findUser(username) {

        if (
            !Array.isArray(
                window.NS_USERS
            )
        ) {

            console.error(
                "NS_USERS was not loaded."
            );

            return null;

        }


        return window.NS_USERS.find(
            function (account) {

                return (
                    String(
                        account.username
                    )
                        .toLowerCase() ===
                    String(username)
                        .toLowerCase()
                );

            }
        );

    }


    // ==================================================
    // GET ACTIVE PIN HASH
    // ==================================================

    function getActivePinHash(user) {

        const overrides =
            getPinOverrides();


        if (
            overrides[user.username]
        ) {

            return overrides[
                user.username
            ];

        }


        return user.pinHash;

    }


    // ==================================================
    // CREATE SESSION
    // ==================================================

    function createSession(user) {

        const loginTime =
            Date.now();


        const expirationTime =
            loginTime +
            SESSION_DURATION;


        const session = {

            username:
                user.username,

            team:
                user.team,

            role:
                user.role,

            deviceId:
                getDeviceId(),

            loginTime:
                loginTime,

            expirationTime:
                expirationTime

        };


        sessionStorage.setItem(

            SESSION_KEY,

            JSON.stringify(
                session
            )

        );


        return session;

    }


    // ==================================================
    // GET CURRENT USER
    // ==================================================

    function getCurrentUser() {

        const saved =
            sessionStorage.getItem(
                SESSION_KEY
            );


        if (!saved) {

            return null;

        }


        try {

            const session =
                JSON.parse(saved);


            if (
                !session ||
                !session.username ||
                !session.expirationTime
            ) {

                sessionStorage.removeItem(
                    SESSION_KEY
                );

                return null;

            }


            // ------------------------------------------
            // SESSION EXPIRATION
            // ------------------------------------------

            if (
                Date.now() >=
                Number(
                    session.expirationTime
                )
            ) {

                sessionStorage.removeItem(
                    SESSION_KEY
                );

                return null;

            }


            // ------------------------------------------
            // DEVICE CHECK
            // ------------------------------------------

            const currentDevice =
                getDeviceId();


            if (
                session.deviceId &&
                session.deviceId !==
                currentDevice
            ) {

                sessionStorage.removeItem(
                    SESSION_KEY
                );

                return null;

            }


            // ------------------------------------------
            // DEVICE OWNER CHECK
            // ------------------------------------------

            const owner =
                getDeviceOwner();


            if (
                owner &&
                owner.toLowerCase() !==
                session.username.toLowerCase()
            ) {

                sessionStorage.removeItem(
                    SESSION_KEY
                );

                return null;

            }


            return session;


        } catch (error) {

            console.error(
                "Session error:",
                error
            );


            sessionStorage.removeItem(
                SESSION_KEY
            );


            return null;

        }

    }


    // ==================================================
    // REQUIRE LOGIN
    // ==================================================

    function requireLogin() {

        const user =
            getCurrentUser();


        if (!user) {

            window.location.href =
                "./index.html";

            return false;

        }


        return true;

    }


    // ==================================================
    // LOGIN
    // ==================================================

    async function performLogin() {

        const usernameInput =
            document.getElementById(
                "nsUsername"
            );


        const pinInput =
            document.getElementById(
                "nsPin"
            );


        const errorElement =
            document.getElementById(
                "nsLoginError"
            );


        const button =
            document.getElementById(
                "nsLoginButton"
            );


        const buttonText =
            document.getElementById(
                "nsLoginText"
            );


        const username =
            usernameInput.value
                .trim()
                .toLowerCase();


        const pin =
            pinInput.value.trim();


        errorElement.textContent =
            "";


        if (!username) {

            errorElement.textContent =
                "Please enter your username.";

            usernameInput.focus();

            return;

        }


        if (!pin) {

            errorElement.textContent =
                "Please enter your PIN.";

            pinInput.focus();

            return;

        }


        if (button) {

            button.disabled =
                true;

        }


        if (buttonText) {

            buttonText.textContent =
                "Checking...";

        }


        try {

            // ------------------------------------------
            // CHECK DEVICE OWNER
            // ------------------------------------------

            const deviceOwner =
                getDeviceOwner();


            if (
                deviceOwner &&
                deviceOwner.toLowerCase() !==
                username
            ) {

                errorElement.textContent =
                    "This device is already assigned to another account.";

                return;

            }


            // ------------------------------------------
            // FIND ACCOUNT
            // ------------------------------------------

            const user =
                findUser(username);


            if (!user) {

                errorElement.textContent =
                    "Invalid username or PIN.";

                pinInput.value =
                    "";

                pinInput.focus();

                return;

            }


            // ------------------------------------------
            // HASH PIN
            // ------------------------------------------

            const enteredHash =
                await sha256(pin);


            // ------------------------------------------
            // ACTIVE PIN
            // ------------------------------------------

            const activePinHash =
                getActivePinHash(user);


            // ------------------------------------------
            // VERIFY PIN
            // ------------------------------------------

            if (
                enteredHash !==
                activePinHash
            ) {

                errorElement.textContent =
                    "Invalid username or PIN.";

                pinInput.value =
                    "";

                pinInput.focus();

                return;

            }


            // ------------------------------------------
            // ASSIGN DEVICE
            // ------------------------------------------

            if (!deviceOwner) {

                setDeviceOwner(
                    user.username
                );

            }


            // ------------------------------------------
            // CREATE SESSION
            // ------------------------------------------

            const session =
                createSession(user);


            console.log(
                "LOGIN SUCCESS:",
                session
            );


            // ------------------------------------------
            // HIDE LOGIN
            // ------------------------------------------

            const overlay =
                document.getElementById(
                    "nsLoginOverlay"
                );


            if (overlay) {

                overlay.classList.add(
                    "ns-login-hidden"
                );

            }


            // ------------------------------------------
            // NOTIFY WEBSITE
            // ------------------------------------------

            document.dispatchEvent(

                new CustomEvent(
                    "nsLoginSuccess",
                    {
                        detail: session
                    }
                )

            );


        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );


            errorElement.textContent =
                "Unable to process login.";

        } finally {

            if (button) {

                button.disabled =
                    false;

            }


            if (buttonText) {

                buttonText.textContent =
                    "Sign In";

            }

        }

    }


    // ==================================================
    // CHANGE PIN
    // ==================================================

    async function changePin(
        currentPin,
        newPin,
        confirmPin
    ) {

        const currentUser =
            getCurrentUser();


        if (!currentUser) {

            throw new Error(
                "Your session has expired. Please log in again."
            );

        }


        if (!currentPin) {

            throw new Error(
                "Please enter your current PIN."
            );

        }


        if (!newPin) {

            throw new Error(
                "Please enter your new PIN."
            );

        }


        if (newPin.length < 4) {

            throw new Error(
                "New PIN must be at least 4 characters."
            );

        }


        if (
            newPin !==
            confirmPin
        ) {

            throw new Error(
                "New PINs do not match."
            );

        }


        // ------------------------------------------
        // FIND CURRENT USER
        // ------------------------------------------

        const user =
            findUser(
                currentUser.username
            );


        if (!user) {

            throw new Error(
                "Account could not be found."
            );

        }


        // ------------------------------------------
        // VERIFY CURRENT PIN
        // ------------------------------------------

        const currentHash =
            await sha256(
                currentPin
            );


        const activeHash =
            getActivePinHash(user);


        if (
            currentHash !==
            activeHash
        ) {

            throw new Error(
                "Current PIN is incorrect."
            );

        }


        // ------------------------------------------
        // HASH NEW PIN
        // ------------------------------------------

        const newHash =
            await sha256(
                newPin
            );


        // ------------------------------------------
        // SAVE OVERRIDE
        // ------------------------------------------

        const overrides =
            getPinOverrides();


        overrides[
            user.username
        ] =
            newHash;


        savePinOverrides(
            overrides
        );


        console.log(
            "PIN changed successfully for:",
            user.username
        );


        return true;

    }


    // ==================================================
    // LOGOUT
    // ==================================================

    function logout() {

        sessionStorage.removeItem(
            SESSION_KEY
        );


        window.location.href =
            "./index.html";

    }


    // ==================================================
    // INITIALIZE LOGIN PAGE
    // ==================================================

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            const overlay =
                document.getElementById(
                    "nsLoginOverlay"
                );


            // ------------------------------------------
            // If this isn't the login page,
            // don't do login-page initialization.
            // ------------------------------------------

            if (!overlay) {

                return;

            }


            // ------------------------------------------
            // Existing session
            // ------------------------------------------

            const currentUser =
                getCurrentUser();


            if (currentUser) {

                overlay.classList.add(
                    "ns-login-hidden"
                );

            }


            // ------------------------------------------
            // Login button
            // ------------------------------------------

            const loginButton =
                document.getElementById(
                    "nsLoginButton"
                );


            if (loginButton) {

                loginButton.addEventListener(
                    "click",
                    performLogin
                );

            }


            // ------------------------------------------
            // Enter - Username
            // ------------------------------------------

            const usernameInput =
                document.getElementById(
                    "nsUsername"
                );


            if (usernameInput) {

                usernameInput.addEventListener(
                    "keydown",
                    function (event) {

                        if (
                            event.key ===
                            "Enter"
                        ) {

                            performLogin();

                        }

                    }
                );

            }


            // ------------------------------------------
            // Enter - PIN
            // ------------------------------------------

            const pinInput =
                document.getElementById(
                    "nsPin"
                );


            if (pinInput) {

                pinInput.addEventListener(
                    "keydown",
                    function (event) {

                        if (
                            event.key ===
                            "Enter"
                        ) {

                            performLogin();

                        }

                    }
                );

            }


            // ------------------------------------------
            // PIN visibility
            // ------------------------------------------

            const toggle =
                document.getElementById(
                    "nsTogglePin"
                );


            if (
                toggle &&
                pinInput
            ) {

                toggle.addEventListener(
                    "click",
                    function () {

                        if (
                            pinInput.type ===
                            "password"
                        ) {

                            pinInput.type =
                                "text";

                            toggle.textContent =
                                "Hide";

                        } else {

                            pinInput.type =
                                "password";

                            toggle.textContent =
                                "Show";

                        }

                    }
                );

            }

        }
    );


    // ==================================================
    // GLOBAL FUNCTIONS
    // ==================================================

    window.nsGetCurrentUser =
        getCurrentUser;


    window.nsLogout =
        logout;


    window.nsLogin =
        performLogin;


    window.nsChangePin =
        changePin;


    window.requireLogin =
        requireLogin;


    window.nsGetDeviceId =
        getDeviceId;


})();
