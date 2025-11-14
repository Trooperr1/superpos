import type { Sale, Settings } from '../db/database';
import { formatCurrency, formatDateTime } from '../i18n/translations';

// ESC/POS Commands
const ESC = 0x1b;
const GS = 0x1d;

const Commands = {
  INIT: [ESC, 0x40], // Initialize printer
  ALIGN_LEFT: [ESC, 0x61, 0x00],
  ALIGN_CENTER: [ESC, 0x61, 0x01],
  ALIGN_RIGHT: [ESC, 0x61, 0x02],
  TEXT_NORMAL: [ESC, 0x21, 0x00],
  TEXT_BOLD: [ESC, 0x21, 0x08],
  TEXT_DOUBLE_HEIGHT: [ESC, 0x21, 0x10],
  TEXT_DOUBLE_WIDTH: [ESC, 0x21, 0x20],
  TEXT_LARGE: [ESC, 0x21, 0x30], // Double height + width
  CUT_PAPER: [GS, 0x56, 0x00], // Full cut
  CUT_PAPER_PARTIAL: [GS, 0x56, 0x01], // Partial cut
  LINE_FEED: [0x0a],
  BEEP: [ESC, 0x42, 0x03, 0x02], // Beep 3 times, 200ms each
};

// Helper functions
const textToBytes = (text: string): number[] => {
  const encoder = new TextEncoder();
  return Array.from(encoder.encode(text));
};

const createLine = (char: string = '-', length: number = 32): number[] => {
  return textToBytes(char.repeat(length));
};

const createRow = (left: string, right: string, width: number = 32): number[] => {
  const leftBytes = textToBytes(left);
  const rightBytes = textToBytes(right);
  const spaces = width - left.length - right.length;
  const spaceBytes = textToBytes(' '.repeat(Math.max(0, spaces)));
  return [...leftBytes, ...spaceBytes, ...rightBytes];
};

// Main receipt printing function
export const printReceipt = (sale: Sale, settings: Settings): Uint8Array => {
  const commands: number[] = [];

  // Initialize printer
  commands.push(...Commands.INIT);

  // Shop logo/name - Centered, Large
  commands.push(...Commands.ALIGN_CENTER);
  commands.push(...Commands.TEXT_LARGE);
  commands.push(...textToBytes(settings.shopNameKurdish || settings.shopName));
  commands.push(...Commands.LINE_FEED);

  commands.push(...Commands.TEXT_NORMAL);
  commands.push(...textToBytes(settings.shopAddress));
  commands.push(...Commands.LINE_FEED);
  commands.push(...textToBytes(settings.shopPhone));
  commands.push(...Commands.LINE_FEED);
  commands.push(...Commands.LINE_FEED);

  // Separator line
  commands.push(...Commands.ALIGN_LEFT);
  commands.push(...createLine('=', 32));
  commands.push(...Commands.LINE_FEED);

  // Transaction info
  commands.push(...Commands.TEXT_BOLD);
  commands.push(...createRow('وەسڵی فرۆشتن', ''));
  commands.push(...Commands.LINE_FEED);
  commands.push(...Commands.TEXT_NORMAL);

  commands.push(...createRow('ژمارە:', sale.transactionId.slice(-8)));
  commands.push(...Commands.LINE_FEED);
  commands.push(...createRow('کات:', formatDateTime(sale.createdAt)));
  commands.push(...Commands.LINE_FEED);

  // Separator
  commands.push(...createLine('-', 32));
  commands.push(...Commands.LINE_FEED);

  // Items header
  commands.push(...Commands.TEXT_BOLD);
  commands.push(...textToBytes('بەرهەم'));
  commands.push(...Commands.LINE_FEED);
  commands.push(...Commands.TEXT_NORMAL);

  // Items
  sale.items.forEach((item) => {
    // Product name (may wrap to multiple lines if long)
    commands.push(...textToBytes(item.productName));
    commands.push(...Commands.LINE_FEED);

    // Quantity x Price = Subtotal
    const qtyPrice = `  ${item.quantity} x ${formatCurrency(item.price)}`;
    const subtotal = formatCurrency(item.subtotal);
    commands.push(...createRow(qtyPrice, subtotal, 32));
    commands.push(...Commands.LINE_FEED);
  });

  // Separator
  commands.push(...createLine('-', 32));
  commands.push(...Commands.LINE_FEED);

  // Totals
  commands.push(...createRow('کۆی کاتی:', formatCurrency(sale.subtotal), 32));
  commands.push(...Commands.LINE_FEED);

  if (sale.discount > 0) {
    const discountText = sale.discountType === 'percentage'
      ? `داشکاندن (${sale.discount}%):`
      : 'داشکاندن:';
    const discountAmount = sale.discountType === 'percentage'
      ? (sale.subtotal * sale.discount) / 100
      : sale.discount;
    commands.push(...createRow(discountText, `-${formatCurrency(discountAmount)}`, 32));
    commands.push(...Commands.LINE_FEED);
  }

  if (sale.tax > 0) {
    const taxRate = settings.taxRate;
    commands.push(...createRow(`باج (${taxRate}%):`, formatCurrency(sale.tax), 32));
    commands.push(...Commands.LINE_FEED);
  }

  // Total - Bold, Large
  commands.push(...createLine('=', 32));
  commands.push(...Commands.LINE_FEED);
  commands.push(...Commands.TEXT_LARGE);
  commands.push(...Commands.TEXT_BOLD);
  commands.push(...createRow('کۆی گشتی:', formatCurrency(sale.total), 32));
  commands.push(...Commands.LINE_FEED);
  commands.push(...Commands.TEXT_NORMAL);

  // Payment method
  commands.push(...createLine('-', 32));
  commands.push(...Commands.LINE_FEED);

  let paymentText = '';
  if (sale.paymentMethod === 'cash') {
    paymentText = 'کاش';
  } else if (sale.paymentMethod === 'card') {
    paymentText = 'کارت';
  } else {
    paymentText = 'کاش و کارت';
  }
  commands.push(...createRow('شێوازی پارەدان:', paymentText, 32));
  commands.push(...Commands.LINE_FEED);

  if (sale.paymentMethod === 'cash' && sale.cashAmount) {
    commands.push(...createRow('پارەی دراو:', formatCurrency(sale.cashAmount), 32));
    commands.push(...Commands.LINE_FEED);
    if (sale.changeGiven && sale.changeGiven > 0) {
      commands.push(...createRow('پارەی گەڕاوە:', formatCurrency(sale.changeGiven), 32));
      commands.push(...Commands.LINE_FEED);
    }
  }

  if (sale.paymentMethod === 'mixed') {
    if (sale.cashAmount) {
      commands.push(...createRow('کاش:', formatCurrency(sale.cashAmount), 32));
      commands.push(...Commands.LINE_FEED);
    }
    if (sale.cardAmount) {
      commands.push(...createRow('کارت:', formatCurrency(sale.cardAmount), 32));
      commands.push(...Commands.LINE_FEED);
    }
  }

  // Footer
  commands.push(...Commands.LINE_FEED);
  commands.push(...Commands.ALIGN_CENTER);
  commands.push(...textToBytes('سوپاس بۆ کڕینەکەت!'));
  commands.push(...Commands.LINE_FEED);
  commands.push(...textToBytes('NEXUS POS'));
  commands.push(...Commands.LINE_FEED);
  commands.push(...Commands.LINE_FEED);
  commands.push(...Commands.LINE_FEED);

  // Cut paper
  commands.push(...Commands.CUT_PAPER_PARTIAL);

  return new Uint8Array(commands);
};

