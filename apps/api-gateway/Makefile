
APP_NAME = gateway
SRC_DIR = .
BUILD_DIR = ./bin
GO = go

.DEFAULT_GOAL := build
.PHONY: all build clean run

build: $(BUILD_DIR)/$(APP_NAME)

$(BUILD_DIR)/$(APP_NAME): $(SRC_DIR)/*.go
	mkdir -p $(BUILD_DIR)
	$(GO) build -ldflags "-linkmode external -s -w" -o $(BUILD_DIR)/$(APP_NAME) $(SRC_DIR)
	python3 to_json.py

run: build
	./$(BUILD_DIR)/$(APP_NAME)

clean:
	rm -f $(BUILD_DIR)/$(APP_NAME)
	rm -rf $(BUILD_DIR)
	rm -rf run.json
rebuild: clean build