.PHONY: compile deploy-local deploy-testnet sapphire-dev
sapphire-dev:
	docker run -it -p8544-8548:8544-8548 --platform linux/x86_64 ghcr.io/oasisprotocol/sapphire-localnet

compile:
	npx hardhat compile

deploy-local: compile
	npx hardhat --network sapphire-localnet deploy

deploy-testnet: compile
	npx hardhat --network sapphire-testnet deploy