docker-compose exec db pg_dump --dbname=postgres://postgres:password@db:5432/postgres > ./postgres_dump/postgres.sql
