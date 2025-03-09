export function calculatePrice(price, discount, quantity, discountTime) {
  if (new Date() > new Date(discountTime)) {
    return price * quantity;
  } else {
    const discountedPrice = price - (price * discount) / 100; // Calculate price after discount
    return discountedPrice * quantity; // Return the total price after discount
  }
}
