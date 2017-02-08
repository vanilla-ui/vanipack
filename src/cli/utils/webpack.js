import Rx from "rxjs/Rx";

import { createWebpack } from "../..";
import getEnv from "./env";

export default ({ side, config }) => (
  createWebpack({
    env: getEnv(),
    side,
    config,
  })
);

export const run = webpack => (
  new Promise((resolve, reject) => {
    webpack.run((error, stats) => {
      if (error || stats.hasErrors()) {
        reject(error);
      } else {
        resolve(stats);
      }
    });
  }).then((stats) => {
    process.stdout.write(stats.toString({ colors: true }));
    process.stdout.write("\n");
    return stats;
  })
);

export const watch = (webpack, options) => {
  const subject = new Rx.Subject();

  Rx.Observable.create((subscriber) => {
    webpack.watch(options, (error, stats) => {
      if (error) {
        subscriber.error(error);
      } else {
        subscriber.next(stats);
      }
    });
  }).subscribe(subject);

  subject.subscribe((stats) => {
    process.stdout.write(stats.toString({ colors: true }));
    process.stdout.write("\n");
    return stats;
  });

  return subject;
};
