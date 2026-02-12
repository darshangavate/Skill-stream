import { getQuestions, getAttemptsByUser } from "./dataStore.js";

export async function pickQuizQuestions(userId, topic, mode) {
  const allQuestions = await getQuestions();
  const topicQuestions = allQuestions.filter(q => q.topic === topic);

  if (mode === "retry") {
    const attempts = await getAttemptsByUser(userId);
    const topicAttempts = attempts.filter(a => a.topic === topic);
    const lastAttempt = topicAttempts[topicAttempts.length - 1];

    if (!lastAttempt || lastAttempt.wrongQuestionIds.length === 0) {
      return topicQuestions.slice(0, 3);
    }

    return topicQuestions.filter(q =>
      lastAttempt.wrongQuestionIds.includes(q.questionId)
    );
  }

  // Normal mode → return first 3 for MVP
  return topicQuestions.slice(0, 3);
}

export async function calculateScore(topic, answers) {
  const allQuestions = await getQuestions();
  const questions = allQuestions.filter(q => q.topic === topic);

  let correct = 0;
  let wrongIds = [];

  questions.forEach(q => {
    if (answers[q.questionId] === q.correctIndex) {
      correct++;
    } else {
      wrongIds.push(q.questionId);
    }
  });

  const score = Math.round((correct / questions.length) * 100);

  return { score, wrongQuestionIds: wrongIds };
}
