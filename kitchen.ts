type CookedStatus =
  | 'raw'
  | 'baked'
  | 'microwaved'
  | 'blended'
  | 'steamed'

export type Food = {
  name: string,
  nutrients: number,
  cookTime: number,
  cookedBy: string,
  status: CookedStatus,
}

type Cooker = {
  name: string,
  cookFactor: number,
  setCookedStatusTo: CookedStatus,
}

export type Belly = {
  nutrients: number,
}

const noopCooker: Cooker = {
  name: 'nothing',
  cookFactor: 0,
  setCookedStatusTo: 'raw',
}

const cookers: ReadonlyArray<Cooker> = [
  noopCooker,
  {
    name: 'convection-oven',
    cookFactor: 1.0,
    setCookedStatusTo: 'baked',
  },
  {
    name: 'microwave-oven',
    cookFactor: 0.2,
    setCookedStatusTo: 'microwaved',
  },
  {
    name: 'steamer',
    cookFactor: 2.0,
    setCookedStatusTo: 'steamed',
  },
  {
    name: 'blender',
    cookFactor: 0.1,
    setCookedStatusTo: 'blended',
  },
]

export const emptyFood: Food = {
  name: 'empty',
  nutrients: 0,
  cookedBy: 'nothing',
  cookTime: 0,
  status: 'raw',
}

const potato: Food = {
  name: 'potato',
  nutrients: 1,
  cookedBy: 'convection-oven',
  cookTime: 3000,
  status: 'raw',
}

const carrot: Food = {
  name: 'carrot',
  nutrients: 1,
  cookedBy: 'steamer',
  cookTime: 500,
  status: 'raw',
}

const sphynx: Food = {
  name: 'sphynx-cat',
  nutrients: 1,
  cookedBy: 'blender',
  cookTime: 750,
  status: 'raw',
}

const broccoli: Food = {
  name: 'broccoli',
  nutrients: 1,
  cookedBy: 'steamer',
  cookTime: 850,
  status: 'raw',
}

const burmese: Food = {
  name: 'burmese-cat',
  nutrients: 1,
  cookedBy: 'blender',
  cookTime: 850,
  status: 'raw',
}

const bombay: Food = {
  name: 'bombay-cat',
  nutrients: 1,
  cookedBy: 'microwave-oven',
  cookTime: 850,
  status: 'raw',
}

const persian: Food = {
  name: 'persian-cat',
  nutrients: 1,
  cookedBy: 'blender',
  cookTime: 850,
  status: 'raw',
}

const siamese: Food = {
  name: 'siamese-cat',
  nutrients: 1,
  cookedBy: 'microwave-oven',
  cookTime: 850,
  status: 'raw',
}

const ingredients: ReadonlyArray<Food> = [
  bombay,
  broccoli,
  burmese,
  carrot,
  persian,
  potato,
  siamese,
  sphynx,
]

/**
 * A random integer generator.
 */
const randomInt = (max: number): number => {
  return Math.floor(Math.random() * max)
}

/**
 * Give us a promisified setTimeout.
 */
export const timeoutPromise = (delay: number): Promise<NodeJS.Timeout> => {
  return new Promise((resolve, _reject) => {
    return setTimeout(resolve, delay)
  })
}

const cookersByName = Object.fromEntries(cookers.map((c: Cooker) => {
  return [ c.name, c ]
}))

const cookerQueue: {[k: string]: Promise<Food>} = Object.fromEntries(
  cookers.map((c: Cooker): [string, Promise<Food>] => {
    return [
      c.name,
      Promise.resolve(emptyFood),
    ]
  }),
)

export const cook = (food: Food): Promise<Food> => {
  const cooker: Cooker = cookers.find(c => c.name == food.cookedBy) || noopCooker
  const enqueuedFn = (): Promise<Food> => {
    console.log(`Putting ${food.name} in the ${cooker.name} for \
${food.cookTime * cooker.cookFactor}...`)
    return timeoutPromise(food.cookTime * cooker.cookFactor).then((): Food => {
      return {
        ...food,
        status: cooker.setCookedStatusTo,
      }
    }).then((food: Food): Food => {
      console.log(`DING! ${cooker.name} is done cooking ${food.name}!`)
      // Remember to chain it back.
      return food
    })
  }
  cookerQueue[cooker.name] = cookerQueue[cooker.name]?.then(enqueuedFn)
    || Promise.resolve(food)
  return cookerQueue[cooker.name] || Promise.resolve(food)
}

const tap1 = <A>(f: (a: A) => void): (a: A) => A => {
  return (a: A): A => {
    f(a)
    return a
  }
}

export const gobbleFood = (food: Food, belly: Belly): Promise<Belly> => {
  return Promise.resolve({ nutrients: food.nutrients + belly.nutrients })
    .then(f => timeoutPromise(200).then(() => f))
}

export const special = (): ReadonlyArray<Food> => {
  return new Array(randomInt(5))
    .map(_ => ingredients[randomInt(ingredients.length - 1)])
    .filter((x: Food | undefined): x is Food => x != null)
}

export const kittyCrunch: ReadonlyArray<Food> = [
  potato,
  siamese,
  sphynx,
  carrot,
]
