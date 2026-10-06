(function () {

    "use strict";


    // =========================================
    // USERS
    // Loaded from ./data/users.js
    // =========================================

    const USERS =
        window.NS_USERS || [];


    // =========================================
    // STORAGE SETTINGS
    // =========================================

    const SESSION_KEY =
        "nsToolkitUser";

    const DEVICE_KEY =
        "nsToolkitDevice";

    const DEVICE_OWNER_KEY =
        "nsToolkitDeviceOwner";

    const PIN_OVERRIDES_KEY =
        "nsToolkitPinOverrides";

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
    // DEVICE ID
    // =========================================

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


    // =========================================
    // DEVICE OWNER
    // =========================================

    function getDeviceOwner() {

        return localStorage.getItem(
            DEVICE_OWNER_KEY
        );

    }


    // =========================================
    // CHECK DEVICE
    // =========================================

    function isDeviceAllowed(username) {

        const owner =
            getDeviceOwner();


        // Device has never been assigned
        if (!owner) {

            return true;

        }


        // Same user is allowed
        return (
            owner.toLowerCase() ===
            username.toLowerCase()
        );

    }


    // =========================================
    // ASSIGN DEVICE
    // =========================================

    function assignDevice(username) {

        const existingOwner =
            getDeviceOwner();


        // Someone already owns this device
        if (existingOwner) {

            if (
                existingOwner.toLowerCase() !==
                username.toLowerCase()
            ) {

                throw new Error(
                    "This device is already assigned to another account."
                );

            }

            return;

        }


        localStorage.setItem(
            DEVICE_OWNER_KEY,
            username
        );

    }


    // =========================================
    // PIN OVERRIDES
    // =========================================

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
                "Unable to read PIN overrides:",
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


    // =========================================
    // GET ACTIVE PIN HASH
    // =========================================

    function getStoredPinHash(user) {

        const overrides =
            getPinOverrides();


        /*
         * If the user has changed their PIN,
         * the local PIN takes priority.
         */

        if (
            overrides[user.username]
        ) {

            return overrides[
                user.username
            ];

        }


        // Otherwise use original users.js PIN
        return user.pinHash;

    }


    // =========================================
    // GET CURRENT USER / SESSION
    // =========================================

    function getCurrentUser() {

        const saved =
            localStorage.getItem(
                SESSION_KEY
            );


        if (!saved) {

            return null;

        }


        try {

            const session =
                JSON.parse(saved);


            // ---------------------------------
            // Validate session
            // ---------------------------------

            if (
                !session ||
                !session.username ||
                !session.loginTime ||
                !session.expirationTime ||
                !session.deviceId
            ) {

                localStorage.removeItem(
                    SESSION_KEY
                );

                return null;

            }


            // ---------------------------------
            // Check expiration
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
            // Check device ID
            // ---------------------------------

            const currentDevice =
                getDeviceId();


            if (
                session.deviceId !==
                currentDevice
            ) {

                localStorage.removeItem(
                    SESSION_KEY
                );

                return null;

            }


            // ---------------------------------
            // Check device owner
            // ---------------------------------

            const owner =
                getDeviceOwner();


            if (
                owner &&
                owner.toLowerCase() !==
                session.username.toLowerCase()
            ) {

                localStorage.removeItem(
                    SESSION_KEY
                );

                return null;

            }


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


        // -------------------------------------
        // Username
        // -------------------------------------

        if (!username) {

            error.textContent =
                "Enter your username.";

            return;

        }


        // -------------------------------------
        // PIN
        // -------------------------------------

        if (!pin) {

            error.textContent =
                "Enter your PIN.";

            return;

        }


        try {

            // ---------------------------------
            // Device
            // ---------------------------------

            const deviceId =
                getDeviceId();


            // ---------------------------------
            // Check device ownership BEFORE
            // checking another account
            // ---------------------------------

            if (
                !isDeviceAllowed(username)
            ) {

                error.textContent =
                    "This device is already assigned to another account.";

                return;

            }


            // ---------------------------------
            // Find username
            // ---------------------------------

            const user =
                USERS.find(
                    account =>
                        account.username
                            .toLowerCase() ===
                        username
                );


            if (!user) {

                error.textContent =
                    "Invalid username or PIN.";

                return;

            }


            // ---------------------------------
            // Hash entered PIN
            // ---------------------------------

            const hash =
                await sha256(pin);


            // ---------------------------------
            // Get active PIN
            // ---------------------------------

            const storedPinHash =
                getStoredPinHash(user);


            // ---------------------------------
            // Verify PIN
            // ---------------------------------

            if (
                storedPinHash !==
                hash
            ) {

                error.textContent =
                    "Invalid username or PIN.";

                return;

            }


            // ---------------------------------
            // Assign this browser/device
            // ---------------------------------

            assignDevice(
                user.username
            );


            // ---------------------------------
            // Create session
            // ---------------------------------

            const now =
                Date.now();


            const session = {

                username:
                    user.username,

                team:
                    user.team,

                role:
                    user.role,

                deviceId:
                    deviceId,

                loginTime:
                    now,

                expirationTime:
                    now +
                    SESSION_DURATION

            };


            // ---------------------------------
            // Save session
            // ---------------------------------

            localStorage.setItem(
                SESSION_KEY,
                JSON.stringify(
                    session
                )
            );


            // ---------------------------------
            // Hide login
            // ---------------------------------

            const overlay =
                document.getElementById(
                    "nsLoginOverlay"
                );


            if (overlay) {

                overlay.classList.add(
                    "ns-login-hidden"
                );

            }


            // ---------------------------------
            // Clear PIN field
            // ---------------------------------

            const pinInput =
                document.getElementById(
                    "nsPin"
                );


            if (pinInput) {

                pinInput.value = "";

            }


            // ---------------------------------
            // Login success event
            // ---------------------------------

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
    // CHANGE PIN
    // =========================================

    async function changePin(
        currentPin,
        newPin,
        confirmPin
    ) {

        const currentUser =
            getCurrentUser();


        if (!currentUser) {

            throw new Error(
                "You must be logged in to change your PIN."
            );

        }


        // -------------------------------------
        // Validate current PIN
        // -------------------------------------

        if (!currentPin) {

            throw new Error(
                "Enter your current PIN."
            );

        }


        // -------------------------------------
        // Validate new PIN
        // -------------------------------------

        if (!newPin) {

            throw new Error(
                "Enter your new PIN."
            );

        }


        if (newPin.length < 4) {

            throw new Error(
                "PIN must be at least 4 characters."
            );

        }


        if (newPin !== confirmPin) {

            throw new Error(
                "New PINs do not match."
            );

        }


        // -------------------------------------
        // Find current account
        // -------------------------------------

        const user =
            USERS.find(
                account =>
                    account.username
                        .toLowerCase() ===
                    currentUser.username
                        .toLowerCase()
            );


        if (!user) {

            throw new Error(
                "Account could not be found."
            );

        }


        // -------------------------------------
        // Verify current PIN
        // -------------------------------------

        const currentHash =
            await sha256(
                currentPin
            );


        const storedHash =
            getStoredPinHash(user);


        if (
            currentHash !==
            storedHash
        ) {

            throw new Error(
                "Current PIN is incorrect."
            );

        }


        // -------------------------------------
        // Hash new PIN
        // -------------------------------------

        const newHash =
            await sha256(
                newPin
            );


        // -------------------------------------
        // Save new PIN locally
        // -------------------------------------

        const overrides =
            getPinOverrides();


        overrides[
            user.username
        ] =
            newHash;


        savePinOverrides(
            overrides
        );


        return true;

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
    // RESET DEVICE BINDING
    // =========================================

    function resetDeviceBinding() {

        localStorage.removeItem(
            DEVICE_OWNER_KEY
        );

        localStorage.removeItem(
            SESSION_KEY
        );

    }


    // =========================================
    // START
    // =========================================

    document.addEventListener(
        "DOMContentLoaded",
        function () {


            // ---------------------------------
            // Existing session
            // ---------------------------------

            const currentUser =
                getCurrentUser();


            if (currentUser) {

                console.log(
                    "Existing session found:",
                    currentUser
                );


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


            // ---------------------------------
            // Login button
            // ---------------------------------

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


            // ---------------------------------
            // Enter - Username
            // ---------------------------------

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


            // ---------------------------------
            // Enter - PIN
            // ---------------------------------

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


    window.nsChangePin =
        changePin;


    window.nsGetDeviceId =
        getDeviceId;


    window.nsResetDeviceBinding =
        resetDeviceBinding;


})();
