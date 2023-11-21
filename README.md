## Currency exchange methods

### GET

- getRates </br>

```
http://localhost:5000/exchange-rate/2023-11-17/2023-11-21/
```

```
response shape:
{
    "rates": [
        {
            "_id": "655c7e7b1c33b365ec9c6bf4",
            "date": "2023-11-17T00:00:00.000Z",
            "rates": {
                "USD": 1.0872,
                "JPY": 162.29,
                "BGN": 1.9558,
                "CZK": 24.461,
                "DKK": 7.4582,
                "GBP": 0.87395,
                "HUF": 377.75,
                "PLN": 4.377,
                "RON": 4.9723,
                "SEK": 11.481,
                "CHF": 0.9643,
                "ISK": 153.3,
                "NOK": 11.811,
                "HRK": 0,
                "RUB": 0,
                "TRY": 31.197,
                "AUD": 1.6709,
                "BRL": 5.2947,
                "CAD": 1.4908,
                "CNY": 7.8414,
                "HKD": 8.4785,
                "IDR": 16717.28,
                "ILS": 4.0487,
                "INR": 90.5065,
                "KRW": 1405,
                "MXN": 18.7042,
                "MYR": 5.0881,
                "NZD": 1.8161,
                "PHP": 60.416,
                "SGD": 1.461,
                "THB": 38.068,
                "ZAR": 19.9254,
                "_id": "655c7e7b1c33b365ec9c6bf5"
            },
            "__v": 0
        },
        {
            "_id": "655c7e7b1c33b365ec9c6bf6",
            "date": "2023-11-20T00:00:00.000Z",
            "rates": {
                "USD": 1.0928,
                "JPY": 162.12,
                "BGN": 1.9558,
                "CZK": 24.541,
                "DKK": 7.4565,
                "GBP": 0.8763,
                "HUF": 378.9,
                "PLN": 4.369,
                "RON": 4.9721,
                "SEK": 11.427,
                "CHF": 0.9665,
                "ISK": 152.5,
                "NOK": 11.72,
                "HRK": 0,
                "RUB": 0,
                "TRY": 31.4332,
                "AUD": 1.6669,
                "BRL": 5.3364,
                "CAD": 1.4994,
                "CNY": 7.8378,
                "HKD": 8.5165,
                "IDR": 16881.57,
                "ILS": 4.0811,
                "INR": 91.106,
                "KRW": 1412.56,
                "MXN": 18.759,
                "MYR": 5.1006,
                "NZD": 1.8132,
                "PHP": 60.497,
                "SGD": 1.4641,
                "THB": 38.494,
                "ZAR": 20.1445,
                "_id": "655c7e7b1c33b365ec9c6bf7"
            },
            "__v": 0
        }
    ]
}
```

- getIndex </br>

```
http://localhost:5000/exchange-rate/
```

response:

```
Currency Exchange API
```

## Currency exchange services

Functions from ecb-euro-exchange

- get<br />
  Fetches and resolves the promise using axios.
- assertString<br />
  Checks if the resolved data is in fact a string. Not sure why would this be needed.
- parse<br />
  Using the fast-xml-parser creates a usable array of exchangerate result objects.
- fetch<br />
  This function uses the daily url which results in a single day's exhange rates.
- fetchHistoric90d<br />
  This function fetches and transforms the data from the XML document containing the last 90 days' exchange rates.
- fetchHistoric<br />
  Just like the 90d function, except it uses all the available data, which dates back to 1999 at the moment. Useful for the first initiation of the exchange database(db).
  ###My functions
- getLastDate<br />
  Returns the date of the last exchange rate object. Returns "1900-01-01" trasformed to date if empty.
- addRate<br />
  Adds a single ExchangeRate type document to the DB. The date is unique, so it skips existing objects.
- getUpdate<br />
  Chooses a fetch method based on how many days is the db behind. Fetches, parses and tries to write all the fetched data into the DB with addRate.

## Currency exchange functions

- getAllRatesInInterval<br />
  Finds all ExchangeRate documents between two dates and returns them. Promise based.
