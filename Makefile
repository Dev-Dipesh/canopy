.DEFAULT_GOAL := help

.PHONY: help up down restart

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

up: ## Start all Kroki containers in detached mode
	docker compose up -d

down: ## Stop and remove all Kroki containers
	docker compose down

restart: ## Restart all Kroki containers in detached mode
	docker compose restart
