export default class RingBuffer {
  constructor(capacity) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
    this.write = 0;
  }

  add(item) {
    this.buffer[this.write] = item
    this.write = (this.write+1) % this.capacity
  }

  contains(item) {
    for (let i = 0; i < this.capacity; i++) {
      if (this.buffer[i] === item) {
        return true;
      }
    }
    return false;
  }
}