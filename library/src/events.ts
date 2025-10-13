type Handler = (...args: any[]) => void;

export class Emitter {
  private handlers: Record<string, Set<Handler>> = {};

  on(event: string, handler: Handler) {
    if (!this.handlers[event]) this.handlers[event] = new Set();
    this.handlers[event].add(handler);
  }

  off(event: string, handler: Handler) {
    this.handlers[event]?.delete(handler);
  }

  emit(event: string, ...args: any[]) {
    this.handlers[event]?.forEach((h) => h(...args));
  }
}


