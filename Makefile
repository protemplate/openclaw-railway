# Makefile for MoltBot Railway Template

# Default configuration
SETUP_PASSWORD ?= $(shell openssl rand -base64 32)
IMAGE_NAME = moltbot-railway

.PHONY: help build run stop test clean deploy-local logs shell generate-password

help: ## Show this help message
	@echo "MoltBot Railway Template"
	@echo "========================"
	@echo ""
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build Docker image
	@echo "Building MoltBot Railway image..."
	docker build -t $(IMAGE_NAME):latest .

run: build ## Run MoltBot locally
	@echo "Running MoltBot locally..."
	@echo "Setup Password: $(SETUP_PASSWORD)"
	docker run -d --name moltbot-dev \
		-p 8080:8080 \
		-e PORT=8080 \
		-e SETUP_PASSWORD=$(SETUP_PASSWORD) \
		-e MOLTBOT_STATE_DIR=/data/.moltbot \
		-e MOLTBOT_WORKSPACE_DIR=/data/workspace \
		-v moltbot_data:/data \
		$(IMAGE_NAME):latest
	@echo ""
	@echo "MoltBot is running at http://localhost:8080"
	@echo "Setup wizard: http://localhost:8080/setup?password=$(SETUP_PASSWORD)"

stop: ## Stop running MoltBot container
	@echo "Stopping MoltBot..."
	docker stop moltbot-dev 2>/dev/null || true
	docker rm moltbot-dev 2>/dev/null || true

test: build ## Test the Docker build and basic functionality
	@echo "Testing MoltBot..."
	docker run -d --name moltbot-test \
		-p 8081:8080 \
		-e PORT=8080 \
		-e SETUP_PASSWORD=test-password \
		-e MOLTBOT_STATE_DIR=/data/.moltbot \
		-e MOLTBOT_WORKSPACE_DIR=/data/workspace \
		$(IMAGE_NAME):latest
	@echo "Waiting for server to start..."
	@sleep 10
	@echo ""
	@echo "Testing health endpoint..."
	curl -sf http://localhost:8081/health | jq .
	@echo ""
	@echo "Testing liveness endpoint..."
	curl -sf http://localhost:8081/health/live | jq .
	@echo ""
	@echo "Testing readiness endpoint (should return 503 before setup)..."
	curl -s http://localhost:8081/health/ready | jq .
	@echo ""
	@echo "Testing auth protection..."
	curl -s -o /dev/null -w "Setup without auth: %{http_code} (expected 401)\n" http://localhost:8081/setup
	@echo ""
	@echo "Testing auth with password..."
	curl -s -o /dev/null -w "Setup with auth: %{http_code} (expected 200)\n" "http://localhost:8081/setup?password=test-password"
	@echo ""
	@echo "Cleaning up..."
	docker stop moltbot-test
	docker rm moltbot-test
	@echo ""
	@echo "All tests passed!"

clean: ## Clean up Docker containers, images, and volumes
	@echo "Cleaning up..."
	docker stop moltbot-dev moltbot-test 2>/dev/null || true
	docker rm moltbot-dev moltbot-test 2>/dev/null || true
	docker rmi $(IMAGE_NAME):latest 2>/dev/null || true
	docker volume rm moltbot_data 2>/dev/null || true

deploy-local: ## Deploy using docker-compose
	@echo "Deploying locally with docker-compose..."
	@if [ ! -f .env ]; then \
		echo "SETUP_PASSWORD=$(SETUP_PASSWORD)" > .env; \
		echo "Created .env with auto-generated password"; \
	fi
	docker-compose up -d
	@echo ""
	@echo "MoltBot is running at http://localhost:8080"
	@echo "Setup password: $$(grep SETUP_PASSWORD .env | cut -d'=' -f2)"

logs: ## Show logs from running container
	docker logs -f moltbot-dev

shell: ## Open shell in running container
	docker exec -it moltbot-dev /bin/bash

generate-password: ## Generate a secure setup password
	@echo "Generated setup password:"
	@openssl rand -base64 32
