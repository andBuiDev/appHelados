from flask import Flask, render_template, jsonify, request
import json
import os
from datetime import datetime

app = Flask(__name__)

# Cargar menú desde JSON con validación
MENU_FILE = 'menu.json'
menu_items = []
if os.path.exists(MENU_FILE):
    try:
        with open(MENU_FILE, 'r') as f:
            menu_items = json.load(f)
        for item in menu_items:
            if not all(key in item for key in ['id', 'name', 'price']):
                raise ValueError(f"Item inválido en menu.json: {item}")
            if not isinstance(item['price'], (int, float)):
                raise ValueError(f"Precio no es un número en item: {item}")
    except (json.JSONDecodeError, ValueError) as e:
        print(f"Error loading menu.json: {e}")
        menu_items = []
else:
    print(f"Error: {MENU_FILE} not found")

# Carrito en memoria
cart = []
# Historial de pedidos en memoria
orders = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/menu', methods=['GET'])
def get_menu():
    return jsonify(menu_items)

@app.route('/api/cart', methods=['GET', 'POST', 'DELETE'])
def manage_cart():
    global cart
    if request.method == 'POST':
        item = request.json
        if not all(key in item for key in ['id', 'name', 'price']):
            return jsonify({"error": "Item inválido"}), 400
        existing_item = next((i for i in cart if i['id'] == item['id']), None)
        if existing_item:
            existing_item['quantity'] += 1
        else:
            item['quantity'] = 1
            cart.append(item)
        return jsonify(cart)
    elif request.method == 'DELETE':
        item_id = request.json.get('id')
        if not item_id:
            return jsonify({"error": "ID no proporcionado"}), 400
        cart[:] = [i for i in cart if i['id'] != item_id]
        return jsonify(cart)
    return jsonify(cart)

@app.route('/api/confirm', methods=['POST'])
def confirm_order():
    global cart, orders
    if not cart:
        return jsonify({"message": "Carrito vacío"}), 400
    data = request.json
    table_number = data.get('table_number')
    if not table_number or table_number < 1:
        return jsonify({"message": "Número de mesa inválido"}), 400
    total = sum(item['price'] * item['quantity'] for item in cart)
    order = {
        'id': len(orders) + 1,
        'items': cart[:],  # Copia del carrito
        'total': total,
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'table_number': table_number,
        'delivered': False  # Nuevo campo
    }
    orders.append(order)
    print(f"Pedido guardado: {order}")  # Debug
    cart = []  # Limpiar carrito
    return jsonify({"message": f"Pedido confirmado! Total: ${total:.2f}"})

@app.route('/api/orders', methods=['GET'])
def get_orders():
    print(f"Recuperando pedidos: {orders}")  # Debug
    return jsonify(orders)

@app.route('/api/orders/<int:order_id>/deliver', methods=['POST'])
def mark_order_delivered(order_id):
    global orders
    order = next((o for o in orders if o['id'] == order_id), None)
    if not order:
        return jsonify({"message": "Pedido no encontrado"}), 404
    order['delivered'] = True
    print(f"Pedido {order_id} marcado como entregado: {order}")  # Debug
    return jsonify({"message": f"Pedido #{order_id} marcado como entregado"})

@app.route('/orders')
def orders_view():
    return render_template('orders.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)