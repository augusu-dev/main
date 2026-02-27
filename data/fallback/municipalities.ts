const fallbackMunicipalities = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        code: '13101',
        name: '千代田区',
        prefecture_code: '13',
        rent_avg: 120000,
        population: 68000,
        area_km2: 11.66
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[139.745, 35.695], [139.78, 35.695], [139.78, 35.67], [139.745, 35.67], [139.745, 35.695]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        code: '27127',
        name: '北区',
        prefecture_code: '27',
        rent_avg: 72000,
        population: 135000,
        area_km2: 20.61
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[135.5, 34.72], [135.54, 34.72], [135.54, 34.69], [135.5, 34.69], [135.5, 34.72]]]
      }
    }
  ]
};

export default fallbackMunicipalities;
