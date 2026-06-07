const path = require('path');
const { generateDoc } = require('../lib/docgen');

const fixturePath = path.join(__dirname, 'fixtures', 'test_template.docx');

test('generateDoc returns a Buffer', () => {
  const buf = generateDoc(fixturePath, { name: 'Kavi', fee: '$650' });
  expect(Buffer.isBuffer(buf)).toBe(true);
  expect(buf.length).toBeGreaterThan(0);
});

test('generateDoc throws when a required variable is missing', () => {
  expect(() => {
    generateDoc(fixturePath, { name: 'Kavi' }); // missing {{fee}}
  }).toThrow();
});
