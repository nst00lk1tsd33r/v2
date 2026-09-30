if (!requireLogin()) {

    throw new Error(
        "Authentication required."
    );

}


const currentUser =
    getCurrentUser();


document.getElementById(
    "teamName"
).textContent =
    currentUser.team;


const members =
    USERS.filter(
        user =>
            user.team === currentUser.team
    );


const container =
    document.getElementById(
        "teamMembers"
    );


members.forEach(
    member => {

        const div =
            document.createElement(
                "div"
            );


        div.innerHTML = `

            <h3>
                ${member.username}
            </h3>

            <p>
                ${member.team}
            </p>

            <a
                href="user.html?user=${member.username}"
            >
                View User
            </a>

        `;


        container.appendChild(div);

    }
);