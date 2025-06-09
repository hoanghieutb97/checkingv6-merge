const { KeyAndApi } = require('../../config/constants');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

function addDateImage(cardId, items) {
  console.log("Bắt đầu xử lý items:", JSON.stringify(items, null, 2));

  // Kiểm tra items
  if (!items || !Array.isArray(items) || items.length === 0) {
    console.error("Items không hợp lệ:", items);
    return false;
  }

  var listDate = items.map(item => {
    if (!item.dateItem) {
      console.error("Item không có dateItem:", item);
      return null;
    }
    return item.dateItem;
  }).filter(Boolean);

  if (listDate.length === 0) {
    console.error("Không có ngày tháng hợp lệ nào");
    return false;
  }

  function findEarliestAndFormat(arr) {
    var dates = arr.map(datetime => new Date(datetime));
    var earliest = dates[0];
    for (var i = 1; i < dates.length; i++) {
      if (dates[i] < earliest) {
        earliest = dates[i];
      }
    }

    var day = ('0' + earliest.getDate()).slice(-2);
    var month = ('0' + (earliest.getMonth() + 1)).slice(-2);
    var buoi = earliest.getHours() < 12 ? "sang" : "chieu";
    return day + "-" + month + "-" + buoi;
  }

  var nameFile = findEarliestAndFormat(listDate);
  console.log("Tên file ảnh:", nameFile);

  // Xử lý partner
  var listKhach = items.map(item => {
    if (!item.partner) {
      console.log("Item không có partner:", item);
      return "";
    }
    return item.partner.toLowerCase();
  }).filter(Boolean);

  console.log("Danh sách khách hàng:", listKhach);

  var coKenNguyen = listKhach.includes("pwser1411");
  var coNCE = listKhach.includes("pwser115");
  var coCaHai = ["pwser1411", "pwser115"].every(item => listKhach.includes(item));

  // Xử lý orderId
  var listOrderID = items.map(item => {
    if (!item.orderId) {
      console.log("Item không có orderId:", item);
      return "";
    }
    return item.orderId.toLowerCase();
  }).filter(Boolean);

  console.log("Danh sách orderId:", listOrderID);

  var hasPWT = listOrderID.some(orderId => orderId.substring(0, 3).toLowerCase() === "pwt");

  var folerderName = "dateImage";
  if (coNCE || hasPWT) folerderName = "dateUT";
  if (coKenNguyen || coCaHai) folerderName = "dateKen";

  console.log("Tên thư mục:", folerderName);

  const activeFile = path.join(KeyAndApi.serverFolder, folerderName, nameFile + ".jpg");
  console.log("Đường dẫn file:", activeFile);

  // Kiểm tra file tồn tại
  if (!fs.existsSync(activeFile)) {
    console.error("File không tồn tại:", activeFile);
    return false;
  }

  return uploadFileToTrello(cardId, activeFile);
}

async function uploadFileToTrello(cardId, activeFile) {
  try {
    const formData = new FormData();
    formData.append('key', KeyAndApi.apiKey);
    formData.append('token', KeyAndApi.token);
    formData.append('file', fs.createReadStream(activeFile));

    const response = await axios.post(
      `https://api.trello.com/1/cards/${cardId}/attachments`,
      formData,
      {
        headers: formData.getHeaders(),
      }
    );
    console.log('Đã thêm ảnh ngày tháng vào card:', cardId);
    return true;
  } catch (error) {
    console.error('Lỗi khi thêm ảnh vào card:', cardId, error.message);
    if (error.response) {
      console.error("Chi tiết lỗi:", error.response.data);
    }
    return false;
  }
}

module.exports = { addDateImage };