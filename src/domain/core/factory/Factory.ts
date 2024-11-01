export interface Factory<T> {
  create(hydration: Partial<T extends object ? T : never>): T;
}
