import { z } from "zod";

export const pollSchema = z.object({
  question: z
    .string()
    .trim()
    .min(10, "Question must be at least 10 characters")
    .max(140, "Question too long"),
  options: z
    .array(
      z.object({
        value: z
          .string()
          .trim()
          .min(1, "Option cannot be empty")
          .max(60, "Option too long"),
      })
    )
    .min(2, "At least 2 options required")
    .max(6, "Max 6 options allowed")
    .refine(
      (items) => {
        const values = items.map((i) => i.value.toLowerCase());
        return new Set(values).size === values.length;
      },
      {
        message: "Options must be unique (case-insensitive)",
      }
    ),
});

export type PollFormValues = z.infer<typeof pollSchema>;
