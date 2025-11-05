/**
 * MinHeap Class
 * Used for workload balancing - assigns tasks to employee with minimum workload
 * Employees with fewer incomplete tasks have higher priority
 */
class MinHeap {
  constructor(compareFunction = null) {
    this.heap = []
    // Default: compare by incompleteTaskCount
    this.compare = compareFunction || ((a, b) => a.incompleteTaskCount - b.incompleteTaskCount)
  }

  /**
   * Get parent index
   * @private
   */
  _getParentIndex(index) {
    return Math.floor((index - 1) / 2)
  }

  /**
   * Get left child index
   * @private
   */
  _getLeftChildIndex(index) {
    return 2 * index + 1
  }

  /**
   * Get right child index
   * @private
   */
  _getRightChildIndex(index) {
    return 2 * index + 2
  }

  /**
   * Check if has parent
   * @private
   */
  _hasParent(index) {
    return this._getParentIndex(index) >= 0
  }

  /**
   * Check if has left child
   * @private
   */
  _hasLeftChild(index) {
    return this._getLeftChildIndex(index) < this.heap.length
  }

  /**
   * Check if has right child
   * @private
   */
  _hasRightChild(index) {
    return this._getRightChildIndex(index) < this.heap.length
  }

  /**
   * Get parent value
   * @private
   */
  _parent(index) {
    return this.heap[this._getParentIndex(index)]
  }

  /**
   * Get left child value
   * @private
   */
  _leftChild(index) {
    return this.heap[this._getLeftChildIndex(index)]
  }

  /**
   * Get right child value
   * @private
   */
  _rightChild(index) {
    return this.heap[this._getRightChildIndex(index)]
  }

  /**
   * Swap two elements
   * @private
   */
  _swap(index1, index2) {
    [this.heap[index1], this.heap[index2]] = [this.heap[index2], this.heap[index1]]
  }

  /**
   * Bubble up to maintain heap property
   * @private
   */
  _bubbleUp(index = this.heap.length - 1) {
    while (
      this._hasParent(index) && 
      this.compare(this.heap[index], this._parent(index)) < 0
    ) {
      const parentIndex = this._getParentIndex(index)
      this._swap(index, parentIndex)
      index = parentIndex
    }
  }

  /**
   * Bubble down to maintain heap property
   * @private
   */
  _bubbleDown(index = 0) {
    while (this._hasLeftChild(index)) {
      let smallerChildIndex = this._getLeftChildIndex(index)

      if (
        this._hasRightChild(index) && 
        this.compare(this._rightChild(index), this._leftChild(index)) < 0
      ) {
        smallerChildIndex = this._getRightChildIndex(index)
      }

      if (this.compare(this.heap[index], this.heap[smallerChildIndex]) < 0) {
        break
      }

      this._swap(index, smallerChildIndex)
      index = smallerChildIndex
    }
  }

  /**
   * Insert an element into the heap
   * @param {Object} employee - { id, name, incompleteTaskCount, rank, ... }
   */
  insert(employee) {
    this.heap.push(employee)
    this._bubbleUp()
  }

  /**
   * Extract and return the minimum element (employee with least workload)
   * @returns {Object|null}
   */
  extractMin() {
    if (this.isEmpty()) {
      return null
    }

    if (this.heap.length === 1) {
      return this.heap.pop()
    }

    const min = this.heap[0]
    this.heap[0] = this.heap.pop()
    this._bubbleDown()

    return min
  }

  /**
   * Peek at the minimum element without removing it
   * @returns {Object|null}
   */
  peek() {
    return this.isEmpty() ? null : this.heap[0]
  }

  /**
   * Remove a specific employee by ID
   * @param {string} employeeId
   * @returns {boolean}
   */
  remove(employeeId) {
    const index = this.heap.findIndex(emp => emp.id === employeeId)
    
    if (index === -1) {
      return false
    }

    // Replace with last element
    this.heap[index] = this.heap.pop()

    // If we removed the last element, we're done
    if (index === this.heap.length) {
      return true
    }

    // Otherwise, restore heap property
    const parentIndex = this._getParentIndex(index)
    
    if (
      index > 0 && 
      this.compare(this.heap[index], this.heap[parentIndex]) < 0
    ) {
      this._bubbleUp(index)
    } else {
      this._bubbleDown(index)
    }

    return true
  }

  /**
   * Update an employee's workload
   * @param {string} employeeId
   * @param {number} newTaskCount
   * @returns {boolean}
   */
  updateWorkload(employeeId, newTaskCount) {
    const index = this.heap.findIndex(emp => emp.id === employeeId)
    
    if (index === -1) {
      return false
    }

    const oldCount = this.heap[index].incompleteTaskCount
    this.heap[index].incompleteTaskCount = newTaskCount

    // Restore heap property
    if (newTaskCount < oldCount) {
      this._bubbleUp(index)
    } else if (newTaskCount > oldCount) {
      this._bubbleDown(index)
    }

    return true
  }

