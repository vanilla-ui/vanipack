<p align="center">
  <a href="https://github.com/vanilla-ui/vanilla-make">
    <img src="https://rawgit.com/vanilla-ui/logo/master/vanilla-make/logo.png" alt="Vanilla Make" width="400" align="middle" />
  </a>
</p>

<p align="center">
  Universal build system for isomorphic app.
</p>

<p align="center">
  <a href="https://travis-ci.org/vanilla-ui/vanilla-make"><img src="https://img.shields.io/travis/vanilla-ui/vanilla-make.svg" alt="build status" align="middle" /></a>
  <a href="https://www.npmjs.com/package/vanilla-make"><img src="https://img.shields.io/npm/v/vanilla-make.svg" alt="version" align="middle" /></a>
  <a href="https://www.npmjs.com/package/vanilla-make"><img src="https://img.shields.io/npm/l/vanilla-make.svg" alt="license" align="middle" /></a>
</p>

***

## Installation

``` shell
$ npm install --save vanilla-make
```

## Usage

``` shell
# start development server
$ vanilla serve

# build for production
$ NODE_ENV=production vanilla build

# start production server
$ NODE_ENV=production vanilla start
```

## Config

``` javascript
// .vanilla.js

export default {
  plugins: [],

  webpack: null,

  path: {
    public: "/",
    static: "./static",
  },

  entry: {
    client: "./entry/client",
    server: "./entry/server",
  },

  bind: {
    client: {
      host: "127.0.0.1",
      port: 8080,
    },
    server: {
      host: "127.0.0.1",
      port: 8000,
    },
  },
};
```

## Plugins

- [vanilla-make-plugin-react](https://github.com/vanilla-ui/vanilla-make-plugin-react)

## Examples

- [vanilla-make-example](https://github.com/vanilla-ui/vanilla-make-example)

***

<p align="center">
  <a href="http://chicory.io/">
    <img src="https://rawgit.com/chicory-project/logo/master/icon-24.svg" width="24" height="24" align="middle" /><br />
    Chicory Project
  </a>
</p>