// Test print function
export const printTestReceipt = (settings: Settings): Uint8Array => {
  const commands: number[] = [];

  // Initialize
  commands.push(...Commands.INIT);

  // Header
  commands.push(...Commands.ALIGN_CENTER);
  commands.push(...Commands.TEXT_LARGE);
  commands.push(...textToBytes('NEXUS POS'));
  commands.push(...Commands.LINE_FEED);

  commands.push(...Commands.TEXT_NORMAL);
  commands.push(...textToBytes('تاقیکردنەوەی پرینتەر'));
  commands.push(...Commands.LINE_FEED);
  commands.push(...Commands.LINE_FEED);

  // Shop info
  commands.push(...Commands.ALIGN_LEFT);
  commands.push(...textToBytes(settings.shopNameKurdish));
  commands.push(...Commands.LINE_FEED);
  commands.push(...textToBytes(settings.shopAddress));
  commands.push(...Commands.LINE_FEED);
  commands.push(...textToBytes(settings.shopPhone));
  commands.push(...Commands.LINE_FEED);
  commands.push(...Commands.LINE_FEED);

  // Test patterns
  commands.push(...createLine('=', 32));
  commands.push(...Commands.LINE_FEED);
  commands.push(...textToBytes('Kurdish: سڵاو - چۆنی؟'));
  commands.push(...Commands.LINE_FEED);
  commands.push(...textToBytes('English: Hello - How are you?'));
  commands.push(...Commands.LINE_FEED);
  commands.push(...textToBytes('Numbers: 1234567890'));
  commands.push(...Commands.LINE_FEED);
  commands.push(...createLine('=', 32));
  commands.push(...Commands.LINE_FEED);
  commands.push(...Commands.LINE_FEED);

  commands.push(...Commands.ALIGN_CENTER);
  commands.push(...Commands.TEXT_BOLD);
  commands.push(...textToBytes('پرینتەر بە باشی کاردەکات'));
  commands.push(...Commands.LINE_FEED);
  commands.push(...Commands.TEXT_NORMAL);
  commands.push(...textToBytes(new Date().toLocaleString()));
  commands.push(...Commands.LINE_FEED);
  commands.push(...Commands.LINE_FEED);
  commands.push(...Commands.LINE_FEED);

  // Cut
  commands.push(...Commands.CUT_PAPER_PARTIAL);

  return new Uint8Array(commands);
};

// Helper to check Web Bluetooth support
export const isBluetoothSupported = (): boolean => {
  return 'bluetooth' in navigator;
};

// Print using Web Bluetooth
export const printViaBluetooth = async (
  device: BluetoothDevice | null,
  characteristic: BluetoothRemoteGATTCharacteristic | null,
  data: Uint8Array
): Promise<void> => {
  if (!device || !characteristic) {
    throw new Error('Printer not connected');
  }

  // Send data in chunks (20 bytes for BLE)
  const chunkSize = 20;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    await characteristic.writeValue(chunk);
    // Small delay between chunks
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
};
