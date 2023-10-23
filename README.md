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

## Currency exchange methods

### GET

```
http://localhost:5000/exchange-rate/EUR/HUF/2023-09-28/2023-10-05
```

```
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
```

## Currency exchange services

Functions from ecb-euro-exchange

- get
  Fetches and resolves the promise using axios
- assertString
  Checks if the resolved data is in fact a string. Not sure why would this be needed.
- parse
  Using the fast-xml-parser creates a usable array of exchangerate result objects.
- fetch
  This function uses the daily url which results in a single day's exhange rates.
- fetchHistoric90d
  This function fetches and transforms the data from the XML document containing the last 90 days' exchange rates.
- fetchHistoric
  Just like the 90d function, except it uses all the available data, which dates back to 1999 at the moment. Useful for the first initiation of the exchange database(db).
  ###My functions
- returnLastFile
  The files are named after the year, which's information they contain. This function returns the last filename which essentially is the last year the database has data from. Removes the .json extension from the result.
- returnLastDate
  Returns the last stored exchange object's time value.
- pushDayRate
  Pushes the supplied updates to the exchange object array leaving in place the previous objects stored in the array.
- getUpdate
  Chooses a fetch method based on how many days is the db behind. Fetches, parses and returns an update which can be used to write in the JSON file(s). Returns an object, where the key is the year (file name) and the value is the desired file content.
- writeFiles
  Does the file operation(s) based on an update variable generated by getUpdate.

## Currency exchange functions

- readRates
  Opens the files(s) based on the date range given. Calculates the crossrates for every available date point which fits between the two given dates and returns the information.
- getRate
  Reads the data with readRates function and returns it
