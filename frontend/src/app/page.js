'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import QuizDisplay from './components/QuizDisplay';

import styles from './HomePage.module.css';

export default function HomePage() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('High School');
  const [numQuestions, setNumQuestions] = useState(5);
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setQuizData(null);

    try {
      const response = await fetch('http://localhost:8000/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, numQuestions, difficulty }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch quiz');
      }

      const data = await response.json();
      setQuizData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {!quizData ? (
          <>
            <h1 className={styles.heading}>🧠 Generate a Quiz</h1>
            <p className={styles.subtext}>Create a personalized quiz based on any topic you like!</p>

            <form onSubmit={handleGenerateQuiz}>
              <div className={styles.inputGroup}>
                <label htmlFor="topic" className={styles.label}>Topic</label>
                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className={styles.input}
                  placeholder="e.g., React, Photosynthesis"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="numQuestions" className={styles.label}>Number of Questions</label>
                <select
                  id="numQuestions"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className={styles.select}
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="difficulty" className={styles.label}>Difficulty</label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className={styles.select}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="High School">High School</option>
                  <option value="University">University</option>
                </select>
              </div>

              <button type="submit" className={styles.button} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Quiz'}
              </button>
            </form>

            {!user && (
              <div className={styles.tip}>
                <p><strong>Tip:</strong> <Link href="/login">Log in</Link> to save your progress and view results later.</p>
              </div>
            )}

            {loading && <div style={{ marginTop: '1.5rem' }}><LoadingSpinner /></div>}
            {error && <p style={{ color: '#f87171', textAlign: 'center', marginTop: '1rem' }}>{error}</p>}
          </>
        ) : (
          <>
            <QuizDisplay quizData={quizData} topic={topic} />
            <div className={styles.resultButtons}>
              <button onClick={() => setQuizData(null)}>Take Another Quiz</button>
              {user && (
                <Link href="/dashboard">View My Dashboard</Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
