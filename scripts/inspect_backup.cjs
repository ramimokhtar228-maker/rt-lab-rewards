const fs = require('fs');
const backupPath = './public/assets/aistudio/rt_lab_backup_2026-10-20_fcf6ccf3.json';

try {
  const content = fs.readFileSync(backupPath, 'utf8');
  const data = JSON.parse(content);
  console.log('--- ROOT KEYS ---');
  for (const k of Object.keys(data)) {
    const val = data[k];
    if (Array.isArray(val)) {
      console.log(`Key "${k}": Array with ${val.length} items`);
    } else if (typeof val === 'object' && val !== null) {
      console.log(`Key "${k}": Object with keys [${Object.keys(val).join(', ')}]`);
    } else {
      console.log(`Key "${k}": ${val}`);
    }
  }

  if (data.settings) {
    console.log('\n--- SETTINGS SUMMARY ---');
    console.log('labName:', data.settings.labName);
    console.log('whatsappNumber:', data.settings.whatsappNumber);
    console.log('hotlineNumber:', data.settings.hotlineNumber);
    console.log('address:', data.settings.address);
    console.log('adminPin:', data.settings.adminPin);
    console.log('branches count:', data.settings.branches ? data.settings.branches.length : 0);
    if (data.settings.branches) {
      data.settings.branches.forEach((b, idx) => {
        console.log(`Branch ${idx + 1}: ${b.name} - Phone: ${b.phone} - WhatsApp: ${b.whatsappNumber} - Address: ${b.address}`);
      });
    }
    console.log('adminTeam count:', data.settings.adminTeam ? data.settings.adminTeam.length : 0);
    if (data.settings.adminTeam) {
      data.settings.adminTeam.forEach((m, idx) => {
        console.log(`Admin ${idx + 1}: ${m.name} (${m.role}) - Phone: ${m.phone} - WhatsApp: ${m.whatsappNumber}`);
      });
    }
  }
} catch (e) {
  console.error('Error reading backup:', e);
}
