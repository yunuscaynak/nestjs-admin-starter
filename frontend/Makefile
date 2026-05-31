SHELL := /bin/bash

PNPM ?= pnpm
PORT ?= 3000

.DEFAULT_GOAL := help

.PHONY: help frontend dev build lint start

help:
	@echo "Available targets:"
	@echo "  make frontend          - Run frontend dev server"
	@echo "  make dev               - Alias for frontend"
	@echo "  make build             - Build frontend"
	@echo "  make lint              - Lint frontend"
	@echo "  make start             - Start built frontend"

frontend:
	PORT=$(PORT) $(PNPM) dev

dev: frontend

build:
	$(PNPM) build

lint:
	$(PNPM) lint

start:
	PORT=$(PORT) $(PNPM) start
