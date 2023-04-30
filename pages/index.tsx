import React, { ReactNode, useEffect, useState } from "react"
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"
import {
  Flex,
  Heading,
  Text,
  IconButton,
  Spacer,
  CircularProgress,
  CircularProgressLabel,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuDivider,
  MenuGroup,
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Switch,
  HStack,
  VStack,
  Select,
  Divider,
  chakra,
  Textarea,
} from "@chakra-ui/react"
import {
  ArrowBackIcon,
  ArrowForwardIcon,
  CopyIcon,
  DeleteIcon,
  HamburgerIcon,
  LinkIcon,
  SettingsIcon,
  UnlockIcon,
  LockIcon,
} from "@chakra-ui/icons"

import {
  FooterButton,
  SwipableParent,
  SwipeableChild,
} from "components/SwipeableView"
import SegmentedProgressBar from "components/SegmentedProgressBar"
import dummyData from "lib/dummyData"
import useWakeLock from "lib/useWakeLock"
import useTimer from "lib/useTimer"
import { useVoices } from "lib/audio"
import CardButton from "components/CardButton"

const Headings = ({ children }: { children: ReactNode }) => (
  <Flex direction="column" gap={16} py={24}>
    {children}
  </Flex>
)

const H1 = ({ children }: { children: ReactNode }) => (
  <Heading textAlign="center" size="4xl" as="h1">
    {children}
  </Heading>
)

const H2 = ({ children }: { children: ReactNode }) => (
  <Heading textAlign="center" size="xl" as="h2">
    {children}
  </Heading>
)

