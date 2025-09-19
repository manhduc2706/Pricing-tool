import axios from "axios";


export async function getLocation() {
  const res = await axios.get("https://ipinfo.io/json?token=YOUR_TOKEN");
  return {
    city: res.data.city,
    region: res.data.region,
    country: res.data.country_name,
  };
}

getLocation().then((loc) => {
  console.log(loc.city, loc.region, loc.country); 
});
