BIN := ./node_modules/.bin

ESLINT := $(BIN)/eslint

lint:
	$(ESLINT) .

.PHONY: lint
