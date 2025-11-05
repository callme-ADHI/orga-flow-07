/**
 * Queue Node Class
 * Represents a single item in the queue
 */
class QueueNode {
  constructor(data) {
    this.data = data
    this.next = null
  }
}

/**
 * Queue Class (FIFO - First In First Out)
 * Used for notifications, task approvals, and report generation
 */
class Queue {
  constructor() {
    this.front = null // First item to be dequeued
    this.rear = null  // Last item in the queue
    this.size = 0
  }

  /**
   * Add an item to the rear of the queue
   * @param {*} data
   * @returns {number} New size of queue
   */
  enqueue(data) {
    const newNode = new QueueNode(data)

    if (this.isEmpty()) {
      this.front = newNode
      this.rear = newNode
    } else {
      this.rear.next = newNode
      this.rear = newNode
    }

    this.size++
    return this.size
  }

  /**
   * Remove and return the front item from the queue
   * @returns {*} The dequeued item, or null if queue is empty
   */
  dequeue() {
    if (this.isEmpty()) {
      return null
    }

    const dequeuedData = this.front.data
    this.front = this.front.next

    // If queue becomes empty, update rear as well
    if (!this.front) {
      this.rear = null
    }

    this.size--
    return dequeuedData
  }

  /**
   * View the front item without removing it
   * @returns {*} The front item, or null if queue is empty
   */
  peek() {
    return this.isEmpty() ? null : this.front.data
  }

  /**
   * View the rear item without removing it
   * @returns {*} The rear item, or null if queue is empty
   */
  peekRear() {
    return this.isEmpty() ? null : this.rear.data
  }

  /**
   * Check if the queue is empty
   * @returns {boolean}
   */
  isEmpty() {
    return this.size === 0
  }

  /**
   * Get the current size of the queue
   * @returns {number}
   */
  getSize() {
    return this.size
  }

  /**
   * Clear all items from the queue
   */
  clear() {
    this.front = null
    this.rear = null
    this.size = 0
  }

  /**
   * Convert queue to array (without modifying queue)
   * @returns {Array}
   */
  toArray() {
    const items = []
    let current = this.front

    while (current) {
      items.push(current.data)
      current = current.next
    }

    return items
  }

  /**
   * Check if queue contains an item
   * @param {Function} predicate - Function to test each item
   * @returns {boolean}
   */
  contains(predicate) {
    let current = this.front

    while (current) {
      if (predicate(current.data)) {
        return true
      }
      current = current.next
    }

    return false
  }

  /**
   * Find an item in the queue
   * @param {Function} predicate - Function to test each item
   * @returns {*} The found item, or null
   */
  find(predicate) {
    let current = this.front

    while (current) {
      if (predicate(current.data)) {
        return current.data
      }
      current = current.next
    }

    return null
  }

  /**
   * Filter queue items
   * @param {Function} predicate - Function to test each item
   * @returns {Array}
   */
  filter(predicate) {
    const items = []
    let current = this.front

    while (current) {
      if (predicate(current.data)) {
        items.push(current.data)
      }
      current = current.next
    }

    return items
  }

  /**
   * Iterate over each item in the queue
   * @param {Function} callback
   */
  forEach(callback) {
    let current = this.front
    let index = 0

    while (current) {
      callback(current.data, index)
      current = current.next
      index++
    }
  }

  /**
   * Print the queue (for debugging)
   */
  print() {
    if (this.isEmpty()) {
      console.log('Empty queue')
      return
    }

    const items = this.toArray()
    console.log('Front -> [' + items.map(item => JSON.stringify(item)).join(', ') + '] <- Rear')
  }

  /**
   * Convert to JSON
   * @returns {Array}
   */
  toJSON() {
    return this.toArray()
  }

  /**
   * Load from JSON array
   * @param {Array} items
   */
  fromJSON(items) {
    this.clear()
    items.forEach(item => this.enqueue(item))
  }
}

/**
 * Priority Queue Class
 * Items are dequeued based on priority (higher priority first)
 */
class PriorityQueue {
  constructor() {
    this.items = []
  }

