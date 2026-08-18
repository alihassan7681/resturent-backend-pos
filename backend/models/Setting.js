const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    restaurantName: {
      type: String,
      default: 'RestroPOS Gourmet Kitchen',
    },
    tagline: {
      type: String,
      default: 'Delicious Food & Quick Service',
    },
    address: {
      type: String,
      default: '123 Food Street, Culinary Hub, City - 400001',
    },
    phone: {
      type: String,
      default: '+91 98765 43210',
    },
    email: {
      type: String,
      default: 'info@restropos.com',
    },
    gstNumber: {
      type: String,
      default: '27AAAAA0000A1Z5',
    },
    taxRatePercent: {
      type: Number,
      default: 5,
    },
    currencySymbol: {
      type: String,
      default: '₹',
    },
    receiptFooter: {
      type: String,
      default: 'Thank you for dining with us! Please visit again.',
    },
    receiptPaperSize: {
      type: String,
      default: '80mm',
      enum: ['80mm', '58mm'],
    },
    showLogoOnReceipt: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
