export async function withErrorHandling<T>(
  fn: () => Promise<T>
): Promise<{ success: boolean; data?: T; message?: string }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, message: (error as Error).message };
  }
}
