# Jugaad

Jugaad is a web application that aims to provide a platform for people to share their ideas and projects. The project is built using Next.js, TypeScript, and Tailwind CSS.

## Scripts

### Scripts to use the project:

`npm run dev`: To run the development server.
`npm run build`: To build the project.
`npm start`: To run the development server.
`npm run lint`: To lint the project.
`npm run format`: To indicate the formatting of the project.
`npm run format:fix`: To format the project files to the correct format.
`npm run prepare`: To prepare git hooks.
`npm test`: To run the tests.

To-Do:

- A user can list their projects from GitHub. [*] (ls --self)
- A user can select their projects to put for contribution. [*] (add-for-contribution <project>)
- A user can list projects that are put up for contribution by other users. [*] (ls)
- A user can select a project to contribute to. [*] (contribute <project>)
- A user can see the list of contributors for a project. [*] (contributors <user>/<project>)
- A user can see the list projects listed for contribution. [*] (contributions)
- A user can see the list of projects they are contributing to. (contributions --self)
- A user can remove their project from the list of projects if it is listed for contribution. [*] (rm <user>/<project>)

Add help commands to README.

Tag projects with the languages and they are written in, the frameworks they use, their platforms, and their licenses(???).

Create a documentation for the ReST APIs, so that developers can make HTTP requests on the server. Also, the APIs should be made accessible publically.

Check if the responses from APIs to be using the success or status code as 200.

Add command for ctrl + c.

Check `isAuthenticated` for the commands that require authentication.

Add CLI frontend for the project.
