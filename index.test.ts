import {slowCook, properCook, incompleteCook, eatFood} from './index'
import { type Belly } from './kitchen'

describe('Kitty Crunch', () => {
  // This actually takes > 5 seconds, but for some reason we need it set to 4
  // make the test error.
  jest.setTimeout(4_000)

  it('cooks the food', (): Promise<any> => {
    return properCook()
      .then((cookedFoods) => {
        expect(cookedFoods.map(c => `${c.name}: ${c.status}`).sort())
          .toEqual([
            'carrot: steamed',
            'potato: baked',
            'siamese-cat: microwaved',
            'sphynx-cat: blended',
          ])
      })
  })

  // The slowCook function uses async/await with a for/of loop instead of
  // Array.prototype.map. This technically works, but it runs all of the
  // promises sequentially, which significantly increases the time we wait for
  // cooking. Nothing happens concurrently here.
  //
  // You can enable this test to see it fail.  You'll need to leave this
  // disabled as part of your submission. This is present just to demonstrate
  // how async/await is only good for strict sequences, and doesn't work for
  // promises that need to execute in parallel.
  it.skip('cookes too slow', (): Promise<any> => {
    return slowCook()
      .then((cookedFoods) => {
        expect(cookedFoods.map(c => `${c.name}: ${c.status}`).sort())
          .toEqual([
            'carrot: steamed',
            'potato: baked',
            'siamese-cat: microwaved',
            'sphynx-cat: blended',
          ])
      })
  })

  // This is the other test you need to make pass.
  it('sums the nutrients', (): Promise<any> => {
    return properCook().then(eatFood).then((belly: Belly) => {
      expect(belly.nutrients).toBe(4)
    })
  })

  // incompleteCook doesn't gather up the promises properly - it is using
  // Array.prototype.map in conjunction with async/await. So the cookedFoods
  // come back as undefined since they haven't resolved yet. Array.prototype.map
  // isn't aware of promises. Thus Array.prototype.map just immediately returns
  // the promises and not the data that's being awaited, even though the code
  // suggests it's the data being returned, rather than the unresolved promise.
  //
  // Note that we're only able to run the program and get undefined here because
  // we told TypeScript to ignore an error it found earlier. Look for the `any`
  // type, which basically indicates to TypeScript that for that entity,
  // TypeScript is to be disabled.
  //
  // This test is left at the end so its dangling promises don't mess with the
  // cooking queues for other tests. You'll need to enable this test to see how
  // it works.
  it.skip('fails to cook (dangling promises)', (): Promise<any> => {
    return incompleteCook()
      .then((cookedFoods) => {
        expect(cookedFoods.map(c => `${c.name}: ${c.status}`).sort())
          .toEqual([
            'undefined: undefined',
            'undefined: undefined',
            'undefined: undefined',
            'undefined: undefined',
          ])
      })
  })
})
