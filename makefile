COMPOSE = docker compose -f back/docker-compose.yml
CERT_DIR = back/nginx/certs
CERT_CRT = $(CERT_DIR)/selfsigned.crt
CERT_KEY = $(CERT_DIR)/selfsigned.key

.PHONY: certs up down logs clean fclean re

certs:
	@mkdir -p $(CERT_DIR)
	@if [ ! -f $(CERT_CRT) ] || [ ! -f $(CERT_KEY) ]; then \
		openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
			-keyout $(CERT_KEY) \
			-out $(CERT_CRT) \
			-subj "/CN=localhost"; \
	else \
		echo "Certificats déjà présents"; \
	fi



ps:
	$(COMPOSE) ps
up: certs
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f --tail=100

clean: down

fclean:
	$(COMPOSE) down -v --remove-orphans
	rm -f $(CERT_CRT) $(CERT_KEY)
	rm -rf $(CERT_DIR)
	rm -rf ~/.npm
	docker volume rm back_postgres_data 2>/dev/null || true
	docker volume rm postgres_data 2>/dev/null || true
# 	du -sh ~/.npm
	@if [ -d front/.next ]; then du -sh front/.next; else echo "front/.next non existant"; fi
	npm cache clean --force
	rm -rf front/.next/


re: fclean up up
