const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');

function generateDoc(templatePath, variables) {
  const content = fs.readFileSync(templatePath, 'binary');
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{{', end: '}}' },
    nullGetter(part) {
      if (!part.module) {
        throw new Error(`Missing variable: "${part.value}"`);
      }
      return '';
    },
  });
  doc.render(variables);
  return doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
}

module.exports = { generateDoc };
