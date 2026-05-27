const MAX_PRODUCTS = 6;

const STYLE_ALIASES = {
    streetwear: ["streetwear", "street wear", "street", "đường phố", "duong pho"],
    minimalism: ["minimalism", "minimalist", "tối giản", "toi gian"],
    vintage: ["vintage", "retro", "cổ điển", "co dien"],
    office: ["office", "office chic", "công sở", "cong so", "đi làm", "di lam"],
    y2k: ["y2k"],
    "old money": ["old money", "sang trọng", "sang trong"],
    sporty: ["sporty", "thể thao", "the thao", "năng động", "nang dong"]
};

const normalizeText = (value = "") =>
    String(value)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .trim();

const includesAny = (text, keywords) =>
    keywords.some((keyword) => text.includes(normalizeText(keyword)));

const productText = (product) =>
    normalizeText([
        product.name,
        product.brand,
        product.material,
        product.style,
        product.vibe,
        product.category?.level1,
        product.category?.level2,
        product.category?.level3,
        ...(product.colors || []),
        ...(product.sizes || [])
    ].filter(Boolean).join(" "));

const applyStrictFilter = (current, predicate, state) => {
    state.hasSpecificIntent = true;
    return current.filter(predicate);
};

const styleTokensFor = (styleName) => {
    const normalizedStyle = normalizeText(styleName);
    return STYLE_ALIASES[normalizedStyle] || [styleName];
};

const detectRequestedStyle = (message) => {
    const normalizedMessage = normalizeText(message);

    for (const [style, aliases] of Object.entries(STYLE_ALIASES)) {
        if (includesAny(normalizedMessage, aliases)) {
            return style;
        }
    }

    const explicitStyleMatch = normalizedMessage.match(/(?:phong cach|style|kieu)\s+([a-z0-9\s-]{2,30})/i);
    return explicitStyleMatch?.[1]?.trim() || null;
};

const parseBudget = (message) => {
    const raw = String(message || "").toLowerCase();
    const normalized = normalizeText(raw);

    const kMatch =
        raw.match(/(dưới|duoi|tối đa|toi da|<=|<)?\s*(\d+)\s*(k|nghìn|ngàn|nghin|ngan)/i) ||
        normalized.match(/(duoi|toi da|<=|<)?\s*(\d+)\s*(k|nghin|ngan)/i);

    if (kMatch) {
        return {
            value: Number.parseInt(kMatch[2], 10) * 1000,
            mode: kMatch[1] ? "lte" : "around"
        };
    }

    const millionMatch =
        raw.match(/(dưới|duoi|tối đa|toi da|<=|<)?\s*(\d+)\s*(triệu|tr|trieu)/i) ||
        normalized.match(/(duoi|toi da|<=|<)?\s*(\d+)\s*(trieu|tr)/i);

    if (millionMatch) {
        return {
            value: Number.parseInt(millionMatch[2], 10) * 1000000,
            mode: millionMatch[1] ? "lte" : "around"
        };
    }

    const vaguePriceMatch = normalized.match(/(duoi|khoang|tam|toi da)\s*(\d+)/i);
    if (vaguePriceMatch) {
        return {
            value: Number.parseInt(vaguePriceMatch[2], 10) * 1000000,
            mode: vaguePriceMatch[1] === "duoi" || vaguePriceMatch[1] === "toi da" ? "lte" : "around"
        };
    }

    return null;
};

const sortByPriority = (products) =>
    [...products].sort((a, b) => {
        const aSale = a.originalPrice > a.price ? 1 : 0;
        const bSale = b.originalPrice > b.price ? 1 : 0;
        const aStock = Number(a.stock || 0) > 0 ? 1 : 0;
        const bStock = Number(b.stock || 0) > 0 ? 1 : 0;

        return (
            bStock - aStock ||
            bSale - aSale ||
            Number(b.sold || 0) - Number(a.sold || 0) ||
            Number(b.ratings || 0) - Number(a.ratings || 0)
        );
    });

const filterByRequestedStyle = (products, requestedStyle) => {
    if (!requestedStyle) return products;

    const tokens = styleTokensFor(requestedStyle).map(normalizeText);

    const strictStyleMatches = products.filter((product) => {
        const style = normalizeText(product.style);
        return tokens.some((token) => style === token || style.includes(token));
    });

    if (strictStyleMatches.length > 0) {
        return strictStyleMatches;
    }

    return products.filter((product) =>
        tokens.some((token) => productText(product).includes(token))
    );
};

