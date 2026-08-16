/* =========================================
   STORAGE KEYS
========================================= */

const USERS_KEY = "loginAuthenticationUsers";
const SESSION_KEY = "loginAuthenticationSession";


/* =========================================
   DOM ELEMENTS
========================================= */

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginMessage = document.getElementById("loginMessage");
const registerMessage = document.getElementById("registerMessage");

const dashboardUser = document.getElementById("dashboardUser");
const accountIdentifier = document.getElementById("accountIdentifier");
const logoutButton = document.getElementById("logoutButton");


/* =========================================
   STORAGE HELPERS
========================================= */

function getUsers() {

    try {

        const savedUsers = localStorage.getItem(USERS_KEY);

        return savedUsers
            ? JSON.parse(savedUsers)
            : [];

    } catch (error) {

        console.error("Unable to load users:", error);

        return [];
    }
}


function saveUsers(users) {

    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );
}


/* =========================================
   SHA-256 PASSWORD HASHING
========================================= */

async function hashPassword(password) {

    const encoder = new TextEncoder();

    const data = encoder.encode(password);

    const hashBuffer =
        await crypto.subtle.digest(
            "SHA-256",
            data
        );

    const hashArray =
        Array.from(new Uint8Array(hashBuffer));

    return hashArray
        .map(function (byte) {
            return byte
                .toString(16)
                .padStart(2, "0");
        })
        .join("");
}


/* =========================================
   VALIDATION
========================================= */

function validatePassword(password) {

    const minimumLength =
        password.length >= 8;

    const containsNumber =
        /\d/.test(password);

    return minimumLength && containsNumber;
}


function validateIdentifier(identifier) {

    return identifier.trim().length >= 3;
}


/* =========================================
   MESSAGE HANDLING
========================================= */

function showMessage(
    element,
    message,
    type = "error"
) {

    if (!element) {
        return;
    }

    element.textContent = message;

    element.classList.remove("success");

    if (type === "success") {

        element.classList.add("success");
    }
}


function clearMessage(element) {

    if (!element) {
        return;
    }

    element.textContent = "";

    element.classList.remove("success");
}


/* =========================================
   REGISTER
========================================= */

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            clearMessage(registerMessage);


            const identifier =
                document
                    .getElementById("registerIdentifier")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("registerPassword")
                    .value;

            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    .value;


            /* Empty field validation */

            if (
                !identifier ||
                !password ||
                !confirmPassword
            ) {

                showMessage(
                    registerMessage,
                    "Please complete all required fields."
                );

                return;
            }


            /* Identifier validation */

            if (!validateIdentifier(identifier)) {

                showMessage(
                    registerMessage,
                    "Username or email must contain at least 3 characters."
                );

                return;
            }


            /* Password validation */

            if (!validatePassword(password)) {

                showMessage(
                    registerMessage,
                    "Password must contain at least 8 characters and 1 number."
                );

                return;
            }


            /* Confirm password */

            if (password !== confirmPassword) {

                showMessage(
                    registerMessage,
                    "Passwords do not match."
                );

                return;
            }


            /* Load existing users */

            const users = getUsers();


            /* Duplicate account detection */

            const identifierExists =
                users.some(function (user) {

                    return (
                        user.identifier.toLowerCase() ===
                        identifier.toLowerCase()
                    );
                });


            if (identifierExists) {

                showMessage(
                    registerMessage,
                    "An account with this username or email already exists."
                );

                return;
            }


            /* Hash password */

            const passwordHash =
                await hashPassword(password);


            /* Create user */

            const newUser = {

                id: crypto.randomUUID(),

                identifier: identifier,

                passwordHash: passwordHash,

                createdAt: new Date().toISOString()
            };


            users.push(newUser);

            saveUsers(users);


            /* Success */

            showMessage(
                registerMessage,
                "Account created successfully. Redirecting to login...",
                "success"
            );


            registerForm.reset();


            setTimeout(function () {

                window.location.href = "index.html";

            }, 1000);

        }
    );
}


/* =========================================
   LOGIN
========================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            clearMessage(loginMessage);


            const identifier =
                document
                    .getElementById("loginIdentifier")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("loginPassword")
                    .value;


            /* Empty fields */

            if (!identifier || !password) {

                showMessage(
                    loginMessage,
                    "Please enter your username/email and password."
                );

                return;
            }


            /* Load users */

            const users = getUsers();


            /* Find account */

            const user =
                users.find(function (item) {

                    return (
                        item.identifier.toLowerCase() ===
                        identifier.toLowerCase()
                    );
                });


            /*
                Generic authentication error.

                We intentionally do not reveal whether
                the username/email exists.
            */

            if (!user) {

                showMessage(
                    loginMessage,
                    "Incorrect username/email or password."
                );

                return;
            }


            /* Hash entered password */

            const enteredPasswordHash =
                await hashPassword(password);


            /* Compare hashes */

            if (
                enteredPasswordHash !==
                user.passwordHash
            ) {

                showMessage(
                    loginMessage,
                    "Incorrect username/email or password."
                );

                return;
            }


            /* Create session */

            const session = {

                userId: user.id,

                identifier: user.identifier,

                loginTime: new Date().toISOString()
            };


            localStorage.setItem(
                SESSION_KEY,
                JSON.stringify(session)
            );


            /* Redirect */

            window.location.href =
                "dashboard.html";
        }
    );
}


/* =========================================
   SESSION HELPERS
========================================= */

function getSession() {

    try {

        const savedSession =
            localStorage.getItem(SESSION_KEY);

        return savedSession
            ? JSON.parse(savedSession)
            : null;

    } catch (error) {

        console.error(
            "Unable to load session:",
            error
        );

        return null;
    }
}


function clearSession() {

    localStorage.removeItem(
        SESSION_KEY
    );
}


/* =========================================
   PROTECT DASHBOARD
========================================= */

if (
    dashboardUser &&
    accountIdentifier
) {

    const session = getSession();


    /* No valid session */

    if (!session) {

        window.location.href =
            "index.html";

    } else {

        dashboardUser.textContent =
            session.identifier;

        accountIdentifier.textContent =
            session.identifier;
    }
}


/* =========================================
   LOGOUT
========================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            clearSession();

            window.location.href =
                "index.html";
        }
    );
}