# cow-backend trial
=======
## Setting up the database

### Prerequisites

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Running Database

```shell
cd mongodb/docker/
docker-compose up -d
```

### Add Local Environment Variable

```
MONGODB_URI=mongodb://user:pass@localhost:27017/
```
