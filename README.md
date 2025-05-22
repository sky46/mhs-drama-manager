# Dratt!
Dratt (stylized as Dratt!) is a web app for managing students' attendance in high school drama productions, built for simplicity and ease of use.
## Features
Both teachers and students can log in and use Dratt. Users have different permissions depending on their account type.
Some key features for teachers include:
- Creating, editing, and deleting productions, with separate attendance and users for each production
- Marking and viewing students' daily attendance
- Quickly sending reminder emails to all missing students
- Viewing students' attendance history
Some key features for students include:
- Marking their own attendance with the click of a button on a page accessible by QR code or link
- Viewing their own attendance history
## Installation
The application runs inside [Docker Compose](https://docs.docker.com/compose/), so to run it, simply install [Docker Desktop](https://www.docker.com/products/docker-desktop/) (on Linux, Docker Compose installed as a command-line program also works) and run the command `docker compose up` in a terminal in the application's root directory. A prepopulated database is included in `/postgres_dump/` and will be automatically imported when first running the app.

The build instructions of the Docker images are stored in `/docker-compose.yml` as well as the `Dockerfile`s in `/frontend/` and `/backend/`. The required npm modules for each container are listed in their respective `package.json` and `package-lock.json` files, and are automatically installed when building the app.

Some key dependencies are [Node.js](https://nodejs.org/en), [PostgreSQL](https://www.postgresql.org/), [Next.js](https://nextjs.org/), [Express](https://expressjs.com/), and [Tailwind CSS](https://tailwindcss.com/).
## Known Bugs
TODO
## Support
Contact Skyler (skyler@skylerma.com) or Lucas (lucasjin.hh@gmail.com) with any questions.
## Sources
TODO
