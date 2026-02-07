'use server';

/**
 * @fileOverview This file defines a Genkit flow for validating student messages.
 *
 * - validateStudentMessage - A function that validates the content of a message intended for a student.
 * - ValidateStudentMessageInput - The input type for the validateStudentMessage function.
 * - ValidateStudentMessageOutput - The return type for the validateStudentMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateStudentMessageInputSchema = z.object({
  message: z
    .string()
    .describe('The message content to be validated before sending to a student.'),
});
export type ValidateStudentMessageInput = z.infer<typeof ValidateStudentMessageInputSchema>;

const ValidateStudentMessageOutputSchema = z.object({
  isValid: z
    .boolean()
    .describe(
      'Whether the message is appropriate for sending to a student (true) or contains inappropriate content (false).'      
    ),
  reason: z
    .string()    
    .optional()
    .describe(
      'If the message is not valid, this field provides a reason why it is considered inappropriate.'
    ),
});
export type ValidateStudentMessageOutput = z.infer<typeof ValidateStudentMessageOutputSchema>;

export async function validateStudentMessage(input: ValidateStudentMessageInput): Promise<ValidateStudentMessageOutput> {
  return validateStudentMessageFlow(input);
}

const validateStudentMessagePrompt = ai.definePrompt({
  name: 'validateStudentMessagePrompt',
  input: {schema: ValidateStudentMessageInputSchema},
  output: {schema: ValidateStudentMessageOutputSchema},
  prompt: `You are an AI assistant specializing in ensuring messages are appropriate for students.

  You will receive a message that an administrator intends to send to a student. Your task is to determine if the message is appropriate for the student.

  Consider the following criteria when evaluating the message:
  - Is the message respectful and professional in tone?
  - Does the message contain any offensive, discriminatory, or inappropriate language?
  - Is the message clear, concise, and easy for a student to understand?
  - Is the message free of any personal or sensitive information that should not be shared?

  Based on your evaluation, determine if the message is valid and set the isValid output field accordingly.
  If the message is not valid, provide a brief reason in the reason output field.

  Message: {{{message}}}`,
});

const validateStudentMessageFlow = ai.defineFlow(
  {
    name: 'validateStudentMessageFlow',
    inputSchema: ValidateStudentMessageInputSchema,
    outputSchema: ValidateStudentMessageOutputSchema,
  },
  async input => {
    const {output} = await validateStudentMessagePrompt(input);
    return output!;
  }
);
