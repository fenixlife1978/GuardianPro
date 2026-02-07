'use server';

import {
  validateStudentMessage,
  type ValidateStudentMessageInput,
  type ValidateStudentMessageOutput,
} from '@/ai/flows/validate-student-message';

export async function validateMessageAction(
  prevState: any,
  formData: FormData
): Promise<{
  validationResult: ValidateStudentMessageOutput | null;
  message: string | null;
  error: string | null;
}> {
  const message = formData.get('message') as string;

  if (!message || message.trim().length === 0) {
    return { validationResult: null, message, error: 'El mensaje no puede estar vacío.' };
  }

  try {
    const input: ValidateStudentMessageInput = { message };
    const validationResult = await validateStudentMessage(input);

    return { validationResult, message, error: null };
  } catch (e) {
    console.error(e);
    return { validationResult: null, message, error: 'Ocurrió un error al validar el mensaje.' };
  }
}
