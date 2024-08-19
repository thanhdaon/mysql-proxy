# mysql-proxy

This is the implementaion of mysql-proxy server based on the docs[https://orm.drizzle.team/docs/get-started-mysql#http-proxy]

# Tech-stack

- Bun: A fast and modern JavaScript runtime that provides better performance and native support for TypeScript. Bun is designed to be an all-in-one toolkit, offering features like a bundler, transpiler, and task runner in addition to being a runtime.

- Elysia: A minimalistic and performant routing library for Bun. Elysia provides an easy-to-use API for building web servers and is optimized for speed and simplicity. It supports middlewares, error handling, and integrates well with TypeScript.

- TypeScript: A strongly typed programming language that builds on JavaScript, adding static type definitions. TypeScript is used in this project to improve code quality, catch errors at compile-time, and enhance the development experience with autocompletion and type checking.

- MySQL2 Driver: A modern, fast MySQL client for Node.js and JavaScript runtimes like Bun. MySQL2 supports both callbacks and promises, making it easy to integrate with modern JavaScript frameworks and ORMs like Drizzle-ORM. It provides a reliable and efficient way to interact with a MySQL database.

# Building a Docker Image

1. To build the Docker image, follow these steps:
2. Open a terminal in the project directory.
   Build the Docker image using the following command:
   ```bash
   docker run -p 3000:3000 mysql-proxy
   ```

# Environment Variables

- PORT: This variable sets the port number on which the server will run. In this case, the server will listen on port 1234. You can change this value to any available port if needed.
- MYSQL_ROOT_PASSWORD:
  This variable holds the root password for the MySQL database. It is crucial to keep this value secure, as it grants full access to the MySQL server.
- MYSQL_ROOT_URI:
  This variable provides the URI for connecting to the MySQL server as the root user. It combines the connection details (username, password, host, and port) into a single string. The URI follows the format:
  `mysql://<username>:<password>@<host>:<port>/<database>`
