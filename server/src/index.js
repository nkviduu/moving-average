const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const { API_KEY } = process.env;

const PORT = 8055;
const cache = {};

app.use(cors());

app.get('/history/:symbol', getSymbolData);

async function getSymbolData(req, res) {
  const symbol = ('' + req.params.symbol).toUpperCase();

  if (cache[symbol]) {
    console.log(symbol + ' from cache');
    return res.json(cache[symbol]);
  }
  const data = await getData(symbol);
  cache[symbol] = data;
  console.log(symbol + ' new data');
  return res.json(data);
}

function getData(symbol) {
  const url = `https://api.worldtradingdata.com/api/v1/history?symbol=${symbol}&date_from=2015-06-01&sort=oldest&api_token=${API_KEY}`;

  return axios.get(url).then(({ data }) => {
    return data;
  });
}

app.listen(PORT, () => console.log('App started on ' + PORT));
