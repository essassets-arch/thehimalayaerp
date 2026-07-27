/**
 * Prioritized Request Queue for Himalaya ERP.
 * Executes concurrent network operations based on priority levels (HIGH, MEDIUM, LOW).
 */

const PRIORITIES = {
  HIGH: 3,   // Session, active notifications count, menu
  MEDIUM: 2, // Active page lists (orders, leads, invoices)
  LOW: 1     // Logs, analytics charts, PDF downloads
};

class RequestQueue {
  constructor(maxConcurrency = 4) {
    this.maxConcurrency = maxConcurrency;
    this.activeCount = 0;
    this.queue = [];
  }

  /**
   * Add a request task to the prioritized queue.
   * @param {Function} task - Async function returning a promise
   * @param {string} priority - 'HIGH', 'MEDIUM', or 'LOW'
   * @returns {Promise}
   */
  add(task, priority = 'MEDIUM') {
    return new Promise((resolve, reject) => {
      const priorityScore = PRIORITIES[priority.toUpperCase()] || PRIORITIES.MEDIUM;
      this.queue.push({ task, resolve, reject, priorityScore });
      this.queue.sort((a, b) => b.priorityScore - a.priorityScore);
      this.next();
    });
  }

  next() {
    if (this.activeCount >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const { task, resolve, reject } = this.queue.shift();
    this.activeCount++;

    task()
      .then((res) => {
        this.activeCount--;
        resolve(res);
        this.next();
      })
      .catch((err) => {
        this.activeCount--;
        reject(err);
        this.next();
      });
  }
}

export const requestQueue = new RequestQueue();
