import React, { createContext, useContext } from "react"
import { InterpreterFrom } from "xstate"
import { useActor, useInterpret } from "@xstate/react"
import timerMachine from "./timerMachine"

const TimerActorContext = createContext(
  {} as InterpreterFrom<typeof timerMachine>
)

interface TimerProviderProps {
  children: React.ReactNode
}
const TimerProvider = ({ children }: TimerProviderProps) => {
  const timerActor = useInterpret(timerMachine)

  return (
    <TimerActorContext.Provider value={timerActor}>
      {children}
    </TimerActorContext.Provider>
  )
}

const useTimerActor = () => {
  const timerActor = useContext(TimerActorContext)
  return useActor(timerActor)
}

export { TimerProvider, useTimerActor }
