// FOR ACCESSING API ENDPOINTS
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3001;

// still needs to be connected, just did the very basics to check if creation of express app worked