
        document.addEventListener('DOMContentLoaded', () => {
            const params = new URLSearchParams(window.location.search);
            const name = params.get('name');
            const priceStr = params.get('price');
            const image = params.get('image');
            const cat = params.get('cat');

            if (name) {
                document.getElementById('p-name').textContent = name;
                document.getElementById('p-price').textContent = priceStr;
                document.getElementById('p-image').src = image;
                document.getElementById('p-cat').textContent = cat;
                document.title = `${name} | AURUM Luxury`;
            }

            const qtyVal = document.getElementById('qty-val');
            document.getElementById('qty-inc').addEventListener('click', () => {
                qtyVal.value = parseInt(qtyVal.value) + 1;
            });
            document.getElementById('qty-dec').addEventListener('click', () => {
                if (parseInt(qtyVal.value) > 1) qtyVal.value = parseInt(qtyVal.value) - 1;
            });

            document.getElementById('add-to-cart-detail').addEventListener('click', () => {
                const qty = parseInt(qtyVal.value);
                const priceNum = parseInt(priceStr.replace('$', '').replace(',', ''));
                
                let cart = JSON.parse(localStorage.getItem('aurum_cart')) || [];
                const existingItem = cart.find(item => item.name === name);
                
                if (existingItem) {
                    existingItem.quantity += qty;
                } else {
                    cart.push({ name, price: priceNum, image, quantity: qty });
                }
                
                localStorage.setItem('aurum_cart', JSON.stringify(cart));
                
                window.location.reload();
            });
        });