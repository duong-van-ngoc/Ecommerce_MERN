const NO_MATCH_SENTINEL = "KHÔNG_CÓ_SẢN_PHẨM_PHÙ_HỢP";

const formatCurrency = (value = 0) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const escapeRegExp = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function formatProductContext(products = []) {
  if (!Array.isArray(products) || products.length === 0) {
    return NO_MATCH_SENTINEL;
  }

  return products
    .map((product, index) => {
      const productUrl = `/product/${product._id}`;
      const cartUrl = `/cart/add/${product._id}`;
      const category = product.category
        ? [product.category.level1, product.category.level2, product.category.level3]
            .filter(Boolean)
            .join(" > ")
        : "N/A";

      const stockStatus =
        Number(product.stock || 0) > 0 ? `còn ${product.stock}` : "hết hàng";

      const saleInfo =
        product.originalPrice > product.price
          ? `, đang giảm ${Math.round(
              (1 - product.price / product.originalPrice) * 100
            )}%`
          : "";

      return `${index + 1}. ID nội bộ: ${product._id}
Tên: ${product.name}
Giá: ${formatCurrency(product.price)}${saleInfo}
Link mua: ${productUrl}
Link thêm giỏ: ${cartUrl}
Nhóm: ${category}
Thương hiệu: ${product.brand || "N/A"}
Chất liệu: ${product.material || "N/A"}
Phong cách: ${product.style || "N/A"}
Vibe: ${product.vibe || "N/A"}
Size: ${(product.sizes || []).slice(0, 5).join(", ") || "N/A"}
Màu: ${(product.colors || []).slice(0, 5).join(", ") || "N/A"}
Tồn kho: ${stockStatus}
Đã bán: ${product.sold || 0}
Đánh giá: ${product.ratings || 0}/5`;
    })
    .join("\n---\n");
}

export function formatHistoryContext(history = []) {
  if (!Array.isArray(history) || history.length === 0) return null;

  return history
    .slice(-4)
    .map((message) => {
      const role = message.role === "user" ? "Khách" : "Tobi";
      return `${role}: ${String(message.content || "").slice(0, 220)}`;
    })
    .join("\n");
}

export function buildPrompt({
  productContext,
  historyContext,
  userMessage,
  includeShopInfo,
  userName = "bạn",
}) {
  void includeShopInfo;

  const historySection = historyContext
    ? `\nLỊCH SỬ CHAT:\n${historyContext}\n`
    : "";

  return `Bạn là TOBI, chatbot tư vấn thời trang thông minh của website TOBI SHOP.

VAI TRÒ:
- Bạn là trợ lý tư vấn mua sắm thời trang.
- Chuyên hỗ trợ khách tìm kiếm sản phẩm, tư vấn outfit và hỗ trợ mua hàng.
- Luôn nói chuyện tự nhiên, thân thiện, giống nhân viên tư vấn thật.
- Trả lời hoàn toàn bằng tiếng Việt.

QUY TẮC BẮT BUỘC:
1. Chỉ được sử dụng sản phẩm có trong DANH SÁCH SẢN PHẨM được cung cấp.
2. Không được tự bịa sản phẩm, giá, size, màu sắc, khuyến mãi hoặc tồn kho.
3. Không nói rằng bạn là AI, Gemini hoặc chatbot của Google.
4. Trả lời ngắn gọn, tự nhiên, tối đa khoảng 120 từ.
5. Ưu tiên sản phẩm còn hàng, phù hợp nhu cầu khách, bán chạy hoặc đang giảm giá.
6. Không hiển thị ID nội bộ cho khách.
7. Khi gợi ý sản phẩm, bắt buộc dùng Markdown link theo format: [Tên sản phẩm - Giá](Link mua)
8. Link mua phải lấy đúng từ dòng "Link mua" của sản phẩm. Không tự tạo link khác.
9. Link mua là đường dẫn nội bộ dạng /product/ID, vẫn phải đặt trong Markdown link.
10. Nếu muốn gợi ý thêm vào giỏ hàng, dùng Markdown link: [Thêm vào giỏ hàng](Link thêm giỏ)
11. Không trả lời các câu hỏi ngoài phạm vi thời trang hoặc mua sắm.

CHÀO HỎI:
- Nếu khách chỉ chào hỏi như hello, hi, xin chào, chào shop, alo thì chào lại thân thiện.
- Không cần gợi ý sản phẩm nếu khách chưa nói nhu cầu.

TƯ VẤN OUTFIT:
- Nếu khách muốn phối đồ, tư vấn outfit, mix đồ, mặc đi chơi, đi học, đi làm, đi biển hoặc đi date, hãy gợi ý outfit phù hợp.
- Có thể kết hợp nhiều sản phẩm, ưu tiên cùng phong cách hoặc màu sắc.
- Chỉ dùng sản phẩm có trong danh sách.

NGÂN SÁCH:
- Nếu khách hỏi khoảng 200k, dưới 500k, giá rẻ hoặc budget thấp, chỉ gợi ý tối đa 3 sản phẩm phù hợp nhất.

MÀU SẮC / SIZE / SALE:
- Nếu khách hỏi theo màu hoặc size, chỉ gợi ý sản phẩm phù hợp với dữ liệu có sẵn.
- Nếu khách hỏi sale, bán chạy hoặc hot trend, ưu tiên sản phẩm sold cao và sản phẩm có giảm giá.

KHÁCH HỎI QUÁ CHUNG CHUNG:
- Nếu khách nói "tư vấn cho tôi", "chọn giúp tôi", "tôi không biết mua gì", hãy hỏi thêm nam hay nữ, phong cách gì, ngân sách bao nhiêu và dùng cho dịp nào.

NGOÀI PHẠM VI:
- Nếu khách hỏi toán học, code, chính trị, hack, tin tức hoặc kiến thức không liên quan thời trang, trả lời:
"Tobi hiện chuyên hỗ trợ tư vấn thời trang và mua sắm tại TOBI SHOP. Bạn muốn tìm outfit hoặc sản phẩm nào hôm nay không?"

LỊCH SỬ CHAT:
- Nếu đã có lịch sử trò chuyện, tận dụng thông tin cũ.
- Không hỏi lại điều khách đã nói.
- Không chào lại ở mỗi phản hồi nếu cuộc trò chuyện đã bắt đầu.
- Trả lời tự nhiên như đang trò chuyện thật với ${userName}.

KHI KHÔNG CÓ SẢN PHẨM:
- Nếu dữ liệu sản phẩm là ${NO_MATCH_SENTINEL}, trả lời:
"Tobi chưa tìm thấy sản phẩm phù hợp với nhu cầu của bạn. Bạn có thể thử mô tả thêm về phong cách, màu sắc, ngân sách hoặc loại sản phẩm để Tobi hỗ trợ tốt hơn nhé."

QUAN TRỌNG:
- Mỗi câu trả lời phải hoàn chỉnh, không được kết thúc giữa câu.
- Không dùng Markdown quá nhiều, chỉ dùng Markdown cho link sản phẩm.
- Không liệt kê quá dài, không spam sản phẩm.
- Chỉ tập trung hỗ trợ mua sắm thời trang.

DANH SÁCH SẢN PHẨM:
${productContext}
${historySection}

CÂU HỎI CỦA KHÁCH:
"${userMessage}"

TOBI TRẢ LỜI:`;
}

