const is_original = require('./script');

//positive case
test("Allows the creation of favorites when the event is not already in favorites",()=>{
  const existing = "Brett Young,2023-05-20T03:00:00|Capital Cities,2023-05-22T10:30:00|Katchafire,2023-05-19T14:50:55";
  const input = "Selena Gomez,2023-05-22T10:30:00";
  expect(is_original(existing,input)).toBe(true);
});

//negative case
test("Prevents the creation of duplicate when the event is already in favorites",()=>{
  const existing = "Brett Young,2023-05-20T03:00:00|Capital Cities,2023-05-22T10:30:00|Katchafire,2023-05-19T14:50:55";
  const input = "Capital Cities,2023-05-22T10:30:00";
  expect(is_original(existing,input)).toBe(false);
});
