.PHONY: build dev sh start-db stop db

build:
	docker compose build

dev:
	docker compose down prod
	docker compose up -d app database

prod:
	docker compose down app
	docker compose up -d prod database

sh:
	docker compose exec app /bin/bash

start-db:
	docker compose up -d database

stop:
	docker compose down

db:
	docker compose exec database psql -U app_dev -d dev

logs:
	docker compose logs -f