const Page = () => {
  const [workouts, setWorkouts] = useState(dummyData)
  const [slideIndex, setSlideIndex] = useState(0)
  const [workoutIndex, setWorkoutIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const voices = useVoices()
  const { wakeLockEnabled, wakeLockSupported, toggleWakeLock } = useWakeLock()
  const {
    toggle,
    reset,
    secondsLeftOfBlock,
    secondsLeftOfProgram,
    text,
    status,
  } = useTimer([5, 10])

  // prettier-ignore
  useEffect(() => {
    const handler = ({state}: {state: any}) => { setSlideIndex(state.slide) }
    addEventListener("popstate", handler)
    return () => { removeEventListener("popstate", handler) }
  }, [])

  const setWorkout = (index: number) => {
    setWorkoutIndex(index)
    setSlideIndex(1)

    // Set up a history stack for the 3 slides
    history.replaceState({ slide: 0 }, "")
    history.pushState({ slide: 1 }, "")
    history.pushState({ slide: 2 }, "")
    history.go(-1)
  }

  const onWorkoutDragEnd = (result: any) => {
    setIsDragging(false)
    if (!result.destination) return
    const { source, destination } = result
    if (source.index === destination.index) return
    setWorkouts(workouts => {
      const newWorkouts = [...workouts]
      const [removed] = newWorkouts.splice(source.index, 1)
      newWorkouts.splice(destination.index, 0, removed)
      return newWorkouts
    })
  }

  const onBlockDragEnd = () => {
    setIsDragging(false)
  }

  const onDragStart = () => {
    setIsDragging(true)
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Settings</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={8} divider={<Divider />}>
              <FormControl as={HStack} justifyContent="space-between">
                <FormLabel htmlFor="sound">Sound</FormLabel>
                <Switch size="lg" id="sound" defaultChecked />
              </FormControl>

              <VStack spacing={4} w="full">
                <FormControl as={HStack} justifyContent="space-between">
                  <FormLabel htmlFor="voice-recognition">
                    Voice recognition
                  </FormLabel>
                  <Switch size="lg" id="voice-recognition" defaultChecked />
                </FormControl>

                <FormControl>
                  <FormLabel hidden>Voice</FormLabel>
                  <Select placeholder="Select voice">
                    {voices.map((voice: SpeechSynthesisVoice) => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} - {voice.lang} {voice.localService || "*"}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </VStack>

              <Flex direction="column" gap={4} w="full">
                <FormLabel>Data</FormLabel>
                <Textarea placeholder="The app data goes here" />
                <Flex gap={4}>
                  <Button colorScheme="red" leftIcon={<DeleteIcon />}>
                    Clear data
                  </Button>
                  <Button isDisabled flex={1}>
                    Import new data
                  </Button>
                </Flex>
              </Flex>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Flex direction="column" h="100%">
        <SwipableParent
          index={slideIndex}
          onChangeIndex={(newIndex, oldIndex) => {
            history.go(newIndex - oldIndex)
            setSlideIndex(newIndex)
          }}
          disabled={workoutIndex === null || isDragging}
          enableMouseEvents
        >
          {/* Home screen */}
          <SwipeableChild
            transparentHeader={
              <>
                <Spacer />
                <IconButton
                  aria-label="Settings"
                  variant="ghost"
                  icon={<SettingsIcon />}
                  fontSize="xl"
                  onClick={onOpen}
                />
              </>
            }
          >
            <Headings>
              <H1>Bleep!</H1>
              <H2>Choose your workout</H2>
            </Headings>

            <DragDropContext
              onDragStart={onDragStart}
              onDragEnd={onWorkoutDragEnd}
            >
              <Droppable droppableId="workout-cards" type="workout">
                {(provided, snapshot) => (
                  <VStack
                    spacing={4}
                    alignItems="stretch"
                    p={6}
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {workouts.map((workout, index) => (
                      <Draggable
                        key={workout.id}
                        draggableId={workout.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <CardButton
                            text={workout.name}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            handleProps={provided.dragHandleProps}
                            isDragging={snapshot.isDragging}
                            style={provided.draggableProps.style}
                            selected={workoutIndex === index}
                            onClick={() => setWorkout(index)}
                            emoji={workout.emoji}
                          />
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </VStack>
                )}
              </Droppable>
            </DragDropContext>
          </SwipeableChild>

          {/* Config screen */}
          <SwipeableChild
            header={
              <>
                <IconButton
                  aria-label="Back"
                  variant="ghost"
                  icon={<ArrowBackIcon />}
                  onClick={() => {
                    history.go(-1)
                    setSlideIndex(0)
                  }}
                  fontSize="xl"
                />
                <Heading fontWeight="thin" textAlign="center" as="h1">
                  {dummyData[workoutIndex || 0].name}
                </Heading>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label="Options"
                    icon={<HamburgerIcon />}
                    variant="outline"
                  />
                  <MenuList>
                    <MenuGroup>
                      <MenuItem icon={<DeleteIcon />}>Delete</MenuItem>
                      <MenuItem icon={<LinkIcon />}>Share</MenuItem>
                      <MenuItem icon={<CopyIcon />}>Duplicate</MenuItem>
                    </MenuGroup>
                    <MenuDivider />
                    <MenuGroup>
                      <MenuItem icon={<SettingsIcon />}>Settings</MenuItem>
                    </MenuGroup>
                  </MenuList>
                </Menu>
              </>
            }
            footer={
              <FooterButton
                span={2}
                onClick={() => {
                  history.go(1)
                  setSlideIndex(2)
                }}
                rightIcon={<ArrowForwardIcon />}
              >
                Go
              </FooterButton>
            }
          >
            <Text textAlign="center" fontSize="xl" p={4} pb={8}>
              {dummyData[workoutIndex || 0].description}
            </Text>

            <DragDropContext
              onDragStart={onDragStart}
              onDragEnd={onBlockDragEnd}
            >
              <Droppable droppableId="block-cards" type="block">
                {(provided, snapshot) => (
                  <Flex
                    direction="column"
                    gap={4}
                    p={4}
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {workouts[workoutIndex || 0].blocks.map((block, index) => (
                      <Draggable
                        key={`${block.name}-${index}`}
                        draggableId={`${block.name}-${index}--TODO-needs-to-be-static`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <CardButton
                            text={`${block.name} ${
                              block.reps
                                ? ` ⨯${block.reps}`
                                : ` for ${block.seconds} seconds`
                            }`}
                            togglesBody
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            handleProps={provided.dragHandleProps}
                            isDragging={snapshot.isDragging}
                            style={provided.draggableProps.style}
                            onClick={console.log}
                          >
                            <chakra.ul ml={10}>
                              <li>Wait until done</li>
                              <li>Lead time</li>
                              <li>Announcement</li>
                              <li>Beeps</li>
                            </chakra.ul>
                          </CardButton>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Flex>
                )}
              </Droppable>
            </DragDropContext>
          </SwipeableChild>

          {/* Timer screen */}
          <SwipeableChild
            header={
              <>
                <IconButton
                  aria-label="Back"
                  variant="ghost"
                  icon={<ArrowBackIcon />}
                  onClick={() => {
                    history.go(-1)
                    setSlideIndex(1)
                  }}
                  fontSize="xl"
                />
                <Heading fontWeight="thin" textAlign="center" as="h1">
                  {dummyData[workoutIndex || 0].name}
                </Heading>
                <IconButton
                  isDisabled={!wakeLockSupported}
                  colorScheme={wakeLockEnabled ? "red" : "green"}
                  aria-label="Wake lock"
                  variant="outline"
                  icon={wakeLockEnabled ? <LockIcon /> : <UnlockIcon />}
                  onClick={toggleWakeLock}
                />
              </>
            }
            footer={
              <>
                <FooterButton isDisabled={status === "stopped"} onClick={reset}>
                  Reset
                </FooterButton>
                <FooterButton onClick={toggle}>
                  {status === "running" ? "Pause" : "Start"}
                </FooterButton>
              </>
            }
          >
            <Flex
              direction="column"
              justifyContent="space-evenly"
              flex={1}
              gap={12}
              p={8}
            >
              <p>Status: {status}</p>
              <SegmentedProgressBar
                blocks={[
                  { width: 10, percentDone: 1 },
                  { width: 20, percentDone: 0.5 },
                  { width: 30, percentDone: 0 },
                ]}
              />
              <p>total seconds left: {secondsLeftOfProgram}</p>
              <CircularProgress
                trackColor="gray.700"
                color="teal.300"
                capIsRound
                size="full"
                value={40}
              >
                <CircularProgressLabel fontSize="6xl">
                  {secondsLeftOfBlock}
                </CircularProgressLabel>
              </CircularProgress>
              <Heading size="3xl" textAlign="center">
                {text}
              </Heading>
            </Flex>
          </SwipeableChild>
        </SwipableParent>
      </Flex>
    </>
  )
}

export default Page
