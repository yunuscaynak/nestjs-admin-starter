SHELL := /bin/bash

PNPM ?= pnpm
BACKEND_PORT ?= 3000

.DEFAULT_GOAL := help

.PHONY: help install setup backend start db-up db-down db-stop db-logs db-generate db-push db-migrate db-studio build lint test

help:
	@echo "Available targets (backend):"
	@echo "  make install      - Install backend dependencies"
	@echo "  make setup        - Install + start DB + generate client + push schema"
	@echo "  make backend      - Run backend in watch mode (PORT=$(BACKEND_PORT))"
	@echo "  make db-up        - Start PostgreSQL with Docker Compose"
	@echo "  make db-stop      - Stop PostgreSQL container"
	@echo "  make db-down      - Stop and remove PostgreSQL container/network"
	@echo "  make db-logs      - Show PostgreSQL logs"
	@echo "  make db-generate  - Generate Prisma client"
	@echo "  make db-push      - Push Prisma schema to DB"
	@echo "  make db-migrate   - Run Prisma migration (name=init)"
	@echo "  make db-studio    - Open Prisma Studio"
	@echo "  make build        - Build backend"
	@echo "  make lint         - Lint backend"
	@echo "  make test         - Run backend tests"

install:
	$(PNPM) install

setup: install db-up db-generate db-push

backend start:
	PORT=$(BACKEND_PORT) $(PNPM) start:dev

db-up:
	docker compose up -d

db-stop:
	docker compose stop

db-down:
	docker compose down

db-logs:
	docker compose logs -f postgres

db-generate:
	$(PNPM) db:generate

db-push:
	$(PNPM) db:push

db-migrate:
	$(PNPM) db:migrate --name init

db-studio:
	$(PNPM) db:studio

build:
	$(PNPM) build

lint:
	$(PNPM) lint

test:
	$(PNPM) test
