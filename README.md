# crownstone-cloud-v2

Rewrite of the crownstone cloud using loopback 4.

## Install

Clone this repo

```
git clone git@github.com:crownstone/cloud-v2.git
```

Add the heroku remote:

```
cd cloud-v2
git remote add heroku https://git.heroku.com/crownstone-cloud-v2.git
```


## Getting started

Run Yarn:

```
yarn
```

Run the builder to compile typescript to javascript

```
npm run dev
```

Run the start command to run with a locally hosted mongo db

```
npm start
```

Alternatively, use a config via env variables and run it that way:

```
./start.example.sh
```

Enjoy!