const fs = require('fs');
const path = require('path');

const files = [
  'frontend/src/pages/SettingsPage.jsx',
  'frontend/src/pages/ReportsPage.jsx',
  'frontend/src/pages/PosPage.jsx',
  'frontend/src/pages/OrderHistoryPage.jsx',
  'frontend/src/pages/MenuManagementPage.jsx',
  'frontend/src/pages/ExpensePage.jsx',
  'frontend/src/pages/DashboardPage.jsx',
  'frontend/src/components/receipt/ReceiptModal.jsx',
  'backend/utils/seedData.js'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/₹/g, 'Rs.');
    
    // For seedData.js, also multiply prices by 3 to simulate PKR
    if (file === 'backend/utils/seedData.js') {
      content = content.replace(/price: (\d+)/g, (match, p1) => {
        return `price: ${parseInt(p1) * 3}`;
      });
      content = content.replace(/amount: (\d+)/g, (match, p1) => {
        return `amount: ${parseInt(p1) * 3}`;
      });
      content = content.replace(/subtotal: (\d+)/g, (match, p1) => {
        return `subtotal: ${parseInt(p1) * 3}`;
      });
      content = content.replace(/grandTotal: ([\d\.]+)/g, (match, p1) => {
        return `grandTotal: ${parseFloat(p1) * 3}`;
      });
      content = content.replace(/taxAmount: ([\d\.]+)/g, (match, p1) => {
        return `taxAmount: ${parseFloat(p1) * 3}`;
      });
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
