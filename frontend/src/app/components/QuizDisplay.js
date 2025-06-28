'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './QuizDisplay.module.css';

export default function QuizDisplay({ quizData, topic }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const { token } = useAuth();

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '1.5rem' }}>No quiz data available.</p>;
  }

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    if (submitted) return;
    setUserAnswers({ ...userAnswers, [questionIndex]: optionIndex });
  };

  const handleSubmit = async () => {
    let currentScore = 0;
    quizData.questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswerIndex) {
        currentScore++;
      }
    });
    setScore(currentScore);
    setSubmitted(true);

    if (!token) {
      console.error('No token found, cannot submit quiz.');
      return;
    }

    try {
      await fetch('http://localhost:8000/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic,
          score: currentScore,
          totalQuestions: quizData.questions.length,
        }),
      });
    } catch (error) {
      console.error('Failed to submit quiz results:', error);
    }
  };

  const getOptionClass = (qIdx, optIdx) => {
    const isSelected = userAnswers[qIdx] === optIdx;
    const isCorrect = submitted && quizData.questions[qIdx].correctAnswerIndex === optIdx;
    const isIncorrect = submitted && isSelected && !isCorrect;

    if (isCorrect) return `${styles.optionButton} ${styles.optionCorrect}`;
    if (isIncorrect) return `${styles.optionButton} ${styles.optionIncorrect}`;
    if (isSelected) return `${styles.optionButton} ${styles.optionSelected}`;
    return `${styles.optionButton} ${styles.optionDefault}`;
  };

  return (
    <div className={styles.quizContainer}>
      <h2 className={styles.heading}>
        Quiz on: <span className={styles.topicHighlight}>{topic}</span>
      </h2>

      <ul className={styles.questionList}>
        {quizData.questions.map((q, qIdx) => (
          <li key={qIdx} className={styles.questionItem}>
            <p className={styles.questionText}>
              {qIdx + 1}. {q.questionText}
            </p>
            <div className={styles.optionsGrid}>
              {q.options.map((opt, optIdx) => (
                <button
                  key={optIdx}
                  onClick={() => handleAnswerSelect(qIdx, optIdx)}
                  disabled={submitted}
                  className={getOptionClass(qIdx, optIdx)}
                >
                  {String.fromCharCode(65 + optIdx)}. {opt}
                </button>
              ))}
            </div>
            {submitted && (
              <p className={styles.explanation}>
                Explanation: {q.explanation}
              </p>
            )}
          </li>
        ))}
      </ul>

      {!submitted && (
        <button onClick={handleSubmit} className={styles.submitButton}>
          Submit Quiz
        </button>
      )}

      {submitted && (
        <p className={styles.scoreMessage}>
          🎉 You scored <strong>{score}</strong> out of {quizData.questions.length}
        </p>
      )}
    </div>
  );
}
