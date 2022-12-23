let pathA = "/Users/alex/Downloads/data";
let pathB = "/Users/alex/Downloads/data 2";

// in the two paths are a number of subdirectories and JSON files. We want check if the contents of both folders are exactly the same
// and if not, we want to know which files are different and what the differences are.

const fs = require("fs");
const path = require("path");

function readDirContents(dirPath, map, base = '') {
  let contents = fs.readdirSync(dirPath);
  for (let file of contents) {
    let fullPath = path.join(dirPath, file);
    // check if it is a file or a directory
    if (fs.statSync(fullPath).isFile()) {
      if (file == ".DS_Store") { continue; } // fuck apple
      if (file.endsWith(".json")) {
        // it is a file, add it to the map
        let data = fs.readFileSync(fullPath, 'utf8');
        try {
          map[fullPath.replace(base || dirPath,"BASE")] = JSON.parse(data);
        } catch (err) {
          console.error("Failed to parse file: ", fullPath);
        }
      }
      else {
        let data = fs.readFileSync(fullPath, 'base64');
        map[fullPath.replace(base || dirPath,"BASE")] = data;
      }
    }
    else {
      // it is a directory, recurse
      readDirContents(fullPath, map, base || dirPath);
    }
  }
}

function deepCompare(a, b, d= 0 ) {
  let iterated = false;
  for (let prop in b) {
    iterated = true;
    if (b.hasOwnProperty(prop)) {
      if (a[prop] === undefined) {
        console.log("1Difference detected at", prop, a[prop], b[prop]);
        if (prop === 'updatedAt' || prop === 'createdAt') {
          console.log("Difference in updatedAt or createdAt, one of these is missing from the original data, this can be legacy and is fine");
          continue;
        }
        return false;
      }
      else if (b[prop] && !a[prop] || a[prop] && !b[prop]) {
        console.log("2Difference detected at", prop, a[prop], b[prop]);
        if (prop === 'updatedAt' || prop === 'createdAt') {
          continue;
        }
        return false;
      }
      else if (!b[prop] && !a[prop] && a[prop] != b[prop]) {
        console.log("3Difference detected at", prop, a[prop], b[prop]);
        if (prop === 'updatedAt' || prop === 'createdAt') {
          continue;
        }
        return false;
      }
      else if (!b[prop] && !a[prop] && a[prop] == b[prop]) {
        continue;
      }
      else if (b[prop].constructor === Object) {
        if (a[prop].constructor === Object) {
          if (deepCompare(a[prop], b[prop], d+1) === false) {
            console.log("5Difference detected at", prop, a[prop], b[prop]);
            if (prop === 'updatedAt' || prop === 'createdAt') {
              continue;
            }
            return false
          }
        }
        else {
          console.log("6Difference detected at", prop, a[prop], b[prop]);
          if (prop === 'updatedAt' || prop === 'createdAt') {
            continue;
          }
          return false;
        }
      }
      else if (Array.isArray(b[prop])) {
        if (Array.isArray(a[prop]) === false) {
          console.log("7Difference detected at", prop, a[prop], b[prop]);
          if (prop === 'updatedAt' || prop === 'createdAt') {
            continue;
          }
          return false;
        }
        else if (a[prop].length !== b[prop].length) {
          console.log("8Difference detected at", prop, a[prop].length, b[prop].length);
          if (prop === 'BASE/tokens.json') {
            // tokens.json is a special case, the login to export the data will add one to the set.
            console.log("Different amount of tokens, but that is expected", a[prop].length, b[prop].length);
            continue;
          }
          if (prop === 'updatedAt' || prop === 'createdAt') {
            continue;
          }
          return false;
        }

        for (let i = 0; i < b[prop].length; i++) {
          if (deepCompare(a[prop][i], b[prop][i]) === false) {
            console.log("9Difference detected at", prop, i);
            if (prop === 'updatedAt' || prop === 'createdAt') {
              continue;
            }
            return false;
          }
        }
      }
      else {
        if (a[prop] !== b[prop]) {
          console.log("10Difference detected at", prop, a[prop], b[prop]);
          if (prop === 'updatedAt' || prop === 'createdAt') {
            continue;
          }
          return false;
        }
      }
    }
  }

  if (!iterated) {
    if (typeof a == (typeof b)) {
      if (typeof a === 'object') {
        return Object.keys(a).length === 0 && Object.keys(b).length === 0;
      }
    }
    return a === b;
  }

  return true;
}

let mapA = {};
let mapB = {};


readDirContents(pathA, mapA);
readDirContents(pathB, mapB);

// console.log(Object.keys(mapA))

console.log(deepCompare(mapA, mapB));