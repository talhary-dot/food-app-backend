function calculatePrice(price, discount, quantity, discountTime) {
  if (new Date() > new Date(discountTime)) {
    return price * quantity;
  } else {
    const discountedPrice = price - (price * discount) / 100;
    return discountedPrice * quantity;
  }
}

module.exports = calculatePrice;
