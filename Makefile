
COMPOSE=docker compose -f ./infra/compose/docker-compose.dev.yml
TAIL?=100
SERVICES?=backend_api front_end nginx database

all: up

up:
	$(COMPOSE)  up -d --build

prod:
	docker  compose -f ./infra/compose/docker-compose.prod.yml up -d --build

down:
	$(COMPOSE) down

clean:
	$(COMPOSE) down --rmi  local

fclean: clean
	$(COMPOSE) down --rmi all -v


re: fclean all

logs:
	$(COMPOSE) logs --tail=$(TAIL) -f $(SERVICES)

logs-backend:
	$(COMPOSE) logs --tail=$(TAIL) -f backend_api

logs-frontend:
	$(COMPOSE) logs --tail=$(TAIL) -f front_end

logs-nginx:
	$(COMPOSE) logs --tail=$(TAIL) -f nginx

logs-db:
	$(COMPOSE) logs --tail=$(TAIL) -f database
ps:
	$(COMPOSE) ps

.PHONY: all up down clean fclean re logs logs-backend logs-frontend logs-nginx logs-db ps