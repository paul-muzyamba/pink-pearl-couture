const stockGrid = document.getElementById("stockGrid");

const checkboxes = document.querySelectorAll(
  '.filter-item input[type="checkbox"]'
);

function renderItems(filteredItems) {

  stockGrid.innerHTML = "";

  if (filteredItems.length === 0) {

    stockGrid.innerHTML = `
      <div class="empty-state">
        No matching items available right now.
      </div>
    `;

    return;
  }

  filteredItems.forEach(item => {

    stockGrid.innerHTML += `

      <div class="stock-card">

        <div class="stock-card__img">
          ${item.emoji}
        </div>

        <div class="stock-card__body">

          <div class="stock-card__name">
            ${item.name}
          </div>

          <div class="stock-card__price">
            ${item.price}
          </div>

          <a
            href="https://wa.me/260979690009?text=Hi%2C%20I%20am%20interested%20in%20${encodeURIComponent(item.name)}"
            target="_blank"
            class="stock-card__btn"
          >
            Order on WhatsApp
          </a>

        </div>

      </div>

    `;
  });
}

function filterItems() {

  const checkedValues = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  if (checkedValues.includes("all")) {
    renderItems(STOCK_ITEMS);
    return;
  }

  const filtered = STOCK_ITEMS.filter(item =>
    checkedValues.includes(item.category)
  );

  renderItems(filtered);
}

checkboxes.forEach(checkbox => {

  checkbox.addEventListener("change", () => {

    const allCheckbox = document.querySelector(
      'input[value="all"]'
    );

    if (checkbox.value === "all" && checkbox.checked) {

      checkboxes.forEach(cb => {
        cb.checked = false;
      });

      allCheckbox.checked = true;

    } else if (checkbox.value !== "all") {

      allCheckbox.checked = false;
    }

    filterItems();
  });

});

renderItems(STOCK_ITEMS);