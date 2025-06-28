'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useRouter } from 'next/navigation';
import styles from './HistoryPage.module.css';

export default function HistoryPage() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/quiz/history', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch your history.');
        const data = await response.json();
        setAttempts(data.attempts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, router]);

  const getScoreClass = (score) => {
    if (score >= 80) return styles.green;
    if (score >= 50) return styles.yellow;
    return styles.red;
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}><LoadingSpinner /></div>;

  if (error) return <p className={styles.red} style={{ textAlign: 'center', marginTop: '1rem' }}>{error}</p>;

  if (!user) return <div style={{ textAlign: 'center', padding: '2rem' }}>Please log in to view your history.</div>;

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Your Quiz History</h2>

      {attempts.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>
          No quiz attempts yet. Start a quiz to see your history here!
        </p>
      ) : (
        <div className={styles.attemptList}>
          {attempts.map((attempt, index) => (
            <div key={index} className={styles.attemptItem}>
              <div>
                <p className={styles.topic}>{attempt.topic}</p>
                <p className={styles.timestamp}>
                  {new Date(attempt.completedAt).toLocaleString()}
                </p>
              </div>
              <div className={`${styles.score} ${getScoreClass(attempt.score)}`}>
                {attempt.score}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
