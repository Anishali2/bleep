import { z } from "zod"

const TimerBlockSchema = z.object({
  type: z.literal("timer"),
  disabled: z.boolean().default(false).optional(),
  name: z.string().min(1),
  seconds: z.number().positive().min(1),
})

const PauseBlockSchema = z.object({
  type: z.literal("pause"),
  disabled: z.boolean().default(false).optional(),
  name: z.string().min(1),
  reps: z.number().positive().optional(),
})

const MessageBlockSchema = z.object({
  type: z.literal("message"),
  disabled: z.boolean().default(false).optional(),
  name: z.string().min(1),
  message: z.string().min(1),
})

const BlockSchema = z.discriminatedUnion("type", [
  TimerBlockSchema,
  PauseBlockSchema,
  MessageBlockSchema,
])

const ProgramSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  emoji: z.string(),
  blocks: z
    .array(BlockSchema)
    .nonempty()
    .refine(arr => arr.some(e => !e.disabled)),
})

type TimerBlock = z.infer<typeof TimerBlockSchema>
type PauseBlock = z.infer<typeof PauseBlockSchema>
type MessageBlock = z.infer<typeof MessageBlockSchema>
type Block = z.infer<typeof BlockSchema>
type Program = z.infer<typeof ProgramSchema>

export type { TimerBlock, PauseBlock, MessageBlock, Block, Program }
export {
  TimerBlockSchema,
  PauseBlockSchema,
  MessageBlockSchema,
  BlockSchema,
  ProgramSchema,
}
