const apiBase = '/products';
    const limitSelect = document.getElementById('limit-select');
    const categorySelect = document.getElementById('category-select');
    const loadButton = document.getElementById('load-button');
    const nextButton = document.getElementById('next-button');
    const productList = document.getElementById('product-list');
    const status = document.getElementById('status');

    let nextCursor = null;

    const renderProducts = (items) => {
      productList.innerHTML = items.length
        ? items.map(item => `
          <div class="product-card">
            <h2>${item.name}</h2>
            <div class="product-meta">
              <span>Category: ${item.category}</span>
              <span>Price: ₹${Number(item.price).toFixed(2)}</span>
              <span>Created: ${new Date(item.created_at).toLocaleString()}</span>
            </div>
          </div>
        `).join('')
        : '<div class="empty">No products found.</div>';
    };

    const updateStatus = (text) => {
      status.textContent = text;
    };

    const fetchProducts = async ({ reset = false } = {}) => {
      const params = new URLSearchParams();
      params.set('limit', limitSelect.value);
      const category = categorySelect.value;
      if (category) params.set('category', category);
      if (!reset && nextCursor) params.set('cursor', nextCursor);

      updateStatus('Loading...');
      const response = await fetch(`${apiBase}?${params.toString()}`);
      const result = await response.json();
      renderProducts(result.data);
      nextCursor = result.next_cursor;
      nextButton.disabled = !nextCursor;
      updateStatus(result.data.length ? `Loaded ${result.data.length} products.` : 'No products returned.');
    };

    loadButton.addEventListener('click', () => {
      nextCursor = null;
      fetchProducts({ reset: true });
    });

    nextButton.addEventListener('click', () => fetchProducts());

    fetchProducts({ reset: true });