  /**
   * Check if heap is empty
   * @returns {boolean}
   */
  isEmpty() {
    return this.heap.length === 0
  }

  /**
   * Get heap size
   * @returns {number}
   */
  size() {
    return this.heap.length
  }

  /**
   * Clear the heap
   */
  clear() {
    this.heap = []
  }

  /**
   * Get all elements as array (sorted)
   * @returns {Array}
   */
  toArray() {
    return [...this.heap]
  }

  /**
   * Get sorted array without modifying heap
   * @returns {Array}
   */
  toSortedArray() {
    const tempHeap = new MinHeap(this.compare)
    tempHeap.heap = [...this.heap]
    
    const sorted = []
    while (!tempHeap.isEmpty()) {
      sorted.push(tempHeap.extractMin())
    }
    
    return sorted
  }

  /**
   * Build heap from array
   * @param {Array} array
   */
  buildHeap(array) {
    this.heap = [...array]
    
    // Start from last parent node and bubble down
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this._bubbleDown(i)
    }
  }

  /**
   * Find employee by rank and get least busy
   * @param {string} rank - 'S', 'A', 'B', 'C', 'D', 'E'
   * @returns {Object|null}
   */
  findLeastBusyByRank(rank) {
    const employeesWithRank = this.heap.filter(emp => emp.rank === rank)
    
    if (employeesWithRank.length === 0) {
      return null
    }

    // Find the one with minimum workload
    return employeesWithRank.reduce((min, emp) => 
      this.compare(emp, min) < 0 ? emp : min
    )
  }

  /**
   * Get all employees with a specific rank, sorted by workload
   * @param {string} rank
   * @returns {Array}
   */
  getEmployeesByRank(rank) {
    return this.heap
      .filter(emp => emp.rank === rank)
      .sort(this.compare)
  }

  /**
   * Get statistics
   * @returns {Object}
   */
  getStats() {
    if (this.isEmpty()) {
      return {
        total: 0,
        minWorkload: 0,
        maxWorkload: 0,
        avgWorkload: 0
      }
    }

    const workloads = this.heap.map(emp => emp.incompleteTaskCount)
    const total = this.heap.length
    const minWorkload = Math.min(...workloads)
    const maxWorkload = Math.max(...workloads)
    const avgWorkload = workloads.reduce((sum, w) => sum + w, 0) / total

    return {
      total,
      minWorkload,
      maxWorkload,
      avgWorkload: Math.round(avgWorkload * 100) / 100
    }
  }

  /**
   * Validate heap property (for debugging)
   * @returns {boolean}
   */
  isValidHeap() {
    for (let i = 0; i < this.heap.length; i++) {
      if (this._hasLeftChild(i)) {
        if (this.compare(this.heap[i], this._leftChild(i)) > 0) {
          return false
        }
      }
      
      if (this._hasRightChild(i)) {
        if (this.compare(this.heap[i], this._rightChild(i)) > 0) {
          return false
        }
      }
    }
    
    return true
  }

  /**
   * Print heap as tree structure (for debugging)
   */
  print() {
    if (this.isEmpty()) {
      console.log('Empty heap')
      return
    }

    console.log('MinHeap (by workload):')
    
    let level = 0
    let levelSize = 1
    let index = 0

    while (index < this.heap.length) {
      const levelItems = []
      
      for (let i = 0; i < levelSize && index < this.heap.length; i++, index++) {
        const emp = this.heap[index]
        levelItems.push(`${emp.name}(${emp.incompleteTaskCount})`)
      }
      
      console.log(`Level ${level}: ${levelItems.join(' | ')}`)
      level++
      levelSize *= 2
    }
  }

  /**
   * Convert to JSON
   * @returns {Array}
   */
  toJSON() {
    return this.heap
  }

  /**
   * Load from JSON
   * @param {Array} data
   */
  fromJSON(data) {
    this.buildHeap(data)
  }
}

/**
 * Helper function to create employee heap for task assignment
 * @param {Array} employees - Array of employee objects
 * @returns {MinHeap}
 */
export function createEmployeeHeap(employees) {
  const heap = new MinHeap()
  employees.forEach(emp => heap.insert(emp))
  return heap
}

/**
 * Helper function to assign task to least busy employee of a rank
 * @param {Array} employees - Array of all employees
 * @param {string} rank - Target rank
 * @returns {Object|null} - Least busy employee or null
 */
export function assignToLeastBusy(employees, rank) {
  const employeesOfRank = employees.filter(emp => emp.rank === rank)
  
  if (employeesOfRank.length === 0) {
    return null
  }

  const heap = createEmployeeHeap(employeesOfRank)
  return heap.extractMin()
}

export default MinHeap