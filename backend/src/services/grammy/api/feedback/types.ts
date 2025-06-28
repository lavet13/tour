import { Feedback } from '@prisma/client';

export type NotifyNewFeedbackType = (feedback: Feedback) => Promise<void>;
