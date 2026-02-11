import { getQuestions, getAttempts } from "./dataStore.js";

export function pickQuizQuestions(userId, topic, mode) {
  const allQuestions = getQuestions().filter(q => q.topic === topic);

  if (mode === "retry") {
    const attempts = getAttempts().filter(a => a.userId === userId && a.topic === topic);
    const lastAttempt = attempts[attempts.length - 1];

    if (!lastAttempt || lastAttempt.wrongQuestionIds.length === 0) {
      return allQuestions.slice(0, 3);
    }

    return allQuestions.filter(q =>
      lastAttempt.wrongQuestionIds.includes(q.questionId)
    );
  }

  // Normal mode → return first 3 for MVP
  return allQuestions.slice(0, 3);
}

export function calculateScore(topic, answers) {
  const questions = getQuestions().filter(q => q.topic === topic);

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
