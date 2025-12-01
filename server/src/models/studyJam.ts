import { z } from "zod";

// Assuming you have a base schema for attributes
const studyJamAttributes = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  recordingLink: z
    .string()
    .url("Recording link must be a valid URL")
    .optional(),
  postJamKitLink: z
    .string()
    .url("Post jam kit link must be a valid URL")
    .optional(),
  preJamKitLink: z
    .string()
    .url("Pre jam kit link must be a valid URL")
    .optional(),
  postJamActivitySubmissionLink: z
    .string()
    .url("Post jam activity submission link must be a valid URL")
    .optional(),
  attendanceFormLink: z
    .string()
    .url("Attendance form link must be a valid URL")
    .optional(),
});

// Create a partial schema for PATCH (updates)
export const patchStudyJamBodySchema = z.object({
  data: z.object({
    type: z.literal("studyJams"),
    id: z.string(),
    attributes: studyJamAttributes.partial(), // Makes all fields optional
  }),
});

export const postStudyJamBodySchema = z.object({
  data: z.object({
    type: z.literal("studyJams"), // JSON:API resource type
    attributes: studyJamAttributes,
  }),
});
