# 3ds Merchant Example Application
example reference application showing how to integrate with Paynetworx 3ds endpoint

# Pre reqs
- docker
- node/typescript
- access to payentworx 3ds environment 

# Components
## backend 
hosts and webpage and intacts with paynetworx

## front end
simple payment page website

# Deployment
modify docker-compose.yml.example with the paynetworx endpoint and credentials and copy to docker-compsoe.yml

```bash
docker build .
docker compose up -d
```
