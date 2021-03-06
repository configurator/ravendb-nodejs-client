export class LinkedListItem<T> {
  public get value(): T {
    return this._value;
  }

  public set value(value: T) {
    this._value = value;
  }

  public get index(): number {
    return this._listTtems.indexOf(this);
  }

  public get first(): boolean {
    const index: number = this.index;

    return index <= 0;
  }

  public get last(): boolean {
    const index: number = this.index;

    return (index < 0) || (index >= (this._listTtems.length - 1));
  }

  public get previous(): LinkedListItem<T> | null {
    if (this.first) {
      return null;
    }

    return this._listTtems[this.index - 1];
  }

  public get next(): LinkedListItem<T> | null {
    if (this.last) {
      return null;
    }

    return this._listTtems[this.index + 1];
  }

  constructor(
    private _value: T,
    private _listTtems: Array<LinkedListItem<T>>
  ) {}
}

export class LinkedList<T> {
  private _items: Array<LinkedListItem<T>>;

  public get count(): number {
    return this._items.length;
  }

  public get first(): LinkedListItem<T> | null {
    if (!this.count) {
      return null;
    }

    return this._items[0];
  }

  public get last(): LinkedListItem<T> | null {
    if (!this.count) {
      return null;
    }

    return this._items[this.count - 1];
  }

  constructor(items: T[] = []) {
    this._items = [];

    if (items.length) {
      items.forEach((item: T) => this.addLast(item));
    }
  }

  public addLast(item: T): LinkedList<T> {
    this._items.push(
      new LinkedListItem<T>(item, this._items)
    );

    return this;
  }

  public addFirst(item: T): LinkedList<T> {
    this._items.unshift(
      new LinkedListItem<T>(item, this._items)
    );

    return this;
  }

  public clear(): LinkedList<T> {
    this._items = [];

    return this;
  }

  public each(iteratee: (item: LinkedListItem<T>) => void) {
    this._items.forEach(iteratee);
  }
}