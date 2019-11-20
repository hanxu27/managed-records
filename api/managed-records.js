import fetch from "../util/fetch-fill";
import URI from "urijs";
import { throws } from "assert";

// /records endpoint
window.path = "http://localhost:3000/records";

// Your retrieve function plus any additional functions go here ...
const retrieve = async (options = {}) => {
  options["limit"] = options["limit"] || 10;
  // will be bug if records are added or deleted
  let maxDataLength = 500;
  let colorString = "";
  let output = { ids: [], open: [], closedPrimaryCount: 0 };

  // construct URI need to switch to library
  if (options.colors)
    options.colors.forEach(color => {
      colorString += `&color[]=${color}`;
    });

  // calculate offset, previousPage, and nextPage
  let offset = 0;
  if (options.page && options.page != 1) {
    offset = (options.page - 1) * options.limit;
    output["previousPage"] = options.page - 1;
    output["nextPage"] = options.page * options.limit < maxDataLength ? options.page + 1 : null;
  } else {
    output["previousPage"] = null;
    output["nextPage"] = 2;
  }
  const data = await fetchURI(
    window.path + `?limit=${options.limit}&offset=${offset}${colorString}`
  );
  if (data.error) return data.error;

  data.forEach(entry => {
    const primaryColors = ["red", "blue", "yellow"];
    //putting ids into array
    output["ids"].push(entry.id);
    //putting open into array adding isPrimary
    if (entry.disposition === "open") {
      entry["isPrimary"] = primaryColors.includes(entry.color);
      output["open"].push(entry);
    }
    //counting closed Primary
    if (entry.disposition === "closed" && primaryColors.includes(entry.color)) {
      output["closedPrimaryCount"]++;
    }
  });

  // will be bug on cases where data is filtered and data === limit
  if (output["ids"].length < options["limit"]) output["nextPage"] = null;
  return output;
};

let fetchURI = async path => {
  return await fetch(path)
    .then(res => {
      if (!res.ok) {
        throw Error(res.statusText);
      }
      return res.json();
    })
    .catch(error => {
      console.log(error);
      return { error };
    });
};

export default retrieve;
