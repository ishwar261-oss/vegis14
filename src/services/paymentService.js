async function createPaymentIntent(order, method) {
  if (method === 'cod') return { status: 'pending', transactionId: `COD-${order.orderNumber}` };
  return { status: 'paid', transactionId: `PAY-${Date.now()}` };
}

module.exports = { createPaymentIntent };
