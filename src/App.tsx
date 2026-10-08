import { useCallback, useEffect, useState } from 'react'
import { Intro } from './intro/Intro'
import { Nav, Rail } from './components/Chrome'
import { Depth } from './components/Depth'
import { BubbleSea } from './components/BubbleSea'
import { Arrival } from './sections/Arrival'
import { Details } from './sections/Details'
import { Celebration } from './sections/Celebration'
import { Memory } from './sections/Memory'
import { Contact } from './sections/Contact'
import { initScroll, startScroll, stopScroll } from './lib/scroll'
import { state } from './lib/state'
import { usePrefersReducedMotion } from './lib/hooks'

export default function App() {
  const reduced = usePrefersReducedMotion()
  const [introDone, setIntroDone] = useState(false)

  useEffect(() => {
    state.reduced = reduced
    stopScroll()
    return () => startScroll()
  }, [reduced])

  const handleIntroDone = useCallback(() => {
    setIntroDone(true)
  }, [])

  useEffect(() => {
    if (!introDone) return
    const cleanup = initScroll(reduced)
    startScroll()
    return cleanup
  }, [introDone, reduced])

  return (
    <>
      <Intro onDone={handleIntroDone} />
      <div className="site" data-site>
        <Nav />
        <Rail />
        <Depth />
        <BubbleSea />
        <main>
          <Arrival />
          <Details />
          <Celebration />
          <Memory />
          <Contact />
        </main>
      </div>
    </>
  )
}
