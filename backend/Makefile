SHELL := /bin/bash

PNPM ?= pnpm
BACKEND_PORT ?= 3002

.DEFAULT_GOAL := help

.PHONY: help install setup backend backend-up start db-start db-stop db-generate db-push db-reset db-migrate db-studio build lint test

help:
	@echo "Available targets (backend):"
	@echo "  make install      - Install backend dependencies"
	@echo "  make setup        - Install + start PostgreSQL + generate client + push schema"
	@echo "  make backend      - Run backend in watch mode (PORT=$(BACKEND_PORT))"
	@echo "  make backend-up   - Start PostgreSQL, prepare Prisma, and run backend"
	@echo "  make db-start     - Start PostgreSQL with Docker Compose"
	@echo "  make db-stop      - Stop PostgreSQL Docker Compose services"
	@echo "  make db-generate  - Generate Prisma client"
	@echo "  make db-push      - Push Prisma schema to DB"
	@echo "  make db-reset     - Reset local DB and push Prisma schema"
	@echo "  make db-migrate   - Run Prisma migration (name=init)"
	@echo "  make db-studio    - Open Prisma Studio"
	@echo "  make build        - Build backend"
	@echo "  make lint         - Lint backend"
	@echo "  make test         - Run backend tests"

install:
	$(PNPM) install

setup: install db-start db-generate db-push

backend start:
	PORT=$(BACKEND_PORT) $(PNPM) start:dev

backend-up: setup
	PORT=$(BACKEND_PORT) $(PNPM) start:dev

db-start:
	$(PNPM) db:start

db-stop:
	$(PNPM) db:stop

db-generate:
	$(PNPM) db:generate

db-push:
	$(PNPM) db:push

db-reset:
	$(PNPM) db:reset

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
