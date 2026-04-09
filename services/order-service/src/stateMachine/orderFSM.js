/**
 * Order State Machine
 * Defines which status transitions are allowed.
 * 
 * Valid flow:
 * pending → paid → processing → shipped → delivered
 * pending → cancelled
 * paid    → cancelled
 */

const TRANSITIONS = {
  pending:    ['paid', 'cancelled'],
  paid:       ['processing', 'cancelled'],
  processing: ['shipped'],
  shipped:    ['delivered'],
  delivered:  [],
  cancelled:  [],
};

// Check if a transition is allowed
const canTransition = (current, next) => {
  return TRANSITIONS[current]?.includes(next) ?? false;
};

// Apply the transition or throw an error
const transition = (order, newStatus) => {
  if (!canTransition(order.status, newStatus)) {
    throw new Error(`Invalid transition: ${order.status} → ${newStatus}`);
  }
  order.status = newStatus;
  order.statusHistory.push({ status: newStatus, timestamp: new Date() });
  return order;
};

module.exports = { transition, canTransition };