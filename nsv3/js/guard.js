(function () {

    "use strict";


    // ==========================================
    // NS TOOLKITS
    // LOGIN ACCESS GUARD
    // ==========================================

    const SESSION_KEY =
        "nsToolkitUser";


    // Main NS ToolKits login page
    const LOGIN_PAGE =
        "/nsv3/index.html";


    // Session duration
    // 10 HOURS
    const SESSION_DURATION =
        10 * 60 * 60 * 1000;



    // ==========================================
    // CHECK LOGIN
    // ==========================================

    function checkAuthentication() {

        const savedSession =
            localStorage.getItem(
                SESSION_KEY
            );


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


            localStorage.removeItem(
                SESSION_KEY
            );


            redirectToMainPage();

            return false;

        }


        // --------------------------------------
        // VALIDATE SESSION
        // --------------------------------------

        if (
            !session ||
            !session.username ||
            !session.loginTime ||
            !session.expirationTime
        ) {

            console.warn(
                "Incomplete NS ToolKits session."
            );


            localStorage.removeItem(
                SESSION_KEY
            );


            redirectToMainPage();

            return false;

        }


        // --------------------------------------
        // CHECK EXPIRATION
        // --------------------------------------

        const now =
            Date.now();


        const expirationTime =
            Number(
                session.expirationTime
            );


        // Invalid expiration
        if (
            !Number.isFinite(
                expirationTime
            )
        ) {

            localStorage.removeItem(
                SESSION_KEY
            );


            redirectToMainPage();

            return false;

        }


        // --------------------------------------
        // 10-HOUR SESSION EXPIRED
        // --------------------------------------

        if (
            now >=
            expirationTime
        ) {

            console.log(
                "NS ToolKits session expired."
            );


            localStorage.removeItem(
                SESSION_KEY
            );


            redirectToMainPage();

            return false;

        }


        // --------------------------------------
        // SESSION IS VALID
        // --------------------------------------

        return true;

    }



    // ==========================================
    // REDIRECT TO MAIN PAGE
    // ==========================================

    function redirectToMainPage() {

        const currentPath =
            window.location.pathname;


        // --------------------------------------
        // Already on NS ToolKits main page
        // --------------------------------------

        if (
            currentPath ===
                "/nsv3/" ||

            currentPath ===
                "/nsv3/index.html"
        ) {

            return;

        }


        // --------------------------------------
        // Redirect
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
    // OPTIONAL PERIODIC CHECK
    // ==========================================
    // Checks the session every minute.
    // This catches expiration even if the
    // user stays on the page for 10+ hours.

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