(function () {

    "use strict";


    // ==========================================
    // NS TOOLKITS
    // LOGIN ACCESS GUARD
    // ==========================================


    // ==========================================
    // SESSION SETTINGS
    // ==========================================

    const SESSION_KEY =
        "nsToolkitUser";


    // 10 HOURS
    const SESSION_DURATION =
        10 * 60 * 60 * 1000;



    // ==========================================
    // LOGIN PAGE
    // ==========================================

    const LOGIN_PAGE =
        new URL(
            "./index.html",
            window.location.href
        ).href;



    // ==========================================
    // GET SESSION
    // ==========================================

    function getSavedSession() {

        /*
         * IMPORTANT:
         *
         * auth.js stores the login session
         * inside sessionStorage.
         *
         * Do NOT use localStorage here.
         */

        return sessionStorage.getItem(
            SESSION_KEY
        );

    }



    // ==========================================
    // REMOVE SESSION
    // ==========================================

    function clearSession() {

        sessionStorage.removeItem(
            SESSION_KEY
        );

    }



    // ==========================================
    // CHECK LOGIN
    // ==========================================

    function checkAuthentication() {

        const savedSession =
            getSavedSession();


        // --------------------------------------
        // NO SESSION
        // --------------------------------------

        if (!savedSession) {

            redirectToMainPage();

            return false;

        }


        let session;


        // --------------------------------------
        // READ SESSION
        // --------------------------------------

        try {

            session =
                JSON.parse(
                    savedSession
                );

        } catch (error) {

            console.error(
                "Invalid NS ToolKits session."
            );


            clearSession();

            redirectToMainPage();

            return false;

        }


        // --------------------------------------
        // BASIC SESSION VALIDATION
        // --------------------------------------

        if (
            !session ||
            typeof session !== "object" ||
            !session.username ||
            !session.loginTime ||
            !session.expirationTime
        ) {

            console.warn(
                "Incomplete NS ToolKits session."
            );


            clearSession();

            redirectToMainPage();

            return false;

        }


        // --------------------------------------
        // CONVERT VALUES TO NUMBERS
        // --------------------------------------

        const loginTime =
            Number(
                session.loginTime
            );

        const expirationTime =
            Number(
                session.expirationTime
            );


        // --------------------------------------
        // INVALID SESSION TIMES
        // --------------------------------------

        if (
            !Number.isFinite(loginTime) ||
            !Number.isFinite(expirationTime)
        ) {

            console.warn(
                "Invalid NS ToolKits session timestamps."
            );


            clearSession();

            redirectToMainPage();

            return false;

        }


        // --------------------------------------
        // MAKE SURE EXPIRATION IS AFTER LOGIN
        // --------------------------------------

        if (
            expirationTime <=
            loginTime
        ) {

            console.warn(
                "Invalid NS ToolKits expiration time."
            );


            clearSession();

            redirectToMainPage();

            return false;

        }


        // --------------------------------------
        // OPTIONAL SAFETY CHECK
        // --------------------------------------
        //
        // The session should be approximately
        // 10 hours long.
        //
        // We allow a small tolerance instead of
        // rejecting a legitimate session because
        // of a minor timestamp difference.
        //

        const sessionLength =
            expirationTime -
            loginTime;

        const tolerance =
            60 * 1000;


        if (
            sessionLength >
            SESSION_DURATION + tolerance
        ) {

            console.warn(
                "Invalid NS ToolKits session duration."
            );


            clearSession();

            redirectToMainPage();

            return false;

        }


        // --------------------------------------
        // CHECK EXPIRATION
        // --------------------------------------

        const now =
            Date.now();


        if (
            now >=
            expirationTime
        ) {

            console.log(
                "NS ToolKits session expired."
            );


            clearSession();

            redirectToMainPage();

            return false;

        }


        // --------------------------------------
        // SESSION IS VALID
        // --------------------------------------

        return true;

    }



    // ==========================================
    // REDIRECT TO LOGIN
    // ==========================================

    function redirectToMainPage() {

        const currentPath =
            window.location.pathname;


        const loginPath =
            new URL(
                "./index.html",
                window.location.href
            ).pathname;


        // --------------------------------------
        // ALREADY ON LOGIN PAGE
        // --------------------------------------

        if (
            currentPath ===
                loginPath ||

            currentPath.endsWith(
                "/index.html"
            )
        ) {

            return;

        }


        // --------------------------------------
        // REDIRECT
        // --------------------------------------

        window.location.replace(
            LOGIN_PAGE
        );

    }



    // ==========================================
    // CHECK IMMEDIATELY
    // ==========================================

    checkAuthentication();



    // ==========================================
    // CHECK WHEN TAB BECOMES ACTIVE
    // ==========================================

    document.addEventListener(
        "visibilitychange",
        function () {

            if (
                document.visibilityState ===
                "visible"
            ) {

                checkAuthentication();

            }

        }
    );



    // ==========================================
    // CHECK WHEN WINDOW GETS FOCUS
    // ==========================================

    window.addEventListener(
        "focus",
        function () {

            checkAuthentication();

        }
    );



    // ==========================================
    // PERIODIC SESSION CHECK
    // ==========================================

    const SESSION_CHECK_INTERVAL =
        60 * 1000;


    setInterval(
        function () {

            checkAuthentication();

        },
        SESSION_CHECK_INTERVAL
    );



    // ==========================================
    // GLOBAL FUNCTION
    // ==========================================

    window.nsCheckAuthentication =
        checkAuthentication;


})();
