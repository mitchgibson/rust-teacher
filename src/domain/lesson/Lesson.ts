import { Factory } from "../core/factory/Factory";

export type Lesson = {
  rustCodeExample: string;
  rustLesson: string;
  typescriptCodeExample: string;
  categorySuggestions: string[];
};

export type LessonCollection = Lesson[];

export function lessonFactory(): Factory<Lesson> {
  return {
    create(hydration: Partial<Lesson> = {}): Lesson {
      return {
        rustCodeExample: "",
        rustLesson: "",
        typescriptCodeExample: "",
        categorySuggestions: [],
        ...hydration,
      };
    },
  };
}

export function lessonCollectionFactory(): Factory<LessonCollection> {
  const { create: unitFactory } = lessonFactory();

  return {
    create(hydrations: Partial<LessonCollection> = []): LessonCollection {
      return hydrations.map((hydration) => unitFactory(hydration as Partial<Lesson>));
    },
  };
}