export function filterRelevantProducts(products = [], userMessage = "") {
    if (!Array.isArray(products) || products.length === 0) {
        return [];
    }

    const msg = normalizeText(userMessage);
    let filtered = [...products];
    const state = { hasSpecificIntent: false };

    const requestedStyle = detectRequestedStyle(userMessage);
    if (requestedStyle) {
        state.hasSpecificIntent = true;
        filtered = filterByRequestedStyle(filtered, requestedStyle);

        const styleInStock = filtered.filter((product) => Number(product.stock || 0) > 0);
        const styleResults = styleInStock.length > 0 ? styleInStock : filtered;

        if (styleResults.length > 0) {
            return sortByPriority(styleResults).slice(0, MAX_PRODUCTS);
        }
    }

    const genderKeywords = {
        nam: ["nam", "con trai", "đàn ông", "men"],
        nu: ["nữ", "con gái", "phụ nữ", "women"],
        unisex: ["unisex"]
    };

    for (const [gender, keywords] of Object.entries(genderKeywords)) {
        if (includesAny(msg, keywords)) {
            filtered = applyStrictFilter(
                filtered,
                (product) => normalizeText(product.category?.level1).includes(gender),
                state
            );
            break;
        }
    }

    if (!requestedStyle) {
        const typeKeywords = [
            "áo", "quần", "giày", "dép", "túi", "balo", "mũ", "nón", "phụ kiện",
            "váy", "hoodie", "polo", "sơ mi", "jean", "kaki", "shirt", "pants", "shoes", "bag"
        ];

        for (const type of typeKeywords) {
            const normalizedType = normalizeText(type);
            if (msg.includes(normalizedType)) {
                filtered = applyStrictFilter(
                    filtered,
                    (product) => productText(product).includes(normalizedType),
                    state
                );
                break;
            }
        }
    }

    const brands = [
        "nike", "adidas", "uniqlo", "zara", "h&m", "gucci", "puma", "converse",
        "vans", "louis vuitton", "balenciaga", "new balance"
    ];

    for (const brand of brands) {
        if (msg.includes(brand)) {
            filtered = applyStrictFilter(
                filtered,
                (product) => productText(product).includes(brand),
                state
            );
            break;
        }
    }

    const colorKeywords = [
        "đen", "trắng", "xanh", "đỏ", "hồng", "vàng", "cam", "tím", "nâu",
        "be", "xám", "ghi", "navy", "kem", "bạc"
    ];

    for (const color of colorKeywords) {
        const normalizedColor = normalizeText(color);
        if (msg.includes(normalizedColor)) {
            filtered = applyStrictFilter(
                filtered,
                (product) => (product.colors || []).some((item) => normalizeText(item).includes(normalizedColor)),
                state
            );
            break;
        }
    }

    const sizeMatch = msg.match(/\b(xs|s|m|l|xl|xxl|xxxl|[2-4]\d)\b/i);
    if (sizeMatch && /(size|co|cỡ|sz|mặc|mac)/i.test(msg)) {
        const wantedSize = normalizeText(sizeMatch[1]);
        filtered = applyStrictFilter(
            filtered,
            (product) => (product.sizes || []).some((size) => normalizeText(size) === wantedSize),
            state
        );
    }

    const budget = parseBudget(userMessage);
    if (budget) {
        filtered = applyStrictFilter(
            filtered,
            (product) => {
                const price = Number(product.price || 0);
                if (budget.mode === "lte") return price <= budget.value;
                return price >= budget.value * 0.6 && price <= budget.value * 1.4;
            },
            state
        );
    }

    const materials = ["cotton", "len", "lụa", "vải", "da", "jean", "denim", "kaki", "linen", "polyester"];
    for (const material of materials) {
        const normalizedMaterial = normalizeText(material);
        if (msg.includes(normalizedMaterial)) {
            filtered = applyStrictFilter(
                filtered,
                (product) => productText(product).includes(normalizedMaterial),
                state
            );
            break;
        }
    }

    if (!requestedStyle) {
        const styleKeywords = Object.values(STYLE_ALIASES).flat();
        for (const style of styleKeywords) {
            const normalizedStyle = normalizeText(style);
            if (msg.includes(normalizedStyle)) {
                filtered = applyStrictFilter(
                    filtered,
                    (product) => productText(product).includes(normalizedStyle),
                    state
                );
                break;
            }
        }
    }

    if (includesAny(msg, ["sale", "giảm giá", "giam gia", "khuyến mãi", "khuyen mai"])) {
        state.hasSpecificIntent = true;
        filtered = filtered.filter((product) => product.originalPrice > product.price);
    }

    if (includesAny(msg, ["bán chạy", "ban chay", "hot trend", "hot", "trending"])) {
        state.hasSpecificIntent = true;
        filtered = sortByPriority(filtered);
    }

    const inStock = filtered.filter((product) => Number(product.stock || 0) > 0);
    if (inStock.length > 0) {
        filtered = inStock;
    }

    if (filtered.length === 0) {
        console.log("Không tìm thấy sản phẩm phù hợp với bộ lọc chat.", {
            requestedStyle,
            userMessage
        });
        return [];
    }

    return sortByPriority(filtered).slice(0, MAX_PRODUCTS);
}

export function validateInput(userMessage) {
    if (!userMessage || typeof userMessage !== "string") {
        return {
            valid: false,
            message: "Bạn muốn hỏi gì ạ?"
        };
    }

    const trimmed = userMessage.trim();

    if (trimmed.length === 0) {
        return {
            valid: false,
            message: "Bạn muốn hỏi gì ạ?"
        };
    }

    if (trimmed.length > 500) {
        return {
            valid: false,
            message: "Câu hỏi hơi dài quá bạn ơi. Bạn có thể nói ngắn gọn hơn được không?"
        };
    }

    const normalized = normalizeText(trimmed);
    const spamPatterns = /(.)\1{10,}|^[^a-z0-9\s]+$/i;

    if (spamPatterns.test(normalized)) {
        return {
            valid: false,
            message: "Mình không hiểu lắm, bạn có thể hỏi rõ hơn được không?"
        };
    }

    return { valid: true };
}
