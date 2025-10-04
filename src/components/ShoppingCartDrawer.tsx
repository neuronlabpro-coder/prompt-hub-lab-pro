import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Button } from './ui/Button';

export function ShoppingCartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-gray-800 shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-white">
              Carrito ({getTotalItems()})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            data-testid="button-close-cart"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingBag className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-center">Tu carrito está vacío</p>
              <p className="text-sm text-center mt-2">
                Agrega prompts del marketplace para comprar
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-700 rounded-lg p-4"
                  data-testid={`cart-item-${item.id}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-white font-medium text-sm line-clamp-2">
                        {item.title}
                      </h3>
                      {item.category && (
                        <span className="text-xs text-gray-400 mt-1 inline-block">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 hover:bg-gray-600 rounded transition-colors ml-2"
                      data-testid={`button-remove-${item.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 bg-gray-600 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-500 rounded-l-lg transition-colors"
                        data-testid={`button-decrease-${item.id}`}
                      >
                        <Minus className="h-3 w-3 text-white" />
                      </button>
                      <span className="text-white text-sm w-8 text-center" data-testid={`quantity-${item.id}`}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-500 rounded-r-lg transition-colors"
                        data-testid={`button-increase-${item.id}`}
                      >
                        <Plus className="h-3 w-3 text-white" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      {item.discount_percent !== undefined && item.discount_percent > 0 ? (
                        <>
                          <div className="text-xs text-gray-400 line-through">
                            {item.price.toFixed(2)} €
                          </div>
                          <div className="text-white font-medium">
                            {(item.final_price || item.price).toFixed(2)} €
                          </div>
                          <div className="text-xs text-green-400">
                            -{item.discount_percent}%
                          </div>
                        </>
                      ) : (
                        <div className="text-white font-medium">
                          {item.price.toFixed(2)} €
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="w-full text-sm text-red-400 hover:text-red-300 py-2"
                  data-testid="button-clear-cart"
                >
                  Vaciar carrito
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer with Total and Checkout */}
        {items.length > 0 && (
          <div className="border-t border-gray-700 p-4 space-y-3">
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-300">Total:</span>
              <span className="text-white font-bold" data-testid="cart-total">
                {getTotalPrice().toFixed(2)} €
              </span>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                // TODO: Implement checkout flow
                console.log('Proceeding to checkout...');
              }}
              data-testid="button-checkout"
            >
              Proceder al pago
            </Button>

            <button
              onClick={() => setIsCartOpen(false)}
              className="w-full text-sm text-gray-400 hover:text-white py-2"
              data-testid="button-continue-shopping"
            >
              Continuar comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}
