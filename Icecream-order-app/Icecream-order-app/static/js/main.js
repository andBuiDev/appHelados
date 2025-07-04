async function loadMenu() {
    try {
        const response = await fetch('/api/menu');
        const menuItems = await response.json();
        const menuList = document.getElementById('menu-list');
        if (menuList) {
            menuList.innerHTML = '';
            menuItems.forEach(item => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.innerHTML = `${item.name} - $${item.price.toFixed(2)}`;
                const addButton = document.createElement('button');
                addButton.textContent = 'Agregar';
                addButton.className = 'btn btn-primary btn-sm ms-2';
                addButton.dataset.item = JSON.stringify(item);
                li.appendChild(addButton);
                menuList.appendChild(li);
            });
            document.querySelectorAll('.btn.btn-primary.btn-sm').forEach(button => {
                button.addEventListener('click', () => {
                    const item = JSON.parse(button.dataset.item);
                    addToCart(item);
                });
            });
        }
    } catch (error) {
        console.error('Error loading menu:', error);
        if (document.getElementById('menu-list')) {
            document.getElementById('menu-list').innerHTML = '<p>Error al cargar el menú</p>';
        }
    }
}

async function loadOrders() {
    try {
        const response = await fetch('/api/orders');
        const orders = await response.json();
        const ordersList = document.getElementById('orders-list');
        if (ordersList) {
            ordersList.innerHTML = '';
            if (orders.length === 0) {
                ordersList.innerHTML = '<p>No hay pedidos confirmados.</p>';
            } else {
                orders.forEach(order => {
                    const li = document.createElement('li');
                    li.className = `list-group-item ${order.delivered ? 'delivered' : ''}`;
                    li.innerHTML = `<strong>Pedido #${order.id} - Mesa ${order.table_number} - ${order.timestamp}</strong>`;
                    const itemsList = document.createElement('ul');
                    itemsList.className = 'list-group list-group-flush';
                    order.items.forEach(item => {
                        const itemLi = document.createElement('li');
                        itemLi.className = 'list-group-item';
                        itemLi.textContent = `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`;
                        itemsList.appendChild(itemLi);
                    });
                    li.appendChild(itemsList);
                    li.innerHTML += `<p><strong>Total: $${order.total.toFixed(2)}</strong></p>`;
                    if (!order.delivered) {
                        const deliverButton = document.createElement('button');
                        deliverButton.textContent = 'Marcar como Entregado';
                        deliverButton.className = 'btn btn-success btn-sm mt-2';
                        deliverButton.dataset.orderId = order.id;
                        deliverButton.addEventListener('click', () => markOrderDelivered(order.id));
                        li.appendChild(deliverButton);
                    } else {
                        li.innerHTML += '<p class="text-success">Entregado</p>';
                    }
                    ordersList.appendChild(li);
                });
            }
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        if (document.getElementById('orders-list')) {
            document.getElementById('orders-list').innerHTML = '<p>Error al cargar los pedidos</p>';
        }
    }
}

async function markOrderDelivered(orderId) {
    try {
        const response = await fetch(`/api/orders/${orderId}/deliver`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            loadOrders(); // Recargar pedidos para actualizar la UI
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error marking order as delivered:', error);
        alert('Error al marcar el pedido como entregado');
    }
}

async function addToCart(item) {
    try {
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });
        const cart = await response.json();
        updateCart(cart);
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

async function removeFromCart(itemId) {
    try {
        const response = await fetch('/api/cart', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: itemId }),
        });
        const cart = await response.json();
        updateCart(cart);
    } catch (error) {
        console.error('Error removing from cart:', error);
    }
}

function updateCart(cart) {
    const cartList = document.getElementById('cart-list');
    if (cartList) {
        cartList.innerHTML = '';
        let total = 0;
        if (cart.length === 0) {
            cartList.innerHTML = '<p>El carrito está vacío</p>';
        } else {
            cart.forEach(item => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.innerHTML = `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`;
                const removeButton = document.createElement('button');
                removeButton.textContent = 'Eliminar';
                removeButton.className = 'btn btn-danger btn-sm ms-2';
                removeButton.dataset.itemId = item.id;
                li.appendChild(removeButton);
                cartList.appendChild(li);
                total += item.price * item.quantity;
            });
            document.querySelectorAll('.btn.btn-danger.btn-sm').forEach(button => {
                button.addEventListener('click', () => {
                    const itemId = parseInt(button.dataset.itemId);
                    removeFromCart(itemId);
                });
            });
        }
        document.getElementById('total').textContent = total.toFixed(2);
    }
}

async function confirmOrder() {
    try {
        const tableNumber = document.getElementById('table-number').value;
        if (!tableNumber || tableNumber < 1) {
            alert('Por favor, ingrese un número de mesa válido.');
            return;
        }
        const response = await fetch('/api/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table_number: parseInt(tableNumber) }),
        });
        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            updateCart([]);
            document.getElementById('table-number').value = '';
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error confirming order:', error);
        alert('Error al confirmar el pedido');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadMenu();
    if (document.getElementById('cart-list')) {
        fetch('/api/cart').then(res => res.json()).then(updateCart);
        document.getElementById('confirm-order').addEventListener('click', confirmOrder);
    }
    loadOrders();
});