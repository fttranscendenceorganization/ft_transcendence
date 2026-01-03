
COMPOSE=docker compose  -f ./infra/compose/docker-compose.yml

all: up

up:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

clean:
	$(COMPOSE) down --rmi  local

fclean: clean
	$(COMPOSE) down --rmi all -v


re: fclean all

logs:
	$(COMPOSE) logs -f
ps:
	$(COMPOSE) ps

.PHONY: all up down clean fclean re logs ps