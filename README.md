<h1 align="center">Dratt!</h1>
<p align="center">
  <img src="/static/Dratt.svg" alt="Logo" width="200"/>
</p>

---

Dratt (stylized as Dratt!) is a web application for managing students' attendance in high school drama productions, built for simplicity and ease of use.

## Features
Both teachers and students can log in and use Dratt. Users have different permissions depending on their account type.

Some key features for teachers include:
- Creating, editing, and deleting productions, with separate attendance and users for each production
- Marking and viewing students' daily attendance
- Quickly sending reminder emails to all missing students
- Viewing individual and overall student attendance histories

Some key features for students include:
- Marking their own attendance with the click of a button on a page accessible by QR code or link
- Viewing their own attendance history
## Installation
The application runs inside [Docker Compose](https://docs.docker.com/compose/). So, there is no need for downloading dependencies from a requirements.txt file. Rather, to run it, download the source code and fill in `frontend/.env.example` and rename it to `.env.development`, and fill in `backend/.env.example` and rename it to `.env`. Then, simply install [Docker Desktop](https://www.docker.com/products/docker-desktop/) (on Linux, Docker Compose installed as a command-line program also works) and run the command `docker compose up` in a terminal in the application's root directory. A prepopulated database is included in `/postgres_dump/` and will be automatically imported when first running the app.

The build instructions of the Docker images are stored in `/docker-compose.yml` as well as the `Dockerfile`s in `/frontend/` and `/backend/`. The required npm modules for each container are listed in their respective `package.json` and `package-lock.json` files, and are automatically installed when building the app.

Some key dependencies are [Node.js](https://nodejs.org/en), [PostgreSQL](https://www.postgresql.org/), [Next.js](https://nextjs.org/), [Express](https://expressjs.com/), and [Tailwind CSS](https://tailwindcss.com/).
## Known Bugs 
The following are known bugs:
- Currently, when viewing the student attendance history, the wrong student may be fetched from the database (i.e. student A is in the class but student B's data is what ends up getting displayed)
- Reminder emails may end up in spam on the first email (*Note: This is not a bug but it is something to be aware of if you are planning on using this feature*)

The developer team may address these in the future but there are no immediate plans to do so.
## Support
Contact Skyler (skyler@skylerma.com) or Lucas (kblazer20@gmail.com) with any questions.
## Sources
The following are links to official documentation for the softwares and libraries used, which were extensively consulted throughout development.
- [Docker Compose](https://docs.docker.com/compose/)
- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev/reference/react)
- [Tailwind CSS](https://tailwindcss.com/docs/installation/using-vite)
- [next-qrcode](https://www.npmjs.com/package/next-qrcode)
- [React Select](https://react-select.com/)
- [Express](https://expressjs.com/)
- [express-session](https://www.npmjs.com/package/express-session)
- [node-mailjet](https://www.npmjs.com/package/node-mailjet)
- [node-postgres](https://node-postgres.com/)
- [connect-pg-simple](https://www.npmjs.com/package/connect-pg-simple)
- [cors](https://www.npmjs.com/package/cors)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [node-argon2](https://www.npmjs.com/package//argon2)
- [nodemon](https://www.npmjs.com/package/nodemon)
- [JSDoc](https://jsdoc.app/)

The excellent [MDN Web Docs](https://developer.mozilla.org/en-US/) were consulted regarding HTML, CSS, JS, CORS, and backend web server design.

Additionally, the [node](https://hub.docker.com/_/node/), [postgres](https://hub.docker.com/_/postgres/), and [adminer](https://hub.docker.com/_/adminer/) Docker Official Images were used.

The following bullet points are the non-official sources used when developing the application. They are also documented inside the code using comments for further clarity.
- https://www.geeksforgeeks.org/sql-cheat-sheet/
    - General SQL cheatsheet that was used when writing the SQL text
- https://nerdcave.com/tailwind-cheat-sheet
    - General TailwindCSS cheatsheet that was used when styling
- https://stackoverflow.com/questions/67383686/how-to-add-a-style-on-a-condition-in-tailwind-css
    - Used this link to figure out how to add terniary operators in TailwindCSS styling for the sign up page (i.e. turn red if incorrect)
- https://launchschool.com/books/sql/read/joins 
    - Used this link to understand all the different types of joins for the backend routes 
- https://www.ibm.com/docs/en/db2-for-zos/12.0.0?topic=type-arrays-in-sql-statements
    - Used this link to understand how to create a list/array inside SQL statements using ARRAY_AGG
- https://www.mailslurp.com/blog/send-emails-with-mailjet/
    - Used this link to figure out how to use the mailjet API to send emails
- https://stackoverflow.com/questions/74965849/youre-importing-a-component-that-needs-usestate-it-only-works-in-a-client-comp
    - Used this link to understand the need for use client in front end code where you want to save the state of variables using useState
- https://stackoverflow.com/questions/76285831/whats-the-difference-between-next-router-and-next-navigation
    - Used to understand when to use useRouter() from next/router vs next/navigation (using next/navigation for this newer version of Next.js because pages are organized in the /app directory)
- https://stackoverflow.com/questions/12997123/print-specific-part-of-webpage
    - Used to figure out how to print a specific portion/element of a webpage (the QR code)
- https://stackoverflow.com/questions/57466655/how-to-generate-each-week-list-from-date-range-start-date-and-end-date
    - Used for code to generate list of dates for a week range
- https://stackoverflow.com/questions/35088088/javascript-for-getting-the-previous-monday?noredirect=1&lq=1
    - Adapted for code to get most recent Sunday including today
