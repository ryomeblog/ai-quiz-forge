import { z } from "zod";

export const ChoiceSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
});

export const QuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  choices: z.array(ChoiceSchema).min(2).max(10),
  isMultiSelect: z.boolean(),
  explanation: z.string().nullable().optional(),
  source: z.enum(["manual", "ai"]).default("manual"),
});

export const ExamSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  questions: z.array(QuestionSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const AnswerRecordSchema = z.object({
  questionId: z.string(),
  questionText: z.string(),
  choices: z.array(ChoiceSchema),
  selectedChoiceIds: z.array(z.string()),
  correctChoiceIds: z.array(z.string()),
  isCorrect: z.boolean(),
  explanation: z.string().nullable().optional(),
});

export const PlayHistorySchema = z.object({
  id: z.string(),
  examId: z.string(),
  examTitle: z.string(),
  score: z.number(),
  totalQuestions: z.number(),
  answers: z.array(AnswerRecordSchema),
  playedAt: z.string(),
});

export const SettingsSchema = z.object({
  provider: z.enum(["anthropic", "openai", "openrouter"]).default("anthropic"),
  apiKeys: z
    .object({
      anthropic: z.string().default(""),
      openai: z.string().default(""),
      openrouter: z.string().default(""),
    })
    .default({ anthropic: "", openai: "", openrouter: "" }),
  openrouterModel: z.string().default("google/gemini-2.5-pro"),
});

// AI出力（UUID無し・isMultiSelect無しの生データ）
export const AIQuestionSchema = z.object({
  text: z.string().min(1),
  choices: z
    .array(
      z.object({
        text: z.string().min(1),
        isCorrect: z.boolean(),
      })
    )
    .min(2)
    .max(10),
  explanation: z.string().default(""),
});

export const AIResponseSchema = z.object({
  questions: z.array(AIQuestionSchema).min(1),
});

export const ExportSchema = z.object({
  version: z.string(),
  exportedAt: z.string(),
  exams: z.array(ExamSchema),
  history: z.array(PlayHistorySchema),
});
