import { PRODUCT_CATEGORY_TREE } from "@/features/products/constants/productFilters.constants";

function ProductCategoryFilter({ handleCategoryToggle, selectedCategories }) {
  const renderCategoryLink = (label, filterValue, isBold = false) => {
    const isActive = selectedCategories.includes(filterValue);

    return (
      <button
        type="button"
        className={`hover-link-slide text-left inline-block ${
          isActive || isBold ? "font-medium text-black active" : "text-gray-600"
        }`}
        onClick={(event) => {
          event.preventDefault();
          handleCategoryToggle(filterValue);
        }}
      >
        {label}
      </button>
    );
  };

  const renderCategoryItems = (items = []) =>
    items.map((item) => (
      <li key={item.value}>
        {renderCategoryLink(item.label, item.value, item.isBold)}
      </li>
    ));

  return (
    <div className="filter-section">
      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
        Khám Phá Danh Mục
      </h2>
      <div className="space-y-8">
        {PRODUCT_CATEGORY_TREE.map((section) => (
          <div key={section.title}>
            <h3 className="text-sm font-semibold mb-4 flex items-center justify-between group cursor-pointer">
              {section.title}
            </h3>

            {section.groups ? (
              <ul className="space-y-4 pl-1 text-sm text-gray-600">
                {section.groups.map((group) => (
                  <li key={group.title}>
                    <span className="block font-medium text-black mb-2">
                      {group.title}
                    </span>
                    <ul className="pl-3 space-y-2 border-l border-gray-100">
                      {renderCategoryItems(group.items)}
                    </ul>
                  </li>
                ))}
                {renderCategoryItems(section.items)}
              </ul>
            ) : (
              <ul className="space-y-3 pl-1 text-sm text-gray-600">
                {renderCategoryItems(section.items)}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductCategoryFilter;
