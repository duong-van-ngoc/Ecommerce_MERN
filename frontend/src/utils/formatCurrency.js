/**
 * Định dạng số thành tiền tệ Việt Nam Đồng (VND)
 * @param {number|string} amount - Số tiền cần định dạng
 * @returns {string} - Chuỗi tiền tệ đã định dạng (VD: 1.000.000 ₫)
 */
export const formatVND = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(Number(amount || 0));
};

export default formatVND;
