CLIMATE CHANGE DATA ANALYSIS DASHBOARD
======================================

HOW TO RUN
1. Keep all files together in ONE folder (climate_project).
2. Double-click index.html  (opens in Chrome / Edge / Firefox).
3. You need internet once, because the chart library (Chart.js) loads online.

FILES
- index.html        : page structure (cards, filters, chart areas)
- style.css         : colors and layout
- script.js         : logic - statistics, trend line, correlation, charts
- data.js           : the dataset used by the dashboard
- climate_data.csv  : same dataset in CSV (open in Excel / use in Python)

DATASET (1980-2023, yearly)
- temp_anomaly_c        : global temperature difference from 1951-1980 average (NASA GISTEMP)
- co2_ppm               : CO2 level at Mauna Loa (NOAA)
- arctic_sea_ice_mkm2   : September Arctic sea ice extent (NSIDC)
Values are rounded. For official numbers, download from NASA / NOAA / NSIDC websites.

WHAT THE PROJECT DOES
- Summary cards (change from start year to end year, correlation)
- Line chart with linear-regression trend line for temperature
- CO2 line chart, decade-average bar chart, CO2 vs temperature scatter plot
- Arctic sea ice chart
- Year filter (From / To) updates all charts and findings

DS CONCEPTS USED
Data collection, cleaning, mean, linear regression (trend), correlation,
grouping by decade, data visualization.

TO USE YOUR OWN DATA
Edit data.js - keep the same format: { year: 2024, temp: 1.0, co2: 423, ice: 4.5 },
