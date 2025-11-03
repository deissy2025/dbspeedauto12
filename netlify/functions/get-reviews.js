import fetch from "node-fetch";
export const handler = async (event) => {
  const placeId = event.queryStringParameters.placeId;
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if(!key){ return { statusCode: 400, body: JSON.stringify({ error: "Missing GOOGLE_MAPS_API_KEY" }) }; }
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,url,rating,user_ratings_total,reviews&reviews_sort=newest&key=${key}`;
  const r = await fetch(url); const data = await r.json();
  const { name, url: mapsUrl, rating, user_ratings_total, reviews = [] } = data.result || {};
  return { statusCode: 200, headers: { "Content-Type": "application/json", "Cache-Control":"no-store" }, body: JSON.stringify({ name, url: mapsUrl, rating, user_ratings_total, reviews }) };
};
