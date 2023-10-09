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

## Currency exchange get method

example:
GET
http://localhost:5000/exchange-rate/EUR/HUF/2023-09-28/2023-10-05
response shape:
{
"rates": [
{
"date": "2023-10-02",
"rate": 388.6
},
{
"date": "2023-10-03",
"rate": 386.73
},
{
"date": "2023-10-04",
"rate": 387.32
},
{
"date": "2023-10-05",
"rate": 387.08
}
]
}
