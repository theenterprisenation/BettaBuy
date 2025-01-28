{/* Previous imports remain the same */}

export function ProductDetailPage() {
  // ... existing code ...

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ... existing product details ... */}
      
      <div className="mt-8">
        <div className="flex items-center space-x-4">
          <div className="w-32">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <select
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
            >
              {[...Array(Math.min(5, product.available_slots))].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 space-x-3">
            <Button
              className="flex items-center justify-center"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>
            <Button
              variant="outline"
              className="flex items-center justify-center"
              onClick={() => navigate('/bulk-order', { 
                state: { product, quantity }
              })}
            >
              <Users className="h-5 w-5 mr-2" />
              Create Bulk Order
            </Button>
          </div>
        </div>
        
        <p className="mt-2 text-sm text-gray-500">
          Need to order for multiple recipients? Try our bulk order feature to manage multiple deliveries in one go.
        </p>
      </div>
      
      {/* ... rest of the component ... */}
    </div>
  );
}