SHELL := /bin/bash

BACKEND_DIR := backend
FRONTEND_DIR := frontend

PNPM ?= pnpm
NPM ?= npm

BACKEND_PORT ?= 3002
FRONTEND_PORT ?= 3001

.DEFAULT_GOAL := help

.PHONY: help install install-backend install-frontend db-generate db-push db-migrate db-studio backend backend-prod frontend build lint test dev dev-backend dev-frontend

help:
	@echo "Available targets:"
	@echo "  make install           - Install backend and frontend dependencies"
	@echo "  make db-generate       - Generate Prisma client"
	@echo "  make db-push           - Push Prisma schema to DB"
	@echo "  make db-migrate        - Run Prisma migration (name=init)"
	@echo "  make db-studio         - Open Prisma Studio"
	@echo "  make backend           - Run backend in watch mode (PORT=$(BACKEND_PORT))"
	@echo "  make frontend          - Run frontend in dev mode (PORT=$(FRONTEND_PORT))"
	@echo "  make build             - Build backend and frontend"
	@echo "  make lint              - Lint backend and frontend"
	@echo "  make test              - Run backend tests"
	@echo "  make dev               - Print dev run instructions"

install: install-backend install-frontend

install-backend:
	cd $(BACKEND_DIR) && $(PNPM) install

install-frontend:
	cd $(FRONTEND_DIR) && $(NPM) install

db-generate:
	cd $(BACKEND_DIR) && $(PNPM) db:generate

db-push:
	cd $(BACKEND_DIR) && $(PNPM) db:push

db-migrate:
	cd $(BACKEND_DIR) && $(PNPM) db:migrate --name init

db-studio:
	cd $(BACKEND_DIR) && $(PNPM) db:studio

backend:
	cd $(BACKEND_DIR) && PORT=$(BACKEND_PORT) $(PNPM) start:dev

backend-prod:
	cd $(BACKEND_DIR) && PORT=$(BACKEND_PORT) $(PNPM) start:prod

frontend:
	cd $(FRONTEND_DIR) && $(NPM) run dev -- --port $(FRONTEND_PORT)

build:
	cd $(BACKEND_DIR) && $(PNPM) build
	cd $(FRONTEND_DIR) && $(NPM) run build

lint:
	cd $(BACKEND_DIR) && $(PNPM) lint
	cd $(FRONTEND_DIR) && $(NPM) run lint

test:
	cd $(BACKEND_DIR) && $(PNPM) test

dev:
	@echo "Run in separate terminals:"
	@echo "  make backend"
	@echo "  make frontend"

dev-backend: backend
dev-frontend: frontend
