SHELL := /bin/bash

PNPM ?= pnpm

BACKEND_PORT ?= 3002
FRONTEND_PORT ?= 3001

.DEFAULT_GOAL := help

.PHONY: help install setup db-start db-stop db-generate db-push db-migrate db-reset db-studio backend backend-up frontend build lint test dev check

help:
	@echo "Available targets:"
	@echo "  make install           - Install workspace dependencies with pnpm"
	@echo "  make setup             - Install deps, start PostgreSQL, and prepare Prisma"
	@echo "  make db-start          - Start PostgreSQL with Docker Compose"
	@echo "  make db-stop           - Stop PostgreSQL Docker Compose services"
	@echo "  make db-generate       - Generate Prisma client"
	@echo "  make db-push           - Push Prisma schema to DB"
	@echo "  make db-migrate        - Run Prisma migration"
	@echo "  make db-reset          - Reset local DB and push schema"
	@echo "  make db-studio         - Open Prisma Studio"
	@echo "  make backend           - Run backend dev server"
	@echo "  make backend-up        - Start PostgreSQL, prepare Prisma, and run backend"
	@echo "  make frontend          - Run frontend dev server"
	@echo "  make dev               - Run backend and frontend together"
	@echo "  make lint              - Run workspace lint"
	@echo "  make test              - Run backend tests"
	@echo "  make build             - Build all packages"
	@echo "  make check             - Run lint, test, and build"

install:
	$(PNPM) install

setup:
	$(PNPM) setup

db-start:
	$(PNPM) db:start

db-stop:
	$(PNPM) db:stop

db-generate:
	$(PNPM) db:generate

db-push:
	$(PNPM) db:push

db-migrate:
	$(PNPM) db:migrate

db-reset:
	$(PNPM) db:reset

db-studio:
	$(PNPM) db:studio

backend:
	PORT=$(BACKEND_PORT) $(PNPM) dev:backend

backend-up:
	PORT=$(BACKEND_PORT) $(PNPM) backend:up

frontend:
	PORT=$(FRONTEND_PORT) $(PNPM) dev:frontend

dev:
	$(PNPM) dev

build:
	$(PNPM) build

lint:
	$(PNPM) lint

test:
	$(PNPM) test

check:
	$(PNPM) check
