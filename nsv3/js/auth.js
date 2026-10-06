```javascript
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


        // -------------------------------------
        // Generate device ID if none exists
        // -------------------------------------

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
    // CHECK DEVICE ACCESS
    // =========================================

    function isDeviceAllowed(username) {

        const owner =
            getDeviceOwner();


        // -------------------------------------
        // Device has never been assigned
        // -------------------------------------

        if (!owner) {

            return true;

        }


        // -------------------------------------
        // Device already belongs to this user
        // -------------------------------------

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


        // Do not overwrite another owner
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
    // GET PIN HASH
    // =========================================

    function getStoredPinHash(user) {

        const overrides =
            getPinOverrides();


        /*
         * If the user changed their PIN,
         * use the local PIN hash.
         */

        if (
            overrides[user.username]
        ) {

            return overrides[
                user.username
            ];

        }


        /*
         * Otherwise use the original
         * hash from users.js.
         */

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
                !session.expirationTime ||
                !session.deviceId
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
            // Check device
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
            // GET DEVICE
            // =================================

            const deviceId =
                getDeviceId();


            // =================================
            // CHECK DEVICE OWNER
            // =================================

            if (
                !isDeviceAllowed(username)
            ) {

                error.textContent =
                    "This device is already assigned to another account.";

                return;

            }


            // =================================
            // HASH PIN
            // =================================

            const hash =
                await sha256(pin);



            // =================================
            // FIND USERNAME
            // =================================

            const user =
                USERS.find(
                    account =>
                        account.username
                            .toLowerCase() ===
                        username
                );


            // =================================
            // INVALID USERNAME
            // =================================

            if (!user) {

                error.textContent =
                    "Invalid username or PIN.";

                return;

            }


            // =================================
            // CHECK PIN
            // =================================

            const storedPinHash =
                getStoredPinHash(user);


            if (
                storedPinHash !==
                hash
            ) {

                error.textContent =
                    "Invalid username or PIN.";

                return;

            }


            // =================================
            // ASSIGN DEVICE
            // =================================

            assignDevice(
                user.username
            );


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

                deviceId:
                    deviceId,

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
        // Find account
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
        // Save local PIN override
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
    // RESET DEVICE
    // =========================================

    /*
     * This removes the device assignment.
     *
     * IMPORTANT:
     * Do not expose this function as a normal
     * public button unless you specifically want
     * users to be able to move their account.
     */

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


    window.nsChangePin =
        changePin;


    window.nsGetDeviceId =
        getDeviceId;


    window.nsResetDeviceBinding =
        resetDeviceBinding;


})();
```

### Add this to your Settings page

You can create a simple settings section anywhere inside your existing dashboard:

```html
<section class="settings-panel">

    <h2>Account Settings</h2>

    <div class="setting-group">

        <label for="currentPin">
            Current PIN
        </label>

        <input
            type="password"
            id="currentPin"
            placeholder="Enter current PIN"
            autocomplete="current-password"
        >

    </div>


    <div class="setting-group">

        <label for="newPin">
            New PIN
        </label>

        <input
            type="password"
            id="newPin"
            placeholder="Enter new PIN"
            autocomplete="new-password"
        >

    </div>


    <div class="setting-group">

        <label for="confirmPin">
            Confirm New PIN
        </label>

        <input
            type="password"
            id="confirmPin"
            placeholder="Confirm new PIN"
            autocomplete="new-password"
        >

    </div>


    <button
        type="button"
        id="changePinButton"
    >
        Change PIN
    </button>


    <div id="pinMessage"></div>

</section>
```

Then add:

```javascript
document.addEventListener(
    "DOMContentLoaded",
    function () {

        const button =
            document.getElementById(
                "changePinButton"
            );

        const message =
            document.getElementById(
                "pinMessage"
            );


        if (!button) {
            return;
        }


        button.addEventListener(
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


                message.textContent = "";


                try {

                    await window.nsChangePin(
                        currentPin,
                        newPin,
                        confirmPin
                    );


                    message.textContent =
                        "PIN changed successfully.";


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

                    message.textContent =
                        error.message;

                }

            }
        );

    }
);
```

### How the new behavior works

**First device:**

```text
User A
   ↓
Username + original PIN
   ↓
Valid
   ↓
Device ID generated
   ↓
Device assigned to User A
```

After that, the browser stores:

```text
nsToolkitDevice
nsToolkitDeviceOwner
nsToolkitUser
```

If somebody tries:

```text
User B + User B PIN
```

on that same browser/device, they get:

> This device is already assigned to another account.

They cannot simply use a URL such as:

```text
dashboard.html?user=anotheruser
```

because your dashboard should use:

```javascript
const username = currentUser.username;
```

rather than accepting a username from the URL.

### PIN change

When User A changes their PIN:

```text
Old PIN
   ↓
Verify against existing hash
   ↓
New PIN
   ↓
SHA-256
   ↓
localStorage
```

The original `users.js` PIN doesn't have to be modified. The local override takes precedence for that browser.

One important limitation: **localStorage cannot provide true one-device security**. A user who knows how to use browser developer tools can delete `nsToolkitDeviceOwner` or modify localStorage. For a GitHub/static website, there is no trusted server enforcing the device restriction. Your existing authentication is also fundamentally client-side because the users are loaded from `window.NS_USERS`.

So this is appropriate for **preventing normal account switching and tying an account to one browser**, but not for high-security authentication.
