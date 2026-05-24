.DEFAULT_GOAL := help
.PHONY: help install dev build check validate start preview health smoke clean status

NODE := $(shell mise which node 2>/dev/null || which node)
PNPM := PATH="$(dir $(NODE)):$$PATH" pnpm

HOST     ?= 127.0.0.1
APP_PORT ?= 4321
URL      ?= http://$(HOST):$(APP_PORT)

help:
	@echo ""
	@echo "  embelleze-web"
	@echo ""
	@echo "  install    instala dependências via pnpm"
	@echo "  dev        sobe Astro dev server       [HOST=$(HOST)] [APP_PORT=$(APP_PORT)]"
	@echo "  check      roda astro check"
	@echo "  build      gera build SSR em dist/"
	@echo "  validate   check + build"
	@echo "  start      inicia servidor compilado   [HOST=$(HOST)] [APP_PORT=$(APP_PORT)]"
	@echo "  preview    preview do último build     [HOST=$(HOST)] [APP_PORT=$(APP_PORT)]"
	@echo ""
	@echo "  health     chama /api/health           [URL=$(URL)]"
	@echo "  smoke      testa / e /api/health       [URL=$(URL)]"
	@echo "  status     mostra versão node/pnpm e scripts"
	@echo "  clean      remove dist/ e .astro/"
	@echo ""

install:
	$(PNPM) install

dev:
	$(PNPM) dev -- --host $(HOST) --port $(APP_PORT)

check:
	$(PNPM) check

build:
	@rm -rf dist
	$(PNPM) build
	@echo "" && du -sh dist/ && echo ""

validate: check build

start:
	HOST=$(HOST) PORT=$(APP_PORT) node ./dist/server/entry.mjs

preview:
	$(PNPM) preview -- --host $(HOST) --port $(APP_PORT)

health:
	@curl -fsS "$(URL)/api/health" | python3 -m json.tool 2>/dev/null || curl -fsS "$(URL)/api/health"

smoke:
	@curl -fsSI "$(URL)/" >/dev/null
	@$(MAKE) --no-print-directory health URL="$(URL)"
	@echo "  smoke ok: $(URL)"

status:
	@echo "node: $$($(NODE) --version)"
	@echo "pnpm: $$($(PNPM) --version)"
	@$(PNPM) run

clean:
	@rm -rf dist .astro
	@echo "  dist/ e .astro/ removidos."
