/*******************************************************************************
 * This program cooks and serves a dinner. Timing is very important here.
 ******************************************************************************/

// We need path and process to determine if we're the executing file. When
// running our tests, we don't want to actually run the program.
// The `* as foo` syntax is probably some artifact of CommonJS vs. ES6 modules
// that Node.js is migrating to. Le sigh.
import * as path from 'node:path'
import * as process from 'node:process'
/**
 * Wondering why this is .js instead of .ts? Get ready for a long read:
 * https://github.com/microsoft/TypeScript/issues/50501
 * https://github.com/microsoft/TypeScript/issues/49083
 * and others.
 *
 * In a Webpack based environment, you don't have to do this. Alas.
 */
import {
  type Belly,
  type Food,
  gobbleFood,
  kittyCrunch,
  cook
} from './kitchen'

/**
 * tap is a utility for creating a "tap" in a monadic pipeline (such as a
 * promise chain). More simply: It puts a "tap" into a pipe. This is useful for
 * doing effectful operations in the pipeline without disturbing the data flow
 * of the pipeline. A very typical use for tap is logging.
 *
 * Example:
 *
 * getNumberPromise()
 *   .then(x => x + 1)
 *   .then(tap(x => console.log('step 1: number is', x)))
 *   .then(x => x / 2)
 *   // This form doesn't work with console.log specifically due to varargs
 *   // limiations. See https://github.com/microsoft/TypeScript/issues/38353 for
 *   // details. It will work for non-vararg functions though.
 *   // .then(tap.bind(null, console.log.bind(null, 'step 2: number is '))
 *    // Fixed.
 *   .then(tap(x => console.log('step 2: number is ', x))
 */
const tap2 = <A>(f: (a: A) => void, a: A): A => {
  f(a)
  return a
}
const tap1 = <A>(f: (a: A) => void): (a: A) => A => {
  return (a: A): A => {
    f(a)
    return a
  }
}

/**
 * This is one of the functions you'll need to implement to make your tests
 * work.
 */

//  const sequence = (strings: Array<string>): Promise<string> => {
//   return strings.reduce(
//     (acc: Promise<string>, s: string) => {
//       return acc.then(accString => {
//         return accString + ' ' + s
//       })
//     },
//     Promise.resolve('start')
//   )
// }

// sequence(['foo', 'bar', 'baz'])
//   .then(allTogether => console.log(allTogether))

export const eatFood = (foods: ReadonlyArray<Food>): Promise<Belly> => {
  return foods.reduce(
    (belly : Promise<Belly>, food: Food) => {
      return belly.then(foodBelly => gobbleFood(food, foodBelly))
    }, Promise.resolve({ nutrients: 0 })
  )
}

/**
 * This is one of the functions you'll need to implement to make your tests
 * work.
 */
export const properCook = (): Promise<ReadonlyArray<Food>> => {
  // get food from kitty crunch
  const result = kittyCrunch.map((food: Food): Promise<Food> => cook(food))
  // ReadonlyArray<Food>
  // cook: takes a Food and returns a promise of Food
  // Promise.all takes an array of promises of x and returns a promise of arrays x
  // Promise.all: Array<Promise<x>> returns => Promise<Array<x>>
  // Promise.all waits for all promises to complete and collates them as a return
  // Array.prototype.map (f, xs) => ys f:(A => B)
  // Promise<ReadonlyArray<Food>>
  return Promise.all(result)
}

export const incompleteCook = async (): Promise<ReadonlyArray<Food>> => {
  const cookedFoods: any = kittyCrunch.map(async (food: Food): Promise<Food> => {
    const cookedFood = await cook(food)
    console.log('cooked food', cookedFood)
    return cookedFood
  })
  return cookedFoods
}

export const slowCook = async (): Promise<ReadonlyArray<Food>> => {
  const foods = []
  for (const food of kittyCrunch) {
    const cookedFood = await cook(food)
    console.log('cooked food', cookedFood)
    foods.push(cookedFood)
  }
  return foods
}

// argv gives us all of the arguments that were passed to the current process.
// The 0th argument is _always_ the current program name, and subsequent
// arguments are the arguments we passed to the program. We can use the name of
// the program to determine if this is the file we're running, or if it's
// included via some other mechanism (such as our tests). We don't want to run
// the main function on import.
if (path.basename(__filename) === process.argv[0]) {
  properCook()
    .then(eatFood)
    .then(tap1(() => console.log('All done!')))
}