export function formatResponse(rawResponse = "") {
  return rawResponse
    .trim()
    .replace(/^(Trả lời:|Phản hồi:|Bot:|ChatBot:|Tobi:|TOBI TRẢ LỜI:)/i, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function ensureProductLinks(rawResponse = "", products = []) {
  if (!rawResponse || !Array.isArray(products) || products.length === 0) {
    return rawResponse;
  }

  const markdownLinkPattern = /(\[[^\]]+\]\([^)]+\))/g;
  const segments = String(rawResponse).split(markdownLinkPattern);
  const sortedProducts = [...products]
    .filter((product) => product?._id && product?.name)
    .sort((a, b) => String(b.name).length - String(a.name).length);

  return segments
    .map((segment) => {
      if (markdownLinkPattern.test(segment)) {
        markdownLinkPattern.lastIndex = 0;
        return segment;
      }
      markdownLinkPattern.lastIndex = 0;

      let linkedSegment = segment;

      for (const product of sortedProducts) {
        const name = String(product.name);
        const price = formatCurrency(product.price);
        const linkText = `${name} - ${price}`;
        const productUrl = `/product/${product._id}`;
        const escapedName = escapeRegExp(name);
        const escapedPrice = escapeRegExp(price);

        const nameWithPricePattern = new RegExp(`${escapedName}\\s*-\\s*${escapedPrice}`, "gu");
        linkedSegment = linkedSegment.replace(
          nameWithPricePattern,
          `[${linkText}](${productUrl})`
        );

        const plainNamePattern = new RegExp(escapedName, "gu");
        linkedSegment = linkedSegment.replace((plainNamePattern), (match, offset, fullText) => {
          const before = fullText.slice(Math.max(0, offset - 2), offset);
          const after = fullText.slice(offset + match.length, offset + match.length + 2);

          if (before.includes("[") || after.includes("]")) {
            return match;
          }

          return `[${linkText}](${productUrl})`;
        });
      }

      return linkedSegment;
    })
    .join("");
}

export function filterAvailableProducts(products = []) {
  return products.filter((product) => Number(product.stock || 0) > 0);
}

export function getBestSellers(products = [], limit = 3) {
  return products
    .filter((product) => Number(product.stock || 0) > 0)
    .sort((a, b) => Number(b.sold || 0) - Number(a.sold || 0))
    .slice(0, limit);
}
