/* eslint-disable no-unused-vars */

import express from 'express'

import * as util from '../utility'

function genPromises(): Promise<any>[] {
  const data: any[] = [
    6, "abc", {"key" : "value"},
    {"complex" : {"object" : "with", "array" : [ 1, 2, 3, 4 ]}}
  ];
  const promises: Promise<any>[] =
      data.map((val) => util.debug(val).then((res) => {
        expect(res).toBe(val);
        return res;
      }));
  return promises;
}

test("utility.debug returns identical",
     () => { return Promise.all(genPromises()); });

test("utility.debug logs their data", () => {
  const logSpy = jest.spyOn(console, 'log');
  return Promise.all(genPromises().map(
      it => it.then((val) => expect(logSpy).toHaveBeenCalledWith(val))));
});
