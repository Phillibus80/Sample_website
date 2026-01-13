# Sample Website with CMS

This is the project for a sample website with a CMS. In development, it uses Docker as the development environment. It also
uses NGINX to proxy all API calls to allow for CSRF Token validation.

A React front end, using [Tanstack Query](https://tanstack.com/query/latest).

## Serve the project

### 1st time:

docker compose up --build

### Every other time:

docker compose up

### Tear down

docker compose down -v

### Running the project

The project is then served from localhost:8080

## Postman

Inside the /postman folder is the Postman collection.

### Postman Notes

There are two security tokens being used: CSRF and JWT (authentication). Those are generated after the login.
While the project is in `development` mode (`/api/index.php`), you can create a user through the `create user`
endpoint (`POST users`)
without needing to login.

## Logging

### Follow logs in real-time (like tail -f)

docker compose logs -f nginx
docker compose logs -f frontend
docker compose logs -f web

### View the last 50 lines and follow

docker compose logs -f --tail=50 nginx

### View all services at once

docker compose logs -f

### View multiple specific services

docker compose logs -f nginx frontend web

### View logs with timestamps

docker compose logs -f -t nginx
