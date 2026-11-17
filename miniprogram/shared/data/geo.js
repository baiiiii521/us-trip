// 生成物：node scripts/mp-geocode.mjs（地址 → 经纬度，供 wx.openLocation 用）
// 不要手改；地址变了重跑脚本，缓存在家目录 .cache/geocode.json。
export const ADDR_LL = {
  "1225 First St NE, Washington, DC 20002": [38.906296, -77.005634],
  "20 Morris St, New York, NY 10006": [40.706634, -74.015212],
  "343 Gold St, Brooklyn, NY 11201": [40.693995, -73.982802],
  "3505 International Pl NW, Washington, DC 20008": [38.942645, -77.066979],
  "400 Arch St, Philadelphia, PA 19106": [39.951959, -75.147407],
  "443 Shatto Pl, Los Angeles, CA 90020": [34.06301, -118.289927],
  "520 12th Ave, New York, NY 10036": [40.762004, -74.000602],
  "811 Massachusetts Ave, Boston, MA 02118": [42.332566, -71.073049],
  "Federal Circle Station, JFK Airport, Jamaica, NY 11430": [40.659756, -73.803538],
  "Frank Pepe Pizzeria Napoletana, 157 Wooster St, New Haven, CT": [41.302965, -72.916958],
  "LAX Terminal 7, Los Angeles, CA": [33.94337, -118.399047],
  "Logan Airport Rental Car Center, East Boston, MA": [42.368157, -71.029391],
  "Newark Liberty International Airport Terminal C, Newark, NJ": [40.689064, -74.177255],
  "Newark Liberty International Airport, Newark, NJ": [40.689064, -74.177255]
};

export const llOf = (q) => (q && ADDR_LL[String(q).trim()]) || null;
