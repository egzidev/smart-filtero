import { useEffect, useRef, EffectCallback, DependencyList } from 'react'

const useUpdateEffect = (effect: EffectCallback, dependencies: DependencyList) => {
  const isMount = useRef(true)

  useEffect(() => {
    if (isMount.current) {
      isMount.current = false
    } else {
      effect()
    }
  }, dependencies)
}

export default useUpdateEffect