import AppFunc from './AppFunc';

test('Checking invalid format Location', () => {
  const loc = '58.11967 56.3471';
  expect(AppFunc.validLocation(loc)).toEqual({ error: 'Неверно разделены или указаны координаты' });
});

test('Checking Valid format Location', () => {
  const loc = '58.12967, -56.1271';
  expect(AppFunc.validLocation(loc)).toEqual({ latitude: 58.12967, longitude: -56.1271 });
});
