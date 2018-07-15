jitters
=======

jitters is an exercise in accessing portions of the twitch.tv api

It allows an end user to browse & search for streams available on the twitch.tv api

It is currently written in a vanilla javascript style with a focus on no external dependencies.

source code is available in the `src` directory.

a demo version of the site can be accessed [here](https://melito.github.io/dist/).
```
.
├── README.md
├── dist
├── node_modules
├── package-lock.json
├── package.json
├── src               <- This is where the code lives
└── test
```

Building
--------

Start by checking out the project
```
$ git clone https://github.com/melito/melito.github.com.git
$ cd melito.github.com
$ npm install
```

Using [parcel](https://parceljs.org/) you can either build for deployment or development.

For development
```
$ parcel src/index.html
Server running at http://localhost:1234
✨  Built in 1.49s.
```

For deployment
```
$ parcel build src/index
✨  Built in 1.39s.
```

By default everything you need should appear in the `dist` directory.
This can be changed by consulting the runtime options for the [parcel](https://parceljs.org/) tool

(Feel free to substitute parcel with webpack or any other js build tool that suites your fancy)

Testing
-------

Took a very simple approach to how I approached setting up tests.

I used the [tape](https://github.com/substack/tape) & [tap-spec](https://www.npmjs.com/package/tap-spec) tools for accomplishing this.

There are no headless browser harnesses or anything of that sort.  That could be easily added, but I opted to just use vanilla types for this approach.

```
npm run test
```

If you are interested in development there is also an autotest task that will run the
test suite anytime a file is changed.
```
npm run autotest
```
