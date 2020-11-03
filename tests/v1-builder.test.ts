import {createUserData} from "./builders/createUserData";


test("populateDatabase", async () => {
  for (let i = 0; i < 1000; i++) {
    console.log("create User", i)
    await createUserData()
  }
}, 50000)
