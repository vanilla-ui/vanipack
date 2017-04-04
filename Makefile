BIN := ./node_modules/.bin

lint:
	$(BIN)/eslint .

prettier:
	$(BIN)/prettier --trailing-comma all --write "./src/**/*.js"

.PHONY: lint prettier