  /**
   * Add an item with priority
   * @param {*} data
   * @param {number} priority - Higher number = higher priority
   */
  enqueue(data, priority) {
    const item = { data, priority }
    
    if (this.isEmpty()) {
      this.items.push(item)
      return
    }

    // Find the correct position to insert
    let added = false
    for (let i = 0; i < this.items.length; i++) {
      if (item.priority > this.items[i].priority) {
        this.items.splice(i, 0, item)
        added = true
        break
      }
    }

    // If not added, append to the end
    if (!added) {
      this.items.push(item)
    }
  }

  /**
   * Remove and return the highest priority item
   * @returns {*}
   */
  dequeue() {
    if (this.isEmpty()) {
      return null
    }
    return this.items.shift().data
  }

  /**
   * View the highest priority item
   * @returns {*}
   */
  peek() {
    if (this.isEmpty()) {
      return null
    }
    return this.items[0].data
  }

  /**
   * Check if queue is empty
   * @returns {boolean}
   */
  isEmpty() {
    return this.items.length === 0
  }

  /**
   * Get the size
   * @returns {number}
   */
  getSize() {
    return this.items.length
  }

  /**
   * Clear the queue
   */
  clear() {
    this.items = []
  }

  /**
   * Convert to array
   * @returns {Array}
   */
  toArray() {
    return this.items.map(item => item.data)
  }

  /**
   * Print the priority queue
   */
  print() {
    if (this.isEmpty()) {
      console.log('Empty priority queue')
      return
    }

    console.log('Priority Queue:')
    this.items.forEach((item, index) => {
      console.log(`[${index}] Priority ${item.priority}: ${JSON.stringify(item.data)}`)
    })
  }
}

/**
 * Circular Queue Class
 * Fixed size queue that overwrites oldest items when full
 */
class CircularQueue {
  constructor(capacity = 10) {
    this.capacity = capacity
    this.items = new Array(capacity)
    this.front = -1
    this.rear = -1
    this.size = 0
  }

  /**
   * Add item to the queue
   * @param {*} data
   * @returns {boolean} Success status
   */
  enqueue(data) {
    if (this.isFull()) {
      // Overwrite oldest item (circular behavior)
      this.dequeue()
    }

    if (this.isEmpty()) {
      this.front = 0
      this.rear = 0
    } else {
      this.rear = (this.rear + 1) % this.capacity
    }

    this.items[this.rear] = data
    this.size++
    return true
  }

  /**
   * Remove and return front item
   * @returns {*}
   */
  dequeue() {
    if (this.isEmpty()) {
      return null
    }

    const data = this.items[this.front]
    this.items[this.front] = null

    if (this.front === this.rear) {
      // Queue becomes empty
      this.front = -1
      this.rear = -1
    } else {
      this.front = (this.front + 1) % this.capacity
    }

    this.size--
    return data
  }

  /**
   * View front item
   * @returns {*}
   */
  peek() {
    return this.isEmpty() ? null : this.items[this.front]
  }

  /**
   * Check if empty
   * @returns {boolean}
   */
  isEmpty() {
    return this.size === 0
  }

  /**
   * Check if full
   * @returns {boolean}
   */
  isFull() {
    return this.size === this.capacity
  }

  /**
   * Get size
   * @returns {number}
   */
  getSize() {
    return this.size
  }

  /**
   * Clear queue
   */
  clear() {
    this.items = new Array(this.capacity)
    this.front = -1
    this.rear = -1
    this.size = 0
  }

  /**
   * Convert to array
   * @returns {Array}
   */
  toArray() {
    if (this.isEmpty()) return []

    const result = []
    let index = this.front

    for (let i = 0; i < this.size; i++) {
      result.push(this.items[index])
      index = (index + 1) % this.capacity
    }

    return result
  }

  /**
   * Print queue
   */
  print() {
    if (this.isEmpty()) {
      console.log('Empty circular queue')
      return
    }

    console.log('Circular Queue:', this.toArray())
  }
}

export { Queue, PriorityQueue, CircularQueue }
export default Queue