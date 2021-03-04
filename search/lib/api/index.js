const axios = require('axios');
const path = require('path');
const zlib = require('zlib');
const fs = require('fs');
const express = require('express');
const { makeCmrSearchUrl, logger } = require('../util');

const provider = require('./provider');
const stac = require('./stac');
const wfs = require('./wfs');

async function getHealth (res) {
  try {
    await axios.get(makeCmrSearchUrl('/health'));
    res.status(200).json({
      search: {
        'ok?': true
      }
    });
  } catch (error) {
    res.status(503).json({
      search: {
        'ok?': false
      }
    });
  }
}

async function getDoc (res) {
  const fileBuffer = fs.readFileSync(path.join(__dirname, '../../docs/index.html')); 
  zlib.gzip(fileBuffer, function(error, gzippedDoc) {
    if (error) {
      res.status(503).json({
        search: {
          'error': error
        }
      });
    }
    const response = {
      statusCode: 200,
      body: gzippedDoc.toString('base64'),
      isBase64Encoded: true,
      headers: {
        'Content-Type': 'text/html',
        'Content-Encoding': 'gzip'
      }
    };
    res.json(response);
  });
}

const routes = express.Router();

routes.use('/docs', (req, res) => getDoc(res));
routes.use('/health', (req, res) => getHealth(res));
routes.use(provider.routes);
routes.use(stac.routes);
routes.use(wfs.routes);

module.exports = {
  routes
};
