import { Util} from "../src/util/Util";

test("check if the diff works", async () => {
  let a : any = {a:2, b:{c:1}}
  let b : any = {a:3, b:{c:1}}
  let diff;
  diff = Util.whatHasBeenChanged(a,b);
  expect(diff.changed.a).toBe(3);

  a = {a:2, b:{c:1}}
  b = {b:{c:1}}
  diff = Util.whatHasBeenChanged(a,b);
  expect(diff.deleted).toStrictEqual({a:2});


  a = {a:2, b:{c:1}}
  b = {a:2, b:{}}
  diff = Util.whatHasBeenChanged(a,b);
  expect(diff.deleted).toStrictEqual({b:{c:1}});

  a = {a:[1,2,3]}
  b = {a:[1,2]}
  diff = Util.whatHasBeenChanged(a,b);
  expect(diff.deleted).toStrictEqual({a:[3]});


  a = {a:[{a:2, b:3}]}
  b = {a:[{a:2}]}
  diff = Util.whatHasBeenChanged(a,b);
  expect(diff.deleted).toStrictEqual({a:[{a:2, b:3}]});

  a = {a:[{a:2,b:3}]}
  b = {a:[{b:3}]}
  diff = Util.whatHasBeenChanged(a,b);
  expect(diff.deleted).toStrictEqual({a:[{a:2, b:3}]});

  a = {a:[{a:2, b:3}]}
  b = {a:[{a:2, b:1}]}
  diff = Util.whatHasBeenChanged(a,b);
  expect(diff.deleted).toStrictEqual({a:[{a:2, b:3}]});

  a = {a:[{a:2, b:3}]}
  b = {a:[{a:2, b:1, c:3}]}
  diff = Util.whatHasBeenChanged(a,b);
  expect(diff.deleted).toStrictEqual({a:[{a:2, b:3}]});

  a = {a:[{a:2, b:3}]}
  b = {a:[{a:2, b:3, c:3}]}
  diff = Util.whatHasBeenChanged(a,b);
  expect(diff.deleted).toStrictEqual({a:[{a:2, b:3}]});

  a = {a:[{a:2}, {b:3}]}
  b = {a:[{b:3}]}
  diff = Util.whatHasBeenChanged(a,b);
  expect(diff.deleted).toStrictEqual({a:[{a:2}]});

  a = {a:[{a:2}, {b:3}]}
  b = {a:[{b:3}, {c:2}]}
  diff = Util.whatHasBeenChanged(a,b);
  expect(diff.deleted).toStrictEqual({a:[{a:2}]});
  expect(diff.added).toStrictEqual({a:[{c:2}]});
})
