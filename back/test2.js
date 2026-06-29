const {PdfReader} = require('pdfreader');
const reader = new PdfReader();
let text = '';
reader.parseFileItems('src/chatbot/RAG_CHAT.pdf', (err, item) => {
  if (err) console.error('error:', err);
  else if (!item) console.log('TEXT EXTRAIT:\n', text.slice(0, 500));
  else if (item.text) text += item.text + ' ';
});
