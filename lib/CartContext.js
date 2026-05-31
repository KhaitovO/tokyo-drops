import { createContext, useContext } from 'react'

const CartContext = createContext({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  changeQty: () => {},
  clearCart: () => {},
})

export default CartContext
export const useCart = () => useContext(CartContext)
