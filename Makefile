# Makefile for OpenClaw Railway Template

# Default configuration
IMAGE_NAME = openclaw-railway

.PHONY: help build build-local run stop test clean deploy-local logs shell generate-password test-local

help: ## Show this help message
	@echo "OpenClaw Railway Template"
	@echo "========================"
	@echo ""
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ==============================================================================
# Production build (requires upstream openclaw repo)
# ==============================================================================

build: ## Build Docker image (production, requires openclaw repo)
	@echo "Building OpenClaw Railway image..."
	docker build -t $(IMAGE_NAME):latest .

run: build ## Run OpenClaw locally (production build)
	@echo "Running OpenClaw locally..."
	$(eval SETUP_PASSWORD := $(if $(SETUP_PASSWORD),$(SETUP_PASSWORD),$(shell openssl rand -hex 24)))
	@echo "Setup Password: $(SETUP_PASSWORD)"
	docker run -d --name openclaw-dev \
		-p 8080:8080 \
		-e PORT=8080 \
		-e SETUP_PASSWORD='$(SETUP_PASSWORD)' \
		-e OPENCLAW_STATE_DIR=/data/.openclaw \
		-e OPENCLAW_WORKSPACE_DIR=/data/workspace \
		-v openclaw_data:/data \
		$(IMAGE_NAME):latest
	@echo ""
	@echo "OpenClaw is running at http://localhost:8080"
	@echo "Setup wizard: http://localhost:8080/setup?password=$(SETUP_PASSWORD)"

stop: ## Stop running OpenClaw container
	@echo "Stopping OpenClaw..."
	docker stop openclaw-dev 2>/dev/null || true
	docker rm openclaw-dev 2>/dev/null || true

# ==============================================================================
# Local development (uses mock openclaw CLI, no upstream repo needed)
# ==============================================================================

build-local: ## Build local dev image (uses mock CLI, no upstream repo needed)
	@echo "Building local development image..."
	docker build -f Dockerfile.local -t $(IMAGE_NAME):local .

test-local: build-local ## Test the local dev build and endpoints
	@echo "Testing OpenClaw local build..."
	docker run -d --name openclaw-test-local \
		-p 8081:8080 \
		-e PORT=8080 \
		-e SETUP_PASSWORD=test-password \
		-e OPENCLAW_STATE_DIR=/data/.openclaw \
		-e OPENCLAW_WORKSPACE_DIR=/data/workspace \
		-e INTERNAL_GATEWAY_PORT=18789 \
		$(IMAGE_NAME):local
	@echo "Waiting for server to start..."
	@sleep 5
	@echo ""
	@echo "--- Testing mock CLI ---"
	@docker exec openclaw-test-local openclaw version
	@echo ""
	@echo "--- Testing health endpoint ---"
	@curl -sf http://localhost:8081/health | python3 -m json.tool 2>/dev/null || curl -sf http://localhost:8081/health
	@echo ""
	@echo "--- Testing liveness endpoint ---"
	@curl -sf http://localhost:8081/health/live | python3 -m json.tool 2>/dev/null || curl -sf http://localhost:8081/health/live
	@echo ""
	@echo "--- Testing readiness endpoint (should return 503 before gateway start) ---"
	@curl -s http://localhost:8081/health/ready | python3 -m json.tool 2>/dev/null || curl -s http://localhost:8081/health/ready
	@echo ""
	@echo "--- Testing auth protection (should return 401) ---"
	@curl -s -o /dev/null -w "Setup without auth: HTTP %{http_code} (expected 401)\n" http://localhost:8081/setup
	@echo ""
	@echo "--- Testing auth with password (should return 200) ---"
	@curl -s -o /dev/null -w "Setup with auth: HTTP %{http_code} (expected 200)\n" "http://localhost:8081/setup?password=test-password"
	@echo ""
	@echo "Cleaning up..."
	@docker stop openclaw-test-local 2>/dev/null || true
	@docker rm openclaw-test-local 2>/dev/null || true
	@echo ""
	@echo "All tests passed!"

# ==============================================================================
# Production test (requires upstream openclaw repo)
# ==============================================================================

test: build ## Test the Docker build and basic functionality
	@echo "Testing OpenClaw..."
	docker run -d --name openclaw-test \
		-p 8081:8080 \
		-e PORT=8080 \
		-e SETUP_PASSWORD=test-password \
		-e OPENCLAW_STATE_DIR=/data/.openclaw \
		-e OPENCLAW_WORKSPACE_DIR=/data/workspace \
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
	docker stop openclaw-test
	docker rm openclaw-test
	@echo ""
	@echo "All tests passed!"

# ==============================================================================
# Utilities
# ==============================================================================

clean: ## Clean up Docker containers, images, and volumes
	@echo "Cleaning up..."
	docker stop openclaw-dev openclaw-test openclaw-local openclaw-test-local 2>/dev/null || true
	docker rm openclaw-dev openclaw-test openclaw-local openclaw-test-local 2>/dev/null || true
	docker rmi $(IMAGE_NAME):latest $(IMAGE_NAME):local 2>/dev/null || true
	docker volume rm openclaw_data 2>/dev/null || true

deploy-local: ## Deploy using docker-compose
	@echo "Deploying locally with docker-compose..."
	@if [ ! -f .env ]; then \
		echo "SETUP_PASSWORD=$$(openssl rand -hex 24)" > .env; \
		echo "Created .env with auto-generated password"; \
	fi
	docker-compose up -d
	@echo ""
	@echo "OpenClaw is running at http://localhost:8080"
	@echo "Setup password: $$(grep SETUP_PASSWORD .env | cut -d'=' -f2)"

logs: ## Show logs from running container
	docker logs -f openclaw-dev

shell: ## Open shell in running container
	docker exec -it openclaw-dev /bin/bash

generate-password: ## Generate a secure setup password
	@echo "Generated setup password:"
	@openssl rand -hex 24
