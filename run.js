const wifi = require('node-wifi');
const readline = require('readline');

// Bắt buộc phải init, kể cả để null
wifi.init({
  iface: null, // Windows: nên để null trước
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function scanWifi() {
  try {
    const networks = await wifi.scan();
    console.log('\n=== DANH SÁCH WIFI ===');
    if (!networks || networks.length === 0) {
      console.log('Không tìm thấy mạng Wi-Fi nào.');
      return [];
    }

    networks.forEach((n, index) => {
      console.log(`\n[${index}]`);
      console.log(`SSID          : ${n.ssid}`);
      console.log(`BSSID/MAC     : ${n.bssid || n.mac}`);
      console.log(`Channel       : ${n.channel}`);
      console.log(`Frequency     : ${n.frequency}`);
      console.log(`Signal Level  : ${n.signal_level}`);
      console.log(`Quality       : ${n.quality}`);
      console.log(`Security      : ${n.security}`);
      console.log(`Security Flags: ${n.security_flags}`);
      console.log(`Mode          : ${n.mode}`);
    });

    return networks;
  } catch (error) {
    console.error('Lỗi scan Wi-Fi:', error);
    return [];
  }
}

async function getCurrentConnections() {
  try {
    const currentConnections = await wifi.getCurrentConnections();

    console.log('\n=== KẾT NỐI HIỆN TẠI ===');
    if (!currentConnections || currentConnections.length === 0) {
      console.log('Hiện không có kết nối Wi-Fi nào.');
      return [];
    }

    currentConnections.forEach((c, index) => {
      console.log(`\n[${index}]`);
      console.log(`Interface     : ${c.iface}`);
      console.log(`SSID          : ${c.ssid}`);
      console.log(`BSSID/MAC     : ${c.bssid || c.mac}`);
      console.log(`Channel       : ${c.channel}`);
      console.log(`Frequency     : ${c.frequency}`);
      console.log(`Signal Level  : ${c.signal_level}`);
      console.log(`Quality       : ${c.quality}`);
      console.log(`Security      : ${c.security}`);
      console.log(`Security Flags: ${c.security_flags}`);
      console.log(`Mode          : ${c.mode}`);
    });

    return currentConnections;
  } catch (error) {
    console.error('Lỗi lấy kết nối hiện tại:', error);
    return [];
  }
}

async function connectWifi() {
  try {
    const ssid = await ask('Nhập SSID cần kết nối: ');
    const password = await ask('Nhập password (để trống nếu mạng open): ');

    const options = password
      ? { ssid, password }
      : { ssid };

    await wifi.connect(options);

    console.log('\nĐã gọi lệnh connect xong.');

    // Rất quan trọng trên Windows:
    // callback/promise có thể xong nhưng chưa chắc connect thành công
    // nên phải kiểm tra lại bằng getCurrentConnections()
    const currentConnections = await wifi.getCurrentConnections();
    const isConnected = currentConnections.some((c) => c.ssid === ssid);

    if (isConnected) {
      console.log(`Kết nối thành công tới Wi-Fi: ${ssid}`);
    } else {
      console.log(`Có thể kết nối chưa thành công tới Wi-Fi: ${ssid}`);
      console.log('Hãy kiểm tra lại password, profile Wi-Fi, hoặc quyền của Windows.');
    }
  } catch (error) {
    console.error('Lỗi connect Wi-Fi:', error);
  }
}

async function disconnectWifi() {
  try {
    await wifi.disconnect();
    console.log('Đã gọi disconnect thành công.');
  } catch (error) {
    console.error('Lỗi disconnect Wi-Fi:', error);
    console.error(
      'Lưu ý: disconnect hiện README không đánh dấu hỗ trợ cho Windows.'
    );
  }
}

async function deleteWifiProfile() {
  try {
    const ssid = await ask('Nhập SSID muốn xóa profile đã lưu: ');
    await wifi.deleteConnection({ ssid });
    console.log(`Đã gọi deleteConnection cho SSID: ${ssid}`);
  } catch (error) {
    console.error('Lỗi deleteConnection:', error);
    console.error(
      'Lưu ý: deleteConnection hiện README không đánh dấu hỗ trợ cho Windows.'
    );
  }
}

async function main() {
  while (true) {
    console.log('\n==============================');
    console.log('1. Scan Wi-Fi');
    console.log('2. Kết nối Wi-Fi');
    console.log('3. Ngắt kết nối Wi-Fi');
    console.log('4. Xóa profile Wi-Fi đã lưu');
    console.log('5. Xem kết nối hiện tại');
    console.log('0. Thoát');
    console.log('==============================');

    const choice = await ask('Chọn chức năng: ');

    switch (choice.trim()) {
      case '1':
        await scanWifi();
        break;
      case '2':
        await connectWifi();
        break;
      case '3':
        await disconnectWifi();
        break;
      case '4':
        await deleteWifiProfile();
        break;
      case '5':
        await getCurrentConnections();
        break;
      case '0':
        console.log('Thoát chương trình.');
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('Lựa chọn không hợp lệ.');
        break;
    }
  }
}

main();